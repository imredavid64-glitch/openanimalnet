'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { sampleAnimals } from '@/data/sample/animals';
import { sampleAlerts } from '@/data/sample/alerts';
import { distanceToRouteKm, greatCircleKm } from '@/lib/geo';
import { PinIcon, ShieldIcon } from '@/components/icons';

interface RegionPreset {
  label: string;
  lat: number;
  lng: number;
  note: string;
}

// Documented conflict hotspots aligned with the migration corridors in the
// dataset (Amboseli–Tsavo elephants, Serengeti–Mara lions, Corbett–Rajaji tigers).
const PRESETS: RegionPreset[] = [
  { label: 'Amboseli, Kenya', lat: -2.65, lng: 37.25, note: 'Elephant corridor between Kilimanjaro and the Chyulu Hills' },
  { label: 'Masai Mara, Kenya', lat: -1.4, lng: 35.1, note: 'Serengeti–Mara lion corridor' },
  { label: 'Sundarbans, India', lat: 21.9, lng: 89.0, note: 'Tiger-occupied mangroves' },
  { label: 'Corbett, India', lat: 29.55, lng: 78.9, note: 'Corbett–Rajaji tiger dispersal route' },
  { label: 'Tsavo, Kenya', lat: -3.0, lng: 38.0, note: 'Ivory trafficking alert site' },
];

// Conflict-prone species scored by how dangerous encounters are near
// human settlements (documented weights; the risk model is transparent).
const CONFLICT_SPECIES = ['elephant-001', 'lion-001', 'tiger-001', 'leopard-001'];

interface SpeciesRisk {
  animalId: string;
  commonName: string;
  conservationStatus: string;
  weight: number;
  nearestKm: number | null;
  corridor: string | null;
  contribution: number; // 0-100
}

const WEIGHT: Record<string, number> = {
  'elephant-001': 1.0,
  'lion-001': 0.9,
  'tiger-001': 0.85,
  'leopard-001': 0.7,
};

const STATUS_BOOST: Record<string, number> = { CR: 1.15, EN: 1.1, VU: 1.0, NT: 0.95, LC: 0.9 };

function riskLevel(score: number): { label: string; color: string; stroke: string } {
  if (score >= 70) return { label: 'Extreme', color: 'bg-danger-500', stroke: 'stroke-danger-500' };
  if (score >= 45) return { label: 'High', color: 'bg-danger-400', stroke: 'stroke-danger-400' };
  if (score >= 20) return { label: 'Moderate', color: 'bg-warning-500', stroke: 'stroke-warning-500' };
  return { label: 'Low', color: 'bg-success-500', stroke: 'stroke-success-500' };
}

