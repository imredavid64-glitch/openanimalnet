'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { WifiOffIcon, RefreshCwIcon, DatabaseIcon, AlertTriangleIcon } from '@/components/icons';
import Link from 'next/link';

export default function OfflinePage() {
  const [online, setOnline] = useState(false);
  const [cachedSpecies, setCachedSpecies] = useState<number>(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => { setOnline(true); window.location.reload(); };
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check cached species count from IndexedDB
    if ('indexedDB' in window) {
      const request = indexedDB.open('OpenAnimalNet', 1);
      request.onsuccess = () => {
        const db = request.result;
        if (db.objectStoreNames.contains('cachedSpecies')) {
          const tx = db.transaction('cachedSpecies', 'readonly');
          const store = tx.objectStore('cachedSpecies');
          const countRequest = store.count();
          countRequest.onsuccess = () => setCachedSpecies(countRequest.result);
        }
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center p-8"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center">
            <WifiOffIcon className="w-12 h-12 text-secondary-400 dark:text-secondary-500" />
          </div>

          <h1 className="text-4xl font-bold text-secondary-900 dark:text-white mb-4">
            You&apos;re Offline
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 mb-8">
            No internet connection detected. Some features are still available offline.
          </p>

          {/* Offline Capabilities */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 mb-8 border border-secondary-100 dark:border-secondary-700 text-left">
            <h3 className="font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
              <DatabaseIcon className="w-5 h-5 text-primary-600" />
              Available Offline
            </h3>
            <ul className="space-y-3 text-secondary-600 dark:text-secondary-400">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-success-500 flex-shrink-0" />
                Browse {cachedSpecies} cached species profiles
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-success-500 flex-shrink-0" />
                View migration corridors & maps
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-success-500 flex-shrink-0" />
                Access analytics dashboard (cached data)
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-success-500 flex-shrink-0" />
                Use acoustic simulator & habitat tools
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-warning-500 flex-shrink-0" />
                Record sightings (syncs when online)
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-warning-500 flex-shrink-0" />
                AI chat (cached responses only)
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCwIcon className="w-5 h-5" />
              Try Reconnecting
            </button>

            <Link
              href="/animal"
              className="block w-full py-4 px-6 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangleIcon className="w-5 h-5" />
              Browse Cached Species
            </Link>

            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              Your data is safe. Sightings & observations will sync automatically when connection restores.
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}