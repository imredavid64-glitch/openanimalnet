'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SafariSpawn } from '@/lib/useSafari';
import { PawIcon, XIcon, ShieldIcon, ChartIcon, BookIcon, CalendarIcon } from '@/components/icons';

const RARITY_STYLES = {
  common: { bg: 'bg-secondary-100', text: 'text-secondary-600', border: 'border-secondary-200', glow: '' },
  uncommon: { bg: 'bg-success-100', text: 'text-success-700', border: 'border-success-200', glow: 'shadow-success-500/20' },
  rare: { bg: 'bg-primary-100', text: 'text-primary-700', border: 'border-primary-200', glow: 'shadow-primary-500/30' },
  legendary: { bg: 'bg-accent-100', text: 'text-accent-700', border: 'border-accent-200', glow: 'shadow-accent-500/30' },
};

const STATUS_NAMES: Record<string, string> = {
  EX: 'Extinct', EW: 'Extinct in Wild', CR: 'Critically Endangered', EN: 'Endangered',
  VU: 'Vulnerable', NT: 'Near Threatened', LC: 'Least Concern', DD: 'Data Deficient', NE: 'Not Evaluated',
};

const STATUS_COLORS: Record<string, string> = {
  CR: 'bg-danger-100 text-danger-700', EN: 'bg-danger-50 text-danger-600',
  VU: 'bg-warning-100 text-warning-700', NT: 'bg-warning-50 text-warning-600',
  LC: 'bg-success-100 text-success-700', DD: 'bg-secondary-100 text-secondary-600', NE: 'bg-secondary-100 text-secondary-500',
};

export default function AnimalEncounter({
  spawn,
  onDiscover,
  onClose,
}: {
  spawn: SafariSpawn;
  onDiscover: (photoTaken: boolean, notes: string) => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<'spotting' | 'encounter' | 'discovered'>('spotting');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [notes, setNotes] = useState('');
  const [showFacts, setShowFacts] = useState(false);

  const animal = spawn.animal;
  const rarity = RARITY_STYLES[spawn.rarity];

  const handleDiscover = () => {
    onDiscover(photoTaken, notes);
    setPhase('discovered');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-lg bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl overflow-hidden ${rarity.glow}`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-secondary-700/80 hover:bg-white dark:hover:bg-secondary-600 transition-colors"
          >
            <XIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-300" />
          </button>

          {/* Phase: Spotting */}
          {phase === 'spotting' && (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6"
              >
                <PawIcon className="w-12 h-12 text-primary-600" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-secondary-900 dark:text-white mb-2"
              >
                Something&apos;s nearby...
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-secondary-500 mb-6"
              >
                {spawn.distance < 500 ? 'Very close!' : spawn.distance < 2000 ? 'Getting closer...' : 'In the distance...'}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPhase('encounter')}
                className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors shadow-lg shadow-primary-500/30"
              >
                Investigate
              </motion.button>
            </div>
          )}

          {/* Phase: Encounter */}
          {phase === 'encounter' && (
            <div>
              {/* Header with animal info */}
              <div className={`p-6 ${rarity.bg} ${rarity.border} border-b`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-secondary-800 flex items-center justify-center shadow-md">
                    <PawIcon className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-secondary-900 dark:text-white">{animal.commonName}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rarity.bg} ${rarity.text}`}>
                        {spawn.rarity}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-500 italic">{animal.scientificName}</p>
                  </div>
                </div>
              </div>

              {/* Animal details */}
              <div className="p-6 space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                    <div className={`text-sm font-bold ${STATUS_COLORS[animal.conservationStatus]?.split(' ')[1] || 'text-secondary-600'}`}>
                      {animal.conservationStatus}
                    </div>
                    <div className="text-xs text-secondary-400">{STATUS_NAMES[animal.conservationStatus]}</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                    <div className="text-sm font-bold text-secondary-900 dark:text-white">
                      {animal.populationEstimate?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-secondary-400">Population</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                    <div className="text-sm font-bold text-secondary-900 dark:text-white">
                      {animal.category}
                    </div>
                    <div className="text-xs text-secondary-400">Category</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
                  {animal.description?.slice(0, 200)}{animal.description && animal.description.length > 200 ? '...' : ''}
                </p>

                {/* Habitat */}
                {animal.habitat && animal.habitat.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-secondary-500">Habitat:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {animal.habitat.map(h => (
                        <span key={h} className="px-2 py-0.5 rounded-full text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learn more toggle */}
                <button
                  onClick={() => setShowFacts(!showFacts)}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <BookIcon className="w-4 h-4" />
                  {showFacts ? 'Hide' : 'Show'} detailed taxonomy
                </button>

                {showFacts && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="text-xs text-secondary-500 space-y-1 overflow-hidden"
                  >
                    <div><span className="font-medium">Kingdom:</span> {animal.taxonomy.kingdom}</div>
                    <div><span className="font-medium">Phylum:</span> {animal.taxonomy.phylum}</div>
                    <div><span className="font-medium">Class:</span> {animal.taxonomy.class}</div>
                    <div><span className="font-medium">Order:</span> {animal.taxonomy.order}</div>
                    <div><span className="font-medium">Family:</span> {animal.taxonomy.family}</div>
                    <div><span className="font-medium">Genus:</span> {animal.taxonomy.genus}</div>
                    <div><span className="font-medium">Species:</span> {animal.taxonomy.species}</div>
                  </motion.div>
                )}

                {/* Photo toggle */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                  <button
                    onClick={() => setPhotoTaken(!photoTaken)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      photoTaken ? 'bg-primary-600 text-white' : 'bg-secondary-200 dark:bg-secondary-600 text-secondary-500'
                    }`}
                  >
                    <span className="text-xl">{photoTaken ? '📸' : '📷'}</span>
                  </button>
                  <div>
                    <div className="text-sm font-medium text-secondary-900 dark:text-white">
                      {photoTaken ? 'Photo taken!' : 'Take a photo'}
                    </div>
                    <div className="text-xs text-secondary-400">Document your discovery</div>
                  </div>
                </div>

                {/* Notes */}
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this encounter..."
                  className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-secondary-50 dark:bg-secondary-700 text-sm text-secondary-900 dark:text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                  rows={2}
                />

                {/* Discover button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDiscover}
                  className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors shadow-lg shadow-primary-500/30"
                >
                  {spawn.discovered ? 'Discover Again' : 'Discover This Species'}
                </motion.button>
              </div>
            </div>
          )}

          {/* Phase: Discovered */}
          {phase === 'discovered' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-4xl">🎉</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                {spawn.discovered ? 'Rediscovered!' : 'New Discovery!'}
              </h2>
              <p className="text-secondary-500 mb-2">
                You&apos;ve found the <strong>{animal.commonName}</strong>!
              </p>
              {photoTaken && (
                <p className="text-sm text-primary-600 mb-4">📸 Photo documented</p>
              )}
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
              >
                Continue Safari
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
