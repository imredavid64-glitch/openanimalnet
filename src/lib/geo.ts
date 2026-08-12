// Great-circle helpers for migration routes. Pure functions — unit-testable.

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two lat/lng points (km), haversine formula. */
export function greatCircleKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Total length of a route (sum of great-circle segments), in km. */
export function routeDistanceKm(points: GeoPoint[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += greatCircleKm(points[i], points[i + 1]);
  }
  return total;
}

/** Format a km distance compactly: "12,345 km" / "1.2M km". */
export function formatKm(km: number): string {
  if (km >= 1_000_000) return `~${(km / 1_000_000).toFixed(1)}M km`;
  return `~${Math.round(km).toLocaleString('en-US')} km`;
}

/** Format a duration: "~90 days" / "~3 months". */
export function formatDurationDays(days: number): string {
  if (days >= 45 && days % 30 === 0) return `~${Math.round(days / 30)} months`;
  if (days >= 60) return `~${(days / 30).toFixed(0)} months`;
  return `~${Math.round(days)} days`;
}

// --- Point-to-route distance (for conflict risk scoring) ---

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Distance (km) from a point to a great-circle segment, approximated with
 * equirectangular projection (accurate enough at corridor scale, far cheaper
 * than full great-circle segment math).
 */
export function distanceToSegmentKm(p: GeoPoint, a: GeoPoint, b: GeoPoint): number {
  const lat = toRad(p.latitude);
  const x = (b.longitude - a.longitude) * Math.cos(lat);
  const y = b.latitude - a.latitude;
  const len2 = x * x + y * y;
  let t = 0;
  if (len2 > 0) {
    t = ((p.longitude - a.longitude) * Math.cos(lat) * x + (p.latitude - a.latitude) * y) / len2;
    t = Math.max(0, Math.min(1, t));
  }
  const projLat = a.latitude + t * y;
  const projLng = a.longitude + t * x / Math.cos(lat);
  return greatCircleKm(p, { latitude: projLat, longitude: projLng });
}

/** Minimum distance (km) from a point to any segment of a route polyline. */
export function distanceToRouteKm(p: GeoPoint, points: GeoPoint[]): number {
  if (points.length === 0) return Number.POSITIVE_INFINITY;
  if (points.length === 1) return greatCircleKm(p, points[0]);
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < points.length - 1; i++) {
    min = Math.min(min, distanceToSegmentKm(p, points[i], points[i + 1]));
  }
  return min;
}
