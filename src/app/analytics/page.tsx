'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { sampleAnimals, conservationStatusData } from '@/data/sample/animals';
import { threatFactors, ThreatDimension, ThreatFactor } from '@/data/sample/threat-factors';
import type { Animal } from '@/types/animal/types';
import { sampleAlerts } from '@/data/sample/alerts';
import { ChartIcon, UsersIcon, ShieldIcon, GlobeIcon, TrendIcon, DownloadIcon, FilterIcon } from '@/components/icons';

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
    const rows = months.map((m, i) => ({
      month: m,
      critical: 0,
      warning: 0,
      info: 0,
    }));
    sampleAlerts.forEach((a) => {
      const mi = a.timestamp?.getMonth() ?? -1;
      if (mi < 0 || mi > 11) return;
      if (a.type === 'critical') rows[mi].critical += 1;
      else if (a.type === 'warning') rows[mi].warning += 1;
      else rows[mi].info += 1;
    });
    return rows;
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

  const DIMENSIONS: ThreatDimension[] = ['poaching', 'climate', 'habitatLoss', 'invasiveSpecies'];
  const DIM_LABELS: Record<ThreatDimension, string> = {
    poaching: 'Poaching',
    climate: 'Climate',
    habitatLoss: 'Habitat Loss',
    invasiveSpecies: 'Invasive Species',
  };
  const DIM_COLORS: Record<ThreatDimension, string> = {
    poaching: '#dc2626',
    climate: '#f59e0b',
    habitatLoss: '#0ea5e9',
    invasiveSpecies: '#7c3aed',
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [enabledDims, setEnabledDims] = useState<ThreatDimension[]>(DIMENSIONS);
  const [radarSpecies, setRadarSpecies] = useState<string | null>(null);

  const threatMatrix = useMemo(() => {
    let rows = threatFactors.map(f => {
      const animal = sampleAnimals.find(a => a.id === f.animalId);
      if (!animal) return null;
      const overall = Math.round((f.poaching + f.climate + f.habitatLoss + f.invasiveSpecies) / 4);
      return {
        ...f,
        animal,
        overall,
      };
    }).filter(Boolean) as Array<ThreatFactor & { animal: Animal; overall: number }>;

    if (selectedCategory !== 'all') {
      rows = rows.filter(r => r.animal.category === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      rows = rows.filter(r => r.animal.conservationStatus === selectedStatus);
    }
    rows.sort((a, b) => b.overall - a.overall);
    return rows;
  }, [selectedCategory, selectedStatus]);

  const categories = useMemo(() => ['all', ...new Set(sampleAnimals.map(a => a.category))].sort(), []);
  const statuses = useMemo(() => ['all', ...new Set(sampleAnimals.map(a => a.conservationStatus))].sort(), []);

  const exportThreatMatrixCSV = () => {
    const headers = ['Species', 'Category', 'IUCN Status', 'Poaching', 'Climate', 'Habitat Loss', 'Invasive Species', 'Overall', 'Primary Threat', 'Rationale'];
    const rows = threatMatrix.map(r => [
      r.commonName,
      r.animal.category,
      r.animal.conservationStatus,
      r.poaching,
      r.climate,
      r.habitatLoss,
      r.invasiveSpecies,
      r.overall,
      DIM_LABELS[r.primaryThreat],
      r.rationale.replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openanimalnet-threat-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

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

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Alert Activity by Month</h2>
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

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-1">Threat Matrix</h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Cross-species vulnerability comparison across four threat dimensions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={exportThreatMatrixCSV}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <DownloadIcon className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
            <div className="flex items-center gap-2">
              <FilterIcon className="w-4 h-4 text-secondary-500" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary-500">Dimensions:</span>
              {DIMENSIONS.map(d => (
                <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabledDims.includes(d)}
                    onChange={e => setEnabledDims(prev => e.target.checked ? [...prev, d] : prev.filter(x => x !== d))}
                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700 dark:text-secondary-300">{DIM_LABELS[d]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-200 dark:border-secondary-700">
                  <th className="text-left p-2 font-semibold text-secondary-600 dark:text-secondary-400">Species</th>
                  <th className="text-left p-2 font-semibold text-secondary-600 dark:text-secondary-400">Category</th>
                  <th className="text-left p-2 font-semibold text-secondary-600 dark:text-secondary-400">IUCN</th>
                  {enabledDims.map(d => (
                    <th key={d} className="text-center p-2 font-semibold text-secondary-600 dark:text-secondary-400">
                      <span className="inline-flex items-center gap-1" style={{ color: DIM_COLORS[d] }}>
                        {DIM_LABELS[d]}
                      </span>
                    </th>
                  ))}
                  <th className="text-center p-2 font-semibold text-secondary-600 dark:text-secondary-400">Overall</th>
                  <th className="text-center p-2 font-semibold text-secondary-600 dark:text-secondary-400">Primary</th>
                </tr>
              </thead>
              <tbody>
                {threatMatrix.map((r, i) => (
                  <tr
                    key={r.animalId}
                    className={`border-b border-secondary-100 dark:border-secondary-800 transition-colors ${radarSpecies === r.animalId ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}
                    onClick={() => setRadarSpecies(prev => prev === r.animalId ? null : r.animalId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="p-2 font-medium text-secondary-900 dark:text-white">{r.commonName}</td>
                    <td className="p-2 text-secondary-500 dark:text-secondary-400 capitalize">{r.animal.category}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: STATUS_COLORS[r.animal.conservationStatus] + '20', color: STATUS_COLORS[r.animal.conservationStatus] }}>
                        {r.animal.conservationStatus}
                      </span>
                    </td>
                    {enabledDims.map(d => (
                      <td key={d} className="text-center p-2 font-mono font-medium"
                        style={{ backgroundColor: DIM_COLORS[d] + Math.round((r[d] / 100) * 40).toString(16).padStart(2, '0') }}>
                        {r[d]}
                      </td>
                    ))}
                    <td className="text-center p-2 font-bold font-data text-secondary-900 dark:text-white">{r.overall}</td>
                    <td className="text-center p-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: DIM_COLORS[r.primaryThreat] + '20', color: DIM_COLORS[r.primaryThreat] }}>
                        {DIM_LABELS[r.primaryThreat]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Overall Vulnerability Ranking</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={threatMatrix.slice(0, 20)} layout="vertical" margin={{ left: 140 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="commonName" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v, 'Overall Threat Score']} />
                  <Bar dataKey="overall" fill="#64748b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Threat Profile</h3>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <select
                value={radarSpecies || ''}
                onChange={e => setRadarSpecies(e.target.value || null)}
                className="flex-1 px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a species to view threat radar</option>
                {threatMatrix.map(r => (
                  <option key={r.animalId} value={r.animalId}>{r.commonName} ({r.animal.conservationStatus})</option>
                ))}
              </select>
            </div>
            {radarSpecies && (() => {
              const r = threatMatrix.find(x => x.animalId === radarSpecies)!;
              const radarData = enabledDims.map(d => ({
                dimension: DIM_LABELS[d],
                score: r[d],
                fullScore: 100,
              }));
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                        <Radar
                          name={r.commonName}
                          dataKey="score"
                          stroke={DIM_COLORS[enabledDims[0]]}
                          fill={DIM_COLORS[enabledDims[0]]}
                          fillOpacity={0.15}
                        />
                        {enabledDims.slice(1).map((d, i) => (
                          <Radar
                            key={d}
                            name={DIM_LABELS[d]}
                            dataKey="score"
                            stroke={DIM_COLORS[d]}
                            fill={DIM_COLORS[d]}
                            fillOpacity={0.15}
                          />
                        ))}
                        <Tooltip
                          content={({ active, payload }: any) => active && payload && payload.length ? (
                            <div className="bg-white dark:bg-secondary-800 p-2 rounded border">
                              <p className="font-bold">{payload[0].payload.dimension}</p>
                              <p>Score: {payload[0].payload.value}/100</p>
                            </div>
                          ) : null}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
                    <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">{r.commonName} <span className="text-sm font-normal text-secondary-500">({r.animal.scientificName})</span></h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">{r.rationale}</p>
                    <div className="space-y-2">
                      {enabledDims.map(d => (
                        <div key={d} className="flex items-center gap-2">
                          <span className="w-8 h-2 rounded" style={{ backgroundColor: DIM_COLORS[d] }} />
                          <span className="text-sm text-secondary-700 dark:text-secondary-300">{DIM_LABELS[d]}</span>
                          <span className="text-sm font-mono font-bold" style={{ color: DIM_COLORS[d] }}>{r[d]}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}