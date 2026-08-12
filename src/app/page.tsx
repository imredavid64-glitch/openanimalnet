'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/layout/HeroSection';
import AnimalCategories from '@/components/animal/AnimalCategories';
import FeaturedAnimals from '@/components/animal/FeaturedAnimals';
import InteractiveGlobe from '@/components/map/InteractiveGlobe';
import StatsDashboard from '@/components/visualization/StatsDashboard';
import MonitoringAlerts from '@/components/monitor/MonitoringAlerts';
import AIAssistant from '@/components/ai/AIAssistant';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      
      <main className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative z-10">
          <HeroSection />
        </section>

        {/* Interactive Globe Section */}
        <section id="globe" className="relative -mt-32 z-0 scroll-mt-24">
          <div className="container mx-auto px-4">
            <InteractiveGlobe />
          </div>
        </section>

        {/* Stats Dashboard */}
        <section className="py-16 bg-white/80 dark:bg-secondary-900/50 backdrop-blur-lg">
          <div className="container mx-auto px-4">
            <StatsDashboard />
          </div>
        </section>

        {/* Animal Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <AnimalCategories />
          </div>
        </section>

        {/* Featured Animals */}
        <section className="py-16 bg-secondary-100/50 dark:bg-secondary-900/30">
          <div className="container mx-auto px-4">
            <FeaturedAnimals />
          </div>
        </section>

        {/* Monitoring Alerts */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <MonitoringAlerts />
          </div>
        </section>

        {/* AI Assistant Button */}
        <AnimatePresence>
          {!showAI && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setShowAI(true)}
              className="fixed bottom-8 right-8 z-50 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <span className="text-2xl">🤖</span>
              <span className="ml-2 font-medium">AI Assistant</span>
            </motion.button>
          )}
        </AnimatePresence>

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
      </main>

      <Footer />
    </div>
  );
}
