'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { sampleAnimals } from '@/data/sample/animals';
import { runPVA, getDefaultPVAParams, PVAParameters, PVAResult } from '@/lib/analyticsWidgets';
import { ChartIcon, AlertTriangleIcon, ShieldIcon, TrendIcon, SendIcon, ChevronDownIcon } from '@/components/icons';

export default function PVAWidget({ speciesId }: { speciesId?: string }) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(speciesId ?? sampleAnimals[0].id);
  const [params, setParams] = useState<PVAParameters>(() => {
    const animal = sampleAnimals.find(a => a.id === selectedSpeciesId) ?? sampleAnimals[0];
    return getDefaultPVAParams(animal);
  });
  const [result, setResult] = useState<PVAResult | null>(null);
  const [running, setRunning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedAnimal = useMemo(() => 
    sampleAnimals.find(a => a.id === selectedSpeciesId) ?? sampleAnimals[0], 
    [selectedSpeciesId]
  );

  // Update params when species changes
  useMemo(() => {
    if (!speciesId) {
      setParams(getDefaultPVAParams(selectedAnimal));
    }
  }, [speciesId, selectedAnimal]);

  const runAnalysis = () => {
    setRunning(true);
    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const res = runPVA(params);
      setResult(res);
      setRunning(false);
    }, 50);
  };

  // Auto-run on first load
  useMemo(() => {
    if (!result) runAnalysis();
  }, []);

  const formatNumber = (n: number) => n.toLocaleString();

  const formatPercent = (p: number) => (p * 100).toFixed(1) + '%';

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
            <ChartIcon className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Population Viability Analysis</h3>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              Stochastic projection for {selectedAnimal.commonName}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
        >
          <ChevronDownIcon className="w-4 h-4" />
          {showAdvanced ? 'Hide Parameters' : 'Show Parameters'}
        </button>
      </div>

      {/* Species Selector */}
      <div className="mb-6">
        <label className="block text-xs text-secondary-500 dark:text-secondary-400 mb-1">Species</label>
        <select
          value={selectedSpeciesId}
          onChange={e => { setSelectedSpeciesId(e.target.value); setResult(null); }}
          className="w-full px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {sampleAnimals
            .filter(a => a.populationEstimate && a.populationEstimate > 0)
            .map(a => (
              <option key={a.id} value={a.id}>
                {a.commonName} ({a.scientificName}) - ~{a.populationEstimate!.toLocaleString()}
              </option>
            ))}
        </select>
      </div>

      {/* Parameters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl space-y-4"
        >
          <h4 className="font-semibold text-secondary-900 dark:text-white mb-3">Model Parameters</h4>
          <div className="grid grid-cols-2 gap-4">
            <ParameterInput
              label="Initial Population (N₀)"
              value={params.initialPopulation}
              onChange={v => setParams({ ...params, initialPopulation: Math.max(1, v) })}
              min={1}
              step={1}
              help="Current population size"
            />
            <ParameterInput
              label="Carrying Capacity (K)"
              value={params.carryingCapacity}
              onChange={v => setParams({ ...params, carryingCapacity: Math.max(10, v) })}
              min={10}
              step={100}
              help="Maximum sustainable population"
            />
            <ParameterInput
              label="Growth Rate (r)"
              value={params.growthRate}
              onChange={v => setParams({ ...params, growthRate: Math.max(0, v) })}
              min={0}
              max={2}
              step={0.01}
              help="Intrinsic rate of increase"
            />
            <ParameterInput
              label="Environmental SD"
              value={params.growthRateSD}
              onChange={v => setParams({ ...params, growthRateSD: Math.max(0, v) })}
              min={0}
              max={1}
              step={0.01}
              help="Year-to-year variation in growth"
            />
            <ParameterInput
              label="Catastrophe Probability"
              value={params.catastropheProbability}
              onChange={v => setParams({ ...params, catastropheProbability: Math.max(0, Math.min(1, v)) })}
              min={0}
              max={1}
              step={0.01}
              help="Annual chance of catastrophic event"
            />
            <ParameterInput
              label="Catastrophe Severity"
              value={params.catastropheSeverity}
              onChange={v => setParams({ ...params, catastropheSeverity: Math.max(0, Math.min(1, v)) })}
              min={0}
              max={1}
              step={0.05}
              help="Proportion of population lost"
            />
            <ParameterInput
              label="Harvest Rate"
              value={params.harvestRate}
              onChange={v => setParams({ ...params, harvestRate: Math.max(0, Math.min(1, v)) })}
              min={0}
              max={1}
              step={0.01}
              help="Annual harvest proportion"
            />
            <ParameterInput
              label="Inbreeding Depression"
              value={params.inbreedingDepression}
              onChange={v => setParams({ ...params, inbreedingDepression: Math.max(0, v) })}
              min={0}
              max={10}
              step={0.5}
              help="Lethal equivalents (0 = none)"
            />
            <ParameterInput
              label="Projection Years"
              value={params.years}
              onChange={v => setParams({ ...params, years: Math.max(10, Math.min(500, v)) })}
              min={10}
              max={500}
              step={10}
              help="Time horizon"
            />
            <ParameterInput
              label="Iterations"
              value={params.iterations}
              onChange={v => setParams({ ...params, iterations: Math.max(100, Math.min(5000, v)) })}
              min={100}
              max={5000}
              step={100}
              help="Monte Carlo simulations"
            />
          </div>
        </motion.div>
      )}

      {/* Run Button */}
      <button
        onClick={runAnalysis}
        disabled={running}
        className="w-full mb-6 px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium transition-colors flex items-center justify-center gap-2"
      >
        {running ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Running {params.iterations} simulations...
          </>
        ) : (
          <>
            <SendIcon className="w-5 h-5" />
            Run Analysis
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={<AlertTriangleIcon className="w-5 h-5" />}
              label="Extinction Risk"
              value={formatPercent(result.extinctionProbability)}
              color={result.extinctionProbability > 0.5 ? 'danger' : result.extinctionProbability > 0.1 ? 'warning' : 'success'}
              trend={result.extinctionProbability > 0.5 ? 'High risk \u2014 urgent action needed' : 'Monitor'}
            />
            <MetricCard
              icon={<TrendIcon className="w-5 h-5" />}
              label="Median Population (Y{params.years})"
              value={formatNumber(result.medianPopulation[result.medianPopulation.length - 1])}
              color="primary"
              trend={result.medianPopulation[result.medianPopulation.length - 1] > params.initialPopulation ? 'Growing' : 'Declining'}
            />
            <MetricCard
              icon={<ShieldIcon className="w-5 h-5" />}
              label="Mean Time to Extinction"
              value={result.meanTimeToExtinction ? `${result.meanTimeToExtinction.toFixed(0)} years` : '\u221e (stable)'}
              color={result.meanTimeToExtinction && result.meanTimeToExtinction < 50 ? 'danger' : 'success'}
              trend={result.meanTimeToExtinction ? 'Years' : 'Population persists'}
            />
            <MetricCard
              icon={<ShieldIcon className="w-5 h-5" />}
              label="5th Percentile (Y{params.years})"
              value={formatNumber(result.percentile5[result.percentile5.length - 1])}
              color={result.percentile5[result.percentile5.length - 1] < 50 ? 'warning' : 'primary'}
              trend="Worst 5% scenario"
            />
          </div>

          {/* Quasi-Extinction Risk */}
          <div className="p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
            <h4 className="font-semibold text-secondary-900 dark:text-white mb-3">Quasi-Extinction Risk</h4>
            <div className="space-y-2">
              {result.quasiExtinctionRisk.map((q, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      Population &lt; {q.threshold}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${q.probability * 100}%` }}
                        className="h-full bg-primary-600 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-mono font-bold text-secondary-900 dark:text-white">
                      {formatPercent(q.probability)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trajectory Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.medianPopulation.map((v, i) => ({
                year: i,
                median: v,
                p5: result.percentile5[i],
                p95: result.percentile95[i],
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis 
                  tick={{ fontSize: 11 }} 
                  width={60}
                  tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                />
                <Tooltip 
                  formatter={(v: number) => [v.toLocaleString(), 'Population']}
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line 
                  type="monotone" 
                  dataKey="p95" 
                  stroke="#64748b" 
                  strokeWidth={1} 
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="p5" 
                  stroke="#64748b" 
                  strokeWidth={1} 
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="median" 
                  stroke="#0ea5e9" 
                  strokeWidth={2.5} 
                  dot={false}
                  name="Median"
                />
                {/* Confidence interval area */}
                <Line 
                  type="monotone" 
                  dataKey="p95" 
                  stroke="transparent"
                  fill="#0ea5e9" 
                  fillOpacity={0.1}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Model Assumptions */}
          <div className="p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl border border-secondary-200 dark:border-secondary-700">
            <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">Model Assumptions & Limitations</h4>
            <ul className="text-sm text-secondary-600 dark:text-secondary-400 space-y-1">
              <li>\u2022 Stochastic Ricker model with environmental & demographic stochasticity</li>
              <li>\u2022 Density-dependent growth (carrying capacity K)</li>
              <li>\u2022 Catastrophes modeled as random proportional mortality events</li>
              <li>\u2022 Inbreeding depression reduces survival at small population sizes</li>
              <li>\u2022 No Allee effects, no explicit age structure, no spatial structure</li>
              <li>\u2022 Parameters are heuristics \u2014 calibrate with species-specific data for real PVA</li>
              <li>\u2022 Educational tool \u2014 not a substitute for formal PVA (e.g., Vortex, RAMAS)</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ParameterInput({ label, value, onChange, min, max, step, help }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; help?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-secondary-500 dark:text-secondary-400 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {help && <p className="text-[10px] text-secondary-400 dark:text-secondary-500 mt-1">{help}</p>}
    </div>
  );
}

function MetricCard({ icon, label, value, color, trend }: {
  icon: React.ReactNode; label: string; value: string; color: 'primary' | 'success' | 'warning' | 'danger'; trend: string;
}) {
  const colors = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
    danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]} dark:border-secondary-700`}>
      <div className="flex items-center justify-between mb-2">
        <span>{icon}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium">
          PVA
        </span>
      </div>
      <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">{label}</p>
      <p className="text-2xl font-bold font-data text-secondary-900 dark:text-white">{value}</p>
      <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">{trend}</p>
    </div>
  );
}