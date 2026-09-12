'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sampleAnimals } from '@/data/sample/animals';
import { ShieldIcon, UsersIcon, GlobeIcon, SearchIcon, XIcon, PinIcon } from '@/components/icons';
import Link from 'next/link';
import { useI18n } from '@/components/i18n/I18nProvider';

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

const CATEGORY_LABELS: Record<string, string> = {
  mammals: 'Mammal', birds: 'Bird', reptiles: 'Reptile', amphibians: 'Amphibian',
  marine: 'Marine', insects: 'Insect', invertebrates: 'Invertebrate', fish: 'Fish', unknown: 'Unknown',
};

const CATEGORY_COLORS: Record<string, string> = {
  mammals: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  birds: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  reptiles: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  amphibians: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  marine: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  insects: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  invertebrates: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  fish: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

export default function ComparePage() {
  const { t } = useI18n();
  const [speciesAId, setSpeciesAId] = useState<string>(sampleAnimals[0].id);
  const [speciesBId, setSpeciesBId] = useState<string>(sampleAnimals[1].id);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const speciesA = useMemo(() => sampleAnimals.find(a => a.id === speciesAId) ?? sampleAnimals[0], [speciesAId]);
  const speciesB = useMemo(() => sampleAnimals.find(a => a.id === speciesBId) ?? sampleAnimals[1], [speciesBId]);

  const comparisonData = useMemo(() => {
    const fields = [
      { key: 'commonName', label: 'Common Name', type: 'text' },
      { key: 'scientificName', label: 'Scientific Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'category' },
      { key: 'conservationStatus', label: 'IUCN Status', type: 'status' },
      { key: 'populationEstimate', label: 'Population Estimate', type: 'number' },
      { key: 'habitat', label: 'Habitat Types', type: 'array' },
      { key: 'location', label: 'Reference Location', type: 'location' },
      { key: 'migrationRoutes', label: 'Migration Routes', type: 'migration' },
      { key: 'populationHistory', label: 'Population History', type: 'history' },
      { key: 'isMonitored', label: 'Actively Monitored', type: 'boolean' },
      { key: 'dataCategories', label: 'Data Categories', type: 'array' },
    ];

    return fields.map(field => {
      let valA: any = speciesA[field.key as keyof typeof speciesA];
      let valB: any = speciesB[field.key as keyof typeof speciesB];
      let formattedA: string, formattedB: string;

      switch (field.type) {
        case 'category':
          formattedA = CATEGORY_LABELS[valA] ?? valA;
          formattedB = CATEGORY_LABELS[valB] ?? valB;
          break;
        case 'status':
          formattedA = STATUS_LABELS[valA] ?? valA;
          formattedB = STATUS_LABELS[valB] ?? valB;
          break;
        case 'number':
          formattedA = valA ? valA.toLocaleString() : 'Unknown';
          formattedB = valB ? valB.toLocaleString() : 'Unknown';
          break;
        case 'array':
          formattedA = Array.isArray(valA) ? valA.join(', ') : 'None';
          formattedB = Array.isArray(valB) ? valB.join(', ') : 'None';
          break;
        case 'location':
          formattedA = valA ? `${valA.latitude.toFixed(2)}, ${valA.longitude.toFixed(2)}` : 'Unknown';
          formattedB = valB ? `${valB.latitude.toFixed(2)}, ${valB.longitude.toFixed(2)}` : 'Unknown';
          break;
        case 'migration':
          formattedA = valA?.length ? valA.map((r: any) => r.name).join('; ') : 'None';
          formattedB = valB?.length ? valB.map((r: any) => r.name).join('; ') : 'None';
          break;
        case 'history':
          formattedA = valA?.length ? valA.map((h: any) => `${h.year}: ${h.estimate.toLocaleString()}`).join('; ') : 'None';
          formattedB = valB?.length ? valB.map((h: any) => `${h.year}: ${h.estimate.toLocaleString()}`).join('; ') : 'None';
          break;
        case 'boolean':
          formattedA = valA ? 'Yes' : 'No';
          formattedB = valB ? 'Yes' : 'No';
          break;
        default:
          formattedA = String(valA ?? 'Unknown');
          formattedB = String(valB ?? 'Unknown');
      }

      return { label: field.label, a: formattedA, b: formattedB, rawA: valA, rawB: valB, type: field.type };
    });
  }, [speciesA, speciesB]);

  const handleSpeciesSelect = (which: 'A' | 'B', id: string) => {
    if (which === 'A') setSpeciesAId(id);
    else setSpeciesBId(id);
  };

  const speciesOptions = useMemo(() => sampleAnimals.map(a => ({
    id: a.id,
    label: `${a.commonName} (${a.scientificName})`,
    status: a.conservationStatus,
    category: a.category,
  })), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <SearchIcon className="w-14 h-14 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">Species Comparison</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Side-by-side comparison of any two species across taxonomy, conservation, population, and ecology.
          </p>
        </motion.div>

        {/* Species Selectors */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {['A', 'B'].map((which) => (
            <div key={which} className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg border border-secondary-100 dark:border-secondary-700">
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Species {which}</h3>
              <select
                value={which === 'A' ? speciesAId : speciesBId}
                onChange={e => handleSpeciesSelect(which as 'A' | 'B', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                {speciesOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} — {opt.status}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg border border-secondary-100 dark:border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">Species A</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{speciesA.commonName}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[speciesA.conservationStatus]}`}>
                {speciesA.conservationStatus}
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg border border-secondary-100 dark:border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">Species B</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{speciesB.commonName}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[speciesB.conservationStatus]}`}>
                {speciesB.conservationStatus}
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg border border-secondary-100 dark:border-secondary-700">
            <p className="text-sm text-secondary-500">Population Ratio</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white font-data">
              {speciesA.populationEstimate && speciesB.populationEstimate
                ? (speciesA.populationEstimate / speciesB.populationEstimate).toFixed(2) + 'x'
                : 'N/A'}
            </p>
          </div>
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg border border-secondary-100 dark:border-secondary-700">
            <p className="text-sm text-secondary-500">Category Match</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white font-data">
              {speciesA.category === speciesB.category ? 'Same' : 'Different'}
            </p>
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-secondary-800 rounded-3xl shadow-lg border border-secondary-100 dark:border-secondary-700 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-secondary-100 dark:border-secondary-700">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Detailed Comparison</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'}`}
              >
                Cards
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {viewMode === 'table' ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary-50 dark:bg-secondary-900/50">
                    <th className="text-left p-4 font-semibold text-secondary-600 dark:text-secondary-400">Attribute</th>
                    <th className="text-center p-4 font-semibold text-secondary-600 dark:text-secondary-400">
                      {speciesA.commonName}
                    </th>
                    <th className="text-center p-4 font-semibold text-secondary-600 dark:text-secondary-400">
                      {speciesB.commonName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={row.label} className={`border-b border-secondary-100 dark:border-secondary-700 ${i % 2 === 0 ? 'bg-secondary-50 dark:bg-secondary-900/30' : ''}`}>
                      <td className="p-4 font-medium text-secondary-900 dark:text-white">{row.label}</td>
                      <td className="p-4 text-center text-secondary-700 dark:text-secondary-300">{row.a}</td>
                      <td className="p-4 text-center text-secondary-700 dark:text-secondary-300">{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {comparisonData.map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-secondary-50 dark:bg-secondary-900/30 rounded-xl p-4"
                  >
                    <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">{row.label}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white dark:bg-secondary-800 rounded-lg p-3">
                        <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">{speciesA.commonName}</p>
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">{row.a}</p>
                      </div>
                      <div className="bg-white dark:bg-secondary-800 rounded-lg p-3">
                        <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">{speciesB.commonName}</p>
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">{row.b}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Visual Comparison Cards */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {['A', 'B'].map((which) => {
            const sp = which === 'A' ? speciesA : speciesB;
            return (
              <motion.div
                key={which}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: which === 'A' ? 0.5 : 0.6 }}
                className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg border border-secondary-100 dark:border-secondary-700"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${sp.images?.[0]})` }} />
                  <div className="flex-1">
                    <Link href={`/animal/${sp.id}`} className="group">
                      <h3 className="text-xl font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 transition-colors">{sp.commonName}</h3>
                    </Link>
                    <p className="text-sm italic text-secondary-500">{sp.scientificName}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[sp.conservationStatus]}`}>
                      {STATUS_LABELS[sp.conservationStatus]}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${CATEGORY_COLORS[sp.category]}`}>
                      {CATEGORY_LABELS[sp.category]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                    <span className="flex items-center gap-1"><UsersIcon className="w-4 h-4" /> {sp.populationEstimate?.toLocaleString() ?? 'Unknown'}</span>
                    <span className="flex items-center gap-1"><PinIcon className="w-4 h-4" /> {sp.location.latitude.toFixed(1)}, {sp.location.longitude.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sp.habitat?.slice(0, 4).map(h => (
                      <span key={h} className="px-2 py-0.5 rounded-full text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300">{h}</span>
                    ))}
                  </div>
                  <Link href={`/animal/${sp.id}`} className="mt-4 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    View full profile →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}