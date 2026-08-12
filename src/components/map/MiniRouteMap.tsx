'use client';

import { MigrationRoute, MigrationSeason } from '@/types/animal/types';

const seasonColor = (season?: MigrationSeason): string => {
  if (season === 'spring') return '#22c55e';
  if (season === 'fall') return '#f59e0b';
  return '#94a3b8';
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
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-1.5 right-2 text-[10px] text-white/80 bg-black/40 rounded-md px-1.5 py-0.5">
        spring · fall · year-round
      </div>
    </div>
  );
}
