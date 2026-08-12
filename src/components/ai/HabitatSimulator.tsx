'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { sampleAnimals } from '@/data/sample/animals';
import { ChartIcon } from '@/components/icons';

// Documented sensitivity assumptions: forest/woodland specialists are hit by
// deforestation; arid/coastal species by warming. Transparent and adjustable —
// the model is a teaching tool, not a population viability analysis.
const TEMP_SENSITIVE = new Set(['mammals', 'reptiles', 'amphibia']);
const DEFOREST_SENSITIVE = new Set(['forest', 'mangrove', 'woodland', 'tropical forest', 'rainforest']);

const YEARS = [0, 5, 10, 15, 20, 25, 30];

export default function HabitatSimulator() {
  const [animalId, setAnimalId] = useState(sampleAnimals[0].id);
  const [tempDelta, setTempDelta] = useState(1.5); // °C
  const [deforestation, setDeforestation] = useState(20); // % of range lost

  const animal = useMemo(() => sampleAnimals.find((a) => a.id === animalId) ?? sampleAnimals[0], [animalId]);

  const model = useMemo(() => {
    const habitats = animal.habitat ?? [];
    const isForest = habitats.some((h) => DEFOREST_SENSITIVE.has(h));
    const isTempSensitive = TEMP_SENSITIVE.has(animal.category) || habitats.some((h) => ['desert', 'savanna', 'coastal'].includes(h));

    // Per-decade decline factors (documented assumptions).
    const deforestationFactor = isForest ? Math.min(0.9, 0.18 * (deforestation / 20)) : Math.min(0.35, 0.06 * (deforestation / 20));
    const tempFactor = isTempSensitive ? Math.min(0.8, 0.22 * (tempDelta / 1.5)) : Math.min(0.45, 0.1 * (tempDelta / 1.5));
    const combined = Math.min(0.95, deforestationFactor + tempFactor);

    const base = animal.populationEstimate ?? 1000;
    const series = YEARS.map((year) => {
      const factor = 1 - (combined * year) / 30;
      return {
        year: `+${year}y`,
        projected: Math.max(0, Math.round(base * factor)),
        baseline: base,
      };
    });
    const final = series[series.length - 1].projected;
    const declinePct = Math.round(((base - final) / base) * 100);
    return { base, final, declinePct, isForest, isTempSensitive, series };
  }, [animal, tempDelta, deforestation]);

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-1">
        <ChartIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Habitat Degradation Simulator</h3>
      </div>
      <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-5">
        Adjust regional warming and habitat loss and watch the projected population response for a species —
        computed live from documented sensitivity assumptions.
      </p>

      {/* Species select */}
      <label className="block text-xs text-secondary-500 dark:text-secondary-400 mb-1">Species</label>
      <select
        value={animalId}
        onChange={(e) => setAnimalId(e.target.value)}
        className="w-full mb-5 px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {sampleAnimals.map((a) => (
          <option key={a.id} value={a.id}>{a.commonName} ({a.scientificName})</option>
        ))}
      </select>

      {/* Sliders */}
      <div className="space-y-5 mb-6">
        <div>
          <div className="flex justify-between text-xs text-secondary-500 dark:text-secondary-400 mb-1">
            <span>Temperature increase</span>
            <span className="font-semibold font-data text-secondary-900 dark:text-white">{tempDelta.toFixed(1)}°C</span>
          </div>
          <input
            type="range" min="0" max="4" step="0.1" value={tempDelta}
            onChange={(e) => setTempDelta(parseFloat(e.target.value))}
            className="w-full accent-primary-600"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs text-secondary-500 dark:text-secondary-400 mb-1">
            <span>Deforestation / range loss</span>
            <span className="font-semibold font-data text-secondary-900 dark:text-white">{deforestation}%</span>
          </div>
          <input
            type="range" min="0" max="80" step="5" value={deforestation}
            onChange={(e) => setDeforestation(parseInt(e.target.value, 10))}
            className="w-full accent-primary-600"
          />
        </div>
      </div>

      {/* Live projection */}
      <motion.div
        key={`${animalId}-${tempDelta}-${deforestation}`}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
          <div>
            <div className="text-xs text-secondary-400">Current population</div>
            <div className="text-lg font-bold font-data text-secondary-900 dark:text-white">{model.base.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-secondary-400">Projected in 30 years</div>
            <div className="text-lg font-bold font-data text-danger-600 dark:text-danger-400">{model.final.toLocaleString()}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-300 text-sm font-semibold">
            −{model.declinePct}% decline
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={model.series} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-secondary-200 dark:stroke-secondary-700" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} className="text-secondary-500" />
              <YAxis tick={{ fontSize: 11 }} className="text-secondary-500" width={55} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="projected" name="Projected" stroke="#e11d48" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="baseline" name="Baseline (no change)" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-4 border-t border-secondary-100 dark:border-secondary-700 pt-3">
        {animal.commonName}: {model.isForest ? 'forest habitat → strongly deforestation-sensitive' : 'non-forest habitat → mildly deforestation-sensitive'};
        {model.isTempSensitive ? ' warming-sensitive' : ' moderately warming-tolerant'}. Assumptions are stated, not hidden —
        educational projection, not a population viability assessment.
      </p>
    </div>
  );
}
