// Shared types + recency helpers for the globe's live-observations layer.
// Client-safe (no server imports): both the 3D globe and the 2D fallback use
// these to color each observation dot by how recently it was recorded.
// The actual GBIF fetching lives server-side in `liveObservations.ts`.

export interface ObservationPoint {
  /** The OpenAnimalNet species id the observation belongs to (e.g. lion-001). */
  animalId: string;
  /** GBIF occurrence key (stable identifier for the record). */
  key: number;
  species: string;
  country?: string;
  latitude: number;
  longitude: number;
  /** ISO date of the observation event (may be absent for some records). */
  eventDate?: string;
}

/** Recency buckets for the observation dots — the legend explains the colors. */
export type ObservationRecency = 'week' | 'month' | 'year' | 'old';

export const RECENCY_COLORS: Record<ObservationRecency, string> = {
  week: '#4ade80', // ≤ 7 days — fresh
  month: '#fbbf24', // ≤ 30 days
  year: '#60a5fa', // ≤ 365 days
  old: '#94a3b8', // older / no date
};

export const RECENCY_LABELS: Record<ObservationRecency, string> = {
  week: '< 7d',
  month: '< 30d',
  year: '< 1y',
  old: 'no date',
};

/** Bucket an observation's event date into a recency color band. */
export function observationRecency(eventDate?: string): ObservationRecency {
  if (!eventDate) return 'old';
  const ageMs = Date.now() - new Date(eventDate).getTime();
  if (Number.isNaN(ageMs)) return 'old';
  const ageDays = ageMs / 86_400_000;
  if (ageDays <= 7) return 'week';
  if (ageDays <= 30) return 'month';
  if (ageDays <= 365) return 'year';
  return 'old';
}

export function recencyColor(eventDate?: string): string {
  return RECENCY_COLORS[observationRecency(eventDate)];
}
