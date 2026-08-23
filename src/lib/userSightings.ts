// User-reported sightings shared between /interact (report + verify) and the
// globe / map layers. Stored in localStorage under one key so every surface
// reads the same data.

export interface StoredSighting {
  id: string;
  animalId: string;
  species: string;
  location: { lat: number; lng: number };
  timestamp: string;
  notes?: string;
  photoUrl?: string;
  verified: boolean;
  reportedBy: string;
}

export const SIGHTING_STORAGE_KEY = 'oan-sightings';

export function loadUserSightings(): StoredSighting[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SIGHTING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s) =>
        s &&
        typeof s.location?.lat === 'number' &&
        typeof s.location?.lng === 'number' &&
        s.location.lat >= -90 && s.location.lat <= 90 &&
        s.location.lng >= -180 && s.location.lng <= 180,
    );
  } catch {
    return [];
  }
}
