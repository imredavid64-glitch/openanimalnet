'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sampleAnimals } from '@/data/sample/animals';
import { Animal } from '@/types/animal/types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { PawIcon, XIcon, ChartIcon } from '@/components/icons';

const COMPARISON_COLORS = [
  '#0ea5e9', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

// Merge all selected species' population histories into a single dataset
// keyed by year, so Recharts can plot multiple lines on the same axes.
function buildComparisonData(species: Animal[]) {
  const yearMap = new Map<number, Record<string, number | string>>();
  for (const sp of species) {
    if (!sp.populationHistory) continue;
    for (const pt of sp.populationHistory) {
      if (!yearMap.has(pt.year)) yearMap.set(pt.year, { year: pt.year });
      yearMap.get(pt.year)![sp.id] = pt.estimate;
    }
  }
  return Array.from(yearMap.values()).sort((a, b) => (a.year as number) - (b.year as number));
}

function formatPopulation(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export default function SpeciesComparison() {
  const [selected, setSelected] = useState<Animal[]>([]);
  const [search, setSearch] = useState('');

  const available = useMemo(() => {
    const q = search.toLowerCase();
    return sampleAnimals
      .filter(a => a.populationHistory && a.populationHistory.length >= 2)
      .filter(a => !selected.find(s => s.id === a.id))
      .filter(a =>
        !q || a.commonName.toLowerCase().includes(q) || a.scientificName.toLowerCase().includes(q)
      )
      .sort((a, b) => a.commonName.localeCompare(b.commonName));
  }, [search, selected]);

  const chartData = useMemo(() => buildComparisonData(selected), [selected]);

  const addSpecies = (animal: Animal) => {
    if (selected.length < 6) {
      setSelected(prev => [...prev, animal]);
      setSearch('');
    }
  };

  const removeSpecies = (id: string) => {
    setSelected(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
          <PawIcon className="w-5 h-5 text-primary-600" />
          Select Species to Compare
          <span className="text-sm font-normal text-secondary-400 ml-2">
            {selected.length}/6 selected
          </span>
        </h3>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search species..."
            className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-secondary-900 dark:text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          />
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selected.map((sp, i) => (
              <motion.span
                key={sp.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: COMPARISON_COLORS[i % COMPARISON_COLORS.length] }}
              >
                {sp.commonName}
                <button
                  onClick={() => removeSpecies(sp.id)}
                  className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${sp.commonName}`}
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            ))}
          </div>
        )}

        {/* Available species grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {available.map(sp => (
            <button
              key={sp.id}
              onClick={() => addSpecies(sp)}
              disabled={selected.length >= 6}
              className="text-left px-3 py-2 rounded-xl text-sm bg-secondary-50 dark:bg-secondary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-secondary-700 dark:text-secondary-300 hover:text-primary-700 dark:hover:text-primary-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
            >
              <div className="font-medium truncate">{sp.commonName}</div>
              <div className="text-xs text-secondary-400 italic truncate">{sp.scientificName}</div>
            </button>
          ))}
          {available.length === 0 && (
            <p className="col-span-full text-sm text-secondary-400 py-4 text-center">
              {selected.length >= 6 ? 'Maximum 6 species reached' : 'No matching species'}
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                <ChartIcon className="w-5 h-5 text-primary-600" />
                Population Trends Comparison
              </h3>
              <span className="text-xs text-secondary-400">
                {selected.length} species · {chartData.length} data points
              </span>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis
                    dataKey="year"
                    stroke="#94a3b8"
                    tickFormatter={(v: number) => String(v)}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tickFormatter={(v: number) => formatPopulation(v)}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const sp = selected.find(s => s.id === name);
                      return [value.toLocaleString(), sp?.commonName ?? name];
                    }}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const sp = selected.find(s => s.id === value);
                      return sp?.commonName ?? value;
                    }}
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  {selected.map((sp, i) => (
                    <Line
                      key={sp.id}
                      type="monotone"
                      dataKey={sp.id}
                      stroke={COMPARISON_COLORS[i % COMPARISON_COLORS.length]}
                      strokeWidth={3}
                      dot={{ r: 5, strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Source notes */}
            <div className="mt-4 space-y-1">
              {selected.map((sp, i) => (
                sp.populationHistoryNote && (
                  <p key={sp.id} className="text-xs text-secondary-500 dark:text-secondary-400">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: COMPARISON_COLORS[i % COMPARISON_COLORS.length] }}
                    />
                    <strong>{sp.commonName}:</strong> {sp.populationHistoryNote}
                  </p>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selected.length === 0 && (
        <div className="text-center py-12 text-secondary-400">
          <PawIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select species above to compare their population trends</p>
          <p className="text-xs mt-1">Up to 6 species can be compared at once</p>
        </div>
      )}
    </div>
  );
}
