'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sampleAnimals, conservationStatusData } from '@/data/sample/animals';
import { sampleAlerts } from '@/data/sample/alerts';
import { ChartIcon, UsersIcon, ShieldIcon, GlobeIcon, TrendIcon } from '@/components/icons';

const STATUS_COLORS: Record<string, string> = {
  CR: '#dc2626', EN: '#ef4444', VU: '#f59e0b', NT: '#fbbf24',
  LC: '#22c55e', DD: '#64748b', NE: '#94a3b8',
};

export default function AnalyticsPage() {
  const stats = useMemo(() => {
    const total = sampleAnimals.length;
    const totalPop = sampleAnimals.reduce((s, a) => s + (a.populationEstimate ?? 0), 0);
    const monitored = sampleAnimals.filter(a => a.isMonitored).length;
    const critical = sampleAlerts.filter(a => a.type === 'critical').length;
    const withHistory = sampleAnimals.filter(a => a.populationHistory?.length);
    const declining = withHistory.filter(a => {
      const h = a.populationHistory!;
      return h.length >= 2 && h[h.length - 1].estimate < h[0].estimate;
    }).length;
    const increasing = withHistory.filter(a => {
      const h = a.populationHistory!;
      return h.length >= 2 && h[h.length - 1].estimate > h[0].estimate;
    }).length;

    return { total, totalPop, monitored, critical, declining, increasing, withHistoryCount: withHistory.length };
  }, []);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    sampleAnimals.forEach(a => { cats[a.category] = (cats[a.category] ?? 0) + 1; });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, []);

  const populationTrend = useMemo(() => {
    return sampleAnimals
      .filter(a => a.populationHistory?.length)
      .slice(0, 8)
      .map(a => ({
        name: a.commonName,
        data: a.populationHistory!.map(p => ({ year: p.year, estimate: p.estimate })),
      }));
  }, []);

  const alertTimeline = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => ({
      month: m,
      critical: Math.floor(Math.random() * 3 + (i < 6 ? 1 : 0)),
      warning: Math.floor(Math.random() * 5 + 2),
      info: Math.floor(Math.random() * 4 + 1),
    }));
  }, []);

  const statusBreakdown = useMemo(() => {
    return conservationStatusData.map(s => ({
      name: s.status,
      fullName: s.name,
      count: s.count,
      color: STATUS_COLORS[s.status] ?? '#64748b',
    }));
  }, []);

  const habitatData = useMemo(() => {
    const habitats: Record<string, number> = {};
    sampleAnimals.forEach(a => {
      a.habitat?.forEach(h => { habitats[h] = (habitats[h] ?? 0) + 1; });
    });
    return Object.entries(habitats).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 10);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-secondary-900">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <ChartIcon className="w-14 h-14 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-secondary-900 dark:text-white mb-4">Analytics Dashboard</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
            Advanced analytics, trend detection, and population insights across all tracked species.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Species', value: stats.total, icon: <GlobeIcon className="w-6 h-6 text-primary-600" /> },
            { label: 'Total Population', value: `~${stats.totalPop.toLocaleString()}`, icon: <UsersIcon className="w-6 h-6 text-primary-600" /> },
            { label: 'Monitored', value: stats.monitored, icon: <ShieldIcon className="w-6 h-6 text-success-600" /> },
            { label: 'Critical Alerts', value: stats.critical, icon: <ShieldIcon className="w-6 h-6 text-danger-600" /> },
          ].map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg border border-secondary-100 dark:border-secondary-700">
              <div className="mb-2">{kpi.icon}</div>
              <div className="text-2xl font-bold text-secondary-900 dark:text-white font-data">{kpi.value}</div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400">{kpi.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Conservation Status Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Conservation Status Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="count" nameKey="fullName" cx="50%" cy="50%" outerRadius={90} label={({ fullName, count }) => `${fullName}: ${count}`}>
                    {statusBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Species by Category */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Species by Category</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Trend Indicators */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Population Trends</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3 p-3 bg-success-50 dark:bg-success-900/10 rounded-xl">
                <TrendIcon className="w-8 h-8 text-success-600" />
                <div>
                  <div className="text-2xl font-bold text-success-600">{stats.increasing}</div>
                  <div className="text-sm text-secondary-500">Increasing</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-danger-50 dark:bg-danger-900/10 rounded-xl">
                <TrendIcon className="w-8 h-8 text-danger-600" />
                <div>
                  <div className="text-2xl font-bold text-danger-600">{stats.declining}</div>
                  <div className="text-sm text-secondary-500">Declining</div>
                </div>
              </div>
            </div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
              Out of {stats.withHistoryCount} species with population history data, {stats.increasing} are trending upward and {stats.declining} are declining.
            </div>
          </motion.div>

          {/* Alert Distribution */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Alert Activity (Simulated Monthly)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={alertTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#dc2626" fill="#fecaca" />
                  <Area type="monotone" dataKey="warning" stackId="1" stroke="#f59e0b" fill="#fef3c7" />
                  <Area type="monotone" dataKey="info" stackId="1" stroke="#0ea5e9" fill="#e0f2fe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Habitat Distribution */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Top Habitats</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitatData} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} height={60} interval={0} angle={-30} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Population Trend Lines */}
        {populationTrend.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Species Population History</h2>
            <div className="space-y-6">
              {populationTrend.map((species, si) => (
                <div key={species.name}>
                  <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">{species.name}</h3>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={species.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} width={60} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                        <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Population']} />
                        <Line type="monotone" dataKey="estimate" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}