'use client';

import { motion } from 'framer-motion';
import { SafariSpawn } from '@/lib/useSafari';
import { PawIcon, GlobeIcon } from '@/components/icons';

const RARITY_STYLES = {
  common: { bg: 'bg-secondary-100 dark:bg-secondary-700', text: 'text-secondary-600 dark:text-secondary-400', dot: 'bg-secondary-400', label: 'Common' },
  uncommon: { bg: 'bg-success-100 dark:bg-success-900/30', text: 'text-success-700 dark:text-success-400', dot: 'bg-success-500', label: 'Uncommon' },
  rare: { bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-700 dark:text-primary-400', dot: 'bg-primary-500', label: 'Rare' },
  legendary: { bg: 'bg-accent-100 dark:bg-accent-900/30', text: 'text-accent-700 dark:text-accent-400', dot: 'bg-accent-500', label: 'Legendary' },
};

const STATUS_COLORS: Record<string, string> = {
  CR: 'text-danger-600',
  EN: 'text-danger-500',
  VU: 'text-warning-500',
  NT: 'text-warning-400',
  LC: 'text-success-500',
  DD: 'text-secondary-400',
  NE: 'text-secondary-400',
};

export default function SafariMap({
  spawns,
  onSelect,
  onRefresh,
}: {
  spawns: SafariSpawn[];
  onSelect: (spawn: SafariSpawn) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Map header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
          <GlobeIcon className="w-5 h-5 text-primary-600" />
          Nearby Wildlife
          <span className="text-sm font-normal text-secondary-400">{spawns.length} spotted</span>
        </h3>
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
        >
          Scan Area
        </button>
      </div>

      {/* Spawn cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {spawns.map((spawn, i) => {
          const rarity = RARITY_STYLES[spawn.rarity];
          return (
            <motion.button
              key={`${spawn.animal.id}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(spawn)}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-200 ${
                spawn.discovered
                  ? 'bg-success-50 dark:bg-success-900/10 border-success-200 dark:border-success-800'
                  : 'bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg'
              }`}
            >
              {/* Rarity badge */}
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rarity.bg} ${rarity.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${rarity.dot}`} />
                  {rarity.label}
                </span>
                {spawn.discovered && (
                  <span className="text-xs text-success-600 dark:text-success-400 font-medium">Discovered</span>
                )}
              </div>

              {/* Animal info */}
              <div className="mb-2">
                <h4 className="font-semibold text-secondary-900 dark:text-white">{spawn.animal.commonName}</h4>
                <p className="text-xs text-secondary-400 italic">{spawn.animal.scientificName}</p>
              </div>

              {/* Status and distance */}
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${STATUS_COLORS[spawn.animal.conservationStatus] || 'text-secondary-400'}`}>
                  {spawn.animal.conservationStatus}
                </span>
                <span className="text-secondary-400">
                  {spawn.distance < 1000 ? `${spawn.distance}m` : `${(spawn.distance / 1000).toFixed(1)}km`} away
                </span>
              </div>

              {/* Paw icon overlay for undiscovered */}
              {!spawn.discovered && (
                <div className="absolute top-3 right-3 opacity-10">
                  <PawIcon className="w-16 h-16 text-primary-600" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
