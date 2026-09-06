/**
 * Universal Animal Search — queries GBIF, Wikipedia, Wikidata, and iNaturalist
 * in parallel and merges results into a single unified response.
 */

export interface SearchResult {
  source: string;
  sourceUrl: string;
  scientificName: string;
  commonName: string;
  description: string;
  image?: string;
  taxonomy?: { kingdom: string; phylum: string; class: string; order: string; family: string; genus: string };
  conservationStatus?: string;
  populationEstimate?: number;
  wikipediaTitle?: string;
  gbifKey?: number;
  iucnId?: string;
  inaturalistId?: number;
  habitat?: string[];
  location?: { latitude: number; longitude: number };
}

const GBIF_BASE = 'https://api.gbif.org/v1';
const WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1';
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const INATURALIST_API = 'https://api.inaturalist.org/v1';

const STATUS_MAP: Record<string, string> = {
  'LC': 'Least Concern', 'NT': 'Near Threatened', 'VU': 'Vulnerable',
  'EN': 'Endangered', 'CR': 'Critically Endangered', 'EW': 'Extinct in the Wild',
  'EX': 'Extinct', 'DD': 'Data Deficient', 'NE': 'Not Evaluated',
};

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function searchGBIF(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetchWithTimeout(`${GBIF_BASE}/species/search?q=${encodeURIComponent(query)}&limit=5&rank=SPECIES`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? [])
      .filter((s: any) => s.species && s.status === 'ACCEPTED')
      .map((s: any) => ({
        source: 'GBIF',
        sourceUrl: `https://www.gbif.org/species/${s.key}`,
        scientificName: s.species,
        commonName: s.vernacularName ?? s.species,
        description: s.description ?? '',
        gbifKey: s.key,
        taxonomy: {
          kingdom: s.kingdom ?? '', phylum: s.phylum ?? '', class: s.class ?? '',
          order: s.order ?? '', family: s.family ?? '', genus: s.genus ?? '',
        },
        image: s.species?.image,
      }));
  } catch { return []; }
}

async function searchWikipedia(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetchWithTimeout(`${WIKIPEDIA_API}/page/search/limit?q=${encodeURIComponent(query)}&limit=5&namespace=0`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.pages ?? []).map((p: any) => ({
      source: 'Wikipedia',
      sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.key)}`,
      scientificName: p.title,
      commonName: p.title,
      description: p.description ?? '',
      image: p.thumbnail?.url,
      wikipediaTitle: p.key,
    }));
  } catch { return []; }
}

async function searchWikidata(query: string): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      action: 'wbsearchentities', search: query, language: 'en',
      format: 'json', limit: '5', type: 'item',
    });
    const res = await fetchWithTimeout(`${WIKIDATA_API}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.search ?? []).map((item: any) => ({
      source: 'Wikidata',
      sourceUrl: `https://www.wikidata.org/wiki/${item.id}`,
      scientificName: item.label ?? '',
      commonName: item.label ?? '',
      description: item.description ?? '',
    }));
  } catch { return []; }
}

async function searchINaturalist(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetchWithTimeout(`${INATURALIST_API}/taxa?q=${encodeURIComponent(query)}&rank=species&per_page=5`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((t: any) => ({
      source: 'iNaturalist',
      sourceUrl: `https://www.inaturalist.org/taxa/${t.id}`,
      scientificName: t.name ?? '',
      commonName: t.preferred_common_name ?? t.name ?? '',
      description: t.wikipedia_summary?.replace(/<[^>]+>/g, '').slice(0, 300) ?? '',
      image: t.default_photo?.medium_url,
      conservationStatus: t.conservation_status?.status_name,
      inaturalistId: t.id,
      taxonomy: t.iconic_taxa ? { kingdom: '', phylum: '', class: t.iconic_taxa, order: '', family: '', genus: '' } : undefined,
    }));
  } catch { return []; }
}

/**
 * Search all four sources in parallel and return merged results.
 */
export async function universalSearch(query: string): Promise<{
  query: string;
  totalResults: number;
  results: SearchResult[];
  sources: Record<string, number>;
}> {
  const [gbif, wikipedia, wikidata, inaturalist] = await Promise.all([
    searchGBIF(query),
    searchWikipedia(query),
    searchWikidata(query),
    searchINaturalist(query),
  ]);

  const all = [...gbif, ...wikipedia, ...wikidata, ...inaturalist];

  // Deduplicate by scientific name
  const seen = new Map<string, SearchResult>();
  for (const r of all) {
    const key = r.scientificName.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, r);
    } else {
      // Merge: prefer entries with more data
      const existing = seen.get(key)!;
      if (!existing.image && r.image) existing.image = r.image;
      if (!existing.description && r.description) existing.description = r.description;
      if (!existing.gbifKey && r.gbifKey) existing.gbifKey = r.gbifKey;
      if (!existing.inaturalistId && r.inaturalistId) existing.inaturalistId = r.inaturalistId;
      if (!existing.conservationStatus && r.conservationStatus) existing.conservationStatus = r.conservationStatus;
    }
  }

  const results = Array.from(seen.values());
  const sources: Record<string, number> = {};
  for (const r of results) {
    sources[r.source] = (sources[r.source] ?? 0) + 1;
  }

  return { query, totalResults: results.length, results, sources };
}

/**
 * Look up a single species by scientific name across all sources.
 */
export async function lookupSpecies(scientificName: string): Promise<SearchResult | null> {
  const { results } = await universalSearch(scientificName);
  return results.find(r =>
    r.scientificName.toLowerCase() === scientificName.toLowerCase()
  ) ?? results[0] ?? null;
}
