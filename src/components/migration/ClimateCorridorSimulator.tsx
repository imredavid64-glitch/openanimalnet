'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { sampleAnimals } from '@/data/sample/animals';
import { GlobeIcon, ChartIcon, ShieldIcon } from '@/components/icons';

interface ClimateScenario {
  name: string;
  label: string;
  tempIncrease: number; // °C above pre-industrial
  description: string;
  color: string;
}

const SCENARIOS: ClimateScenario[] = [
  { name: 'ssp1-1.9', label: 'Paris 1.5°C', tempIncrease: 1.5, description: 'Very low emissions. Strong mitigation. Paris Agreement goal.', color: '#22c55e' },
  { name: 'ssp1-2.6', label: 'Paris 2°C', tempIncrease: 2.0, description: 'Low emissions. Net-zero by 2070. Paris Agreement upper bound.', color: '#38bdf8' },
  { name: 'ssp2-4.5', label: 'Middle Road', tempIncrease: 2.7, description: 'Moderate emissions. Current policies extended. 2.7°C by 2100.', color: '#f59e0b' },
  { name: 'ssp3-7.0', label: 'Regional Rivalry', tempIncrease: 3.6, description: 'High emissions. Fragmented policies. 3.6°C by 2100.', color: '#ef4444' },
  { name: 'ssp5-8.5', label: 'Fossil Fuel', tempIncrease: 4.4, description: 'Very high emissions. No mitigation. 4.4°C by 2100.', color: '#dc2626' },
];

// Corridor shift model: how migration routes shift under warming
// Based on published research on range shifts (~17km/decade poleward, ~11m/decade upslope)
const CORRIDOR_SHIFTS: Record<string, {
  name: string;
  latShiftPerC: number; // km poleward per °C warming
  lngShiftPerC: number; // km eastward per °C
  altShiftPerC: number; // meters upslope per °C
  riskLevel: (temp: number) => 'low' | 'moderate' | 'high' | 'critical';
  notes: (temp: number) => string[];
}> = {
  'monarch-001': {
    name: 'Monarch Butterfly',
    latShiftPerC: 85, // ~85 km poleward per °C (well-documented)
    lngShiftPerC: 0,
    altShiftPerC: 0,
    riskLevel: (t) => t >= 3 ? 'critical' : t >= 2 ? 'high' : t >= 1.5 ? 'moderate' : 'low',
    notes: (t) => [
      'Milkweed habitat shifts north',
      t >= 2 ? 'Oyamel fir forests retreat upslope — critical overwintering habitat shrinking' : 'Overwintering habitat stable',
      t >= 3 ? 'Migration route may become non-viable' : 'Migration continues but extends',
      `${Math.round(t * 85)} km poleward shift in breeding range`,
    ],
  },
  'tern-001': {
    name: 'Arctic Tern',
    latShiftPerC: 120, // Arctic species — large poleward shifts
    lngShiftPerC: 10,
    altShiftPerC: 0,
    riskLevel: (t) => t >= 3 ? 'critical' : t >= 2 ? 'high' : 'low',
    notes: (t) => [
      `${Math.round(t * 120)} km poleward shift in Arctic breeding grounds`,
      t >= 2 ? 'Sea ice loss reduces stopover habitat' : 'Stopover habitat adequate',
      t >= 3 ? 'Antarctic feeding grounds warming — krill decline' : 'Antarctic food web stable',
      'Longest migration in animal kingdom at risk',
    ],
  },
  'lion-001': {
    name: 'African Lion',
    latShiftPerC: 35,
    lngShiftPerC: 0,
    altShiftPerC: 50,
    riskLevel: (t) => t >= 2.5 ? 'high' : t >= 1.5 ? 'moderate' : 'low',
    notes: (t) => [
      `${Math.round(t * 35)} km poleward shift in range`,
      t >= 2 ? 'Prey species declining in equatorial regions' : 'Prey populations stable',
      'Human-wildlife conflict intensifies as range overlaps with farmland',
      `${Math.round(t * 50)}m upslope movement possible in highlands`,
    ],
  },
  'elephant-001': {
    name: 'African Bush Elephant',
    latShiftPerC: 30,
    lngShiftPerC: 0,
    altShiftPerC: 100,
    riskLevel: (t) => t >= 2.5 ? 'high' : t >= 1.5 ? 'moderate' : 'low',
    notes: (t) => [
      `${Math.round(t * 30)} km poleward shift in savanna range`,
      'Water source availability decreases in core range',
      t >= 2 ? 'Amboseli-Tsavo corridor increasingly fragmented' : 'Corridor intact',
      'Increased competition with pastoralists',
    ],
  },
  'polar-bear-001': {
    name: 'Polar Bear',
    latShiftPerC: -50, // Moves FARTHER north (negative = toward pole)
    lngShiftPerC: 0,
    altShiftPerC: 0,
    riskLevel: (t) => t >= 2 ? 'critical' : t >= 1.5 ? 'high' : 'moderate',
    notes: (t) => [
      `Sea ice platform retreats ~${Math.round(t * 150)} km north`,
      t >= 2 ? 'Summer ice-free periods exceed 4 months — starvation risk' : 'Adequate ice platform',
      'Denning habitat shifts further north onto land',
      'Prey (seal) access becomes increasingly difficult',
    ],
  },
  'tiger-001': {
    name: 'Bengal Tiger',
    latShiftPerC: 25,
    lngShiftPerC: 0,
    altShiftPerC: 150,
    riskLevel: (t) => t >= 3 ? 'high' : t >= 2 ? 'moderate' : 'low',
    notes: (t) => [
      `${Math.round(t * 150)}m upslope shift in Himalayan range`,
      t >= 2 ? 'Corbett-Rajaji corridor faces increased flooding risk' : 'Corridor stable',
      'Prey base (deer, boar) shifts to higher elevations',
      `${Math.round(t * 25)} km poleward shift in lowland breeding grounds`,
    ],
  },
};

