'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { sampleAnimals } from '@/data/sample/animals';
import { AnimalCategory, ConservationStatus } from '@/types/animal/types';

const categoryIcons: Record<AnimalCategory, string> = {
  mammals: '🦁',
  birds: '🦅',
  reptiles: '🐍',
  amphibians: '🐸',
  fish: '🐟',
  invertebrates: '🦋',
  insects: '🐜',
  marine: '🐋',
};

const conservationStatusColors: Record<ConservationStatus, string> = {
  EX: 'bg-danger-500',
  EW: 'bg-danger-500',
  CR: 'bg-danger-400',
  EN: 'bg-warning-500',
  VU: 'bg-warning-400',
  NT: 'bg-warning-300',
  LC: 'bg-success-500',
  DD: 'bg-secondary-500',
  NE: 'bg-secondary-400',
};

const conservationStatusNames: Record<ConservationStatus, string> = {
  EX: 'Extinct',
  EW: 'Extinct in the Wild',
  CR: 'Critically Endangered',
  EN: 'Endangered',
  VU: 'Vulnerable',
  NT: 'Near Threatened',
  LC: 'Least Concern',
  DD: 'Data Deficient',
  NE: 'Not Evaluated',
};

export default function FeaturedAnimals() {
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);

  const featuredAnimals = sampleAnimals;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative"
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          <span className="text-4xl">⭐</span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">
          Featured Animals
        </h2>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-4 max-w-2xl mx-auto">
          Discover some of the most fascinating species being tracked on OpenAnimalNet.
          Click on any animal to learn more about its data and conservation status.
        </p>
      </div>

      {/* Animals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredAnimals.map((animal, index) => (
          <motion.div
            key={animal.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => setSelectedAnimal(selectedAnimal === animal.id ? null : animal.id)}
            className="relative cursor-pointer"
          >
            {/* Animal Card */}
            <div
              className={`relative h-80 rounded-3xl overflow-hidden shadow-xl transition-shadow duration-300 ${
                selectedAnimal === animal.id 
                  ? 'ring-4 ring-primary-500 shadow-primary-500/30' 
                  : 'hover:shadow-2xl'
              }`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: animal.images?.[0] ? `url(${animal.images[0]})` : 'none',
                  backgroundColor: '#f0f9ff',
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-3 py-1.5">
                  <span>{categoryIcons[animal.category]}</span>
                  <span className="text-white text-sm font-medium">{animal.category}</span>
                </div>
              </div>
              
              {/* Conservation Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className={`px-3 py-1.5 rounded-xl text-white text-sm font-medium ${
                  conservationStatusColors[animal.conservationStatus]
                }`}>
                  {animal.conservationStatus}
                </div>
              </div>
              
              {/* Animal Info */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-1">{animal.commonName}</h3>
                  <p className="text-white/80 text-sm mb-3">{animal.scientificName}</p>
                  <div className="flex items-center space-x-4 text-white/90 text-sm">
                    <div className="flex items-center space-x-1">
                      <span>📍</span>
                      <span>{animal.habitat?.join(', ') || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👥</span>
                      <span>{animal.populationEstimate?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2">
                      {animal.dataCategories.slice(0, 3).map((category) => (
                        <span
                          key={category}
                          className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs"
                          title={category}
                        >
                          {category === 'biological' && '🧬'}
                          {category === 'behavioral' && '🗺️'}
                          {category === 'ecological' && '🌿'}
                          {category === 'population' && '📊'}
                          {category === 'health' && '🏥'}
                          {category === 'agricultural' && '🐄'}
                          {category === 'shelter' && '🏠'}
                          {category === 'human-interaction' && '⚠️'}
                        </span>
                      ))}
                    </div>
                    <div className={`flex items-center space-x-1 text-sm ${
                      animal.isMonitored ? 'text-success-400' : 'text-secondary-400'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      <span>{animal.isMonitored ? 'Monitored' : 'Not Monitored'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        className="mt-12 text-center"
      >
        <Link href="/animal" className="btn-primary text-lg px-8 py-4">
          View All Animals
        </Link>
      </motion.div>

      {/* Animal Detail Modal */}
      <AnimatePresence>
        {selectedAnimal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAnimal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-secondary-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {(() => {
                const animal = sampleAnimals.find(a => a.id === selectedAnimal);
                if (!animal) return null;
                
                return (
                  <>
                    {/* Header */}
                    <div className="relative">
                      <div
                        className="h-64 bg-cover bg-center"
                        style={{
                          backgroundImage: animal.images?.[0] ? `url(${animal.images[0]})` : 'none',
                          backgroundColor: '#f0f9ff',
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button
                          onClick={() => setSelectedAnimal(null)}
                          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300"
                        >
                          <span className="text-xl">×</span>
                        </button>
                      </div>
                      <div className="absolute -bottom-12 left-6">
                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-secondary-800 p-1 shadow-lg">
                          <div
                            className="w-full h-full rounded-xl bg-cover bg-center"
                            style={{
                              backgroundImage: animal.images?.[0] ? `url(${animal.images[0]})` : 'none',
                              backgroundColor: '#f0f9ff',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 pt-16">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">
                            {animal.commonName}
                          </h2>
                          <p className="text-secondary-600 dark:text-secondary-400">
                            {animal.scientificName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{categoryIcons[animal.category]}</span>
                          <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                            {animal.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        <div className={`px-3 py-1 rounded-xl text-white text-sm font-medium ${
                          conservationStatusColors[animal.conservationStatus]
                        }`}>
                          {conservationStatusNames[animal.conservationStatus]}
                        </div>
                        <div className="px-3 py-1 bg-secondary-100 dark:bg-secondary-700 rounded-xl text-secondary-600 dark:text-secondary-300 text-sm font-medium">
                          Population: {animal.populationEstimate?.toLocaleString() || 'N/A'}
                        </div>
                        <div className={`px-3 py-1 rounded-xl text-sm font-medium ${
                          animal.isMonitored ? 'bg-success-100 text-success-700' : 'bg-secondary-100 text-secondary-700'
                        }`}>
                          {animal.isMonitored ? '✅ Monitored' : '❌ Not Monitored'}
                        </div>
                      </div>
                      
                      <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                        {animal.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 mb-2">
                            Taxonomy
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div><span className="text-secondary-400">Kingdom:</span> {animal.taxonomy.kingdom}</div>
                            <div><span className="text-secondary-400">Phylum:</span> {animal.taxonomy.phylum}</div>
                            <div><span className="text-secondary-400">Class:</span> {animal.taxonomy.class}</div>
                            <div><span className="text-secondary-400">Order:</span> {animal.taxonomy.order}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 mb-2">
                            Habitat
                          </h4>
                          <div className="space-y-1 text-sm">
                            {animal.habitat?.map((h, i) => (
                              <div key={i}>• {h}</div>
                            )) || <div>Unknown</div>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 mb-2">
                          Data Categories
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {animal.dataCategories.map((category) => (
                            <span
                              key={category}
                              className="px-3 py-1 bg-secondary-100 dark:bg-secondary-700 rounded-xl text-secondary-600 dark:text-secondary-300 text-sm"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Link
                          href={`/animal/${animal.id}`}
                          className="btn-primary flex-1 text-center"
                        >
                          View Full Profile
                        </Link>
                        <Link
                          href={`/monitor?animal=${animal.id}`}
                          className="btn-secondary flex-1 text-center"
                        >
                          Monitor
                        </Link>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
