/**
 * Global Species Search Engine
 * Searches across GBIF, Wikipedia, and local dataset for ANY species
 * No database required - uses public APIs + local index
 */

import { sampleAnimals } from '@/data/sample/animals';
import type { Animal } from '@/types/animal/types';

export interface SearchResult {
  source: 'local' | 'gbif' | 'wikipedia' | 'wikidata';
  id: string;
  commonName: string;
  scientificName: string;
  category?: string;
  conservationStatus?: string;
  image?: string;
  description?: string;
  url?: string;
  confidence: number; // 0-100
}

const GBIF_API = 'https://api.gbif.org/v1';
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';

// Local search index for instant results
function buildLocalIndex(): Map<string, Animal[]> {
  const index = new Map<string, Animal[]>();
  for (const animal of sampleAnimals) {
    const keys = [
      animal.commonName.toLowerCase(),
      animal.scientificName.toLowerCase(),
      animal.id.toLowerCase(),
      ...(animal.habitat?.map(h => h.toLowerCase()) ?? []),
      animal.category.toLowerCase(),
      animal.conservationStatus.toLowerCase(),
    ];
    for (const key of keys) {
      const words = key.split(/\s+/);
      for (const word of words) {
        if (word.length >= 2) {
          const existing = index.get(word) ?? [];
          existing.push(animal);
          index.set(word, existing);
        }
      }
    }
  }
  return index;
}

let localIndex: Map<string, Animal[]> | null = null;

function getLocalIndex(): Map<string, Animal[]> {
  if (!localIndex) localIndex = buildLocalIndex();
  return localIndex;
}

export function searchLocal(query: string, limit = 20): SearchResult[] {
  const index = getLocalIndex();
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results = new Map<string, SearchResult>();

  // Exact phrase match
  for (const animal of sampleAnimals) {
    const common = animal.commonName.toLowerCase();
    const scientific = animal.scientificName.toLowerCase();
    if (common.includes(q) || scientific.includes(q) || animal.id.toLowerCase().includes(q)) {
      const score = common === q || scientific === q ? 100 : 90;
      results.set(animal.id, {
        source: 'local',
        id: animal.id,
        commonName: animal.commonName,
        scientificName: animal.scientificName,
        category: animal.category,
        conservationStatus: animal.conservationStatus,
        image: animal.images?.[0],
        confidence: score,
      });
    }
  }

  // Token-based match
  const tokens = q.split(/\s+/).filter(t => t.length >= 2);
  for (const token of tokens) {
    const matches = index.get(token) ?? [];
    for (const animal of matches) {
      if (!results.has(animal.id)) {
        results.set(animal.id, {
          source: 'local',
          id: animal.id,
          commonName: animal.commonName,
          scientificName: animal.scientificName,
          category: animal.category,
          conservationStatus: animal.conservationStatus,
          image: animal.images?.[0],
          confidence: 70,
        });
      }
    }
  }

  return Array.from(results.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

// GBIF species search
export async function searchGBIF(query: string, limit = 20): Promise<SearchResult[]> {
  try {
    const url = `${GBIF_API}/species/match?name=${encodeURIComponent(query)}&strict=false&verbose=true`;
    const res = await fetch(url, { headers: { 'User-Agent': 'OpenAnimalNet/1.0' } });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.usageKey) return [];

    // Get full species info
    const speciesUrl = `${GBIF_API}/species/${data.usageKey}`;
    const speciesRes = await fetch(speciesUrl, { headers: { 'User-Agent': 'OpenAnimalNet/1.0' } });
    if (!speciesRes.ok) return [];

    const species = await speciesRes.json();

    // Get occurrence count for confidence
    const occUrl = `${GBIF_API}/occurrence/search?taxonKey=${data.usageKey}&limit=0`;
    const occRes = await fetch(occUrl, { headers: { 'User-Agent': 'OpenAnimalNet/1.0' } });
    const occData = occRes.ok ? await occRes.json() : { count: 0 };

    return [{
      source: 'gbif',
      id: `gbif-${data.usageKey}`,
      commonName: species.vernacularName ?? species.species ?? query,
      scientificName: species.scientificName ?? query,
      category: mapGBIFClass(species.class),
      conservationStatus: undefined,
      description: `${occData.count} occurrences in GBIF`,
      url: `https://www.gbif.org/species/${data.usageKey}`,
      confidence: Math.min(85, 50 + Math.log10(Math.max(1, occData.count)) * 5),
    }];
  } catch {
    return [];
  }
}

// GBIF autocomplete for typeahead
export async function autocompleteGBIF(query: string, limit = 10): Promise<SearchResult[]> {
  if (query.length < 2) return [];
  try {
    const url = `${GBIF_API}/species/suggest?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'OpenAnimalNet/1.0' } });
    if (!res.ok) return [];

    const data = await res.json();
    return data.map((s: any) => ({
      source: 'gbif' as const,
      id: `gbif-${s.key}`,
      commonName: s.vernacularName ?? s.species ?? '',
      scientificName: s.scientificName ?? '',
      category: mapGBIFClass(s.class),
      confidence: 60,
      url: `https://www.gbif.org/species/${s.key}`,
    })).filter((r: { scientificName?: string }) => r.scientificName);
  } catch {
    return [];
  }
}

