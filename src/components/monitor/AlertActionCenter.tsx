'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SampleAlert } from '@/data/sample/alerts';
import { routeDistanceKm, formatKm } from '@/lib/geo';
import { BellIcon, PinIcon, CheckIcon, ShieldIcon } from '@/components/icons';

interface ActionLogEntry {
  time: string;
  text: string;
}

/** SVG equirectangular projection helpers (viewBox 360×180, x=lng+180, y=90-lat). */
const px = (lng: number) => lng + 180;
const py = (lat: number) => 90 - lat;
// 1° latitude ≈ 111 km; scale so 5 km ≈ 4.5 SVG units (readable on the mini map).
const KM_TO_UNITS = 4.5 / 5;

const ROUTE_KM = 5; // mitigation route length + deterrent radius (approx.)

/**
 * Interactive action center for monitoring alerts. Each action is a simulated
 * workflow with an honest status trail: dispatch logs a ranger notification
 * with a progression timeline, mitigation computes a safe-zone route, and the
 * acoustic deterrent renders a coverage radius on the map.
 */
export default function AlertActionCenter({ alert }: { alert: SampleAlert }) {
  const [log, setLog] = useState<ActionLogEntry[]>([]);
  const [dispatchState, setDispatchState] = useState<'idle' | 'dispatched' | 'enroute' | 'onsite'>('idle');
  const [showRoute, setShowRoute] = useState(false);
  const [showDeterrent, setShowDeterrent] = useState(false);
  const [crimeReported, setCrimeReported] = useState(false);

  const append = (text: string) => {
    setLog((prev) => [{ time: new Date().toLocaleTimeString(), text }, ...prev].slice(0, 6));
  };

  // Simulated dispatch progression: dispatched → en route → on site.
  useEffect(() => {
    if (dispatchState === 'dispatched') {
      const t1 = setTimeout(() => {
        setDispatchState('enroute');
        append('Ranger unit en route to alert coordinates');
      }, 2500);
      const t2 = setTimeout(() => {
        setDispatchState('onsite');
        append('Ranger unit on site — situation assessed');
      }, 6000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatchState]);

  // Mitigation route: alert location → intermediate points → safe zone ~5 km away.
  const route = useMemo(() => {
    const { lat, lng } = alert.location;
    const waypoints = [
      { latitude: lat, longitude: lng },
      { latitude: lat + 0.015, longitude: lng + 0.015 },
      { latitude: lat + 0.03, longitude: lng + 0.03 },
      { latitude: lat + 0.045, longitude: lng + 0.045 },
    ];
    return { waypoints, km: routeDistanceKm(waypoints) };
  }, [alert.location]);

  const dispatch = () => {
    setDispatchState('dispatched');
    append(`Ranger notification dispatched to ${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}`);
  };

  const toggleRoute = () => {
    setShowRoute((v) => !v);
    append(showRoute ? 'Mitigation route cleared' : `Mitigation route generated (${formatKm(route.km)})`);
  };

  const toggleDeterrent = () => {
    setShowDeterrent((v) => !v);
    append(showDeterrent ? 'Acoustic deterrent simulation off' : 'Acoustic deterrent range active (~5 km radius)');
  };

  const reportCrime = () => {
    setCrimeReported(true);
    append(
      `Wildlife crime report filed with the authorities at ${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)} — reference ${alert.id.toUpperCase()}`
    );
  };

  const statusColor =
    alert.type === 'critical' ? 'bg-danger-500' : alert.type === 'warning' ? 'bg-warning-500' : 'bg-primary-500';

  return (
    <div className="rounded-2xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
      <div className={`px-4 py-3 text-white text-sm font-semibold flex items-center gap-2 ${statusColor}`}>
        <ShieldIcon className="w-4 h-4" />
        Action Center
        <span className="ml-auto font-normal text-xs opacity-90">simulated workflows</span>
      </div>

      <div className="p-4">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={dispatch}
            disabled={dispatchState === 'dispatched' || dispatchState === 'enroute'}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-300 ${
              dispatchState === 'idle'
                ? 'bg-danger-600 hover:bg-danger-700 text-white'
                : 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300'
            } disabled:opacity-70 flex items-center gap-1.5`}
          >
            <BellIcon className="w-3.5 h-3.5" />
            {dispatchState === 'idle' ? 'Dispatch Local Ranger' : dispatchState === 'onsite' ? 'Ranger on site' : 'Ranger notified'}
          </button>
          <button
            onClick={toggleRoute}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-300 flex items-center gap-1.5 ${
              showRoute
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
            }`}
          >
            <PinIcon className="w-3.5 h-3.5" />
            {showRoute ? 'Clear Mitigation Route' : 'Generate Mitigation Route'}
          </button>
          {alert.crime && (
            <button
              onClick={reportCrime}
              disabled={crimeReported}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                crimeReported
                  ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300'
                  : 'bg-danger-600 hover:bg-danger-700 text-white'
              } disabled:opacity-70`}
            >
              <ShieldIcon className="w-3.5 h-3.5" />
              {crimeReported ? 'Crime report filed' : 'Report Wildlife Crime'}
            </button>
          )}
          <button
            onClick={toggleDeterrent}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-300 flex items-center gap-1.5 ${
              showDeterrent
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
            }`}
          >
            <ShieldIcon className="w-3.5 h-3.5" />
            {showDeterrent ? 'Disable Acoustic Deterrent' : 'Simulate Acoustic Deterrent'}
          </button>
        </div>

        {/* Map: alert marker + optional route + deterrent radius */}
        <div
          className="relative w-full h-44 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700"
          style={{
            backgroundImage: "url('/images/earth.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <svg viewBox="0 0 360 180" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            {/* Acoustic deterrent range */}
            {showDeterrent && (
              <g>
                <circle
                  cx={px(alert.location.lng)}
                  cy={py(alert.location.lat)}
                  r={ROUTE_KM * KM_TO_UNITS}
                  fill="rgba(37,99,235,0.15)"
                  stroke="#2563eb"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
                {/* Deployment points on the perimeter */}
                {[0, 60, 120, 180, 240, 300].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const r = ROUTE_KM * KM_TO_UNITS;
                  return (
                    <circle
                      key={deg}
                      cx={px(alert.location.lng) + r * Math.cos(rad)}
                      cy={py(alert.location.lat) + r * Math.sin(rad)}
                      r="1.6"
                      fill="#2563eb"
                      stroke="#fff"
                      strokeWidth="0.5"
                    />
                  );
                })}
              </g>
            )}

            {/* Mitigation route */}
            {showRoute && (
              <g>
                <polyline
                  points={route.waypoints.map((p) => `${px(p.longitude)},${py(p.latitude)}`).join(' ')}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="1.8"
                  strokeDasharray="6 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {route.waypoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={px(p.longitude)}
                    cy={py(p.latitude)}
                    r={i === 0 ? 2.8 : 2}
                    fill={i === 0 ? '#dc2626' : '#16a34a'}
                    stroke="#fff"
                    strokeWidth="0.7"
                  />
                ))}
                <text x={px(route.waypoints[1].longitude) + 2} y={py(route.waypoints[1].latitude) - 3} fontSize="7.5" fill="#16a34a" fontWeight="bold">
                  safe zone
                </text>
              </g>
            )}

            {/* Alert marker */}
            <circle cx={px(alert.location.lng)} cy={py(alert.location.lat)} r="3.2" fill="#dc2626" stroke="#fff" strokeWidth="0.9" />
          </svg>
          <div className="absolute bottom-1.5 right-2 text-[10px] text-white/90 bg-black/40 rounded-md px-1.5 py-0.5">
            alert: {alert.location.lat.toFixed(2)}, {alert.location.lng.toFixed(2)}
          </div>
        </div>

        {/* Route summary */}
        {showRoute && (
          <div className="mt-3 text-xs text-secondary-600 dark:text-secondary-300 flex items-center gap-2">
            <CheckIcon className="w-3.5 h-3.5 text-success-500" />
            Mitigation route: {route.waypoints.length} waypoints · {formatKm(route.km)} to the community safe zone (~{ROUTE_KM} km NE).
          </div>
        )}

        {/* Action log */}
        <AnimatePresence>
          {log.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="text-[11px] uppercase tracking-wide text-secondary-400 dark:text-secondary-500 mb-1.5">Action log</div>
              <ul className="space-y-1">
                {log.map((entry, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-secondary-600 dark:text-secondary-300">
                    <span className="font-data text-secondary-400 dark:text-secondary-500 shrink-0">{entry.time}</span>
                    <span>{entry.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
