'use client';

import { useState, useEffect, useCallback } from 'react';
import { sampleAnimals } from '@/data/sample/animals';
import { computeShelterMatches, type ShelterMatchAnswers } from './interactMatching';
import type { ShelterMatch } from './interactMatching';
import { SIGHTING_STORAGE_KEY, type StoredSighting } from './userSightings';
import { getSupabaseClient } from './supabase/client';
import type { Database } from './supabase/types';

export interface WildlifeSighting extends StoredSighting {
  // Extra interact-only fields can extend the stored shape here.
  user_id?: string; // Add user_id field for Supabase sync
  created_at?: string; // Add created_at field for Supabase sync
}

export interface SensorReading {
  sensorId: string;
  animalId: string;
  type: 'temperature' | 'humidity' | 'movement' | 'location' | 'sound';
  value: number;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  user_id?: string; // Add user_id field for Supabase sync
  created_at?: string; // Add created_at field for Supabase sync
}

export interface AccessLog {
  id: string;
  serviceAnimalId: string;
  handlerName: string;
  location: string;
  timestamp: string;
  purpose: string;
  duration: string;
  status: 'granted' | 'denied' | 'pending';
  user_id?: string; // Add user_id field for Supabase sync
  created_at?: string; // Add created_at field for Supabase sync
}

export type { ShelterMatch, ShelterMatchAnswers } from './interactMatching';

declare global {
  interface Window {
    supabase: any;
  }
}

declare module '@supabase/supabase-js' {
  interface PostgrestBuilder<T> {
    upsert: (items: T[], options?: { onConflict?: string; ignoreDuplicates?: boolean }) => Promise<{ data: T[] | null; error: Error | null }>;
  }
}

const SENSOR_KEY = 'oan-sensors';
const ACCESS_KEY = 'oan-access';
const MATCH_KEY = 'oan-matches';

function genId() { return Math.random().toString(36).slice(2, 10); }

async function load<T>(key: string, fallback: T): Promise<T> {
  if (typeof window === 'undefined') return fallback;
  try {
    const r = localStorage.getItem(key);
    let localData = r ? JSON.parse(r) : [];
    
    // Sync with Supabase if user is signed in
    if (typeof window !== 'undefined' && window.supabase) {
      const user = window.supabase.auth.user();
      if (user) {
        // Determine the table name based on the key
        let tableName;
        switch (key) {
          case SIGHTING_STORAGE_KEY:
            tableName = 'sightings';
            break;
          case ACCESS_KEY:
            tableName = 'access_logs';
            break;
          case MATCH_KEY:
            tableName = 'shelter_matches';
            break;
          case SENSOR_KEY:
            tableName = 'sensor_readings';
            break;
          default:
            return localData;
        }
        
        // Fetch data from Supabase with conflict resolution
        const { data: syncedData, error } = await window.supabase
          .from(tableName)
          .select('*')
          .eq('user_id', user.id);
        
        if (!error && syncedData) {
          // Merge local and remote data with conflict resolution
          const merged = [...localData, ...syncedData].reduce((acc, curr) => {
            const existingItem = acc.find(item => item.id === curr.id);
            if (!existingItem) {
              acc.push(curr);
            } else if (new Date(curr.updated_at) > new Date(existingItem.updated_at)) {
              // Keep the newer version
              acc = acc.filter(item => item.id !== curr.id);
              acc.push(curr);
            }
            return acc;
          }, []);
          // Update localStorage with merged data
          localStorage.setItem(key, JSON.stringify(merged));
          return merged as T;
        }
      }
    }
    
    return localData;
  } catch {
    return fallback;
  }
}
async function save(key: string, data: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
  
  // Sync with Supabase if user is signed in
  if (typeof window !== 'undefined' && window.supabase) {
    const user = window.supabase.auth.user();
    if (user) {
      // Determine the table name based on the key
      let tableName;
      switch (key) {
        case SIGHTING_STORAGE_KEY:
          tableName = 'sightings';
          break;
        case ACCESS_KEY:
          tableName = 'access_logs';
          break;
        case MATCH_KEY:
          tableName = 'shelter_matches';
          break;
        case SENSOR_KEY:
          tableName = 'sensor_readings';
          break;
        default:
          return;
      }
      
      // Upsert data to Supabase
      const { error } = await window.supabase
        .from(tableName)
        .upsert(data.map(item => ({
          ...item,
          user_id: user.id,
          created_at: item.created_at || new Date().toISOString(),
          // Add updated_at field for tracking changes
          updated_at: new Date().toISOString()
        })));
      if (error) {
        console.error(`Error syncing with Supabase (${tableName}):`, error);
      }
    }
  }
}
// Lets other surfaces (e.g. the globe's sightings layer) refresh in the same
// tab immediately after a report is added or verified.
function notifySightingsChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('oan-sightings-updated'));
}

