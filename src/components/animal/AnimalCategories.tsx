'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { animalCategoryData, sampleAnimals } from '@/data/sample/animals';
import { AnimalCategory } from '@/types/animal/types';
import { CategoryIcon, GlobeIcon, PawIcon, AntennaIcon, SeverityIcon, DataCategoryIcon } from '@/components/icons';

const speciesCount = sampleAnimals.length;
const corridorCount = sampleAnimals.reduce((t, a) => t + (a.migrationRoutes?.length ?? 0), 0);
const iucnCount = sampleAnimals.filter((a) => a.conservationStatus !== 'NE').length;
const monitoredCount = sampleAnimals.filter((a) => a.isMonitored).length;

export default function AnimalCategories() {
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
          <GlobeIcon className="w-10 h-10 text-primary-500 dark:text-primary-400 mx-auto" />
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">
          Explore Animal Categories
        </h2>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-4 max-w-2xl mx-auto">
          Browse through millions of species across all major animal categories.
          Each category contains comprehensive data on biology, behavior, ecology, and conservation.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {animalCategoryData.map((category, index) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
            whileHover={{ y: -3, scale: 1.02 }}
            className="relative group"
          >
            <Link
              href={`/animal?category=${category.category}`}
              className="block relative h-64 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 card-hover"
            >
              {/* Background */}
              <div
                className="absolute inset-0 bg-gradient-to-br"
                style={{
                  background: `linear-gradient(135deg, ${category.color}40, ${category.color}80)`,
                }}
              />
              
              {/* Icon Background */}
              <div
                className="absolute top-6 left-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${category.color}30, ${category.color}10)`,
                }}
              >
                <CategoryIcon category={category.category as AnimalCategory} className="w-8 h-8 text-white" />
              </div>
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                  <span className="text-white/60 text-sm">
                    {category.count.toLocaleString()} species
                  </span>
                </div>
                <p className="text-white/80 text-sm line-clamp-2">
                  {`Comprehensive data on ${category.name.toLowerCase()}`}
                </p>
              </div>
              
              {/* Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Border Effect */}
              <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-br from-primary-500 to-primary-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'species tracked', value: String(speciesCount), icon: <PawIcon className="w-7 h-7 text-primary-500 dark:text-primary-400" /> },
          { label: 'migration corridors', value: String(corridorCount), icon: <AntennaIcon className="w-7 h-7 text-primary-500 dark:text-primary-400" /> },
          { label: 'IUCN-assessed', value: String(iucnCount), icon: <SeverityIcon type="warning" className="w-7 h-7 text-warning-500" /> },
          { label: 'under monitoring', value: String(monitoredCount), icon: <DataCategoryIcon category="population" className="w-7 h-7 text-primary-500 dark:text-primary-400" /> },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-secondary-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
