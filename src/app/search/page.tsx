'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SearchIcon, GlobeIcon, BookIcon, ShieldIcon, PinIcon } from '@/components/icons';

interface SearchResult {
  source: string;
  sourceUrl: string;
  scientificName: string;
  commonName: string;
  description: string;
  image?: string;
  taxonomy?: { kingdom: string; phylum: string; class: string; order: string; family: string; genus: string };
  conservationStatus?: string;
  gbifKey?: number;
  inaturalistId?: number;
  wikipediaTitle?: string;
}

const sourceColors: Record<string, string> = {
  GBIF: 'bg-success-500',
  Wikipedia: 'bg-secondary-500',
  Wikidata: 'bg-primary-500',
  iNaturalist: 'bg-success-600',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [sources, setSources] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q?: string) => {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data.results);
        setSources(data.data.sources);
      }
    } catch { setResults([]); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <SearchIcon className="w-14 h-14 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">Universal Animal Search</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Search any species across GBIF, Wikipedia, Wikidata, and iNaturalist simultaneously.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto mb-12">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by common or scientific name (e.g., Panthera leo, humpback whale)..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-lg focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold transition-colors disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {['Panthera leo', 'Blue whale', 'Monarch butterfly', 'Emperor penguin', 'Giant panda'].map(q => (
              <button key={q} onClick={() => { setQuery(q); handleSearch(q); }}
                className="px-3 py-1 rounded-full text-sm bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-700 hover:bg-primary-50 dark:hover:bg-secondary-700 transition-colors">
                {q}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Source summary */}
        {searched && Object.keys(sources).length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.entries(sources).map(([source, count]) => (
                <span key={source} className="px-4 py-2 rounded-xl bg-white dark:bg-secondary-800 text-sm font-medium text-secondary-700 dark:text-secondary-300 shadow-sm border border-secondary-200 dark:border-secondary-700">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${sourceColors[source] ?? 'bg-secondary-400'}`} />
                  {source}: {count} results
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        <div className="max-w-4xl mx-auto space-y-4">
          {loading && (
            <div className="text-center py-12">
              <GlobeIcon className="w-12 h-12 text-primary-600 animate-spin mx-auto" />
              <p className="text-secondary-500 mt-4">Searching across 4 live sources...</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">No results found</h3>
              <p className="text-secondary-500 dark:text-secondary-400">Try a different common or scientific name.</p>
            </div>
          )}

          {results.map((r, i) => (
            <motion.div
              key={`${r.source}-${r.scientificName}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg border border-secondary-100 dark:border-secondary-700 hover:shadow-xl transition-shadow"
            >
              <div className="flex gap-4">
                {r.image && (
                  <div className="w-24 h-24 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${r.image})` }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">{r.commonName}</h3>
                      <p className="text-sm italic text-secondary-500 dark:text-secondary-400">{r.scientificName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shrink-0 ${sourceColors[r.source] ?? 'bg-secondary-400'}`}>
                      {r.source}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2 line-clamp-2">{r.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {r.conservationStatus && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300">
                        {r.conservationStatus}
                      </span>
                    )}
                    {r.taxonomy?.class && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                        {r.taxonomy.class}
                      </span>
                    )}
                    <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded-lg text-xs font-medium bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors">
                      View on {r.source} ↗
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}