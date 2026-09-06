'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HabitatGlobe from '@/components/map/HabitatGlobe';
import { sampleAnimals } from '@/data/sample/animals';

export default function HabitatVisualizationPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const selectedAnimal = selectedId ? sampleAnimals.find(a => a.id === selectedId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">3D Habitat Visualization</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Explore all {sampleAnimals.length} species on an interactive 3D globe with habitat-colored markers and migration corridors.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <HabitatGlobe selectedId={selectedId} onSelect={setSelectedId} />
        </motion.div>

        {/* Selected animal detail */}
        {selectedAnimal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-xl max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              {selectedAnimal.images?.[0] && (
                <div className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${selectedAnimal.images[0]})` }} />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">{selectedAnimal.commonName}</h2>
                <p className="italic text-secondary-500">{selectedAnimal.scientificName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-700">{selectedAnimal.conservationStatus}</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-secondary-100 dark:bg-secondary-700 text-secondary-600">{selectedAnimal.category}</span>
                </div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2 line-clamp-3">{selectedAnimal.description}</p>
                <Link href={`/animal/${selectedAnimal.id}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
                  View full profile →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}