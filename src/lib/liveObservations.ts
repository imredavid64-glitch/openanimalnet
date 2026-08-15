// Server-side live observations. Fetches recent, georeferenced occurrence
// records for several species from the GBIF occurrence search API (free, no
// key) and caches per species for a short TTL — the same pattern as
// `liveGbf.ts`, but batched: the globe's observations layer asks for the
// species currently in view, and each species is fetched (or reused) in
// parallel. A single species failing never fails the batch.
import { speciesSources } from '@/data/sample/sources';
import type { ObservationPoint } from './observations';

export interface LiveObservationsResult {
  fetchedAt: string; // ISO timestamp of the batch fetch
  cached: boolean; // true when every requested species came from cache
  /** Species ids that have no GBIF taxon key (skipped, not errors). */
  skipped: string[];
  observations: ObservationPoint[];
}

/** How long a per-species result is reused within one server instance (60s). */
export const OBSERVATIONS_CACHE_TTL_MS = 60_000;

/** How many recent records to pull per species (dots are small; keep it light). */
const PER_SPECIES_LIMIT = 40;

const cache = new Map<string, { at: number; data: ObservationPoint[] }>();

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toObservation(animalId: string, record: Record<string, unknown>): ObservationPoint | null {
  const latitude = record.decimalLatitude as number | undefined;
  const longitude = record.decimalLongitude as number | undefined;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    animalId,
    key: record.key as number,
    species: (record.species as string) ?? 'unknown',
    country: record.country as string | undefined,
    latitude,
    longitude,
    eventDate: record.eventDate as string | undefined,
  };
}

async function fetchForSpecies(animalId: string, gbifKey: number): Promise<ObservationPoint[]> {
  const hit = cache.get(animalId);
  if (hit && Date.now() - hit.at < OBSERVATIONS_CACHE_TTL_MS) {
    return hit.data;
  }

  // A rolling 12-month window keeps every dot meaningful on the recency
  // scale (records older than that simply don't show — they'd read as dim
  // clutter rather than "recent observations").
  const from = new Date(Date.now() - 365 * 86_400_000);
  const to = new Date();

  const url =
    `https://api.gbif.org/v1/occurrence/search?` +
    new URLSearchParams({
      taxonKey: String(gbifKey),
      limit: String(PER_SPECIES_LIMIT),
      hasCoordinate: 'true',
      hasGeospatialIssue: 'false',
      occurrenceStatus: 'PRESENT',
      eventDate: `${isoDate(from)},${isoDate(to)}`,
    });

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'OpenAnimalNet-live-observations/1.0 (https://github.com/imredavid64-glitch/openanimalnet)',
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`GBIF returned HTTP ${res.status} for ${animalId}`);

  const json = (await res.json()) as { results?: Record<string, unknown>[] };
  const observations = (json.results ?? [])
    .map((r) => toObservation(animalId, r))
    .filter((o): o is ObservationPoint => o !== null)
    // Most-recent-first so the client gets the freshest records deterministically.
    .sort((a, b) => (b.eventDate ?? '').localeCompare(a.eventDate ?? ''));

  cache.set(animalId, { at: Date.now(), data: observations });
  return observations;
}

/** Fetch (or reuse) recent observations for a batch of species ids. */
export async function fetchObservationsForAnimals(ids: string[]): Promise<LiveObservationsResult> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const fetchedAt = new Date().toISOString();

  const byId = new Map(speciesSources.map((s) => [s.animalId, s]));
  const skipped: string[] = [];

  // True when every requested species (that has a key) was already cached.
  const allCached = uniqueIds.every((id) => {
    if (!byId.get(id)?.gbifKey) return false;
    const hit = cache.get(id);
    return !!hit && Date.now() - hit.at < OBSERVATIONS_CACHE_TTL_MS;
  });

  const results = await Promise.all(
    uniqueIds.map(async (animalId): Promise<ObservationPoint[]> => {
      const gbifKey = byId.get(animalId)?.gbifKey ?? null;
      if (!gbifKey) {
        skipped.push(animalId);
        return [];
      }
      try {
        return await fetchForSpecies(animalId, gbifKey);
      } catch {
        // One species failing (GBIF hiccup, unknown taxon) shouldn't blank
        // the whole globe layer — skip it and keep the rest.
        skipped.push(animalId);
        return [];
      }
    }),
  );

  return {
    fetchedAt,
    cached: allCached,
    skipped,
    observations: results.flat(),
  };
}
