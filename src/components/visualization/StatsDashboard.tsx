'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  sampleAnimals,
  sampleMonitoringData,
  conservationStatusData,
  animalCategoryData,
  dataCategoryData,
} from '@/data/sample/animals';
import { ConservationStatus, AnimalCategory, DataCategory } from '@/types/animal/types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PawIcon, AntennaIcon, ShieldIcon, DataCategoryIcon, SeverityIcon, CalendarIcon, ChartIcon } from '@/components/icons';

const COLORS = ['#0ea5e9', '#38bdf8', '#06b6d4', '#0891b2', '#0e7490', '#1d4ed8', '#7c3aed', '#1e40af'];
const CONSERVATION_COLORS: Record<ConservationStatus, string> = {
  EX: '#7f1d1d',
  EW: '#7f1d1d',
  CR: '#dc2626',
  EN: '#ef4444',
  VU: '#f59e0b',
  NT: '#fbbf24',
  LC: '#22c55e',
  DD: '#64748b',
  NE: '#94a3b8',
};

const categoryColors: Record<AnimalCategory, string> = {
  mammals: '#0ea5e9',
  birds: '#38bdf8',
  reptiles: '#06b6d4',
  amphibians: '#0891b2',
  fish: '#0e7490',
  invertebrates: '#1d4ed8',
  insects: '#7c3aed',
  marine: '#1e40af',
};


interface MonitoringStats {
  totalAnimals: number;
  monitoredAnimals: number;
  activeAlerts: number;
  populationTrend: { date: string; mammals: number; birds: number; reptiles: number; amphibians: number }[];
}