// Wikipedia search
export async function searchWikipedia(query: string, limit = 10): Promise<SearchResult[]> {
  try {
    const url = `${WIKIPEDIA_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json&srprop=snippet`;
    const res = await fetch(url, { headers: { 'User-Agent': 'OpenAnimalNet/1.0' } });
    if (!res.ok) return [];

    const data = await res.json();
    const results = data.query?.search ?? [];

    return results.map((page: any) => ({
      source: 'wikipedia' as const,
      id: `wiki-${page.pageid}`,
      commonName: page.title,
      scientificName: extractScientificName(page.snippet) ?? '',
      description: stripHtml(page.snippet),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
      confidence: 50,
    })).filter((r: { commonName?: string }) => r.commonName);
  } catch {
    return [];
  }
}

// Wikidata search (for taxonomy + images)
export async function searchWikidata(query: string, limit = 10): Promise<SearchResult[]> {
  try {
    const url = `${WIKIDATA_API}?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&type=item&limit=${limit}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'OpenAnimalNet/1.0' } });
    if (!res.ok) return [];

    const data = await res.json();
    return data.search?.map((item: any) => ({
      source: 'wikidata' as const,
      id: `wd-${item.id}`,
      commonName: item.label,
      scientificName: item.description ?? '',
      description: item.description,
      url: `https://www.wikidata.org/wiki/${item.id}`,
      confidence: 55,
    })) ?? [];
  } catch {
    return [];
  }
}

// Unified search across all sources
export async function searchAllSources(query: string, options: {
  includeLocal?: boolean;
  includeGBIF?: boolean;
  includeWikipedia?: boolean;
  includeWikidata?: boolean;
  limit?: number;
} = {}): Promise<SearchResult[]> {
  const {
    includeLocal = true,
    includeGBIF = true,
    includeWikipedia = true,
    includeWikidata = true,
    limit = 20,
  } = options;

  const results: SearchResult[] = [];

  // Local first (instant)
  if (includeLocal) {
    results.push(...searchLocal(query, limit));
  }

  // Parallel external searches
  const promises: Promise<SearchResult[]>[] = [];
  if (includeGBIF) promises.push(searchGBIF(query, Math.ceil(limit / 3)));
  if (includeWikipedia) promises.push(searchWikipedia(query, Math.ceil(limit / 3)));
  if (includeWikidata) promises.push(searchWikidata(query, Math.ceil(limit / 3)));

  const externalResults = await Promise.allSettled(promises);
  for (const result of externalResults) {
    if (result.status === 'fulfilled') {
      results.push(...result.value);
    }
  }

  // Deduplicate by scientific name
  const seen = new Set<string>();
  const deduped = results.filter(r => {
    const key = r.scientificName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

// Species detail from GBIF (for species not in local DB)
export async function getSpeciesDetailGBIF(usageKey: number): Promise<SearchResult | null> {
  try {
    const [speciesRes, occRes, mediaRes] = await Promise.all([
      fetch(`${GBIF_API}/species/${usageKey}`, { headers: { 'User-Agent': 'OpenAnimalNet/1.0' } }),
      fetch(`${GBIF_API}/occurrence/search?taxonKey=${usageKey}&limit=0`, { headers: { 'User-Agent': 'OpenAnimalNet/1.0' } }),
      fetch(`${GBIF_API}/species/${usageKey}/media?limit=5`, { headers: { 'User-Agent': 'OpenAnimalNet/1.0' } }),
    ]);

    const [species, occData, mediaData] = await Promise.all([
      speciesRes.ok ? speciesRes.json() : null,
      occRes.ok ? occRes.json() : { count: 0 },
      mediaRes.ok ? mediaRes.json() : { results: [] },
    ]);

    if (!species) return null;

    return {
      source: 'gbif',
      id: `gbif-${usageKey}`,
      commonName: species.vernacularName ?? species.species ?? '',
      scientificName: species.scientificName ?? '',
      category: mapGBIFClass(species.class),
      conservationStatus: undefined,
      image: mediaData.results?.[0]?.identifier,
      description: `${occData.count} occurrences • Kingdom: ${species.kingdom} • Phylum: ${species.phylum} • Class: ${species.class} • Order: ${species.order} • Family: ${species.family}`,
      url: `https://www.gbif.org/species/${usageKey}`,
      confidence: 80,
    };
  } catch {
    return null;
  }
}

// Helper: map GBIF class to our categories
function mapGBIFClass(gbifClass?: string): string {
  if (!gbifClass) return 'unknown';
  const c = gbifClass.toLowerCase();
  if (c.includes('mammalia')) return 'mammals';
  if (c.includes('aves')) return 'birds';
  if (c.includes('reptilia')) return 'reptiles';
  if (c.includes('amphibia')) return 'amphibians';
  if (c.includes('actinopterygii') || c.includes('chondrichthyes')) return 'marine';
  if (c.includes('insecta')) return 'insects';
  if (c.includes('arachnida') || c.includes('malacostraca')) return 'invertebrates';
  if (c.includes('mollusca')) return 'invertebrates';
  if (c.includes('cnidaria')) return 'marine';
  return 'unknown';
}

// Extract scientific name from Wikipedia snippet
function extractScientificName(snippet: string): string | null {
  const match = snippet.match(/<i>([^<]+)<\/i>/) ?? snippet.match(/\(([A-Z][a-z]+ [a-z]+)\)/);
  return match?.[1] ?? null;
}

function stripHtml(html: string): string {
  return html.replace(/<\/?[^>]+>/g, '').replace(/&[^;]+;/g, '').trim();
}

// Cache for search results (in-memory, cleared on reload)
const searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function cachedSearchAll(query: string, options?: Parameters<typeof searchAllSources>[1]): Promise<SearchResult[]> {
  const cacheKey = JSON.stringify({ query, options });
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results;
  }
  const results = await searchAllSources(query, options);
  searchCache.set(cacheKey, { results, timestamp: Date.now() });
  return results;
}