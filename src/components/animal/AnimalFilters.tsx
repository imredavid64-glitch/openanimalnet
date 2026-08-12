'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimalFilter, AnimalCategory, ConservationStatus, DataCategory } from '@/types/animal/types';
import { animalCategoryData, conservationStatusData, dataCategoryData } from '@/data/sample/animals';
import { CategoryIcon, DataCategoryIcon, FilterIcon, PawIcon, ShieldIcon, AntennaIcon, SeverityIcon } from '@/components/icons';

// Status chips use the IUCN color dot instead of an emoji.
const statusColor = (status: ConservationStatus): string =>
  conservationStatusData.find((s) => s.status === status)?.color ?? '#94a3b8';

interface AnimalFiltersProps {
  filters: AnimalFilter;
  onFilterChange: (filters: Partial<AnimalFilter>) => void;
}

export default function AnimalFilters({ filters, onFilterChange }: AnimalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'categories' | 'status' | 'data' | 'monitored' | null>(null);

  const handleCategoryToggle = (category: AnimalCategory) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    onFilterChange({ categories: newCategories });
  };

  const handleStatusToggle = (status: ConservationStatus) => {
    const currentStatus = filters.conservationStatus || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    onFilterChange({ conservationStatus: newStatus });
  };

  const handleDataCategoryToggle = (category: DataCategory) => {
    const currentCategories = filters.dataCategories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    onFilterChange({ dataCategories: newCategories });
  };

  const handleMonitoredToggle = (value: boolean) => {
    onFilterChange({ isMonitored: value });
  };

  const clearAllFilters = () => {
    onFilterChange({ categories: [], conservationStatus: [], dataCategories: [], isMonitored: undefined });
  };

  const categoryOptions = animalCategoryData.map(cat => cat.category as AnimalCategory);
  const statusOptions = conservationStatusData.map(s => s.status as ConservationStatus);
  const dataOptions = dataCategoryData.map(d => d.category as DataCategory);

  // Count active filters
  const activeFilterCount = (
    (filters.categories?.length || 0) +
    (filters.conservationStatus?.length || 0) +
    (filters.dataCategories?.length || 0) +
    (filters.isMonitored !== undefined ? 1 : 0)
  );

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors duration-300"
      >
        <div className="flex items-center space-x-2">
          <FilterIcon className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <span>{isExpanded ? '↑' : '↓'}</span>
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl border border-secondary-200 dark:border-secondary-600 overflow-hidden z-50"
          >
            <div className="p-4">
              {/* Quick Filters */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => {
                    handleMonitoredToggle(true);
                    setIsExpanded(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 text-sm transition-colors duration-300"
                >
                  Monitored Only
                </button>
                <button
                  onClick={() => {
                    onFilterChange({ conservationStatus: ['CR', 'EN', 'VU'] });
                    setIsExpanded(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-danger-100 dark:bg-danger-900/20 hover:bg-danger-200 dark:hover:bg-danger-800/20 text-danger-700 dark:text-danger-200 text-sm transition-colors duration-300"
                >
                  Threatened Species
                </button>
              </div>

              {/* Category Filters */}
              <div className="mb-4">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'categories' ? null : 'categories')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 transition-colors duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <PawIcon className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
                    <span>Categories</span>
                  </div>
                  <span>{activeFilter === 'categories' ? '↑' : '↓'}</span>
                </button>
                
                <AnimatePresence>
                  {activeFilter === 'categories' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 grid grid-cols-2 gap-2"
                    >
                      {categoryOptions.map(category => (
                        <button
                          key={category}
                          onClick={() => handleCategoryToggle(category)}
                          className={`px-3 py-2 rounded-xl text-sm transition-colors duration-300 flex items-center space-x-2 ${
                            filters.categories?.includes(category)
                              ? 'bg-primary-500 text-white'
                              : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                          }`}
                        >
                          <CategoryIcon category={category} className="w-4 h-4" />
                          <span>{category}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Conservation Status Filters */}
              <div className="mb-4">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'status' ? null : 'status')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 transition-colors duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <ShieldIcon className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
                    <span>Conservation Status</span>
                  </div>
                  <span>{activeFilter === 'status' ? '↑' : '↓'}</span>
                </button>
                
                <AnimatePresence>
                  {activeFilter === 'status' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 grid grid-cols-2 gap-2"
                    >
                      {statusOptions.map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusToggle(status)}
                          className={`px-3 py-2 rounded-xl text-sm transition-colors duration-300 flex items-center space-x-2 ${
                            filters.conservationStatus?.includes(status)
                              ? 'bg-primary-500 text-white'
                              : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: statusColor(status) }}
                          />
                          <span>{status}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Data Category Filters */}
              <div className="mb-4">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'data' ? null : 'data')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 transition-colors duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <DataCategoryIcon category="population" className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
                    <span>Data Categories</span>
                  </div>
                  <span>{activeFilter === 'data' ? '↑' : '↓'}</span>
                </button>
                
                <AnimatePresence>
                  {activeFilter === 'data' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 grid grid-cols-2 gap-2"
                    >
                      {dataOptions.map(category => (
                        <button
                          key={category}
                          onClick={() => handleDataCategoryToggle(category)}
                          className={`px-3 py-2 rounded-xl text-sm transition-colors duration-300 flex items-center space-x-2 ${
                            filters.dataCategories?.includes(category)
                              ? 'bg-primary-500 text-white'
                              : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                          }`}
                        >
                          <DataCategoryIcon category={category} className="w-4 h-4" />
                          <span>{category.replace('-', ' ')}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Monitored Status Filter */}
              <div className="mb-4">
                <button
                  onClick={() => setActiveFilter(activeFilter === 'monitored' ? null : 'monitored')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 transition-colors duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <AntennaIcon className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
                    <span>Monitored Status</span>
                  </div>
                  <span>{activeFilter === 'monitored' ? '↑' : '↓'}</span>
                </button>
                
                <AnimatePresence>
                  {activeFilter === 'monitored' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 grid grid-cols-2 gap-2"
                    >
                      <button
                        onClick={() => handleMonitoredToggle(true)}
                        className={`px-3 py-2 rounded-xl text-sm transition-colors duration-300 flex items-center space-x-2 ${
                          filters.isMonitored === true
                            ? 'bg-primary-500 text-white'
                            : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                        }`}
                      >
                        <SeverityIcon type="info" className="w-4 h-4" />
                        <span>Monitored</span>
                      </button>
                      <button
                        onClick={() => handleMonitoredToggle(false)}
                        className={`px-3 py-2 rounded-xl text-sm transition-colors duration-300 flex items-center space-x-2 ${
                          filters.isMonitored === false
                            ? 'bg-primary-500 text-white'
                            : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                        }`}
                      >
                        <SeverityIcon type="warning" className="w-4 h-4" />
                        <span>Not Monitored</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-2 rounded-xl bg-danger-100 dark:bg-danger-900/20 hover:bg-danger-200 dark:hover:bg-danger-800/20 text-danger-700 dark:text-danger-200 text-sm transition-colors duration-300"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm transition-colors duration-300"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