export default function ConflictPredictor() {
  const [lat, setLat] = useState('-2.65');
  const [lng, setLng] = useState('37.25');
  const [computed, setComputed] = useState(false);
  const [includeTrafficking, setIncludeTrafficking] = useState(true);

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  const valid = !Number.isNaN(latNum) && !Number.isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;

  const result = useMemo(() => {
    if (!valid) return null;
    const point = { latitude: latNum, longitude: lngNum };
    const risks: SpeciesRisk[] = CONFLICT_SPECIES
      .map((id) => sampleAnimals.find((a) => a.id === id))
      .filter((animal): animal is NonNullable<typeof animal> => Boolean(animal))
      .map((animal) => {
        const routes = animal.migrationRoutes ?? [];
        let nearestKm: number | null = null;
        let corridor: string | null = null;
        for (const route of routes) {
          const d = distanceToRouteKm(point, route.points);
          if (nearestKm === null || d < nearestKm) {
            nearestKm = d;
            corridor = route.name;
          }
        }
        const weight = WEIGHT[animal.id] ?? 0.5;
        const boost = STATUS_BOOST[animal.conservationStatus] ?? 1;
        // Exponential distance decay: full weight at 0 km, ~half at 35 km,
        // negligible past ~150 km.
        const proximity = nearestKm === null ? 0 : 100 * Math.exp(-nearestKm / 50);
        const contribution = Math.round(Math.min(100, proximity * weight * boost));
        return { animalId: animal.id, commonName: animal.commonName, conservationStatus: animal.conservationStatus, weight, nearestKm, corridor, contribution };
      });

    const encounterRaw = risks.reduce((t, r) => t + r.contribution * r.weight, 0) / risks.reduce((t, r) => t + r.weight, 0);
    const encounter = Math.round(Math.min(100, encounterRaw));

    // Wildlife-trafficking layer: proximity to crime-flagged alerts
    // (ivory trafficking, snares), scaled by each alert's severity. The
    // nearest or most severe alert drives the score.
    const crimeAlerts = sampleAlerts
      .filter((a) => a.crime)
      .map((a) => {
        const distKm = greatCircleKm(point, a.location);
        const contribution = Math.round(Math.min(100, 100 * Math.exp(-distKm / 30) * (a.severity / 10)));
        return { alert: a, distKm, contribution };
      })
      .sort((a, b) => a.distKm - b.distKm);
    const trafficking = Math.max(0, ...crimeAlerts.map((c) => c.contribution));

    // Overall blends both layers (trafficking weighs less than direct
    // encounters) unless the layer is toggled off.
    const score = includeTrafficking
      ? Math.round(Math.min(100, 0.65 * encounter + 0.35 * trafficking))
      : encounter;

    return {
      score,
      encounter,
      trafficking,
      level: riskLevel(score),
      risks: risks.filter((r) => r.contribution > 0).sort((a, b) => b.contribution - a.contribution),
      crimeAlerts: crimeAlerts.filter((c) => c.contribution > 0),
    };
  }, [latNum, lngNum, valid, includeTrafficking]);

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-3xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-1">
        <ShieldIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Human–Wildlife Conflict Predictor</h3>
      </div>
      <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-5">
        Pick a region or enter a coordinate to score the risk of elephant/lion/tiger encounters and wildlife
        trafficking. The score is computed from distance to documented migration corridors and crime-flagged
        alerts — transparent, not black-box.
      </p>

      {/* Layer toggle */}
      <label className="flex items-center gap-2 text-xs text-secondary-700 dark:text-secondary-300 mb-4">
        <input
          type="checkbox"
          checked={includeTrafficking}
          onChange={(e) => setIncludeTrafficking(e.target.checked)}
          className="w-4 h-4 accent-primary-600"
        />
        Include wildlife-trafficking layer
      </label>

      {/* Region presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => { setLat(String(p.lat)); setLng(String(p.lng)); setComputed(true); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-300 ${
              latNum === p.lat && lngNum === p.lng
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Coordinate inputs */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="flex flex-col text-xs text-secondary-500 dark:text-secondary-400">
          Latitude
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            type="number"
            step="0.01"
            className="mt-1 px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-36"
          />
        </label>
        <label className="flex flex-col text-xs text-secondary-500 dark:text-secondary-400">
          Longitude
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            type="number"
            step="0.01"
            className="mt-1 px-3 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-36"
          />
        </label>
        <button
          onClick={() => setComputed(true)}
          disabled={!valid}
          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium transition-colors duration-300"
        >
          Assess risk
        </button>
      </div>

      {!valid && <p className="text-xs text-danger-500">Enter a valid latitude (−90–90) and longitude (−180–180).</p>}

      {computed && valid && result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
          {/* Score */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-secondary-100 dark:stroke-secondary-700" />
                <circle
                  cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(result.score / 100) * 263.9} 263.9`}
                  className={result.level.stroke}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-data text-secondary-900 dark:text-white">{result.score}</span>
                <span className="text-[10px] uppercase tracking-wide text-secondary-400">/ 100</span>
              </div>
            </div>
            <div>
              <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white ${result.level.color}`}>
                {result.level.label} risk
              </div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2 max-w-md">
                at {latNum.toFixed(2)}, {lngNum.toFixed(2)}
              </p>
              <p className="text-xs font-data text-secondary-400 dark:text-secondary-500">
                encounter {result.encounter} · trafficking {result.trafficking}
              </p>
            </div>
          </div>

          {/* Per-species breakdown */}
          {result.risks.length > 0 ? (
            <div className="space-y-3">
              {result.risks.slice(0, 4).map((r) => (
                <div key={r.animalId} className="flex items-center gap-3">
                  <div className="w-40 shrink-0 flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300">
                    <PinIcon className="w-4 h-4 text-primary-500 shrink-0" />
                    {r.commonName}
                    <span className="text-xs px-1.5 py-0.5 rounded bg-secondary-100 dark:bg-secondary-700 text-secondary-500">{r.conservationStatus}</span>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-secondary-100 dark:bg-secondary-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.contribution}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full ${result.level.color}`}
                    />
                  </div>
                  <span className="w-24 text-right text-xs text-secondary-500 dark:text-secondary-400">
                    {r.nearestKm === null ? 'no corridor' : `${Math.round(r.nearestKm)} km away`}
                  </span>
                </div>
              ))}
              {result.risks[0]?.corridor && (
                <p className="text-xs text-secondary-400 dark:text-secondary-500 pt-1">
                  Nearest corridor: {result.risks[0].corridor}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              No conflict-prone species corridor within range of this point.
            </p>
          )}

          {/* Trafficking layer breakdown */}
          {includeTrafficking && (
            <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                  <ShieldIcon className="w-4 h-4 text-danger-500" /> Wildlife-trafficking risk
                </span>
                <span className="text-sm font-bold font-data text-danger-600 dark:text-danger-400">{result.trafficking}</span>
              </div>
              {result.crimeAlerts.length > 0 ? (
                <div className="space-y-2">
                  {result.crimeAlerts.slice(0, 3).map((c) => (
                    <div key={c.alert.id} className="text-xs text-secondary-600 dark:text-secondary-300 flex items-start gap-2">
                      <PinIcon className="w-3.5 h-3.5 text-danger-500 shrink-0 mt-0.5" />
                      <span className="flex-1">{c.alert.message}</span>
                      <span className="text-secondary-400 dark:text-secondary-500 shrink-0 font-data">{Math.round(c.distKm)} km</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  No crime-flagged alerts within range of this point.
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-4 border-t border-secondary-100 dark:border-secondary-700 pt-3">
            Model: encounter risk decays exponentially with distance to documented corridors (half at ~35 km,
            negligible past ~150 km), weighted by species danger and IUCN status. The trafficking layer adds
            proximity to crime-flagged alerts (severity-scaled, half at ~30 km); the overall score blends both.
            Educational model — not a substitute for on-the-ground assessments.
          </p>
        </motion.div>
      )}
    </div>
  );
}
