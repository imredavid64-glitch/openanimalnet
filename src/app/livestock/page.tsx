'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { sampleAnimals } from '@/data/sample/animals';
import LivestockHealthDashboard from '@/components/livestock/LivestockHealthDashboard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PawIcon, ShieldIcon, ChartIcon } from '@/components/icons';
import Link from 'next/link';

export default function LivestockPage() {
  const livestockSpecies = useMemo(() =>
    sampleAnimals.filter(a =>
      a.dataCategories.includes('agricultural') ||
      (a as any).livestockTelemetry
    ),
    []
  );

  // Find the cow with telemetry data
  const cow = sampleAnimals.find(a => a.id === 'cow-001');
  const telemetry = (cow as any)?.livestockTelemetry;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white dark:from-secondary-900 dark:to-secondary-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <PawIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">
            Responsible Agriculture
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-4 max-w-3xl mx-auto">
            Real-time livestock health monitoring with telemetry dashboards tracking
            rumination patterns, body temperature, and mobility metrics to detect
            disease outbreaks days before physical symptoms manifest.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: <ChartIcon className="w-6 h-6" />, title: 'Rumination Tracking', desc: 'Monitors chewing cycles to detect stress, illness, or heat stress early.' },
            { icon: <ShieldIcon className="w-6 h-6" />, title: 'Thermal Monitoring', desc: 'Continuous body temperature readings to catch fever before clinical signs.' },
            { icon: <PawIcon className="w-6 h-6" />, title: 'Mobility Analysis', desc: 'Gait and movement scoring to identify lameness or injury.' },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-3 text-primary-600">
                {feat.icon}
              </div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">{feat.title}</h3>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Dashboard */}
        {telemetry ? (
          <LivestockHealthDashboard telemetry={telemetry} />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-secondary-800 rounded-2xl shadow-lg">
            <PawIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
            <p className="text-secondary-500">No telemetry data available</p>
          </div>
        )}

        {/* Livestock species list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Monitored Livestock Species
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {livestockSpecies.map(sp => (
              <Link
                key={sp.id}
                href={`/animal/${sp.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                  <PawIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-secondary-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                    {sp.commonName}
                  </div>
                  <div className="text-xs text-secondary-400 italic truncate">{sp.scientificName}</div>
                </div>
                <span className="text-xs text-secondary-400">{sp.populationEstimate?.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Data note */}
        <div className="mt-6 text-center text-xs text-secondary-400">
          <p>Telemetry data is simulated for demonstration. In production, this would integrate with commercial livestock monitoring systems (e.g., Allflex,SCR, Nedap).</p>
          <p className="mt-1">Disease risk probabilities are computed from deviation models against baseline herd norms.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
