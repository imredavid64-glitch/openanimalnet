'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSafari } from '@/lib/useSafari';
import SafariMap from '@/components/safari/SafariMap';
import AnimalEncounter from '@/components/safari/AnimalEncounter';
import WildlifeCollection from '@/components/safari/WildlifeCollection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PawIcon, GlobeIcon, ChartIcon } from '@/components/icons';

export default function SafariPage() {
  const {
    loaded, spawns, stats, discoveries,
    setEncountering, encountering,
    discoverAnimal, refreshSpawns,
  } = useSafari();

  const [activeTab, setActiveTab] = useState<'safari' | 'collection'>('safari');

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PawIcon className="w-12 h-12 text-primary-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white dark:from-secondary-900 dark:to-secondary-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <span className="text-5xl">🌍</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">
            Wildlife Safari
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-4 max-w-2xl mx-auto">
            Explore the world, discover animals, and build your collection.
            Learn about endangered species while documenting your wildlife encounters.
          </p>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Species Found', value: stats.uniqueSpecies.toString(), icon: <PawIcon className="w-5 h-5" />, color: 'text-primary-600' },
            { label: 'Total Discoveries', value: stats.totalDiscoveries.toString(), icon: <ChartIcon className="w-5 h-5" />, color: 'text-success-600' },
            { label: 'Collection', value: `${stats.completionPercent}%`, icon: <GlobeIcon className="w-5 h-5" />, color: 'text-warning-600' },
            { label: 'Nearby', value: spawns.filter(s => !s.discovered).length.toString(), icon: <span className="text-lg">📍</span>, color: 'text-accent-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-md text-center"
            >
              <div className={`w-10 h-10 rounded-xl bg-secondary-50 dark:bg-secondary-700 flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-xl font-bold text-secondary-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-secondary-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'safari', label: 'Safari', icon: <GlobeIcon className="w-4 h-4" /> },
            { id: 'collection', label: 'Collection', icon: <PawIcon className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'safari' && (
          <SafariMap spawns={spawns} onSelect={setEncountering} onRefresh={refreshSpawns} />
        )}

        {activeTab === 'collection' && (
          <WildlifeCollection discoveries={discoveries} stats={stats} />
        )}

        {/* Encounter modal */}
        {encountering && (
          <AnimalEncounter
            spawn={encountering}
            onDiscover={(photo, notes) => discoverAnimal(encountering, photo, notes)}
            onClose={() => setEncountering(null)}
          />
        )}

        {/* Privacy note */}
        <p className="text-center text-xs text-secondary-400 mt-8">
          Location data stays on your device. All discoveries are saved locally in your browser.
        </p>
      </main>
      <Footer />
    </div>
  );
}
