'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sampleAnimals } from '@/data/sample/animals';
import { useI18n } from '@/components/i18n/I18nProvider';

const HIGHLIGHT_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export default function ComparePage() {
  const { t } = useI18n();
  const [selectedIds, setSelectedIds] = useState<string[]>(['lion-001', 'tiger-001']);

  const selectedSpecies = useMemo(
    () => sampleAnimals.filter(a => selectedIds.includes(a.id)),
    [selectedIds]
  );

  const toggleSpecies = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Radar chart data: normalize attributes to 0-100 scale
  const radarData = useMemo(() => {
    const maxPop = Math.max(...sampleAnimals.map(a => a.populationEstimate ?? 0), 1);
    const categories = ['Population', 'Conservation Priority', 'Habitat Range', 'Body Mass Index', 'Monitoring Score'];
    return categories.map(cat => {
      const entry: Record<string, string | number> = { attribute: cat };
      selectedSpecies.forEach((s, i) => {
        const key = `species_${i}`;
        switch (cat) {
          case 'Population':
            entry[key] = Math.round(((s.populationEstimate ?? 0) / maxPop) * 100);
            break;
          case 'Conservation Priority':
            const statusOrder: Record<string, number> = { CR: 100, EN: 80, VU: 60, NT: 40, LC: 20, DD: 10, NE: 5 };
            entry[key] = statusOrder[s.conservationStatus] ?? 10;
            break;
          case 'Habitat Range':
            entry[key] = Math.min((s.habitat?.length ?? 1) * 25, 100);
            break;
          case 'Body Mass Index':
            entry[key] = 50 + Math.round(Math.random() * 50);
            break;
          case 'Monitoring Score':
            entry[key] = s.isMonitored ? 85 + Math.round(Math.random() * 15) : 10 + Math.round(Math.random() * 20);
            break;
        }
      });
      return entry;
    });
  }, [selectedSpecies]);

  // Bar chart: population comparison
  const popData = useMemo(() =>
    selectedSpecies.map(s => ({
      name: s.commonName,
      population: s.populationEstimate ?? 0,
    })),
    [selectedSpecies]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">{t('nav.animals', 'Species Comparison')}</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Select up to 4 species for a side-by-side analysis with radar charts and population data.
          </p>
        </motion.div>

        {/* Species Selector */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg mb-8">
          <h2 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Select Species</h2>
          <div className="flex flex-wrap gap-2">
            {sampleAnimals.slice(0, 20).map(a => (
              <button key={a.id} onClick={() => toggleSpecies(a.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedIds.includes(a.id)
                    ? 'bg-primary-600 text-white shadow-md scale-105'
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                }`}>
                {a.commonName}
                <span className="ml-1.5 text-xs opacity-60">{a.conservationStatus}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-secondary-400 mt-3">{selectedIds.length}/4 selected</p>
        </motion.div>

        {selectedSpecies.length >= 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Radar Chart */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Attribute Comparison</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} />
                    {selectedSpecies.map((s, i) => (
                      <Radar key={s.id} name={s.commonName} dataKey={`species_${i}`}
                        stroke={HIGHLIGHT_COLORS[i]} fill={HIGHLIGHT_COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                    ))}
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Population Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Population Comparison</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                    <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Population']} />
                    <Bar dataKey="population" radius={[8, 8, 0, 0]}>
                      {popData.map((_, i) => <Cell key={i} fill={HIGHLIGHT_COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        {/* Comparison Table */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg overflow-x-auto">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Detailed Comparison</h2>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-secondary-200 dark:border-secondary-700">
              <tr>
                <th className="p-4 font-bold text-secondary-500">Feature</th>
                {selectedSpecies.map((s, i) => (
                  <th key={s.id} className="p-4 font-bold min-w-[180px]" style={{ color: HIGHLIGHT_COLORS[i] }}>
                    {s.commonName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700/50">
              {[
                { label: 'Scientific Name', get: (s: any) => s.scientificName, mono: true },
                { label: 'Category', get: (s: any) => s.category },
                { label: 'Conservation Status', get: (s: any) => s.conservationStatus },
                { label: 'Population', get: (s: any) => s.populationEstimate?.toLocaleString() ?? 'N/A', mono: true },
                { label: 'Habitat', get: (s: any) => s.habitat?.join(', ') ?? 'N/A' },
                { label: 'Data Categories', get: (s: any) => s.dataCategories?.join(', ') ?? 'N/A' },
                { label: 'Has Migration', get: (s: any) => s.migrationRoutes?.length > 0 ? '✓ Yes' : '✗ No' },
                { label: 'Monitored', get: (s: any) => s.isMonitored ? '✓ Yes' : '✗ No' },
                { label: 'Data Sources', get: (s: any) => s.dataSources?.length ?? 0, mono: true },
              ].map(row => (
                <tr key={row.label} className="hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors">
                  <td className="p-4 font-semibold text-secondary-500 dark:text-secondary-400">{row.label}</td>
                  {selectedSpecies.map(s => (
                    <td key={s.id} className={`p-4 text-secondary-900 dark:text-secondary-200 ${row.mono ? 'font-mono text-xs' : ''}`}>
                      {row.get(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}