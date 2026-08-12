'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import InteractiveGlobe from '@/components/map/InteractiveGlobe';
import MonitoringAlerts from '@/components/monitor/MonitoringAlerts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sampleAnimals, sampleMonitoringData } from '@/data/sample/animals';
import { AntennaIcon, BellIcon, PawIcon, GlobeIcon, PinIcon, DataCategoryIcon } from '@/components/icons';

// Static Tailwind classes — JIT purges dynamically-constructed class names,
// so the accent borders are mapped here instead of interpolated.
const statBorder: Record<string, string> = {
  primary: 'border-primary-500',
  danger: 'border-danger-500',
  success: 'border-success-500',
  accent: 'border-accent-500',
};

export default function MonitorPage() {
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);

  // Get monitored animals
  const monitoredAnimals = sampleAnimals.filter(a => a.isMonitored);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <AntennaIcon className="w-14 h-14 text-primary-600 dark:text-primary-400" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 dark:text-white mt-4">
            Real-Time Monitoring
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 mt-4 max-w-3xl mx-auto">
            Track animals in real-time with our global monitoring network. View live locations, receive alerts,
            and analyze movement patterns for thousands of species worldwide.
          </p>
        </motion.div>

        {/* Monitoring Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            {
              label: 'Total Monitored',
              value: sampleMonitoringData.totalAnimals.toLocaleString(),
              icon: <AntennaIcon className="w-7 h-7 text-primary-600 dark:text-primary-400" />,
              color: 'primary',
            },
            {
              label: 'Active Alerts',
              value: sampleMonitoringData.activeAlerts.toLocaleString(),
              icon: <BellIcon className="w-7 h-7 text-danger-500" />,
              color: 'danger',
            },
            {
              label: 'Species Tracked',
              value: monitoredAnimals.length.toLocaleString(),
              icon: <PawIcon className="w-7 h-7 text-success-600 dark:text-success-400" />,
              color: 'success',
            },
            {
              label: 'Coverage',
              value: `${(sampleMonitoringData.monitoredAnimals / sampleMonitoringData.totalAnimals * 100).toFixed(1)}%`,
              icon: <GlobeIcon className="w-7 h-7 text-accent-600 dark:text-accent-400" />,
              color: 'accent',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${statBorder[stat.color] ?? 'border-primary-500'}`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Globe */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="mb-12"
        >
          <div className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                Live Animal Tracking
              </h2>
              <div className="flex space-x-4">
                <button className="px-4 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-900 dark:text-secondary-100 transition-colors duration-300">
                  All Animals
                </button>
                <button className="px-4 py-2 rounded-xl bg-primary-100 dark:bg-primary-900/20 hover:bg-primary-200 dark:hover:bg-primary-800/20 text-primary-700 dark:text-primary-200 transition-colors duration-300">
                  Monitored Only
                </button>
              </div>
            </div>
            <InteractiveGlobe />
          </div>
        </motion.div>

        {/* Monitoring Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <MonitoringAlerts />
        </motion.div>

        {/* Monitoring Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Monitoring Coverage by Category
            </h2>
            <Link
              href="/monitor/coverage"
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm transition-colors duration-300"
            >
              View Details
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(sampleMonitoringData.monitoringCoverage).map(([category, percentage], index) => {
              const categoryData = sampleAnimals.find(a => a.category === category);
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{categoryData ? categoryData.category[0].toUpperCase() : category[0].toUpperCase()}</span>
                      <span className="font-semibold text-secondary-900 dark:text-white">{category}</span>
                    </div>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {(percentage * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-secondary-200 dark:bg-secondary-600 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-primary-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                  <div className="text-sm text-secondary-500 dark:text-secondary-400">
                    {sampleAnimals.filter(a => a.category === category && a.isMonitored).length} of {sampleAnimals.filter(a => a.category === category).length} species
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Monitored Animals List */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Currently Monitored Animals
            </h2>
            <Link
              href="/animal?isMonitored=true"
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm transition-colors duration-300"
            >
              View All Monitored Animals
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monitoredAnimals.slice(0, 6).map((animal, index) => (
              <motion.div
                key={animal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-secondary-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <Link href={`/animal/${animal.id}`} className="block">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-16 h-16 rounded-2xl bg-cover bg-center"
                      style={{
                        backgroundImage: animal.images?.[0] ? `url(${animal.images[0]})` : 'none',
                        backgroundColor: '#f0f9ff',
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-secondary-900 dark:text-white">
                        {animal.commonName}
                      </h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {animal.scientificName}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1 text-sm text-secondary-500 dark:text-secondary-400">
                          <PinIcon className="w-3.5 h-3.5" />
                          <span className="font-data">{animal.location.latitude.toFixed(2)}, {animal.location.longitude.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-success-600 dark:text-success-400">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          <span>Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                    <div className="flex space-x-2">
                      {animal.dataCategories.slice(0, 3).map(category => (
                        <span
                          key={category}
                          className="w-6 h-6 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-600 dark:text-secondary-300"
                          title={category}
                        >
                          <DataCategoryIcon category={category} className="w-3.5 h-3.5" />
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/monitor/${animal.id}`}
                      className="px-3 py-1 rounded-xl bg-primary-100 dark:bg-primary-900/20 hover:bg-primary-200 dark:hover:bg-primary-800/20 text-primary-700 dark:text-primary-200 text-sm transition-colors duration-300"
                    >
                      View Tracking
                    </Link>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
