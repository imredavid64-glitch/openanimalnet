'use client';

import { MigrationRoute, MigrationSeason } from '@/types/animal/types';
import { routeDistanceKm, formatKm, formatDurationDays } from '@/lib/geo';

const seasonColor = (season?: MigrationSeason): string => {
  if (season === 'spring') return '#22c55e';
  if (season === 'fall') return '#f59e0b';
  return '#94a3b8';
};

// Midpoint of a route (lat/lng) for placing its distance label on the map.
const midpoint = (points: MigrationRoute['points']): { lat: number; lng: number } => {
  if (points.length === 0) return { lat: 0, lng: 0 };
  const mid = points[Math.floor((points.length - 1) / 2)];
  return { lat: mid.latitude, lng: mid.longitude };
};

/**
 * Mini equirectangular world map (NASA earth texture as the base layer) with
 * each migration corridor drawn as a dashed, season-colored polyline over its
 * real geographic path — a lightweight map for profile/monitor pages.
 */
export default function MiniRouteMap({
  routes,
  height = 'h-40',
}: {
  routes: MigrationRoute[];
  height?: string;
}) {
  if (routes.length === 0) return null;

  return (
    <div
      className={`relative w-full ${height} rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700`}
      style={{
        backgroundImage: "url('/images/earth.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 360 180" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        {routes.map((route, i) => {
          const color = seasonColor(route.season);
          const line = route.points
            .map((p) => `${(p.longitude + 180).toFixed(2)},${(90 - p.latitude).toFixed(2)}`)
            .join(' ');
          const mid = midpoint(route.points);
          const km = routeDistanceKm(route.points);
          const duration = route.durationDays ? formatDurationDays(route.durationDays) : null;
          const label = [formatKm(km), duration].filter(Boolean).join(' · ');
          return (
            <g key={i}>
              <polyline
                points={line}
                fill="none"
                stroke={color}
                strokeWidth="1.6"
                strokeDasharray="7 4"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.95"
              />
              {route.points.map((p, j) => (
                <circle
                  key={j}
                  cx={p.longitude + 180}
                  cy={90 - p.latitude}
                  r="2.6"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="0.7"
                />
              ))}
              {/* Distance + duration label at the route's midpoint */}
              <g>
                <rect
                  x={mid.lng + 180 + 2.5}
                  y={90 - mid.lat - 6.5}
                  width={label.length * 3.05 + 4}
                  height="13"
                  rx="2.5"
                  fill="rgba(0,0,0,0.55)"
                />
                <text
                  x={mid.lng + 180 + 4.5}
                  y={90 - mid.lat + 3.2}
                  fontSize="8"
                  fill="#ffffff"
                  fontFamily="ui-monospace, monospace"
                >
                  {label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-1.5 right-2 text-[10px] text-white/80 bg-black/40 rounded-md px-1.5 py-0.5">
        distances approx. · spring · fall · year-round
      </div>
    </div>
  );
}
