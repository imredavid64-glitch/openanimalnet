'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { sampleAnimals, animalCategoryData } from '@/data/sample/animals';
import { AnimalCategory, ConservationStatus, AnimalFilter } from '@/types/animal/types';
import { filterAndSortAnimals, AnimalSortBy } from '@/lib/animalFiltering';
import AnimalCard from '@/components/animal/AnimalCard';
import AnimalFilters from '@/components/animal/AnimalFilters';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AnimalPage() {
  const [animals, setAnimals] = useState(sampleAnimals);
  const [filters, setFilters] = useState<AnimalFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<AnimalSortBy>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize filters from URL query params (?category=..., ?isMonitored=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const monitored = params.get('isMonitored');
    if (category) {
      setFilters(prev => ({ ...prev, categories: [category as AnimalCategory] }));
    }
    if (monitored === 'true') {
      setFilters(prev => ({ ...prev, isMonitored: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    setIsLoading(true);
    const filteredAnimals = filterAndSortAnimals(
      sampleAnimals,
      filters,
      searchQuery,
      sortBy,
      sortDirection
    );
    setAnimals(filteredAnimals);
    setIsLoading(false);
  }, [filters, searchQuery, sortBy, sortDirection]);

  const handleFilterChange = (newFilters: Partial<AnimalFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const categoryCounts = sampleAnimals.reduce((acc, animal) => {
    acc[animal.category] = (acc[animal.category] || 0) + 1;
    return acc;
  }, {} as Record<AnimalCategory, number>);

  const statusCounts = sampleAnimals.reduce((acc, animal) => {
    acc[animal.conservationStatus] = (acc[animal.conservationStatus] || 0) + 1;
    return acc;
  }, {} as Record<ConservationStatus, number>);

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
            <span className="text-5xl">🐾</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 dark:text-white mt-4">
            Animal Database
          </h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 mt-4 max-w-3xl mx-auto">
            Explore comprehensive data on {sampleAnimals.length.toLocaleString()} species across all major animal categories.
            Filter, sort, and discover animals based on your research needs.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8"
        >
          {animalCategoryData.map((category) => (
            <Link
              key={category.category}
              href={`?category=${category.category}`}
              className="bg-white dark:bg-secondary-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center card-hover"
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="text-lg font-bold text-secondary-900 dark:text-white">
                {categoryCounts[category.category as AnimalCategory] || 0}
              </div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                {category.name}
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="bg-white dark:bg-secondary-800 rounded-3xl p-6 mb-8 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                Search Animals
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, scientific name, habitat, or description..."
                  className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 placeholder:text-secondary-400 dark:placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-secondary-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex-1">
              <AnimalFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-500 dark:text-secondary-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
              >
                <option value="name">Name</option>
                <option value="population">Population</option>
                <option value="status">Conservation Status</option>
                <option value="monitored">Monitored Status</option>
              </select>
              <button
                onClick={toggleSortDirection}
                className="px-3 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-900 dark:text-secondary-100 transition-colors duration-300"
              >
                {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-500 dark:text-secondary-400">
                Showing {animals.length} of {sampleAnimals.length} animals
              </span>
              <button
                onClick={() => {
                  setFilters({});
                  setSearchQuery('');
                  setSortBy('name');
                  setSortDirection('asc');
                }}
                className="px-3 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-900 dark:text-secondary-100 text-sm transition-colors duration-300"
              >
                Clear All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-4xl animate-spin">🌍</div>
            <p className="text-secondary-600 dark:text-secondary-400 mt-4">Loading animals...</p>
          </motion.div>
        ) : animals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
              No Animals Found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setFilters({});
                setSearchQuery('');
              }}
              className="btn-primary"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {animals.map((animal, index) => (
              <motion.div
                key={animal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <AnimalCard animal={animal} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
