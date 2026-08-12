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

export default function InteractiveGlobe() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ConservationStatus | null>(null);
  const [hoveredAnimal, setHoveredAnimal] = useState<string | null>(null);
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
    router.push(`/animal/${animalId}`);
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
            <div className="flex space-x-2">
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-300">
                <span className="text-white">📊</span>
              </button>
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-300">
                <span className="text-white">🔍</span>
              </button>
            </div>
          </div>
          
          {hoveredAnimal ? (
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

        {/* Globe Component */}
        {isClient && (
          <Globe
            ref={globeRef}
            data={filteredData}
            onAnimalHover={handleAnimalHover}
            onAnimalClick={handleAnimalClick}
            selectedCategory={selectedCategory}
          />
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg flex space-x-4">
          <button
            onClick={() => globeRef.current?.resetCamera()}
            className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-300"
            title="Reset View"
          >
            <span className="text-white">🔄</span>
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
    </motion.div>
  );
}
