'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area,
} from 'recharts';
import { AntennaIcon, ShieldIcon, ChartIcon } from '@/components/icons';

interface TelemetryPoint {
  timestamp: Date;
  rumination: number;
  temperature: number;
  mobility: number;
}

interface DiseaseRisk {
  name: string;
  risk: 'low' | 'moderate' | 'high';
  indicator: string;
  probability: number;
}

interface LivestockTelemetry {
  herdSize: number;
  averageRuminationMinutes: number;
  averageBodyTemperature: number;
  averageMobilityScore: number;
  healthAlerts: number;
  recentMetrics: TelemetryPoint[];
  diseaseRisks: DiseaseRisk[];
}

const RISK_COLORS = {
  low: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-700 dark:text-success-400', border: 'border-success-200 dark:border-success-800' },
  moderate: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-700 dark:text-warning-400', border: 'border-warning-200 dark:border-warning-800' },
  high: { bg: 'bg-danger-50 dark:bg-danger-900/20', text: 'text-danger-700 dark:text-danger-400', border: 'border-danger-200 dark:border-danger-800' },
};

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function LivestockHealthDashboard({ telemetry }: { telemetry: LivestockTelemetry }) {
  const chartData = useMemo(() =>
    telemetry.recentMetrics.map(m => ({
      time: formatTime(new Date(m.timestamp)),
      rumination: m.rumination,
      temperature: m.temperature,
      mobility: m.mobility,
    })),
    [telemetry.recentMetrics]
  );

  const herdHealthScore = useMemo(() => {
    const rumScore = Math.min(100, (telemetry.averageRuminationMinutes / 500) * 100);
    const tempScore = telemetry.averageBodyTemperature <= 39.0 ? 100 : Math.max(0, 100 - (telemetry.averageBodyTemperature - 39.0) * 50);
    const mobScore = telemetry.averageMobilityScore;
    return Math.round((rumScore + tempScore + mobScore) / 3);
  }, [telemetry]);

  const healthColor = herdHealthScore >= 80 ? 'text-success-600' : herdHealthScore >= 60 ? 'text-warning-600' : 'text-danger-600';

  return (
    <div className="space-y-6">
      {/* Herd Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Herd Size', value: telemetry.herdSize.toString(), icon: <AntennaIcon className="w-5 h-5" />, color: 'text-primary-600' },
          { label: 'Avg Rumination', value: `${telemetry.averageRuminationMinutes} min`, icon: <ChartIcon className="w-5 h-5" />, color: 'text-accent-600' },
          { label: 'Avg Temperature', value: `${telemetry.averageBodyTemperature}C`, icon: <ShieldIcon className="w-5 h-5" />, color: telemetry.averageBodyTemperature > 39.0 ? 'text-danger-600' : 'text-success-600' },
          { label: 'Mobility Score', value: `${telemetry.averageMobilityScore}/100`, icon: <AntennaIcon className="w-5 h-5" />, color: telemetry.averageMobilityScore >= 80 ? 'text-success-600' : 'text-warning-600' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-lg"
          >
            <div className={`w-10 h-10 rounded-xl bg-secondary-50 dark:bg-secondary-700 flex items-center justify-center mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <div className="text-2xl font-bold text-secondary-900 dark:text-white">{card.value}</div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Herd Health Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Herd Health Score</h3>
          {telemetry.healthAlerts > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400">
              {telemetry.healthAlerts} active alert{telemetry.healthAlerts > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={herdHealthScore >= 80 ? '#22c55e' : herdHealthScore >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={`${herdHealthScore * 2.64} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${healthColor}`}>{herdHealthScore}</span>
            </div>
          </div>
          <div className="flex-1 text-sm text-secondary-600 dark:text-secondary-400">
            <p>Composite score from rumination ({Math.round((telemetry.averageRuminationMinutes / 500) * 100)}), body temperature ({telemetry.averageBodyTemperature <= 39.0 ? 100 : Math.round(Math.max(0, 100 - (telemetry.averageBodyTemperature - 39.0) * 50))}), and mobility ({telemetry.averageMobilityScore}).</p>
            <p className="mt-1">Normal range: 80-100. Below 60 triggers automatic vet alert.</p>
          </div>
        </div>
      </motion.div>

      {/* Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rumination Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Rumination Patterns</h3>
          <p className="text-xs text-secondary-400 mb-3">Normal: 400-500 min/day. Drop below 350 indicates stress or illness.</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" domain={[0, 60]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <ReferenceLine y={40} stroke="#22c55e" strokeDasharray="3 3" opacity={0.5} />
                <ReferenceLine y={35} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
                <Area type="monotone" dataKey="rumination" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Temperature Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Body Temperature</h3>
          <p className="text-xs text-secondary-400 mb-3">Normal: 38.0-39.0C. Above 39.3C may indicate fever or heat stress.</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" domain={[37.5, 40.5]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <ReferenceLine y={39.0} stroke="#22c55e" strokeDasharray="3 3" opacity={0.5} />
                <ReferenceLine y={39.3} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
                <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Mobility Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Mobility Score</h3>
        <p className="text-xs text-secondary-400 mb-3">Scale 0-100. Score below 70 may indicate lameness or injury.</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} />
              <Area type="monotone" dataKey="mobility" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Disease Risk Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldIcon className="w-5 h-5 text-primary-600" />
          Disease Risk Assessment
        </h3>
        <div className="space-y-3">
          {telemetry.diseaseRisks.map((risk, i) => {
            const colors = RISK_COLORS[risk.risk];
            return (
              <motion.div
                key={risk.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`flex items-center justify-between p-4 rounded-xl border ${colors.bg} ${colors.border}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${colors.text}`}>{risk.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {risk.risk}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{risk.indicator}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {Math.round(risk.probability * 100)}%
                  </div>
                  <div className="text-xs text-secondary-400">probability</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
