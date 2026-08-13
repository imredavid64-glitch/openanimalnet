'use client';

import { useState, useEffect, useCallback } from 'react';
import { sampleAnimals } from '@/data/sample/animals';

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

export interface ShelterMatch {
  petId: string;
  petName: string;
  species: string;
  breed: string;
  age: number;
  temperament: string[];
  matchScore: number;
  matchReasons: string[];
  shelter: string;
  contact: string;
  adopted: boolean;
}

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

// Shelter matching engine
function computeMatches(answers: {
  species: string;
  size: string;
  energy: string;
  kids: boolean;
  experience: string;
}): ShelterMatch[] {
  const pets = [
    { id: 'pet-1', name: 'Luna', species: 'Dog', breed: 'Labrador Mix', age: 3, temperament: ['gentle', 'energetic', 'kid-friendly'], shelter: 'City Animal Shelter', contact: '555-0101' },
    { id: 'pet-2', name: 'Shadow', species: 'Cat', breed: 'Domestic Shorthair', age: 2, temperament: ['calm', 'independent', 'quiet'], shelter: 'Feline Rescue', contact: '555-0102' },
    { id: 'pet-3', name: 'Max', species: 'Dog', breed: 'German Shepherd', age: 5, temperament: ['loyal', 'protective', 'active'], shelter: 'K-9 Rescue', contact: '555-0103' },
    { id: 'pet-4', name: 'Whiskers', species: 'Cat', breed: 'Persian', age: 4, temperament: ['calm', 'affectionate', 'quiet'], shelter: 'Purrfect Home', contact: '555-0104' },
    { id: 'pet-5', name: 'Buddy', species: 'Dog', breed: 'Beagle', age: 1, temperament: ['energetic', 'friendly', 'playful'], shelter: 'Happy Tails', contact: '555-0105' },
    { id: 'pet-6', name: 'Cleo', species: 'Cat', breed: 'Siamese', age: 2, temperament: ['vocal', 'social', 'playful'], shelter: 'Feline Rescue', contact: '555-0106' },
    { id: 'pet-7', name: 'Rex', species: 'Dog', breed: 'Golden Retriever', age: 4, temperament: ['gentle', 'kid-friendly', 'energetic'], shelter: 'City Animal Shelter', contact: '555-0107' },
    { id: 'pet-8', name: 'Milo', species: 'Rabbit', breed: 'Holland Lop', age: 1, temperament: ['gentle', 'quiet', 'kid-friendly'], shelter: 'Small Wonders', contact: '555-0108' },
  ];

  return pets.map(pet => {
    let score = 50;
    const reasons: string[] = [];

    if (answers.species === 'Any' || answers.species.toLowerCase() === pet.species.toLowerCase()) {
      score += 20; reasons.push(`Species match: ${pet.species}`);
    }
    if (answers.energy === 'Calm' && pet.temperament.includes('calm')) { score += 15; reasons.push('Temperament: calm'); }
    if (answers.energy === 'Active' && (pet.temperament.includes('energetic') || pet.temperament.includes('active'))) { score += 15; reasons.push('Temperament: active'); }
    if (answers.kids && pet.temperament.includes('kid-friendly')) { score += 15; reasons.push('Good with kids'); }
    if (answers.size === 'Small' && ['Cat', 'Rabbit'].includes(pet.species)) { score += 10; reasons.push('Size match'); }
    if (answers.size === 'Large' && pet.species === 'Dog') { score += 10; reasons.push('Size match'); }
    if (answers.experience === 'First-time' && pet.age > 2) { score += 5; reasons.push('Mature & stable'); }

    return {
      petId: pet.id,
      petName: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      temperament: pet.temperament,
      matchScore: Math.min(99, score),
      matchReasons: reasons,
      shelter: pet.shelter,
      contact: pet.contact,
      adopted: false,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
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

  const runMatch = useCallback((answers: Parameters<typeof computeMatches>[0]) => {
    const result = computeMatches(answers);
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
