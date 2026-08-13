'use client';

import { motion } from 'framer-motion';
import PetTracker from '@/components/tracker/PetTracker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PawIcon, ShieldIcon, CalendarIcon, ChartIcon } from '@/components/icons';

export default function TrackerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-white dark:from-secondary-900 dark:to-secondary-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
            Pet Tracker
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-4 max-w-2xl mx-auto">
            Track your pets and never miss a vaccination, vet visit, or medication.
            Everything is stored locally in your browser — nothing leaves your device.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: <PawIcon className="w-5 h-5" />, title: 'Pet Profiles', desc: 'Name, breed, age, weight, microchip' },
            { icon: <ShieldIcon className="w-5 h-5" />, title: 'Vaccinations', desc: 'Track doses and next due dates' },
            { icon: <CalendarIcon className="w-5 h-5" />, title: 'Vet Visits', desc: 'Log visits, diagnoses, and costs' },
            { icon: <ChartIcon className="w-5 h-5" />, title: 'Care Dashboard', desc: 'See what your pet needs at a glance' },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-md text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-2 text-primary-600">
                {feat.icon}
              </div>
              <h3 className="font-medium text-sm text-secondary-900 dark:text-white">{feat.title}</h3>
              <p className="text-xs text-secondary-400 mt-0.5">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        <PetTracker />
      </main>
      <Footer />
    </div>
  );
}
