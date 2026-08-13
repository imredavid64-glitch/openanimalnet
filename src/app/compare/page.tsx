'use client';

import { motion } from 'framer-motion';
import SpeciesComparison from '@/components/compare/SpeciesComparison';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ChartIcon } from '@/components/icons';

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white dark:from-secondary-900 dark:to-secondary-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
            <ChartIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">
            Species Comparison
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-4 max-w-2xl mx-auto">
            Select up to 6 species to compare their population trends side by side.
            All data is sourced from IUCN assessments, census reports, and peer-reviewed surveys.
          </p>
        </motion.div>

        <SpeciesComparison />
      </main>
      <Footer />
    </div>
  );
}
