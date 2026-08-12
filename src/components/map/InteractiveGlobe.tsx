'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { sampleAnimals, conservationStatusData } from '@/data/sample/animals';
import { AnimalCategory, ConservationStatus } from '@/types/animal/types';
import { routeDistanceKm, formatKm, formatDurationDays } from '@/lib/geo';
import type { SeasonFilter } from './GlobeComponent';

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

// Season scrubber: the four seasons + 'all'. Year-round corridors are always
// active; summer/winter show only those.
const SEASONS: { key: Exclude<SeasonFilter, 'all'>; label: string; emoji: string }[] = [
  { key: 'spring', label: 'Spring', emoji: '🌱' },
  { key: 'summer', label: 'Summer', emoji: '☀️' },
  { key: 'fall', label: 'Fall', emoji: '🍂' },
  { key: 'winter', label: 'Winter', emoji: '❄️' },
];

// Minimal inline icon set (stroke SVGs) so the globe controls don't lean on
// emoji — crisp, consistent, and theme-aware via currentColor.
const ICON_PATHS: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>,
  reset: <><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" /><path d="M3 3v5h5" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  route: <><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8" /></>,
  cloud: <path d="M17.5 19a4.5 4.5 0 1 0-.44-8.98A6 6 0 0 0 5.66 12.3 3.5 3.5 0 0 0 6 19h11.5Z" />,
  zoomIn: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M11 8v6" /><path d="M8 11h6" /></>,
  zoomOut: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M8 11h6" /></>,
  rotate: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>,
  play: <path d="M6 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 6 5.5Z" />,
  pause: <><path d="M8 5v14" /><path d="M16 5v14" /></>,
  close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" /></>,
};

