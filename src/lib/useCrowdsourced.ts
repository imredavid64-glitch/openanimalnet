'use client';

import { useState, useEffect, useCallback } from 'react';
import { sampleAnimals } from '@/data/sample/animals';
import { computeShelterMatches, type ShelterMatchAnswers } from './interactMatching';

export interface WildlifeSighting {
  id: string;
  animalId: string;
  species: string;
  location: { lat: number; lng: number };
  timestamp: string;
  notes: string;
  photoUrl?: string;
  verified: boolean;
  reportedBy: string;
}

export interface SensorReading {
  sensorId: string;
  animalId: string;
  type: 'temperature' | 'humidity' | 'movement' | 'location' | 'sound';
  value: number;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
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
}

export type { ShelterMatch, ShelterMatchAnswers } from './interactMatching';

const SIGHTING_KEY = 'oan-sightings';
const SENSOR_KEY = 'oan-sensors';
const ACCESS_KEY = 'oan-access';
const MATCH_KEY = 'oan-matches';

function genId() { return Math.random().toString(36).slice(2, 10); }

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function save(key: string, data: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
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

export function useCrowdsourced() {
  const [sightings, setSightings] = useState<WildlifeSighting[]>([]);
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [matches, setMatches] = useState<ShelterMatch[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSightings(load(SIGHTING_KEY, []));
    setSensors(generateSensorData());
    setAccessLogs(load(ACCESS_KEY, []));
    setMatches(load(MATCH_KEY, []));
    setLoaded(true);
  }, []);

  const addSighting = useCallback((s: Omit<WildlifeSighting, 'id' | 'verified'>) => {
    const updated = [...sightings, { ...s, id: genId(), verified: false }];
    setSightings(updated);
    save(SIGHTING_KEY, updated);
  }, [sightings]);

  const verifySighting = useCallback((id: string) => {
    const updated = sightings.map(s => s.id === id ? { ...s, verified: true } : s);
    setSightings(updated);
    save(SIGHTING_KEY, updated);
  }, [sightings]);

  const addAccessLog = useCallback((log: Omit<AccessLog, 'id'>) => {
    const updated = [...accessLogs, { ...log, id: genId() }];
    setAccessLogs(updated);
    save(ACCESS_KEY, updated);
  }, [accessLogs]);

  const runMatch = useCallback((answers: ShelterMatchAnswers) => {
    const result = computeShelterMatches(answers);
    setMatches(result);
    save(MATCH_KEY, result);
    return result;
  }, []);

  const adoptPet = useCallback((petId: string) => {
    const updated = matches.map(m => m.petId === petId ? { ...m, adopted: true } : m);
    setMatches(updated);
    save(MATCH_KEY, updated);
  }, [matches]);

  const refreshSensors = useCallback(() => {
    setSensors(generateSensorData());
  }, []);

  return {
    loaded, sightings, sensors, accessLogs, matches,
    addSighting, verifySighting, addAccessLog, runMatch, adoptPet, refreshSensors,
  };
}
