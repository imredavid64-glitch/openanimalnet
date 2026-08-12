'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import InteractiveGlobe from '@/components/map/InteractiveGlobe';
import StatsDashboard from '@/components/visualization/StatsDashboard';
import MonitoringAlerts from '@/components/monitor/MonitoringAlerts';
import AnimalCategories from '@/components/animal/AnimalCategories';
import FeaturedAnimals from '@/components/animal/FeaturedAnimals';
import { PawIcon, AntennaIcon, RobotIcon, ChartIcon } from '@/components/icons';
import AIAssistant from '@/components/ai/AIAssistant';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function DashboardPage() {
  const [showAI, setShowAI] = useState(false);

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
            <span className="text-5xl">📊</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 dark:text-white mt-4">
            Dashboard
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 mt-4 max-w-3xl mx-auto">
            Your comprehensive overview of global animal data, monitoring status, and conservation insights.
            Explore real-time statistics, interactive maps, and AI-powered analysis.
          </p>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { name: 'Animals', path: '/animal', icon: <PawIcon className="w-6 h-6" /> },
            { name: 'Monitor', path: '/monitor', icon: <AntennaIcon className="w-6 h-6" /> },
            { name: 'AI Analysis', path: '/ai', icon: <RobotIcon className="w-6 h-6" /> },
            { name: 'Data Explorer', path: '/data', icon: <ChartIcon className="w-6 h-6" /> },
          ].map((nav, index) => (
            <motion.div
              key={nav.path}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white dark:bg-secondary-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <Link
                href={nav.path}
                className="flex items-center space-x-3"
              >
                <span className="text-primary-600 dark:text-primary-400">{nav.icon}</span>
                <span className="font-semibold text-secondary-900 dark:text-white">{nav.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="mb-12"
        >
          <StatsDashboard />
        </motion.div>

        {/* Interactive Globe */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <InteractiveGlobe />
        </motion.div>

        {/* Featured Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          <div>
            <AnimalCategories />
          </div>
          <div>
            <MonitoringAlerts />
          </div>
        </motion.div>

        {/* Featured Animals */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: 'easeOut' }}
          className="mb-12"
        >
          <FeaturedAnimals />
        </motion.div>
      </main>

      {/* AI Assistant Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setShowAI(true)}
        className="fixed bottom-8 right-8 z-50 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <RobotIcon className="w-6 h-6" />
        <span className="ml-2 font-medium">AI Assistant</span>
      </motion.button>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 right-8 z-50 w-96 max-w-[90vw] bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl border border-secondary-200 dark:border-secondary-700 overflow-hidden"
          >
            <AIAssistant onClose={() => setShowAI(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
