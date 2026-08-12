'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { sampleAnimals, sampleAnimalData } from '@/data/sample/animals';
import MiniRouteMap from '@/components/map/MiniRouteMap';
import { speciesSources } from '@/data/sample/sources';
import { Animal, AnimalData } from '@/types/animal/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const categoryIcons: Record<string, string> = {
  mammals: '🦁',
  birds: '🦅',
  reptiles: '🐍',
  amphibians: '🐸',
  fish: '🐟',
  invertebrates: '🦋',
  insects: '🐜',
  marine: '🐋',
};

const conservationStatusColors: Record<string, string> = {
  EX: 'bg-danger-500',
  EW: 'bg-danger-500',
  CR: 'bg-danger-400',
  EN: 'bg-warning-500',
  VU: 'bg-warning-400',
  NT: 'bg-warning-300',
  LC: 'bg-success-500',
  DD: 'bg-secondary-500',
  NE: 'bg-secondary-400',
};

const conservationStatusNames: Record<string, string> = {
  EX: 'Extinct',
  EW: 'Extinct in the Wild',
  CR: 'Critically Endangered',
  EN: 'Endangered',
  VU: 'Vulnerable',
  NT: 'Near Threatened',
  LC: 'Least Concern',
  DD: 'Data Deficient',
  NE: 'Not Evaluated',
};

// Hex colors for SVG strokes (badges above use Tailwind bg classes)
const conservationStatusHex: Record<string, string> = {
  EX: '#7f1d1d',
  EW: '#7f1d1d',
  CR: '#dc2626',
  EN: '#ef4444',
  VU: '#f59e0b',
  NT: '#fbbf24',
  LC: '#22c55e',
  DD: '#64748b',
  NE: '#94a3b8',
};

