'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function MigrationPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">Migration Corridors</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Explore animated migration routes with climate corridor projections under SSP scenarios.
          </p>
          <button onClick={() => setCount(c => c + 1)} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg">
            Count: {count}
          </button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}