export default function StatsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'conservation' | 'monitoring'>('overview');
  const [isClient, setIsClient] = useState(false);
  const [apiStats, setApiStats] = useState<MonitoringStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch live stats from the API; fall back to bundled sample data on error.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/monitoring/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.success) setApiStats(json.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const liveStats = apiStats ?? {
    totalAnimals: sampleMonitoringData.totalAnimals,
    monitoredAnimals: sampleMonitoringData.monitoredAnimals,
    activeAlerts: sampleMonitoringData.activeAlerts,
  };

  // Prepare data for charts
  const categoryChartData = animalCategoryData.map(cat => ({
    name: cat.name,
    value: cat.count,
    color: categoryColors[cat.category as AnimalCategory],
  }));

  const conservationChartData = conservationStatusData.map(status => ({
    name: status.name,
    value: status.count,
    color: CONSERVATION_COLORS[status.status as ConservationStatus],
  }));

  const monitoringChartData = [
    { name: 'Monitored', value: sampleMonitoringData.monitoredAnimals, color: '#22c55e' },
    { name: 'Not Monitored', value: sampleMonitoringData.totalAnimals - sampleMonitoringData.monitoredAnimals, color: '#ef4444' },
  ];

  const populationTrendData = apiStats?.populationTrend ?? sampleMonitoringData.populationTrend;

  const dataCategoryChartData = dataCategoryData.map(cat => ({
    name: cat.name,
    value: Math.floor(Math.random() * 50000) + 10000,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <DataCategoryIcon category="population" className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <PawIcon className="w-4 h-4" /> },
    { id: 'conservation', label: 'Conservation', icon: <ShieldIcon className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoring', icon: <AntennaIcon className="w-4 h-4" /> },
  ];

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
          <span className="text-4xl">📈</span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mt-4">
          Global Statistics
        </h2>
        <p className="text-lg text-secondary-600 dark:text-secondary-400 mt-4 max-w-2xl mx-auto">
          Real-time insights into global animal populations, conservation status, and monitoring efforts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div>
              <div className="flex items-center justify-end mb-4">
                {apiStats ? (
                  <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-success-600 dark:text-success-400">
                    <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                    <span>Live API data</span>
                  </span>
                ) : statsLoading ? (
                  <span className="text-xs text-secondary-400">Loading live stats…</span>
                ) : null}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: 'Total Species',
                    value: liveStats.totalAnimals.toLocaleString(),
                    icon: <PawIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />,
                    color: 'primary',
                  },
                  {
                    label: 'Monitored Animals',
                    value: liveStats.monitoredAnimals.toLocaleString(),
                    icon: <AntennaIcon className="w-6 h-6 text-success-600 dark:text-success-400" />,
                    color: 'success',
                  },
                  {
                    label: 'Active Alerts',
                    value: liveStats.activeAlerts.toLocaleString(),
                    icon: <SeverityIcon type="warning" className="w-6 h-6 text-warning-600 dark:text-warning-400" />,
                    color: 'warning',
                  },
                  {
                    label: 'Data Categories Tracked',
                    value: dataCategoryData.length.toString(),
                    icon: <DataCategoryIcon category="population" className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />,
                    color: 'accent',
                  },
                ].map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-${metric.color}-100 dark:bg-${metric.color}-900/20 flex items-center justify-center`}>
                        {metric.icon}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-secondary-900 dark:text-white mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-secondary-500 dark:text-secondary-400">
                      {metric.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Population Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                    Population Trends
                  </h3>
                  <div className="flex space-x-2">
                    <button aria-label="Calendar view" className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-300">
                      <CalendarIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                    </button>
                    <button aria-label="Chart view" className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-300">
                      <ChartIcon className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={populationTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="mammals" stroke="#0ea5e9" strokeWidth={3} />
                        <Line type="monotone" dataKey="birds" stroke="#38bdf8" strokeWidth={3} />
                        <Line type="monotone" dataKey="reptiles" stroke="#06b6d4" strokeWidth={3} />
                        <Line type="monotone" dataKey="amphibians" stroke="#0891b2" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>
            </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Species by Category
                </h3>
                <div className="h-64">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>

              {/* Data Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Data Coverage
                </h3>
                <div className="h-64">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataCategoryChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#94a3b8" />
                        <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                          }}
                        />
                        <Bar dataKey="value" fill="#8884d8">
                          {dataCategoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'conservation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Conservation Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Conservation Status Distribution
                </h3>
                <div className="h-64">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={conservationChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {conservationChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>

              {/* Conservation Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  Conservation Metrics
                </h3>
                <div className="space-y-4">
                  {conservationStatusData.map((status, index) => (
                    <motion.div
                      key={status.status}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                      whileHover={{ x: 5, scale: 1.01 }}
                      className={`flex items-center justify-between p-4 rounded-2xl ${
                        status.status === 'EX' || status.status === 'EW' || status.status === 'CR'
                          ? 'bg-danger-50 dark:bg-danger-900/20'
                          : status.status === 'EN' || status.status === 'VU'
                          ? 'bg-warning-50 dark:bg-warning-900/20'
                          : 'bg-success-50 dark:bg-success-900/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: CONSERVATION_COLORS[status.status as ConservationStatus] }}
                        />
                        <div>
                          <div className="font-semibold text-secondary-900 dark:text-white">
                            {status.name}
                          </div>
                          <div className="text-sm text-secondary-500 dark:text-secondary-400">
                            {status.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-secondary-900 dark:text-white">
                          {status.count.toLocaleString()}
                        </div>
                        <div className="text-sm text-secondary-500 dark:text-secondary-400">
                          {(status.count / sampleMonitoringData.totalAnimals * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monitoring Coverage */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Monitoring Coverage
                </h3>
                <div className="h-64">
                  {isClient && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monitoringChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {monitoringChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="mt-6 text-center">
                  <div className="text-4xl font-bold text-primary-600">
                    {(sampleMonitoringData.monitoredAnimals / sampleMonitoringData.totalAnimals * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-secondary-500 dark:text-secondary-400">
                    of all species are being monitored
                  </div>
                </div>
              </motion.div>

              {/* Monitoring by Category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Monitoring by Category
                </h3>
                <div className="space-y-3">
                  {Object.entries(sampleMonitoringData.monitoringCoverage).map(([category, percentage], index) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                      whileHover={{ x: 5, scale: 1.01 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/50"
                    >
                      <div className="flex items-center space-x-3">
                        <DataCategoryIcon category={category as DataCategory} className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <span className="font-medium text-secondary-900 dark:text-white">
                          {category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 h-2 bg-secondary-200 dark:bg-secondary-600 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                        <span className="text-sm font-medium text-secondary-600 dark:text-secondary-300">
                          {(percentage * 100).toFixed(0)}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
