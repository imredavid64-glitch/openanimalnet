'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SearchIcon, GlobeIcon, DatabaseIcon, ExternalLinkIcon, ChevronDownIcon, LoaderIcon, ShieldIcon, AlertTriangleIcon } from '@/components/icons';
import Link from 'next/link';
import { useI18n } from '@/components/i18n/I18nProvider';
import { sampleAnimals } from '@/data/sample/animals';

interface SearchResult {
  source: 'local' | 'gbif' | 'wikipedia' | 'wikidata';
  id: string;
  commonName: string;
  scientificName: string;
  category?: string;
  conservationStatus?: string;
  image?: string;
  description?: string;
  url?: string;
  confidence: number;
}

const SOURCE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  local: { label: 'Local DB', icon: <DatabaseIcon className="w-3 h-3" />, color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' },
  gbif: { label: 'GBIF', icon: <GlobeIcon className="w-3 h-3" />, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  wikipedia: { label: 'Wikipedia', icon: <ExternalLinkIcon className="w-3 h-3" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  wikidata: { label: 'Wikidata', icon: <ShieldIcon className="w-3 h-3" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

const CATEGORY_LABELS: Record<string, string> = {
  mammals: 'Mammal', birds: 'Bird', reptiles: 'Reptile', amphibians: 'Amphibian',
  marine: 'Marine', insects: 'Insect', invertebrates: 'Invertebrate', fish: 'Fish', unknown: 'Unknown',
};

const STATUS_LABELS: Record<string, string> = {
  CR: 'Critically Endangered', EN: 'Endangered', VU: 'Vulnerable',
  NT: 'Near Threatened', LC: 'Least Concern', DD: 'Data Deficient', NE: 'Not Evaluated',
};

const STATUS_COLORS: Record<string, string> = {
  CR: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  EN: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  VU: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  NT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  LC: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  DD: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  NE: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
};

export default function SearchPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSources, setSelectedSources] = useState<('local' | 'gbif' | 'wikipedia' | 'wikidata')[]>(['local', 'gbif', 'wikipedia', 'wikidata']);
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 1) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetch(`/api/v1/search?q=${encodeURIComponent(debouncedQuery)}&limit=30&sources=${selectedSources.join(',')}`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResults(data.data);
        } else {
          setError(data.error || 'Search failed');
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError('Network error \u2014 please try again');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery, selectedSources]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError('');
    inputRef.current?.focus();
  };

  const sourceToggle = (source: 'local' | 'gbif' | 'wikipedia' | 'wikidata') => {
    setSelectedSources(prev => prev.includes(source)
      ? prev.filter(s => s !== source)
      : [...prev, source]);
  };

  const getProfileLink = (result: SearchResult) => {
    if (result.source === 'local') {
      // Find local animal ID
      const localAnimal = sampleAnimals.find(
        (a) => a.scientificName.toLowerCase() === result.scientificName.toLowerCase() ||
                 a.commonName.toLowerCase() === result.commonName.toLowerCase()
      );
      return localAnimal ? `/animal/${localAnimal.id}` : (result.url ?? '#');
    }
    return result.url ?? '#';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <SearchIcon className="w-14 h-14 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">Global Species Search</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Search across 42 local species + 2M+ GBIF species + Wikipedia + Wikidata. Real-time, no database required.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 w-6 h-6" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search any species: common name, scientific name, habitat, location..."
                className="w-full pl-12 pr-16 py-4 text-lg bg-white dark:bg-secondary-800 rounded-2xl border-2 border-secondary-200 dark:border-secondary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-secondary-900 dark:text-white placeholder-secondary-400 transition-all"
                autoComplete="off"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                  aria-label="Clear search"
                >
                  <span className="text-xl">\u00d7</span>
                </button>
              )}
            </div>
            {loading && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-2 text-secondary-500">
                <LoaderIcon className="w-5 h-5 animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            )}
          </form>

          {/* Source Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-secondary-500 dark:text-secondary-400 mr-2">Sources:</span>
            {(['local', 'gbif', 'wikipedia', 'wikidata'] as const).map(source => {
              const info = SOURCE_LABELS[source];
              const active = selectedSources.includes(source);
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => sourceToggle(source)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? info.color + ' shadow-sm'
                      : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                  }`}
                >
                  {info.icon}
                  <span>{info.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                </button>
              );
            })}
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-danger-500 text-sm flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {debouncedQuery && (
            <motion.div
              key={debouncedQuery}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                  <span className="text-sm font-normal text-secondary-500 dark:text-secondary-400 ml-2">for \u201c{debouncedQuery}\u201d</span>
                </h2>
                {results.length > 0 && (
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    {results.filter(r => r.source === 'local').length} local \u00b7 {results.filter(r => r.source === 'gbif').length} GBIF \u00b7 {results.filter(r => r.source === 'wikipedia').length} Wiki
                  </span>
                )}
              </div>

              {results.length === 0 && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <SearchIcon className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">No species found</h3>
                  <p className="text-secondary-500 dark:text-secondary-400 max-w-md mx-auto">
                    Try a different name, scientific name, or broader term. External sources may have more results.
                  </p>
                </motion.div>
              )}

              <div className="space-y-4" ref={resultsRef}>
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg border border-secondary-100 dark:border-secondary-700 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {result.image && (
                        <Link href={getProfileLink(result)} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-cover bg-center shrink-0 shadow-md" style={{ backgroundImage: `url(${result.image})` }} aria-label={result.commonName} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Link href={getProfileLink(result)} className="group">
                              <h3 className="font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 transition-colors text-lg">
                                {result.commonName}
                              </h3>
                            </Link>
                            <p className="text-sm italic text-secondary-500 dark:text-secondary-400 truncate">{result.scientificName}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_LABELS[result.source].color}`}>
                              {SOURCE_LABELS[result.source].icon}
                              {SOURCE_LABELS[result.source].label}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${result.confidence >= 80 ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300' : result.confidence >= 60 ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300' : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300'}`}>
                              {result.confidence}%
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {result.category && (
                            <span className="px-2 py-1 rounded-lg text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                              {CATEGORY_LABELS[result.category] ?? result.category}
                            </span>
                          )}
                          {result.conservationStatus && (
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[result.conservationStatus] ?? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300'}`}>
                              {STATUS_LABELS[result.conservationStatus] ?? result.conservationStatus}
                            </span>
                          )}
                        </div>

                        {result.description && (
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2 mb-3">{result.description}</p>
                        )}

                        <div className="flex flex-wrap gap-3">
                          {getProfileLink(result) && (
                            <Link
                              href={getProfileLink(result)}
                              className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                            >
                              {result.source === 'local' ? 'View Profile' : 'View Details'}
                              <ChevronDownIcon className="w-4 h-4" />
                            </Link>
                          )}
                          {result.url && result.source !== 'local' && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                            >
                              <ExternalLinkIcon className="w-4 h-4" />
                              {result.source.charAt(0).toUpperCase() + result.source.slice(1)}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {loading && results.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                  <LoaderIcon className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Tips */}
        {!debouncedQuery && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-3xl mx-auto mt-16">
            <div className="bg-white/50 dark:bg-secondary-800/50 rounded-2xl p-8 border border-secondary-100 dark:border-secondary-700">
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-6 text-center">Search Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Common Names', examples: ['lion', 'bald eagle', 'monarch butterfly', 'great white shark'] },
                  { title: 'Scientific Names', examples: ['Panthera leo', 'Haliaeetus leucocephalus', 'Danaus plexippus'] },
                  { title: 'Habitats & Regions', examples: ['savanna', 'rainforest', 'coral reef', 'arctic', 'amazon'] },
                  { title: 'Conservation Status', examples: ['critically endangered', 'endangered', 'vulnerable', 'least concern'] },
                ].map((tip, i) => (
                  <div key={i} className="p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
                    <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">{tip.title}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {tip.examples.map((ex, j) => (
                        <button
                          key={j}
                          onClick={() => { setQuery(ex); inputRef.current?.focus(); }}
                          className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}