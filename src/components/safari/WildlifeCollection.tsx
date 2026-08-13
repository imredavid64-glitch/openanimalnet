'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Discovery, SafariStats } from '@/lib/useSafari';
import { sampleAnimals } from '@/data/sample/animals';
import { Animal } from '@/types/animal/types';
import { PawIcon, ShieldIcon, ChartIcon, XIcon } from '@/components/icons';

const STATUS_COLORS: Record<string, string> = {
  CR: 'bg-danger-500', EN: 'bg-danger-400', VU: 'bg-warning-500',
  NT: 'bg-warning-400', LC: 'bg-success-500', DD: 'bg-secondary-400', NE: 'bg-secondary-400',
};

const STATUS_TEXT: Record<string, string> = {
  CR: 'Critically Endangered', EN: 'Endangered', VU: 'Vulnerable',
  NT: 'Near Threatened', LC: 'Least Concern', DD: 'Data Deficient', NE: 'Not Evaluated',
};

export default function WildlifeCollection({
  discoveries,
  stats,
}: {
  discoveries: Discovery[];
  stats: SafariStats;
}) {
  const [filter, setFilter] = useState<'all' | 'discovered' | 'undiscovered'>('all');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'discoveries'>('name');

  const discoveryMap = useMemo(() => {
    const map = new Map<string, Discovery>();
    discoveries.forEach(d => map.set(d.animalId, d));
    return map;
  }, [discoveries]);

  const filteredAnimals = useMemo(() => {
    let list = [...sampleAnimals];

    if (filter === 'discovered') list = list.filter(a => discoveryMap.has(a.id));
    if (filter === 'undiscovered') list = list.filter(a => !discoveryMap.has(a.id));

    if (sortBy === 'name') list.sort((a, b) => a.commonName.localeCompare(b.commonName));
    if (sortBy === 'status') {
      const order = { CR: 0, EN: 1, VU: 2, NT: 3, LC: 4, DD: 5, NE: 6 };
      list.sort((a, b) => (order[a.conservationStatus as keyof typeof order] ?? 7) - (order[b.conservationStatus as keyof typeof order] ?? 7));
    }
    if (sortBy === 'discoveries') {
      list.sort((a, b) => {
        const da = discoveryMap.get(a.id)?.count ?? 0;
        const db = discoveryMap.get(b.id)?.count ?? 0;
        return db - da;
      });
    }

    return list;
  }, [filter, sortBy, discoveryMap]);

  const discovery = selectedAnimal ? discoveryMap.get(selectedAnimal.id) : null;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
            <PawIcon className="w-5 h-5 text-primary-600" />
            Wildlife Collection
          </h3>
          <span className="text-sm text-secondary-400">
            {stats.uniqueSpecies}/{stats.totalSpecies} species ({stats.completionPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-xl font-bold text-primary-600">{stats.totalDiscoveries}</div>
            <div className="text-xs text-secondary-400">Total Discoveries</div>
          </div>
          <div>
            <div className="text-xl font-bold text-success-600">{stats.uniqueSpecies}</div>
            <div className="text-xs text-secondary-400">Unique Species</div>
          </div>
          <div>
            <div className="text-xl font-bold text-warning-600">{stats.completionPercent}%</div>
            <div className="text-xs text-secondary-400">Complete</div>
          </div>
          <div>
            <div className="text-xl font-bold text-accent-600 truncate">{stats.rarestFound || 'None'}</div>
            <div className="text-xs text-secondary-400">Rarest Found</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: `All (${sampleAnimals.length})` },
          { id: 'discovered', label: `Found (${stats.uniqueSpecies})` },
          { id: 'undiscovered', label: `Undiscovered (${stats.totalSpecies - stats.uniqueSpecies})` },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            }`}
          >
            {f.label}
          </button>
        ))}

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="px-3 py-2 rounded-xl text-sm border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300"
        >
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
          <option value="discoveries">Sort by Discoveries</option>
        </select>
      </div>

      {/* Animal grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredAnimals.map((animal, i) => {
          const disc = discoveryMap.get(animal.id);
          const found = !!disc;

          return (
            <motion.button
              key={animal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAnimal(animal)}
              className={`relative p-3 rounded-2xl border text-left transition-all duration-200 ${
                found
                  ? 'bg-white dark:bg-secondary-800 border-primary-200 dark:border-primary-800 shadow-md'
                  : 'bg-secondary-50 dark:bg-secondary-800/50 border-secondary-200 dark:border-secondary-700 opacity-60 hover:opacity-100'
              }`}
            >
              {/* Status dot */}
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${STATUS_COLORS[animal.conservationStatus] || 'bg-secondary-400'}`} />

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                found ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-secondary-200 dark:bg-secondary-700'
              }`}>
                {found ? (
                  <PawIcon className="w-6 h-6 text-primary-600" />
                ) : (
                  <span className="text-2xl opacity-30">?</span>
                )}
              </div>

              {/* Name */}
              <div className="font-medium text-sm text-secondary-900 dark:text-white truncate">
                {found ? animal.commonName : '???'}
              </div>
              <div className="text-xs text-secondary-400 truncate">
                {found ? animal.scientificName : 'Undiscovered'}
              </div>

              {/* Discovery count */}
              {disc && disc.count > 1 && (
                <div className="mt-1 text-xs text-primary-600 font-medium">
                  x{disc.count}
                </div>
              )}

              {/* Photo badge */}
              {disc?.photoTaken && (
                <div className="absolute bottom-2 right-2 text-xs">📸</div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Animal detail modal */}
      <AnimatePresence>
        {selectedAnimal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedAnimal(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className={`p-5 ${discovery ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-secondary-50 dark:bg-secondary-700'} border-b border-secondary-200 dark:border-secondary-700`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                      {discovery ? selectedAnimal.commonName : '???'}
                    </h3>
                    <p className="text-sm text-secondary-500 italic">
                      {discovery ? selectedAnimal.scientificName : 'Undiscovered species'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAnimal(null)}
                    className="p-2 rounded-full hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
                  >
                    <XIcon className="w-5 h-5 text-secondary-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {discovery ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50 text-center">
                        <div className="text-sm font-bold text-secondary-900 dark:text-white">{selectedAnimal.conservationStatus}</div>
                        <div className="text-xs text-secondary-400">{STATUS_TEXT[selectedAnimal.conservationStatus]}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50 text-center">
                        <div className="text-sm font-bold text-secondary-900 dark:text-white">{selectedAnimal.populationEstimate?.toLocaleString() || 'N/A'}</div>
                        <div className="text-xs text-secondary-400">Population</div>
                      </div>
                    </div>

                    <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
                      {selectedAnimal.description}
                    </p>

                    <div className="text-xs text-secondary-500 space-y-1">
                      <div><span className="font-medium">First discovered:</span> {new Date(discovery.discoveredAt).toLocaleDateString()}</div>
                      <div><span className="font-medium">Times found:</span> {discovery.count}</div>
                      <div><span className="font-medium">Location:</span> {discovery.location.lat.toFixed(4)}, {discovery.location.lng.toFixed(4)}</div>
                      {discovery.photoTaken && <div>📸 Photo documented</div>}
                      {discovery.notes && <div><span className="font-medium">Notes:</span> {discovery.notes}</div>}
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`/animal/${selectedAnimal.id}`}
                        className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium text-center transition-colors"
                      >
                        View Full Profile
                      </a>
                      <button
                        onClick={() => setSelectedAnimal(null)}
                        className="px-4 py-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 text-sm font-medium transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <span className="text-5xl mb-4 block">🔍</span>
                    <p className="text-secondary-500 mb-4">This species hasn&apos;t been discovered yet.</p>
                    <p className="text-sm text-secondary-400">Go on a safari to find it!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