function CtrlIcon({ name, className = 'w-5 h-5' }: { name: keyof typeof ICON_PATHS; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

// Count of migration corridors active in a given season filter.
const activeRouteCount = (filter: SeasonFilter): number =>
  sampleAnimals.reduce((total, animal) => {
    (animal.migrationRoutes || []).forEach((route) => {
      const season = route.season ?? 'year-round';
      if (filter === 'all' || season === 'year-round' || season === filter) total += 1;
    });
    return total;
  }, 0);

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
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('all');
  const [seasonPlaying, setSeasonPlaying] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Month-linked deep link from the migration calendar: /?season=spring#globe
  // pre-filters the globe to that season and scrolls it into view.
  useEffect(() => {
    if (!isClient) return;
    const params = new URLSearchParams(window.location.search);
    const season = params.get('season');
    if (season === 'all' || season === 'spring' || season === 'summer' || season === 'fall' || season === 'winter') {
      setSeasonFilter(season);
      setSeasonPlaying(false);
    }
    if (window.location.hash === '#globe') {
      // wait for the globe to mount before scrolling
      setTimeout(() => {
        document.getElementById('globe')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

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

  // Season scrubber play: cycle through the four seasons while playing
  useEffect(() => {
    if (!seasonPlaying) return;
    const id = setInterval(() => {
      setSeasonFilter((prev) => {
        if (prev === 'all') return 'spring';
        const idx = SEASONS.findIndex((s) => s.key === prev);
        return SEASONS[(idx + 1) % SEASONS.length].key;
      });
    }, 1800);
    return () => clearInterval(id);
  }, [seasonPlaying]);

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
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white"
                title="Search species"
              >
                <CtrlIcon name="search" className="w-5 h-5" />
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
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <CtrlIcon name="route" className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-white font-semibold">{hoveredRoute.name}</div>
                  <div className="text-white/70 text-sm">Migration corridor</div>
                </div>
              </div>
              <div className="text-white/80 text-sm bg-white/10 rounded-xl p-3">
                {hoveredRoute.routeName}
              </div>
              {(() => {
                const animal = sampleAnimals.find((a) => a.id === hoveredRoute.animalId);
                const route = animal?.migrationRoutes?.find((r) => r.name === hoveredRoute.routeName);
                if (!route) return null;
                const km = routeDistanceKm(route.points);
                const duration = route.durationDays ? formatDurationDays(route.durationDays) : null;
                return (
                  <div className="flex items-center gap-3 text-xs text-white/80">
                    <span className="inline-flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                      📏 {formatKm(km)}
                    </span>
                    {duration && (
                      <span className="inline-flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                        ⏱ {duration}
                      </span>
                    )}
                  </div>
                );
              })()}
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
              <div className="text-4xl mb-2 text-white/70 flex justify-center">
                <CtrlIcon name="globe" className="w-9 h-9" />
              </div>
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
            seasonFilter={seasonFilter}
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
              {animal.migrationRoutes && animal.migrationRoutes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-secondary-100 dark:border-secondary-700">
                  <div className="text-[11px] uppercase tracking-wide text-secondary-400 dark:text-secondary-500 font-semibold mb-1.5">
                    🧭 Migration
                  </div>
                  <ul className="space-y-1">
                    {animal.migrationRoutes.map((route, i) => {
                      const km = routeDistanceKm(route.points);
                      const duration = route.durationDays ? formatDurationDays(route.durationDays) : null;
                      return (
                        <li key={i} className="flex items-start gap-1.5 text-xs">
                          <span className="inline-block w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: route.season === 'spring' ? '#22c55e' : route.season === 'fall' ? '#f59e0b' : '#94a3b8' }} />
                          <span className="text-secondary-600 dark:text-secondary-300 min-w-0">
                            <span className="block truncate" title={route.name}>{route.name}</span>
                            <span className="text-secondary-400 dark:text-secondary-500">
                              {formatKm(km)}
                              {duration ? ` · ${duration}` : ''}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
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

        {/* Seasonal time scrubber — scrub/play through the seasons to watch
            which migration corridors are active in each */}
        <div className="absolute bottom-24 right-6 z-20 bg-white/10 backdrop-blur-lg rounded-2xl p-3 shadow-lg">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-white text-xs font-semibold mr-1 inline-flex items-center gap-1">
              <CtrlIcon name="calendar" className="w-3.5 h-3.5" /> Seasons
            </span>
            <button
              onClick={() => setSeasonPlaying((prev) => !prev)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors duration-300 inline-flex items-center gap-1 ${
                seasonPlaying ? 'bg-primary-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={seasonPlaying ? 'Pause season cycle' : 'Play season cycle'}
            >
              <CtrlIcon name={seasonPlaying ? 'pause' : 'play'} className="w-3 h-3" />
              {seasonPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={() => {
                setSeasonFilter('all');
                setSeasonPlaying(false);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors duration-300 ${
                seasonFilter === 'all' ? 'bg-white text-primary-600' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Show all corridors"
            >
              All
            </button>
          </div>
          <div className="flex gap-1">
            {SEASONS.map((s) => {
              const active = seasonFilter === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => {
                    setSeasonFilter(s.key);
                    setSeasonPlaying(false);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    active
                      ? 'bg-white text-primary-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={`Show ${s.label} migrations`}
                >
                  <span className="mr-1">{s.emoji}</span>
                  {s.label}
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 text-[11px] text-white/70">
            {activeRouteCount(seasonFilter)} of {activeRouteCount('all')} corridors active
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg flex space-x-3">
          <button
            onClick={() => globeRef.current?.resetCamera()}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white"
            title="Reset View"
          >
            <CtrlIcon name="reset" />
          </button>
          <button
            onClick={() => setShowMarkers((prev) => !prev)}
            className={`p-3 rounded-xl transition-colors duration-300 ${
              showMarkers ? 'bg-primary-500 text-white shadow-lg' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title={showMarkers ? 'Hide species markers' : 'Show species markers'}
          >
            <CtrlIcon name="pin" />
          </button>
          <button
            onClick={() => setShowRoutes((prev) => !prev)}
            className={`p-3 rounded-xl transition-colors duration-300 ${
              showRoutes ? 'bg-primary-500 text-white shadow-lg' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title={showRoutes ? 'Hide migration corridors' : 'Show migration corridors'}
          >
            <CtrlIcon name="route" />
          </button>
          <button
            onClick={() => setShowClouds((prev) => !prev)}
            className={`p-3 rounded-xl transition-colors duration-300 ${
              showClouds ? 'bg-primary-500 text-white shadow-lg' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title={showClouds ? 'Hide clouds' : 'Show clouds'}
          >
            <CtrlIcon name="cloud" />
          </button>
          <button
            onClick={() => globeRef.current?.zoomIn()}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white"
            title="Zoom In"
          >
            <CtrlIcon name="zoomIn" />
          </button>
          <button
            onClick={() => globeRef.current?.zoomOut()}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white"
            title="Zoom Out"
          >
            <CtrlIcon name="zoomOut" />
          </button>
          <button
            onClick={() => globeRef.current?.toggleRotation()}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300 text-white"
            title="Toggle Rotation"
          >
            <CtrlIcon name="rotate" />
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
        <span className="inline-flex items-center gap-1">
          🗓️
          scrub seasons to watch migrations
        </span>
      </div>
    </motion.div>
  );
}