const RISK_COLORS = {
  low: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-700 dark:text-success-400', dot: 'bg-success-500' },
  moderate: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-700 dark:text-warning-400', dot: 'bg-warning-500' },
  high: { bg: 'bg-danger-50 dark:bg-danger-900/20', text: 'text-danger-700 dark:text-danger-400', dot: 'bg-danger-500' },
  critical: { bg: 'bg-danger-100 dark:bg-danger-900/30', text: 'text-danger-600 dark:text-danger-400', dot: 'bg-danger-600 animate-pulse' },
};

export default function ClimateCorridorSimulator() {
  const [year, setYear] = useState(2050);
  const [scenario, setScenario] = useState(SCENARIOS[2]); // Default: SSP2-4.5
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);

  // Calculate warming at the selected year (approximate from SSP scenarios)
  const warming = useMemo(() => {
    const baseYear = 2020;
    const targetYear = year;
    const yearsFromBase = targetYear - baseYear;
    const fraction = Math.min(yearsFromBase / 80, 1); // by 2100
    return scenario.tempIncrease * fraction;
  }, [year, scenario]);

  const corridorData = useMemo(() => {
    return Object.entries(CORRIDOR_SHIFTS).map(([id, corridor]) => {
      const animal = sampleAnimals.find(a => a.id === id);
      if (!animal) return null;

      const latShift = corridor.latShiftPerC * warming;
      const altShift = corridor.altShiftPerC * warming;
      const risk = corridor.riskLevel(warming);
      const notes = corridor.notes(warming);

      // Original location
      const origLat = animal.location.latitude;
      const origLng = animal.location.longitude;

      // Shifted location
      const newLat = origLat + (latShift / 111); // degrees (111 km per degree)
      const newLng = origLng + (corridor.lngShiftPerC * warming / 111);

      return {
        id,
        name: corridor.name,
        scientificName: animal.scientificName,
        risk,
        latShift: Math.round(latShift),
        altShift: Math.round(altShift),
        origLat: origLat.toFixed(2),
        origLng: origLng.toFixed(2),
        newLat: newLat.toFixed(2),
        newLng: newLng.toFixed(2),
        notes,
      };
    }).filter(Boolean);
  }, [warming]);

  const selected = corridorData.find(c => c?.id === selectedSpecies);

  return (
    <div className="space-y-6">
      {/* Scenario selector */}
      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
          <GlobeIcon className="w-5 h-5 text-primary-600" />
          Climate Scenario
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {SCENARIOS.map(s => (
            <button
              key={s.name}
              onClick={() => setScenario(s)}
              className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                scenario.name === s.name
                  ? 'border-primary-300 dark:border-primary-700 shadow-md'
                  : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-200'
              }`}
              style={scenario.name === s.name ? { borderColor: s.color, backgroundColor: `${s.color}10` } : {}}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-medium text-secondary-900 dark:text-white">{s.label}</span>
              </div>
              <div className="text-xs text-secondary-400 mt-1">{s.tempIncrease}°C by 2100</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time scrubber */}
      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-primary-600" />
            Timeline
          </h3>
          <div className="text-right">
            <span className="text-3xl font-bold text-primary-600">{year}</span>
            <div className="text-sm text-secondary-400">
              +{warming.toFixed(1)}°C warming
            </div>
          </div>
        </div>

        <input
          type="range"
          min={2025}
          max={2100}
          step={5}
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-full h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-secondary-400 mt-1">
          <span>2025</span>
          <span>2050</span>
          <span>2075</span>
          <span>2100</span>
        </div>

        {/* Year markers */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[2030, 2050, 2070, 2100].map(y => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                year === y
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-primary-50'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Corridor shift cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {corridorData.map((corridor, i) => {
          if (!corridor) return null;
          const risk = RISK_COLORS[corridor.risk];
          const isSelected = selectedSpecies === corridor.id;

          return (
            <motion.button
              key={corridor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedSpecies(isSelected ? null : corridor.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-primary-500 shadow-lg'
                  : 'hover:shadow-md'
              } ${risk.bg} ${risk.text}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{corridor.name}</h4>
                  <p className="text-xs italic opacity-75">{corridor.scientificName}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk.bg} ${risk.text} border border-current/20`}>
                  {corridor.risk}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="opacity-60">Poleward:</span>{' '}
                  <strong>{corridor.latShift > 0 ? '+' : ''}{corridor.latShift} km</strong>
                </div>
                <div>
                  <span className="opacity-60">Altitude:</span>{' '}
                  <strong>{corridor.altShift > 0 ? '+' : ''}{corridor.altShift} m</strong>
                </div>
              </div>

              {isSelected && corridor.notes.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 space-y-1 border-t border-current/10 pt-3"
                >
                  {corridor.notes.map((note, j) => (
                    <p key={j} className="text-xs opacity-80 flex items-start gap-1.5">
                      <span className="mt-0.5">→</span>
                      {note}
                    </p>
                  ))}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
          <ShieldIcon className="w-5 h-5 text-primary-600" />
          Impact Summary: {year}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-success-50 dark:bg-success-900/20 text-center">
            <div className="text-xl font-bold text-success-700 dark:text-success-400">
              {corridorData.filter(c => c?.risk === 'low').length}
            </div>
            <div className="text-xs text-success-600 dark:text-success-400">Low Risk</div>
          </div>
          <div className="p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 text-center">
            <div className="text-xl font-bold text-warning-700 dark:text-warning-400">
              {corridorData.filter(c => c?.risk === 'moderate').length}
            </div>
            <div className="text-xs text-warning-600 dark:text-warning-400">Moderate</div>
          </div>
          <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20 text-center">
            <div className="text-xl font-bold text-danger-700 dark:text-danger-400">
              {corridorData.filter(c => c?.risk === 'high').length}
            </div>
            <div className="text-xs text-danger-600 dark:text-danger-400">High Risk</div>
          </div>
          <div className="p-3 rounded-xl bg-danger-100 dark:bg-danger-900/30 text-center">
            <div className="text-xl font-bold text-danger-600">
              {corridorData.filter(c => c?.risk === 'critical').length}
            </div>
            <div className="text-xs text-danger-500">Critical</div>
          </div>
        </div>
      </div>

      {/* Methodology note */}
      <div className="text-xs text-secondary-400 p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/50">
        <strong>Methodology:</strong> Corridor shifts are estimated from published IPCC AR6 and
        peer-reviewed research on range shifts (~17 km poleward per decade, ~11 m upslope per
        decade). Actual shifts depend on local topography, habitat connectivity, and species
        adaptability. This is an educational model, not a predictive tool.
      </div>
    </div>
  );
}