const dataCategoryIcons: Record<string, string> = {
  biological: '🧬',
  behavioral: '🗺️',
  ecological: '🌿',
  population: '📊',
  health: '🏥',
  agricultural: '🐄',
  shelter: '🏠',
  'human-interaction': '⚠️',
};

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [animalData, setAnimalData] = useState<AnimalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const [activeTab, setActiveTab] = useState<'overview' | 'biological' | 'behavioral' | 'ecological' | 'population' | 'health' | 'monitoring'>('overview');

  useEffect(() => {
    // Find animal by ID
    const foundAnimal = sampleAnimals.find(a => a.id === params.id);
    if (foundAnimal) {
      setAnimal(foundAnimal);
      const foundData = sampleAnimalData.find(d => d.animal.id === params.id);
      setAnimalData(foundData || null);
    } else {
      // Redirect to 404 if animal not found
      router.push('/404');
    }
    setIsLoading(false);
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center py-12">
            <div className="text-4xl animate-spin">🌍</div>
            <p className="text-secondary-600 dark:text-secondary-400 mt-4">Loading animal details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">
              Animal Not Found
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              The animal you&apos;re looking for doesn&apos;t exist in our database.
            </p>
            <Link href="/animal" className="btn-primary">
              Browse All Animals
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'biological', label: 'Biological Data', icon: '🧬' },
    { id: 'behavioral', label: 'Behavioral Data', icon: '🗺️' },
    { id: 'ecological', label: 'Ecological Data', icon: '🌿' },
    { id: 'population', label: 'Population Data', icon: '📊' },
    { id: 'health', label: 'Health Data', icon: '🏥' },
    { id: 'monitoring', label: 'Monitoring', icon: '📡' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/animal"
              className="text-2xl text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
            >
              ← Back to Animals
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Animal Image and Basic Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex-1"
            >
              <div className="relative">
                <div
                  className="w-full h-80 rounded-3xl bg-cover bg-center"
                  style={{
                    backgroundImage: animal.images?.[0] ? `url(${animal.images[0]})` : 'none',
                    backgroundColor: '#f0f9ff',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-3 py-1.5">
                    <span>{categoryIcons[animal.category]}</span>
                    <span className="text-white text-sm font-medium">{animal.category}</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-white text-sm font-medium ${
                    conservationStatusColors[animal.conservationStatus]
                  }`}>
                    {animal.conservationStatus}
                  </div>
                </div>

                {/* Monitoring Status */}
                <div className="absolute top-4 right-4">
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl ${
                    animal.isMonitored ? 'bg-success-500' : 'bg-secondary-500'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span className="text-white text-sm font-medium">
                      {animal.isMonitored ? 'Monitored' : 'Not Monitored'}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <Link
                    href={`/monitor/${animal.id}`}
                    className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-lg text-white text-sm hover:bg-white/30 transition-colors duration-300"
                  >
                    Monitor
                  </Link>
                  <button className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-lg text-white text-sm hover:bg-white/30 transition-colors duration-300">
                    Share
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Animal Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex-1"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-2">
                {animal.commonName}
              </h1>
              <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-1">
                {animal.scientificName}
              </p>
              <div className="text-secondary-500 dark:text-secondary-400 mb-6">
                {animal.taxonomy.kingdom} → {animal.taxonomy.phylum} → {animal.taxonomy.class} → {animal.taxonomy.order}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4">
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-lg font-bold text-secondary-900 dark:text-white">
                    {animal.populationEstimate?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Population</div>
                </div>
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4">
                  <div className="text-2xl mb-1">📍</div>
                  <div className="text-lg font-bold text-secondary-900 dark:text-white">
                    {animal.location.latitude.toFixed(2)}, {animal.location.longitude.toFixed(2)}
                  </div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Location</div>
                </div>
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4">
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="text-lg font-bold text-secondary-900 dark:text-white">
                    {animal.habitat?.length || 0}
                  </div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Habitats</div>
                </div>
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-lg font-bold text-secondary-900 dark:text-white">
                    {animal.dataCategories.length}
                  </div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Data Categories</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4 mb-6">
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Description</h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {animal.description || 'No description available for this species.'}
                </p>
              </div>

              {/* Data Categories */}
              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4">
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Available Data</h3>
                <div className="flex flex-wrap gap-2">
                  {animal.dataCategories.map(category => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-secondary-100 dark:bg-secondary-700 rounded-xl text-secondary-600 dark:text-secondary-300 text-sm flex items-center space-x-1"
                    >
                      <span>{dataCategoryIcons[category]}</span>
                      <span>{category.replace('-', ' ')}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Seasonal Migration */}
              {animal.migrationRoutes && animal.migrationRoutes.length > 0 && (
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4 mt-4">
                  <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">🗺️ Seasonal Migration</h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">
                    Documented seasonal corridors — shown as animated arcs on the globe and traced on the map below.
                  </p>
                  <MiniRouteMap routes={animal.migrationRoutes} height="h-44" />
                  <div className="space-y-2 mt-3">
                    {animal.migrationRoutes.map((route, i) => {
                      const n = route.points.length;
                      const start = route.points[0];
                      const end = route.points[n - 1];
                      const fmt = (p: { latitude: number; longitude: number }) =>
                        `${Math.abs(p.latitude).toFixed(1)}°${p.latitude >= 0 ? 'N' : 'S'} ${Math.abs(p.longitude).toFixed(1)}°${p.longitude >= 0 ? 'E' : 'W'}`;
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              route.season === 'spring' ? 'bg-success-500' :
                              route.season === 'fall' ? 'bg-warning-500' :
                              'bg-secondary-400'
                            }`}
                          />
                          <span className="text-secondary-700 dark:text-secondary-300 font-medium capitalize">
                            {route.season ?? 'year-round'}
                          </span>
                          <span className="text-secondary-500 dark:text-secondary-400 truncate">
                            {route.name} · {fmt(start)} → {fmt(end)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sources */}
              {(() => {
                const source = speciesSources.find(s => s.animalId === animal.id);
                if (!source) return null;
                const wikipediaUrl = `https://en.wikipedia.org/wiki/${source.wikipediaTitle.replace(/ /g, '_')}`;
                const iucnUrl = source.iucnId ? `https://www.iucnredlist.org/species/${source.iucnId}/0` : null;
                return (
                  <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4 mt-4">
                    <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Sources</h3>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">
                      {source.populationNote}
                    </p>
                    <div className="flex flex-col gap-2">
                      <a
                        href={wikipediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors duration-300 flex items-center gap-2"
                      >
                        <span>📖</span> Wikipedia — {source.commonName}
                      </a>
                      {iucnUrl && (
                        <a
                          href={iucnUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors duration-300 flex items-center gap-2"
                        >
                          <span>🟥</span> IUCN Red List assessment
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-wrap gap-2 mb-6 border-b border-secondary-200 dark:border-secondary-700 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-64">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Taxonomy */}
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                    Taxonomy
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(animal.taxonomy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                        <span className="text-secondary-600 dark:text-secondary-400">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <span className="font-medium text-secondary-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Habitat and Location */}
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                    Habitat & Location
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                      <div className="text-secondary-600 dark:text-secondary-400 mb-1">Habitat Types</div>
                      <div className="flex flex-wrap gap-2">
                        {animal.habitat?.map((h, i) => (
                          <span key={i} className="px-3 py-1 bg-white dark:bg-secondary-800 rounded-xl text-secondary-700 dark:text-secondary-300 text-sm">
                            {h}
                          </span>
                        )) || <span className="text-secondary-500 dark:text-secondary-400">Unknown</span>}
                      </div>
                    </div>
                    <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                      <div className="text-secondary-600 dark:text-secondary-400 mb-1">Last Location</div>
                      <div className="font-medium text-secondary-900 dark:text-white">
                        Latitude: {animal.location.latitude.toFixed(4)}, Longitude: {animal.location.longitude.toFixed(4)}
                      </div>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        Altitude: {animal.location.altitude || 0}m, Accuracy: {animal.location.accuracy || 0}m
                      </div>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        Source: {animal.location.source}
                      </div>
                    </div>
                    <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                      <div className="text-secondary-600 dark:text-secondary-400 mb-1">Last Updated</div>
                      <div className="font-medium text-secondary-900 dark:text-white">
                        {new Date(animal.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'biological' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Biological & Physiological Data
                </h3>
                
                {animalData?.biological ? (
                  <div className="space-y-6">
                    {/* Biometrics */}
                    {animalData.biological.biometrics && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Biometrics & Physical Traits
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(animalData.biological.biometrics).map(([key, value]) => (
                            value !== undefined && (
                              <div key={key} className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                                <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                                <div className="font-medium text-secondary-900 dark:text-white">
                                  {typeof value === 'number' ? value.toLocaleString() : value}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Genomic Data */}
                    {animalData.biological.genomic && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Genomic & Molecular Data
                        </h4>
                        <div className="space-y-3">
                          {animalData.biological.genomic.wholeGenomeSequence && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Whole Genome Sequence
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.biological.genomic.wholeGenomeSequence}
                              </div>
                            </div>
                          )}
                          {animalData.biological.genomic.snps && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                SNPs Identified
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.biological.genomic.snps.length}
                              </div>
                            </div>
                          )}
                          {animalData.biological.genomic.parentage && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Parentage/Lineage
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.biological.genomic.parentage.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Physiological Metrics */}
                    {animalData.biological.physiological && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Physiological Metrics
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(animalData.biological.physiological).map(([key, value]) => (
                            value !== undefined && (
                              <div key={key} className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                                <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                                {typeof value === 'object' ? (
                                  <div className="font-medium text-secondary-900 dark:text-white">
                                    {Object.entries(value as any).map(([k, v]) => (
                                      <div key={k}>{k}: {String(v)}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="font-medium text-secondary-900 dark:text-white">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                  </div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Endocrine Data */}
                    {animalData.biological.endocrine && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Endocrine & Blood Chemistry
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(animalData.biological.endocrine).map(([key, value]) => (
                            value !== undefined && (
                              <div key={key} className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                                <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                                {typeof value === 'object' ? (
                                  <div className="font-medium text-secondary-900 dark:text-white">
                                    {Object.entries(value as any).map(([k, v]) => (
                                      <div key={k}>{k}: {String(v)}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="font-medium text-secondary-900 dark:text-white">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                  </div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔬</div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                      No Biological Data Available
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      This animal doesn&apos;t have biological data in our system yet.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'behavioral' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Behavioral & Spatial Data
                </h3>
                
                {animalData?.behavioral ? (
                  <div className="space-y-6">
                    {/* Telemetry Data */}
                    {animalData.behavioral.telemetry && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Telemetry & Spatial Tracking
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                            <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                              GPS Coordinates
                            </div>
                            <div className="font-medium text-secondary-900 dark:text-white">
                              {animalData.behavioral.telemetry.gpsCoordinates.length} data points
                            </div>
                          </div>
                          {animalData.behavioral.telemetry.homeRangeBoundary && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Home Range Boundary
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                Defined
                              </div>
                            </div>
                          )}
                          {animalData.behavioral.telemetry.migrationCorridors && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Migration Corridors
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.behavioral.telemetry.migrationCorridors.length} corridors mapped
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ethological Data */}
                    {animalData.behavioral.ethology && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Ethological Activity Budgets
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(animalData.behavioral.ethology).map(([key, value]) => (
                            value !== undefined && (
                              <div key={key} className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                                <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                                <div className="font-medium text-secondary-900 dark:text-white">
                                  {value} minutes
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bioacoustics Data */}
                    {animalData.behavioral.bioacoustics && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Bioacoustics
                        </h4>
                        <div className="space-y-3">
                          {animalData.behavioral.bioacoustics.vocalizationRecordings && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Vocalization Recordings
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.behavioral.bioacoustics.vocalizationRecordings.length} recordings
                              </div>
                            </div>
                          )}
                          {animalData.behavioral.bioacoustics.callCounts && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Call Counts
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.behavioral.bioacoustics.callCounts.length} call logs
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Biomechanics Data */}
                    {animalData.behavioral.biomechanics && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Biomechanics & Motion
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(animalData.behavioral.biomechanics).map(([key, value]) => (
                            value !== undefined && (
                              <div key={key} className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                                <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                                {Array.isArray(value) ? (
                                  <div className="font-medium text-secondary-900 dark:text-white">
                                    {value.length} data points
                                  </div>
                                ) : (
                                  <div className="font-medium text-secondary-900 dark:text-white">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                  </div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                      No Behavioral Data Available
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      This animal doesn&apos;t have behavioral data in our system yet.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'ecological' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Ecological & Environmental Data
                </h3>
                
                {animalData?.ecological ? (
                  <div className="space-y-6">
                    {/* Habitat Data */}
                    {animalData.ecological.habitat && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Habitat Conditions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(animalData.ecological.habitat).map(([key, value]) => (
                            value !== undefined && (
                              <div key={key} className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                                <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                                {typeof value === 'object' ? (
                                  <div className="font-medium text-secondary-900 dark:text-white">
                                    {Object.entries(value as any).map(([k, v]) => (
                                      <div key={k}>{k}: {String(v)}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="font-medium text-secondary-900 dark:text-white">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                  </div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dietary Data */}
                    {animalData.ecological.dietary && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Dietary & Trophic Data
                        </h4>
                        <div className="space-y-3">
                          {animalData.ecological.dietary.stableIsotopeRatios && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Stable Isotope Ratios
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                Carbon-13: {animalData.ecological.dietary.stableIsotopeRatios.carbon13}, 
                                Nitrogen-15: {animalData.ecological.dietary.stableIsotopeRatios.nitrogen15}
                              </div>
                            </div>
                          )}
                          {animalData.ecological.dietary.fecalDNAMetabarcoding && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Fecal DNA Metabarcoding
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.ecological.dietary.fecalDNAMetabarcoding.length} samples analyzed
                              </div>
                            </div>
                          )}
                          {animalData.ecological.dietary.preyDensity !== undefined && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Prey Density
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.ecological.dietary.preyDensity}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interactions Data */}
                    {animalData.ecological.interactions && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Interspecies Interactions
                        </h4>
                        <div className="space-y-3">
                          {animalData.ecological.interactions.predatorPreyEncounters && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Predator-Prey Encounters
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.ecological.interactions.predatorPreyEncounters.length} encounters logged
                              </div>
                            </div>
                          )}
                          {animalData.ecological.interactions.competitiveDisplacements && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Competitive Displacements
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.ecological.interactions.competitiveDisplacements.length} occurrences
                              </div>
                            </div>
                          )}
                          {animalData.ecological.interactions.mutualisticInteractions && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Mutualistic Interactions
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.ecological.interactions.mutualisticInteractions.length} interactions
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌿</div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                      No Ecological Data Available
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      This animal doesn&apos;t have ecological data in our system yet.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'population' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Population & Demographic Data
                </h3>

                {/* Population trend timeline */}
                {animal.populationHistory && animal.populationHistory.length > 0 && (
                  <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200">
                        Population Trend
                      </h4>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">
                        Current estimate:{' '}
                        <span className="font-semibold text-secondary-900 dark:text-white">
                          {animal.populationEstimate?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="h-56">
                      {isClient && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={animal.populationHistory}
                            margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                            <XAxis dataKey="year" stroke="#94a3b8" tickFormatter={(v) => String(v)} />
                            <YAxis stroke="#94a3b8" tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                            <Tooltip
                              formatter={(value: number) => [value.toLocaleString(), 'Estimated population']}
                              labelFormatter={(label) => `Year ${label}`}
                              contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                              }}
                            />
                            <Line type="monotone" dataKey="estimate" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    {animal.populationHistoryNote && (
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                        {animal.populationHistoryNote}
                      </p>
                    )}
                  </div>
                )}

                {animalData?.population ? (
                  <div className="space-y-6">
                    {/* Abundance Data */}
                    {animalData.population.abundance && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Abundance & Density
                        </h4>
                        <div className="space-y-3">
                          {animalData.population.abundance.markRecaptureRecords && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Mark-Recapture Records
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.population.abundance.markRecaptureRecords.length} individuals tracked
                              </div>
                            </div>
                          )}
                          {animalData.population.abundance.cameraTrapCaptureRates !== undefined && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Camera Trap Capture Rates
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.population.abundance.cameraTrapCaptureRates}
                              </div>
                            </div>
                          )}
                          {animalData.population.abundance.aerialSurveyCounts !== undefined && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Aerial Survey Counts
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.population.abundance.aerialSurveyCounts.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Demographic Data */}
                    {animalData.population.demographic && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Demographic Rates
                        </h4>
                        <div className="space-y-3">
                          {animalData.population.demographic.ageClassDistribution && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Age Class Distribution
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {animalData.population.demographic.ageClassDistribution.map((ageClass, i) => (
                                  <div key={i} className="text-center">
                                    <div className="font-medium text-secondary-900 dark:text-white">
                                      {ageClass.count}
                                    </div>
                                    <div className="text-xs text-secondary-500 dark:text-secondary-400">
                                      {ageClass.class}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {animalData.population.demographic.sexRatio && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Sex Ratio
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                Male: {animalData.population.demographic.sexRatio.male}%, 
                                Female: {animalData.population.demographic.sexRatio.female}%, 
                                Unknown: {animalData.population.demographic.sexRatio.unknown}%
                              </div>
                            </div>
                          )}
                          {animalData.population.demographic.birthRate !== undefined && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Birth Rate
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.population.demographic.birthRate}
                              </div>
                            </div>
                          )}
                          {animalData.population.demographic.juvenileSurvivalRate !== undefined && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Juvenile Survival Rate
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {(animalData.population.demographic.juvenileSurvivalRate * 100).toFixed(1)}%
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Conservation Metrics */}
                    {animalData.population.conservation && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Conservation Metrics
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                            <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                              IUCN Red List Status
                            </div>
                            <div className={`font-medium px-2 py-1 rounded-lg ${
                              conservationStatusColors[animalData.population.conservation.iucnStatus]
                            } text-white`}>
                              {animalData.population.conservation.iucnStatus}
                            </div>
                          </div>
                          {animalData.population.conservation.rangeContractionPercentage !== undefined && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Range Contraction
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.population.conservation.rangeContractionPercentage}%
                              </div>
                            </div>
                          )}
                          {animalData.population.conservation.populationFragmentationIndex !== undefined && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Population Fragmentation Index
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.population.conservation.populationFragmentationIndex}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                      No Population Data Available
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      This animal doesn&apos;t have population data in our system yet.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'health' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Health, Disease & Zoonotic Risk Data
                </h3>
                
                {animalData?.health ? (
                  <div className="space-y-6">
                    {/* Pathogen Data */}
                    {animalData.health.pathogen && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Pathogen Surveillance
                        </h4>
                        <div className="space-y-3">
                          {animalData.health.pathogen.viralLoads && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Viral Loads
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.health.pathogen.viralLoads.length} viral loads tracked
                              </div>
                            </div>
                          )}
                          {animalData.health.pathogen.bacterialLoads && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Bacterial Loads
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.health.pathogen.bacterialLoads.length} bacterial loads tracked
                              </div>
                            </div>
                          )}
                          {animalData.health.pathogen.parasiteCounts && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Parasite Counts
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.health.pathogen.parasiteCounts.length} parasite counts
                              </div>
                            </div>
                          )}
                          {animalData.health.pathogen.seroprevalenceRates && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Seroprevalence Rates
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.health.pathogen.seroprevalenceRates.length} rates tracked
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Veterinary Data */}
                    {animalData.health.veterinary && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Veterinary Medical Records
                        </h4>
                        <div className="space-y-3">
                          {animalData.health.veterinary.clinicalDiagnoses && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Clinical Diagnoses
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.health.veterinary.clinicalDiagnoses.length} diagnoses
                              </div>
                            </div>
                          )}
                          {animalData.health.veterinary.vaccinationRecords && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Vaccination Records
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.health.veterinary.vaccinationRecords.length} vaccinations
                              </div>
                            </div>
                          )}
                          {animalData.health.veterinary.pharmacologicalTreatments && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Pharmacological Treatments
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.health.veterinary.pharmacologicalTreatments.length} treatments
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Zoonotic Data */}
                    {animalData.health.zoonotic && (
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                          Zoonoses & Vector Tracking
                        </h4>
                        <div className="space-y-3">
                          {animalData.health.zoonotic.vectorAbundance && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Vector Abundance
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.health.zoonotic.vectorAbundance.length} vectors tracked
                              </div>
                            </div>
                          )}
                          {animalData.health.zoonotic.spilloverEvents && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Spillover Events
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.health.zoonotic.spilloverEvents.length} events logged
                              </div>
                            </div>
                          )}
                          {animalData.health.zoonotic.pathogenMutations && (
                            <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                              <div className="text-secondary-600 dark:text-secondary-400 mb-1">
                                Pathogen Mutations
                              </div>
                              <div className="font-medium text-secondary-900 dark:text-white">
                                {animalData.health.zoonotic.pathogenMutations.length} mutations tracked
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏥</div>
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                      No Health Data Available
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      This animal doesn&apos;t have health data in our system yet.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'monitoring' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Monitoring Information
                </h3>
                
                <div className="space-y-6">
                  {/* Monitoring Status */}
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                    <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                      Current Monitoring Status
                    </h4>
                    <div className={`flex items-center space-x-3 p-3 rounded-xl ${
                      animal.isMonitored ? 'bg-success-100 dark:bg-success-900/20' : 'bg-secondary-100 dark:bg-secondary-700/50'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        animal.isMonitored ? 'bg-success-500' : 'bg-secondary-400'
                      }`} />
                      <div className="font-medium text-secondary-900 dark:text-white">
                        {animal.isMonitored ? 'Currently being monitored in real-time' : 'Not currently monitored'}
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-secondary-600 dark:text-secondary-400 text-sm">Last Location Update</div>
                        <div className="font-medium text-secondary-900 dark:text-white">
                          {new Date(animal.location.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-secondary-600 dark:text-secondary-400 text-sm">Data Source</div>
                        <div className="font-medium text-secondary-900 dark:text-white">
                          {animal.location.source}
                        </div>
                      </div>
                      <div>
                        <div className="text-secondary-600 dark:text-secondary-400 text-sm">Last Profile Update</div>
                        <div className="font-medium text-secondary-900 dark:text-white">
                          {new Date(animal.lastUpdated).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-secondary-600 dark:text-secondary-400 text-sm">Data Confidence</div>
                        <div className="font-medium text-secondary-900 dark:text-white">
                          {animalData?.metadata ? `${(animalData.metadata.confidence * 100).toFixed(0)}%` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Available Data Categories */}
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                    <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                      Available Data Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {animal.dataCategories.map(category => (
                        <span
                          key={category}
                          className="px-3 py-1 bg-white dark:bg-secondary-800 rounded-xl text-secondary-700 dark:text-secondary-300 text-sm flex items-center space-x-1"
                        >
                          <span>{dataCategoryIcons[category]}</span>
                          <span>{category.replace('-', ' ')}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Monitoring Actions */}
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                    <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                      Monitoring Actions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/monitor/${animal.id}`}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm transition-colors duration-300"
                      >
                        View Live Tracking
                      </Link>
                      <button className="px-4 py-2 bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-900 dark:text-secondary-100 rounded-xl text-sm transition-colors duration-300">
                        Set Alert Notifications
                      </button>
                      <button className="px-4 py-2 bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-900 dark:text-secondary-100 rounded-xl text-sm transition-colors duration-300">
                        Export Data
                      </button>
                      <button className="px-4 py-2 bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-900 dark:text-secondary-100 rounded-xl text-sm transition-colors duration-300">
                        Compare with Other Species
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  {animalData?.metadata && (
                    <div className="p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                      <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-3">
                        Data Metadata
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-secondary-600 dark:text-secondary-400 text-sm">Collected By</div>
                          <div className="font-medium text-secondary-900 dark:text-white">
                            {animalData.metadata.collectedBy}
                          </div>
                        </div>
                        <div>
                          <div className="text-secondary-600 dark:text-secondary-400 text-sm">Collection Date</div>
                          <div className="font-medium text-secondary-900 dark:text-white">
                            {new Date(animalData.metadata.collectionDate).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-secondary-600 dark:text-secondary-400 text-sm">Sources</div>
                          <div className="font-medium text-secondary-900 dark:text-white">
                            {animalData.metadata.sources.join(', ')}
                          </div>
                        </div>
                        <div>
                          <div className="text-secondary-600 dark:text-secondary-400 text-sm">Confidence</div>
                          <div className="font-medium text-secondary-900 dark:text-white">
                            {(animalData.metadata.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
