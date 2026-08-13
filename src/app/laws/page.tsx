'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animalLaws, lawCategories, regions, countries, AnimalLaw } from '@/data/sample/animal-laws';
import { ShieldIcon, BookIcon, XIcon, SearchIcon } from '@/components/icons';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const CATEGORY_ICONS: Record<string, string> = {
  wildlife: '🌍',
  companion: '🐾',
  'service-animal': '🦮',
  agriculture: '🐄',
  trade: '📦',
};

const STATUS_COLORS = {
  active: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400',
  amended: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400',
  pending: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
};

export default function LawsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);

  const filteredLaws = useMemo(() => {
    let list = [...animalLaws];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.keyProvisions.some(p => p.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) list = list.filter(l => l.category === selectedCategory);
    if (selectedRegion) list = list.filter(l => l.region === selectedRegion);
    return list.sort((a, b) => b.year - a.year);
  }, [search, selectedCategory, selectedRegion]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white dark:from-secondary-900 dark:to-secondary-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <ShieldIcon className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto" />
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">
            Animal Laws
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-4 max-w-3xl mx-auto">
            Explore {animalLaws.length} key animal protection laws from around the world.
            Search by name, country, or topic to understand the legal framework
            that protects animals globally.
          </p>
        </motion.div>

        {/* Category cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {lawCategories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`p-4 rounded-2xl text-left transition-all duration-200 border ${
                selectedCategory === cat.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 shadow-md'
                  : 'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 hover:border-primary-200 dark:hover:border-primary-800'
              }`}
            >
              <span className="text-2xl">{CATEGORY_ICONS[cat.id]}</span>
              <div className="font-medium text-sm text-secondary-900 dark:text-white mt-2">{cat.label}</div>
              <div className="text-xs text-secondary-400">{cat.count} laws</div>
            </motion.button>
          ))}
        </div>

        {/* Search and filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search laws, countries, provisions..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <select
            value={selectedRegion || ''}
            onChange={e => setSelectedRegion(e.target.value || null)}
            className="px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
          >
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-secondary-400 mb-4">
          Showing {filteredLaws.length} of {animalLaws.length} laws
          {selectedCategory && <span> in <strong>{lawCategories.find(c => c.id === selectedCategory)?.label}</strong></span>}
          {selectedRegion && <span> from <strong>{selectedRegion}</strong></span>}
        </div>

        {/* Laws list */}
        <div className="space-y-3">
          {filteredLaws.map((law, i) => (
            <motion.div
              key={law.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedLaw(expandedLaw === law.id ? null : law.id)}
                className="w-full text-left p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{CATEGORY_ICONS[law.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-secondary-900 dark:text-white">{law.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[law.status]}`}>
                        {law.status}
                      </span>
                    </div>
                    <div className="text-sm text-secondary-500 mt-1">
                      {law.country} · {law.year} · {law.region}
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2 line-clamp-2">
                      {law.summary}
                    </p>
                  </div>
                  <span className="text-secondary-400 text-sm">{expandedLaw === law.id ? '−' : '+'}</span>
                </div>
              </button>

              <AnimatePresence>
                {expandedLaw === law.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-secondary-100 dark:border-secondary-700 pt-4">
                      {/* Summary */}
                      <div>
                        <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-1">Summary</h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">{law.summary}</p>
                      </div>

                      {/* Key provisions */}
                      <div>
                        <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-2">Key Provisions</h4>
                        <ul className="space-y-1">
                          {law.keyProvisions.map((p, j) => (
                            <li key={j} className="text-sm text-secondary-600 dark:text-secondary-400 flex items-start gap-2">
                              <span className="text-primary-500 mt-0.5">•</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Enforcement & penalties */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                          <h4 className="text-xs font-semibold text-secondary-500 mb-1">Enforcement</h4>
                          <p className="text-sm text-secondary-700 dark:text-secondary-300">{law.enforcement}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                          <h4 className="text-xs font-semibold text-secondary-500 mb-1">Penalties</h4>
                          <p className="text-sm text-secondary-700 dark:text-secondary-300">{law.penalties}</p>
                        </div>
                      </div>

                      {/* Official link */}
                      <a
                        href={law.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        <BookIcon className="w-4 h-4" />
                        View Official Source
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredLaws.length === 0 && (
          <div className="text-center py-12 text-secondary-400">
            <ShieldIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No laws match your search. Try different keywords.</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-10 p-4 rounded-xl bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-800">
          <p className="text-sm text-warning-700 dark:text-warning-400">
            <strong>Disclaimer:</strong> This database is for educational purposes only and does not
            constitute legal advice. Laws change frequently. Always consult official government
            sources and qualified legal professionals for specific legal questions.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
