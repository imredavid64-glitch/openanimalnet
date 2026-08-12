// Server-side GBIF live sync. Pulls recent, georeferenced occurrence records
// for a species from the Global Biodiversity Information Facility (free API,
// no key) and caches per server instance for a short TTL so the "Last synced"
// badge stays cheap while still proving real-time data flow.
import { speciesSources } from '@/data/sample/sources';

export interface GbifObservation {
  key: number;
  species: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  eventDate?: string;
  basisOfRecord?: string;
}

export interface LiveSyncResult {
  source: 'gbif';
  gbifKey: number | null;
  fetchedAt: string; // ISO timestamp of the last successful sync
  ageSeconds: number; // how long ago the sync happened
  observations: GbifObservation[];
  total: number; // GBIF-reported total occurrences for the taxon key
  cached: boolean;
}

/** How long a sync result is reused within one server instance (60s). */
export const GBIF_CACHE_TTL_MS = 60_000;

const cache = new Map<string, { at: number; data: LiveSyncResult }>();

function toObservation(record: Record<string, unknown>): GbifObservation {
  return {
    key: record.key as number,
    species: (record.species as string) ?? 'unknown',
    country: record.country as string | undefined,
    latitude: record.decimalLatitude as number | undefined,
    longitude: record.decimalLongitude as number | undefined,
    eventDate: record.eventDate as string | undefined,
    basisOfRecord: record.basisOfRecord as string | undefined,
  };
}

/** Fetch (or reuse) the latest GBIF sync for an animal. */
export async function syncGbfForAnimal(animalId: string): Promise<LiveSyncResult> {
  const hit = cache.get(animalId);
  if (hit && Date.now() - hit.at < GBIF_CACHE_TTL_MS) {
    return { ...hit.data, ageSeconds: Math.round((Date.now() - hit.at) / 1000), cached: true };
  }

  const source = speciesSources.find((s) => s.animalId === animalId);
  const gbifKey = source?.gbifKey ?? null;

  if (!gbifKey) {
    const failed: LiveSyncResult = {
      source: 'gbif',
      gbifKey: null,
      fetchedAt: new Date().toISOString(),
      ageSeconds: 0,
      observations: [],
      total: 0,
      cached: false,
    };
    cache.set(animalId, { at: Date.now(), data: failed });
    return failed;
  }

  const url =
    `https://api.gbif.org/v1/occurrence/search?` +
    new URLSearchParams({
      taxonKey: String(gbifKey),
      limit: '8',
      hasCoordinate: 'true',
      hasGeospatialIssue: 'false',
    });

  const res = await fetch(url, {
    headers: { 'User-Agent': 'OpenAnimalNet-live-sync/1.0 (https://github.com/imredavid64-glitch/openanimalnet)' },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`GBIF returned HTTP ${res.status}`);

  const json = (await res.json()) as { results?: Record<string, unknown>[]; count?: number };
  const now = Date.now();
  const data: LiveSyncResult = {
    source: 'gbif',
    gbifKey,
    fetchedAt: new Date(now).toISOString(),
    ageSeconds: 0,
    observations: (json.results ?? []).map(toObservation),
    total: json.count ?? 0,
    cached: false,
  };
  cache.set(animalId, { at: now, data });
  return data;
}
