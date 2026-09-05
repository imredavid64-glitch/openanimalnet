'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MiniRouteMap from '@/components/map/MiniRouteMap';
import { Animal, AnimalData } from '@/types/animal/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CategoryIcon, DataCategoryIcon, AntennaIcon, GlobeIcon, UsersIcon, PinIcon, ChartIcon, ShieldIcon, BookIcon, CalendarIcon, DataIcon } from '@/components/icons';
import LiveSyncBadge from '@/components/animal/LiveSyncBadge';

interface Props {
  animal: Animal;
  animalData: AnimalData | null;
  source: any;
}

const conservationStatusColors: Record<string, string> = {
  EX: 'bg-danger-500', EW: 'bg-danger-500', CR: 'bg-danger-400',
  EN: 'bg-warning-500', VU: 'bg-warning-400', NT: 'bg-warning-300',
  LC: 'bg-success-500', DD: 'bg-secondary-500', NE: 'bg-secondary-400',
};

export default function AnimalDetailClient({ animal, animalData, source }: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <GlobeIcon className="w-4 h-4" /> },
    { id: 'biological', label: 'Biological Data', icon: <DataCategoryIcon category="biological" className="w-4 h-4" /> },
    { id: 'behavioral', label: 'Behavioral Data', icon: <DataCategoryIcon category="behavioral" className="w-4 h-4" /> },
    { id: 'ecological', label: 'Ecological Data', icon: <DataCategoryIcon category="ecological" className="w-4 h-4" /> },
    { id: 'population', label: 'Population Data', icon: <DataCategoryIcon category="population" className="w-4 h-4" /> },
    { id: 'health', label: 'Health Data', icon: <DataCategoryIcon category="health" className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoring', icon: <AntennaIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
          <Link href="/animal" className="text-2xl text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors mb-6 inline-block">
            ← Back to Animals
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1">
              <div className="relative">
                <div className="w-full h-80 rounded-3xl bg-cover bg-center" style={{ backgroundImage: animal.images?.[0] ? `url(${animal.images[0]})` : 'none', backgroundColor: '#f0f9ff' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl" />
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-3 py-1.5">
                    <CategoryIcon category={animal.category} className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">{animal.category}</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-white text-sm font-medium ${conservationStatusColors[animal.conservationStatus]}`}>
                    {animal.conservationStatus}
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl ${animal.isMonitored ? 'bg-success-500' : 'bg-secondary-500'}`}>
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span className="text-white text-sm font-medium">{animal.isMonitored ? 'Monitored' : 'Not Monitored'}</span>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <Link href={`/monitor/${animal.id}`} className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-lg text-white text-sm hover:bg-white/30 transition-colors">
                    Monitor
                  </Link>
                  <button className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-lg text-white text-sm hover:bg-white/30 transition-colors">Share</button>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-2">{animal.commonName}</h1>
              <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-1">{animal.scientificName}</p>
              <div className="text-secondary-500 dark:text-secondary-400 mb-3">
                {animal.taxonomy.kingdom} → {animal.taxonomy.phylum} → {animal.taxonomy.class} → {animal.taxonomy.order}
              </div>
              <div className="mb-6"><LiveSyncBadge animalId={animal.id} commonName={animal.commonName} /></div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4">
                  <div className="mb-1"><UsersIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>
                  <div className="text-lg font-bold text-secondary-900 dark:text-white font-data">{animal.populationEstimate?.toLocaleString() || 'N/A'}</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Population</div>
                </div>
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4">
                  <div className="mb-1"><PinIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>
                  <div className="text-lg font-bold text-secondary-900 dark:text-white font-data">{animal.location.latitude.toFixed(2)}, {animal.location.longitude.toFixed(2)}</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Location</div>
                </div>
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4">
                  <div className="mb-1"><GlobeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>
                  <div className="text-lg font-bold text-secondary-900 dark:text-white font-data">{animal.habitat?.length || 0}</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Habitats</div>
                </div>
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4">
                  <div className="mb-1"><ChartIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>
                  <div className="text-lg font-bold text-secondary-900 dark:text-white font-data">{animal.dataCategories.length}</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Data Categories</div>
                </div>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4 mb-6">
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Description</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{animal.description || 'No description available for this species.'}</p>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4">
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Available Data</h3>
                <div className="flex flex-wrap gap-2">
                  {animal.dataCategories.map(category => (
                    <span key={category} className="px-3 py-1 bg-secondary-100 dark:bg-secondary-700 rounded-xl text-secondary-600 dark:text-secondary-300 text-sm flex items-center space-x-1">
                      <DataCategoryIcon category={category} className="w-3.5 h-3.5" />
                      <span>{category.replace('-', ' ')}</span>
                    </span>
                  ))}
                </div>
              </div>

              {animal.migrationRoutes && animal.migrationRoutes.length > 0 && (
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4 mt-4">
                  <h3 className="font-semibold text-secondary-900 dark:text-white mb-1 flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> Seasonal Migration</h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">Documented seasonal corridors.</p>
                  <MiniRouteMap routes={animal.migrationRoutes} height="h-44" />
                  <div className="space-y-2 mt-3">
                    {animal.migrationRoutes.map((route, i) => {
                      const start = route.points[0];
                      const end = route.points[route.points.length - 1];
                      const fmt = (p: { latitude: number; longitude: number }) => `${Math.abs(p.latitude).toFixed(1)}°${p.latitude >= 0 ? 'N' : 'S'} ${Math.abs(p.longitude).toFixed(1)}°${p.longitude >= 0 ? 'E' : 'W'}`;
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${route.season === 'spring' ? 'bg-success-500' : route.season === 'fall' ? 'bg-warning-500' : 'bg-secondary-400'}`} />
                          <span className="text-secondary-700 dark:text-secondary-300 font-medium capitalize">{route.season ?? 'year-round'}</span>
                          <span className="text-secondary-500 dark:text-secondary-400 truncate">{route.name} · {fmt(start)} → {fmt(end)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {source && (
                <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4 mt-4">
                  <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Sources</h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3">{source.populationNote}</p>
                  <p className="text-xs text-secondary-400 dark:text-secondary-500 mb-3">Verified across Wikipedia, Wikidata/IUCN, GBIF, and iNaturalist.</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { href: `https://en.wikipedia.org/wiki/${source.wikipediaTitle.replace(/ /g, '_')}`, label: `Wikipedia — ${source.commonName}`, icon: BookIcon },
                      ...(source.iucnId ? [{ href: `https://www.iucnredlist.org/species/${source.iucnId}/0`, label: 'IUCN Red List assessment', icon: ShieldIcon }] : []),
                      ...(source.gbifKey ? [{ href: `https://www.gbif.org/species/${source.gbifKey}`, label: 'GBIF taxonomy record', icon: DataIcon }] : []),
                      ...(source.inaturalistId ? [{ href: `https://www.inaturalist.org/taxa/${source.inaturalistId}`, label: 'iNaturalist observations', icon: PinIcon }] : []),
                    ].map(({ href, label, icon: Icon }) => (
                      <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0" /> {label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg mb-8">
          <div className="flex flex-wrap gap-2 mb-6 border-b border-secondary-200 dark:border-secondary-700 pb-4">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'}`}>
                <span>{tab.icon}</span><span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="min-h-64">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">Taxonomy</h3>
                  <div className="space-y-3">
                    {Object.entries(animal.taxonomy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                        <span className="text-secondary-600 dark:text-secondary-400">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <span className="font-medium text-secondary-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">Habitat & Location</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                      <div className="text-secondary-600 dark:text-secondary-400 mb-1">Habitat Types</div>
                      <div className="flex flex-wrap gap-2">
                        {animal.habitat?.map((h, i) => <span key={i} className="px-3 py-1 bg-white dark:bg-secondary-800 rounded-xl text-secondary-700 dark:text-secondary-300 text-sm">{h}</span>) || <span className="text-secondary-500 dark:text-secondary-400">Unknown</span>}
                      </div>
                    </div>
                    <div className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                      <div className="text-secondary-600 dark:text-secondary-400 mb-1">Last Location</div>
                      <div className="font-medium text-secondary-900 dark:text-white">Lat: {animal.location.latitude.toFixed(4)}, Lng: {animal.location.longitude.toFixed(4)}</div>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">Source: {animal.location.source}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'population' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">Population & Demographic Data</h3>
                {animal.populationHistory && animal.populationHistory.length > 0 && (
                  <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h4 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200">Population Trend</h4>
                      <div className="text-sm text-secondary-500 dark:text-secondary-400">Current estimate: <span className="font-semibold text-secondary-900 dark:text-white">{animal.populationEstimate?.toLocaleString() || 'N/A'}</span></div>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={animal.populationHistory} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                          <XAxis dataKey="year" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                          <Line type="monotone" dataKey="estimate" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {animal.populationHistoryNote && <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">{animal.populationHistoryNote}</p>}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'biological' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔬</div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Biological & Physiological Data</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{animalData?.biological ? 'Detailed biological data available.' : 'No biological data available yet.'}</p>
              </div>
            )}

            {activeTab === 'behavioral' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Behavioral & Spatial Data</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{animalData?.behavioral ? 'Detailed behavioral data available.' : 'No behavioral data available yet.'}</p>
              </div>
            )}

            {activeTab === 'ecological' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌿</div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Ecological & Environmental Data</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{animalData?.ecological ? 'Detailed ecological data available.' : 'No ecological data available yet.'}</p>
              </div>
            )}

            {activeTab === 'health' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏥</div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Health, Disease & Zoonotic Risk Data</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{animalData?.health ? 'Detailed health data available.' : 'No health data available yet.'}</p>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📡</div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Monitoring Data</h3>
                <p className="text-secondary-600 dark:text-secondary-400">Live monitoring data and telemetry available on the <Link href={`/monitor/${animal.id}`} className="text-primary-600 dark:text-primary-400 underline">monitoring page</Link>.</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}