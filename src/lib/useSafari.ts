'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { sampleAnimals } from '@/data/sample/animals';
import { Animal } from '@/types/animal/types';

export interface Discovery {
  animalId: string;
  discoveredAt: string;
  location: { lat: number; lng: number };
  photoTaken: boolean;
  notes: string;
  count: number; // times discovered
}

export interface SafariSpawn {
  animal: Animal;
  lat: number;
  lng: number;
  distance: number; // meters from user
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  discovered: boolean;
}

export interface SafariStats {
  totalDiscoveries: number;
  uniqueSpecies: number;
  totalSpecies: number;
  completionPercent: number;
  rarestFound: string | null;
  lastDiscovery: string | null;
}

const STORAGE_KEY = 'openanimalnet-safari';

// Region-based spawn weights — animals appear more often near their real habitats
const REGION_WEIGHTS: Record<string, Record<string, number>> = {
  africa: { 'lion-001': 3, 'elephant-001': 3, 'gorilla-001': 2, 'penguin-001': 1 },
  asia: { 'tiger-001': 3, 'panda-001': 2, 'orangutan-001': 2, 'snow-leopard-001': 1, 'red-panda-001': 2 },
  northAmerica: { 'eagle-001': 3, 'polar-bear-001': 1 },
  southAmerica: { 'tamarin-001': 2, 'axolotl-001': 1 },
  oceania: { 'koala-001': 3, 'monarch-001': 1 },
  europe: { 'shark-001': 1, 'dolphin-001': 2 },
  global: { 'bee-001': 2, 'cow-001': 1, 'tern-001': 1 },
};

const RARITY_MAP: Record<string, SafariSpawn['rarity']> = {
  'CR': 'legendary',
  'EN': 'rare',
  'VU': 'uncommon',
  'NT': 'uncommon',
  'LC': 'common',
  'DD': 'common',
  'NE': 'common',
};

// Haversine distance in meters
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getStoredDiscoveries(): Discovery[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function storeDiscoveries(d: Discovery[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

// Generate spawns near a given location
function generateSpawns(userLat: number, userLng: number, count: number): SafariSpawn[] {
  const spawns: SafariSpawn[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Pick a random animal weighted by rarity
    const shuffled = [...sampleAnimals].sort(() => Math.random() - 0.5);
    let picked: Animal | null = null;

    for (const animal of shuffled) {
      if (used.has(animal.id)) continue;
      // Weight by conservation status (rarer = harder to find)
      const rarity = RARITY_MAP[animal.conservationStatus] || 'common';
      const chance = rarity === 'legendary' ? 0.05 : rarity === 'rare' ? 0.15 : rarity === 'uncommon' ? 0.3 : 0.5;
      if (Math.random() < chance) {
        picked = animal;
        break;
      }
    }

    if (!picked) {
      picked = shuffled[0];
    }

    used.add(picked.id);

    // Random position within 5km
    const angle = Math.random() * 2 * Math.PI;
    const dist = 200 + Math.random() * 4800; // 200m to 5km
    const lat = userLat + (dist / 111320) * Math.cos(angle);
    const lng = userLng + (dist / (111320 * Math.cos((userLat * Math.PI) / 180))) * Math.sin(angle);

    spawns.push({
      animal: picked,
      lat,
      lng,
      distance: Math.round(dist),
      rarity: RARITY_MAP[picked.conservationStatus] || 'common',
      discovered: false,
    });
  }

  return spawns.sort((a, b) => a.distance - b.distance);
}

export function useSafari() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [spawns, setSpawns] = useState<SafariSpawn[]>([]);
  const [encountering, setEncountering] = useState<SafariSpawn | null>(null);

  useEffect(() => {
    setDiscoveries(getStoredDiscoveries());
    setLoaded(true);

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Default to Nairobi, Kenya (near many species' habitats)
          setUserLocation({ lat: -1.2921, lng: 36.8219 });
        }
      );
    } else {
      setUserLocation({ lat: -1.2921, lng: 36.8219 });
    }
  }, []);

  // Generate spawns when location changes
  useEffect(() => {
    if (userLocation) {
      const newSpawns = generateSpawns(userLocation.lat, userLocation.lng, 12);
      // Mark already-discovered ones
      const discoveredIds = new Set(discoveries.map(d => d.animalId));
      newSpawns.forEach(s => {
        if (discoveredIds.has(s.animal.id)) s.discovered = true;
      });
      setSpawns(newSpawns);
    }
  }, [userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDiscoveries = useCallback((updated: Discovery[]) => {
    setDiscoveries(updated);
    storeDiscoveries(updated);
  }, []);

  const discoverAnimal = useCallback((spawn: SafariSpawn, photoTaken: boolean, notes: string = '') => {
    const existing = discoveries.find(d => d.animalId === spawn.animal.id);
    let updated: Discovery[];

    if (existing) {
      updated = discoveries.map(d =>
        d.animalId === spawn.animal.id
          ? { ...d, count: d.count + 1, photoTaken: d.photoTaken || photoTaken, notes: notes || d.notes }
          : d
      );
    } else {
      updated = [...discoveries, {
        animalId: spawn.animal.id,
        discoveredAt: new Date().toISOString(),
        location: { lat: spawn.lat, lng: spawn.lng },
        photoTaken,
        notes,
        count: 1,
      }];
    }

    saveDiscoveries(updated);

    // Mark spawn as discovered
    setSpawns(prev => prev.map(s =>
      s.animal.id === spawn.animal.id ? { ...s, discovered: true } : s
    ));
  }, [discoveries, saveDiscoveries]);

  const refreshSpawns = useCallback(() => {
    if (userLocation) {
      const newSpawns = generateSpawns(userLocation.lat, userLocation.lng, 12);
      const discoveredIds = new Set(discoveries.map(d => d.animalId));
      newSpawns.forEach(s => {
        if (discoveredIds.has(s.animal.id)) s.discovered = true;
      });
      setSpawns(newSpawns);
    }
  }, [userLocation, discoveries]);

  const stats: SafariStats = useMemo(() => {
    const uniqueSpecies = new Set(discoveries.map(d => d.animalId)).size;
    const totalSpecies = sampleAnimals.length;
    const rarestDiscovery = discoveries
      .map(d => sampleAnimals.find(a => a.id === d.animalId))
      .filter(Boolean)
      .sort((a, b) => {
        const order = { CR: 0, EN: 1, VU: 2, NT: 3, LC: 4, DD: 5, NE: 6 };
        return (order[a!.conservationStatus as keyof typeof order] ?? 7) - (order[b!.conservationStatus as keyof typeof order] ?? 7);
      })[0];

    return {
      totalDiscoveries: discoveries.reduce((sum, d) => sum + d.count, 0),
      uniqueSpecies,
      totalSpecies,
      completionPercent: Math.round((uniqueSpecies / totalSpecies) * 100),
      rarestFound: rarestDiscovery?.commonName ?? null,
      lastDiscovery: discoveries.length > 0 ? discoveries[discoveries.length - 1].discoveredAt : null,
    };
  }, [discoveries]);

  return {
    loaded,
    discoveries,
    spawns,
    encountering,
    setEncountering,
    userLocation,
    stats,
    discoverAnimal,
    refreshSpawns,
    sampleAnimals,
  };
}
