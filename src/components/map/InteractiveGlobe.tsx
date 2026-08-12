'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { sampleAnimals, conservationStatusData } from '@/data/sample/animals';
import { AnimalCategory, ConservationStatus } from '@/types/animal/types';

// Dynamically import Three.js components to avoid SSR issues
const Globe = dynamic(() => import('./GlobeComponent').catch(() => import('./GlobeComponentFallback')), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gradient-to-br from-primary-600 to-secondary-700 rounded-3xl flex items-center justify-center">
      <div className="text-white text-2xl animate-pulse">Loading Globe...</div>
    </div>
  ),
});

interface RouteInfo {
  animalId: string;
  name: string;
  routeName: string;
}

const animalCategoryColors: Record<AnimalCategory, string> = {
  mammals: '#0ea5e9',
  birds: '#38bdf8',
  reptiles: '#06b6d4',
  amphibians: '#0891b2',
  fish: '#0e7490',
  invertebrates: '#1d4ed8',
  insects: '#7c3aed',
  marine: '#1e40af',
};

const categoryIcons: Record<AnimalCategory, string> = {
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

export default function InteractiveGlobe() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ConservationStatus | null>(null);
  const [hoveredAnimal, setHoveredAnimal] = useState<string | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<RouteInfo | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showClouds, setShowClouds] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCategorySelect = (category: AnimalCategory | null) => {
    setSelectedCategory(category);
    // Reset animal hover when filters change
    setHoveredAnimal(null);
  };

  const handleStatusSelect = (status: ConservationStatus | null) => {
    setSelectedStatus((prev) => (prev === status ? null : status));
    setHoveredAnimal(null);
  };

  const handleAnimalHover = (animalId: string | null) => {
    setHoveredAnimal(animalId);
  };

  const handleAnimalClick = (animalId: string) => {
    const animal = sampleAnimals.find(a => a.id === animalId);
    if (!animal) return;
    // OpenGrid-style: focus the camera on the marker and show a details popup
    setSelectedAnimal(animalId);
    globeRef.current?.flyTo?.(animal.location.latitude, animal.location.longitude);
  };

  // Search: fly to the first matching species and open its details popup
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const q = query.trim().toLowerCase();
    if (!q) return;
    const match = sampleAnimals.find(
      (a) =>
        a.commonName.toLowerCase().includes(q) ||
        a.scientificName.toLowerCase().includes(q),
    );
    if (match) {
      setSelectedAnimal(match.id);
      setSelectedCategory(null);
      setSelectedStatus(null);
      globeRef.current?.flyTo?.(match.location.latitude, match.location.longitude);
    }
  };

  const handleRouteHover = (info: RouteInfo | null) => {
    setHoveredRoute(info);
    // A route hover supersedes the animal hover panel
    if (info) setHoveredAnimal(null);
  };

  const handleRouteClick = (info: RouteInfo) => {
    // Focus like a marker click (popup + fly-to) — the corridor also traces
    // itself on the globe. The popup's profile button navigates.
    const animal = sampleAnimals.find(a => a.id === info.animalId);
    if (!animal) return;
    setSelectedAnimal(info.animalId);
    globeRef.current?.flyTo?.(animal.location.latitude, animal.location.longitude);
  };

  // Popup gallery: step through the species in the current filtered view
  const stepGallery = (dir: 1 | -1) => {
    if (filteredData.length === 0) return;
    const idx = filteredData.findIndex((d) => d.id === selectedAnimal);
    const next = filteredData[(idx + dir + filteredData.length) % filteredData.length];
    setSelectedAnimal(next.id);
    globeRef.current?.flyTo?.(next.lat, next.lng);
  };

  // Convert sample animals to format suitable for globe
  const globeData = sampleAnimals.map(animal => ({
    id: animal.id,
    name: animal.commonName,
    scientificName: animal.scientificName,
    category: animal.category,
    lat: animal.location.latitude,
    lng: animal.location.longitude,
    size: animal.populationEstimate ? Math.log(animal.populationEstimate) / 4 : 0.5,
    color: animalCategoryColors[animal.category],
    icon: categoryIcons[animal.category],
    conservationStatus: animal.conservationStatus,
    isMonitored: animal.isMonitored,
    migrationRoutes: animal.migrationRoutes,
  }));

  // Filter data based on selected category AND IUCN status
  const filteredData = globeData.filter(
    (d) =>
      (!selectedCategory || d.category === selectedCategory) &&
      (!selectedStatus || d.conservationStatus === selectedStatus),
  );

  // Get unique categories from sample animals
  const uniqueCategories = [...new Set(sampleAnimals.map(a => a.category))] as AnimalCategory[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative"
    >
      {/* Globe Container */}
      <div className="relative w-full h-[600px] md:h-[700px] bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/20">
        {/* Controls Overlay */}
        <div className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
          {/* Search box (OpenGrid-style find-and-fly) */}
          <div className="relative mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300"
                title="Search species"
              >
                <span className="text-white">🔍</span>
              </button>
              {searchOpen && (
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Find a species…"
                  className="px-3 py-2 rounded-xl bg-white/15 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 w-44"
                />
              )}
            </div>
            {searchOpen && searchQuery.trim() && (
              <div className="mt-1 text-xs text-white/70">
                {sampleAnimals.some((a) =>
                  a.commonName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                  a.scientificName.toLowerCase().includes(searchQuery.trim().toLowerCase())
                )
                  ? 'Flying to match…'
                  : 'No match — try another name'}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedCategory === null
                  ? 'bg-white text-primary-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All Animals
            </button>
            {uniqueCategories.map(category => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                  selectedCategory === category
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <span>{categoryIcons[category]}</span>
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Panel — hover info is a desktop affordance; hidden on small
            screens (no hover on touch) where its min-width would clip the globe */}
        <div className="hidden sm:block absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Animal Data</h3>
          </div>
          
          {hoveredRoute ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">🧭</span>
                </div>
                <div>
                  <div className="text-white font-semibold">{hoveredRoute.name}</div>
                  <div className="text-white/70 text-sm">Migration corridor</div>
                </div>
              </div>
              <div className="text-white/80 text-sm bg-white/10 rounded-xl p-3">
                {hoveredRoute.routeName}
              </div>
              <button
                onClick={() => router.push(`/animal/${hoveredRoute.animalId}`)}
                className="w-full px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors duration-300"
              >
                View {hoveredRoute.name} profile →
              </button>
            </motion.div>
          ) : hoveredAnimal ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {(() => {
                const animal = sampleAnimals.find(a => a.id === hoveredAnimal);
                if (!animal) return null;
                
                return (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <span className="text-2xl">{categoryIcons[animal.category]}</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{animal.commonName}</div>
                        <div className="text-white/70 text-sm">{animal.scientificName}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-white/60">Population</div>
                        <div className="text-white font-medium">{animal.populationEstimate?.toLocaleString() || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Status</div>
                        <div className={`text-white font-medium px-2 py-1 rounded-lg bg-opacity-20 ${
                          animal.conservationStatus === 'EX' || animal.conservationStatus === 'EW' ? 'bg-danger-500' :
                          animal.conservationStatus === 'CR' ? 'bg-danger-400' :
                          animal.conservationStatus === 'EN' ? 'bg-warning-500' :
                          animal.conservationStatus === 'VU' ? 'bg-warning-400' :
                          'bg-success-500'
                        }`}>
                          {animal.conservationStatus}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60">Category</div>
                        <div className="text-white font-medium">{animal.category}</div>
                      </div>
                      <div>
                        <div className="text-white/60">Monitored</div>
                        <div className="text-white font-medium">
                          {animal.isMonitored ? '✅ Yes' : '❌ No'}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          ) : (
            <div className="text-white/80 text-center py-8">
              <div className="text-4xl mb-2">🌍</div>
              <div className="text-sm">Hover over an animal on the globe</div>
              <div className="text-xs text-white/60 mt-2">
                {filteredData.length} {selectedCategory ? selectedCategory : 'animals'} visible
              </div>
            </div>
          )}
        </div>

        {/* Globe Component */}          {isClient && (
          <Globe
            ref={globeRef}
            data={filteredData}
            onAnimalHover={handleAnimalHover}
            onAnimalClick={handleAnimalClick}
            selectedCategory={selectedCategory}
            showRoutes={showRoutes}
            showMarkers={showMarkers}
            showClouds={showClouds}
            onRouteHover={handleRouteHover}
            onRouteClick={handleRouteClick}
          />
        )}

        {/* Details popup — OpenGrid-style selected-species card */}
        {selectedAnimal && (() => {
          const animal = sampleAnimals.find(a => a.id === selectedAnimal);
          if (!animal) return null;
          const galleryIdx = filteredData.findIndex((d) => d.id === selectedAnimal);
          return (
            <div className="absolute bottom-24 left-6 z-20 bg-white/95 dark:bg-secondary-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl w-80 border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary-200 dark:bg-secondary-700 shrink-0">
                  {animal.images?.[0] ? (
                    <img src={animal.images[0]} alt={animal.commonName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {categoryIcons[animal.category]}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-secondary-900 dark:text-white truncate">{animal.commonName}</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400 italic truncate">
                    {animal.scientificName}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-lg text-white text-xs font-bold ${
                      conservationStatusColors[animal.conservationStatus]
                    }`}>
                      {animal.conservationStatus}
                    </span>
                    <span className="text-xs text-secondary-600 dark:text-secondary-300">
                      👥 {animal.populationEstimate?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAnimal(null)}
                  className="text-secondary-400 hover:text-secondary-600 dark:hover:text-white text-lg leading-none"
                  aria-label="Close details"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => stepGallery(-1)}
                  className="p-2 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-100 text-sm transition-colors"
                  title="Previous species in view"
                  aria-label="Previous species"
                >
                  ‹
                </button>
                <button
                  onClick={() => router.push(`/animal/${animal.id}`)}
                  className="flex-1 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
                >
                  View profile
                </button>
                <button
                  onClick={() => router.push(`/monitor/${animal.id}`)}
                  className="flex-1 px-3 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-100 text-sm font-medium transition-colors"
                >
                  Monitor
                </button>
                <button
                  onClick={() => stepGallery(1)}
                  className="p-2 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-100 text-sm transition-colors"
                  title="Next species in view"
                  aria-label="Next species"
                >
                  ›
                </button>
              </div>
              {filteredData.length > 1 && (
                <div className="mt-2 text-[11px] text-secondary-400 dark:text-secondary-500 text-center">
                  {galleryIdx >= 0 ? galleryIdx + 1 : '—'} of {filteredData.length} in view
                </div>
              )}
            </div>
          );
        })()}

        {/* Bottom Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg flex space-x-3">
          <button
            onClick={() => globeRef.current?.resetCamera()}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300"
            title="Reset View"
          >
            <span className="text-white">🔄</span>
          </button>
          <button
            onClick={() => setShowMarkers((prev) => !prev)}
            className={`p-3 rounded-xl transition-colors duration-300 ${
              showMarkers ? 'bg-primary-500 text-white shadow-lg' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title={showMarkers ? 'Hide species markers' : 'Show species markers'}
          >
            <span className="text-white">📍</span>
          </button>
          <button
            onClick={() => setShowRoutes((prev) => !prev)}
            className={`p-3 rounded-xl transition-colors duration-300 ${
              showRoutes ? 'bg-primary-500 text-white shadow-lg' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title={showRoutes ? 'Hide migration corridors' : 'Show migration corridors'}
          >
            <span className="text-white">🧭</span>
          </button>
          <button
            onClick={() => setShowClouds((prev) => !prev)}
            className={`p-3 rounded-xl transition-colors duration-300 ${
              showClouds ? 'bg-primary-500 text-white shadow-lg' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title={showClouds ? 'Hide clouds' : 'Show clouds'}
          >
            <span className="text-white">☁️</span>
          </button>
          <button
            onClick={() => globeRef.current?.zoomIn()}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300"
            title="Zoom In"
          >
            <span className="text-white">+</span>
          </button>
          <button
            onClick={() => globeRef.current?.zoomOut()}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300"
            title="Zoom Out"
          >
            <span className="text-white">−</span>
          </button>
          <button
            onClick={() => globeRef.current?.toggleRotation()}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300"
            title="Toggle Rotation"
          >
            <span className="text-white">🌪️</span>
          </button>
        </div>
      </div>

      {/* Category Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {uniqueCategories.map(category => (
          <motion.div
            key={category}
            whileHover={{ scale: 1.05, y: -2 }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-secondary-800/50 backdrop-blur-sm ${
              selectedCategory === category ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <span className="text-xl">{categoryIcons[category]}</span>
            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200">
              {category}
            </span>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: animalCategoryColors[category] }}
            />
          </motion.div>
        ))}
      </div>

      {/* IUCN Status Legend — clickable filters (marker color on the globe) */}
      <div className="mt-3 flex flex-wrap justify-center gap-x-2 gap-y-1.5 text-xs text-secondary-600 dark:text-secondary-300">
        <span className="font-semibold uppercase tracking-wide text-secondary-400 dark:text-secondary-500 mr-1 self-center">IUCN status:</span>
        {conservationStatusData
          .filter((s) => sampleAnimals.some((a) => a.conservationStatus === s.status))
          .map((s) => {
            const active = selectedStatus === s.status;
            return (
              <button
                key={s.status}
                onClick={() => handleStatusSelect(s.status as ConservationStatus)}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full transition-all ${
                  active
                    ? 'ring-2 ring-primary-500 bg-white/80 dark:bg-secondary-800/60 shadow'
                    : 'hover:bg-white/60 dark:hover:bg-secondary-800/40'
                }`}
                title={`Filter to ${s.name}`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-semibold">{s.status}</span>
                {s.name}
              </button>
            );
          })}
      </div>

      {/* Migration Legend — seasons + layers */}
      <div className="mt-2 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-secondary-500 dark:text-secondary-400">
        <span className="inline-flex items-center gap-1.5">
          <svg width="26" height="6" viewBox="0 0 26 6">
            <line x1="0" y1="3" x2="26" y2="3" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="3" cy="3" r="1.8" fill="currentColor" />
          </svg>
          {showRoutes ? 'Migration corridor' : 'Migration corridors hidden'}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          spring
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
          fall
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#94a3b8' }} />
          year-round
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary-400" />
          click a marker to focus
        </span>
      </div>
    </motion.div>
  );
}