// Simulated sensor data generator
function generateSensorData(): SensorReading[] {
  const sensors: SensorReading[] = [];
  const sensorTypes = ['temperature', 'humidity', 'movement', 'location', 'sound'] as const;
  const now = new Date();

  sampleAnimals.filter(a => a.livestockTelemetry || a.isMonitored).forEach(animal => {
    for (let i = 0; i < 5; i++) {
      const type = sensorTypes[i];
      const hoursAgo = Math.random() * 24;
      const ts = new Date(now.getTime() - hoursAgo * 3600000);

      let value = 0, unit = '', status: 'normal' | 'warning' | 'critical' = 'normal';
      if (type === 'temperature') {
        value = 36 + Math.random() * 4; unit = '°C';
        status = value > 39.5 ? 'critical' : value > 39.0 ? 'warning' : 'normal';
      } else if (type === 'humidity') {
        value = 40 + Math.random() * 40; unit = '%';
        status = value > 70 ? 'warning' : 'normal';
      } else if (type === 'movement') {
        value = Math.random() * 100; unit = 'steps/hr';
        status = value < 10 ? 'warning' : 'normal';
      } else if (type === 'location') {
        value = animal.location.latitude + (Math.random() - 0.5) * 0.01;
        unit = 'lat';
        status = 'normal';
      } else {
        value = Math.random() * 80; unit = 'dB';
        status = value > 60 ? 'warning' : 'normal';
      }

      sensors.push({
        sensorId: `sensor-${animal.id}-${type}`,
        animalId: animal.id,
        type,
        value: Math.round(value * 100) / 100,
        unit,
        timestamp: ts.toISOString(),
        status,
      });
    }
  });
  return sensors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function useCrowdsourced() {
  const [sightings, setSightings] = useState<WildlifeSighting[]>([]);
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [matches, setMatches] = useState<ShelterMatch[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);

  // Initialize Supabase client
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.supabase) {
      window.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      setSupabaseInitialized(true);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      const sightingsData = await load(SIGHTING_STORAGE_KEY, []);
      setSightings(sightingsData);
      setSensors(generateSensorData());
      const accessLogsData = await load(ACCESS_KEY, []);
      setAccessLogs(accessLogsData);
      const matchesData = await load(MATCH_KEY, []);
      setMatches(matchesData);
      setLoaded(true);
    }
    if (supabaseInitialized) {
      loadData();
    }
  }, [supabaseInitialized]);

  const addSighting = useCallback(async (s: Omit<WildlifeSighting, 'id' | 'verified'>) => {
    const newSighting = {
      ...s,
      id: genId(),
      verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [...sightings, newSighting];
    setSightings(updated);
    await save(SIGHTING_STORAGE_KEY, updated);
    notifySightingsChanged();
  }, [sightings]);

  const verifySighting = useCallback(async (id: string) => {
    const updated = sightings.map(s => s.id === id ? { ...s, verified: true, updated_at: new Date().toISOString() } : s);
    setSightings(updated);
    await save(SIGHTING_STORAGE_KEY, updated);
    notifySightingsChanged();
  }, [sightings]);

  const addAccessLog = useCallback(async (log: Omit<AccessLog, 'id'>) => {
    const newLog = {
      ...log,
      id: genId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [...accessLogs, newLog];
    setAccessLogs(updated);
    await save(ACCESS_KEY, updated);
  }, [accessLogs]);

  const runMatch = useCallback(async (answers: ShelterMatchAnswers) => {
    const result = computeShelterMatches(answers).map(match => ({
      ...match,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    setMatches(result);
    await save(MATCH_KEY, result);
    return result;
  }, []);

  const adoptPet = useCallback(async (petId: string) => {
    const updated = matches.map(m => m.petId === petId ? { ...m, adopted: true, updated_at: new Date().toISOString() } : m);
    setMatches(updated);
    await save(MATCH_KEY, updated);
  }, [matches]);

  const refreshSensors = useCallback(async () => {
    const newSensors = generateSensorData().map(sensor => ({
      ...sensor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    setSensors(newSensors);
  }, []);

  return {
    loaded, sightings, sensors, accessLogs, matches,
    addSighting, verifySighting, addAccessLog, runMatch, adoptPet, refreshSensors,
  };
}
