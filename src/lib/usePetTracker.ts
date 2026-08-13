'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  color: string;
  microchipId?: string;
  photoUrl?: string;
  addedAt: string;
  // Care tracking
  vaccinations: Vaccination[];
  feedings: FeedingSchedule[];
  vetVisits: VetVisit[];
  medications: Medication[];
  exerciseGoals: ExerciseGoal[];
}

export interface Vaccination {
  id: string;
  name: string;
  dateGiven: string;
  nextDue: string;
  veterinarian: string;
  notes?: string;
}

export interface FeedingSchedule {
  id: string;
  time: string;
  foodType: string;
  amount: string;
  notes?: string;
}

export interface VetVisit {
  id: string;
  date: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  cost?: number;
  nextVisit?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface ExerciseGoal {
  id: string;
  activity: string;
  durationMinutes: number;
  frequency: string;
}

export interface PetCareNeed {
  type: 'vaccination' | 'vet-visit' | 'medication' | 'feeding' | 'exercise';
  title: string;
  description: string;
  dueDate?: string;
  priority: 'urgent' | 'upcoming' | 'routine';
  petId: string;
  petName: string;
}

const STORAGE_KEY = 'openanimalnet-pet-tracker';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function getStoredPets(): Pet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storePets(pets: Pet[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
}

export function usePetTracker() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPets(getStoredPets());
    setLoaded(true);
  }, []);

  const savePets = useCallback((updated: Pet[]) => {
    setPets(updated);
    storePets(updated);
  }, []);

  const addPet = useCallback((pet: Omit<Pet, 'id' | 'addedAt' | 'vaccinations' | 'feedings' | 'vetVisits' | 'medications' | 'exerciseGoals'>) => {
    const newPet: Pet = {
      ...pet,
      id: generateId(),
      addedAt: new Date().toISOString(),
      vaccinations: [],
      feedings: [],
      vetVisits: [],
      medications: [],
      exerciseGoals: [],
    };
    savePets([...pets, newPet]);
    return newPet;
  }, [pets, savePets]);

  const removePet = useCallback((id: string) => {
    savePets(pets.filter(p => p.id !== id));
  }, [pets, savePets]);

  const addVaccination = useCallback((petId: string, vax: Omit<Vaccination, 'id'>) => {
    savePets(pets.map(p =>
      p.id === petId ? { ...p, vaccinations: [...p.vaccinations, { ...vax, id: generateId() }] } : p
    ));
  }, [pets, savePets]);

  const addVetVisit = useCallback((petId: string, visit: Omit<VetVisit, 'id'>) => {
    savePets(pets.map(p =>
      p.id === petId ? { ...p, vetVisits: [...p.vetVisits, { ...visit, id: generateId() }] } : p
    ));
  }, [pets, savePets]);

  const addMedication = useCallback((petId: string, med: Omit<Medication, 'id'>) => {
    savePets(pets.map(p =>
      p.id === petId ? { ...p, medications: [...p.medications, { ...med, id: generateId() }] } : p
    ));
  }, [pets, savePets]);

  const addFeeding = useCallback((petId: string, feeding: Omit<FeedingSchedule, 'id'>) => {
    savePets(pets.map(p =>
      p.id === petId ? { ...p, feedings: [...p.feedings, { ...feeding, id: generateId() }] } : p
    ));
  }, [pets, savePets]);

  const addExerciseGoal = useCallback((petId: string, goal: Omit<ExerciseGoal, 'id'>) => {
    savePets(pets.map(p =>
      p.id === petId ? { ...p, exerciseGoals: [...p.exerciseGoals, { ...goal, id: generateId() }] } : p
    ));
  }, [pets, savePets]);

  // Compute care needs for all pets
  const getCareNeeds = useCallback((): PetCareNeed[] => {
    const needs: PetCareNeed[] = [];
    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const pet of pets) {
      // Check upcoming vaccinations
      for (const vax of pet.vaccinations) {
        if (vax.nextDue) {
          const due = new Date(vax.nextDue);
          if (due <= soon) {
            needs.push({
              type: 'vaccination',
              title: `${vax.name} vaccination due`,
              description: `Next dose due for ${pet.name}`,
              dueDate: vax.nextDue,
              priority: due <= now ? 'urgent' : 'upcoming',
              petId: pet.id,
              petName: pet.name,
            });
          }
        }
      }

      // Check vet visits
      for (const visit of pet.vetVisits) {
        if (visit.nextVisit) {
          const due = new Date(visit.nextVisit);
          if (due <= soon) {
            needs.push({
              type: 'vet-visit',
              title: `Vet visit for ${pet.name}`,
              description: visit.reason || 'Scheduled checkup',
              dueDate: visit.nextVisit,
              priority: due <= now ? 'urgent' : 'upcoming',
              petId: pet.id,
              petName: pet.name,
            });
          }
        }
      }

      // Check medications
      for (const med of pet.medications) {
        if (!med.endDate || new Date(med.endDate) >= now) {
          needs.push({
            type: 'medication',
            title: `${med.name} — ${med.dosage}`,
            description: `${med.frequency} for ${pet.name}`,
            priority: 'routine',
            petId: pet.id,
            petName: pet.name,
          });
        }
      }

      // Check feeding schedule
      if (pet.feedings.length === 0) {
        needs.push({
          type: 'feeding',
          title: 'Set up feeding schedule',
          description: `No feeding schedule set for ${pet.name}`,
          priority: 'routine',
          petId: pet.id,
          petName: pet.name,
        });
      }

      // Check exercise goals
      if (pet.exerciseGoals.length === 0) {
        needs.push({
          type: 'exercise',
          title: 'Set exercise goals',
          description: `No exercise goals set for ${pet.name}`,
          priority: 'routine',
          petId: pet.id,
          petName: pet.name,
        });
      }
    }

    return needs.sort((a, b) => {
      const priorityOrder = { urgent: 0, upcoming: 1, routine: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [pets]);

  return {
    pets,
    loaded,
    addPet,
    removePet,
    addVaccination,
    addVetVisit,
    addMedication,
    addFeeding,
    addExerciseGoal,
    getCareNeeds,
  };
}
