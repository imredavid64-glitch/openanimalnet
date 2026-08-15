// Pure matching engines for the /interact platform and the companion-animal
// hub (/reunite). Extracted from the UI so the logic can be unit-tested with
// `node --test` — no React, no `@/` alias imports, no browser APIs.
// All functions are deterministic and side-effect free.
//
// Engines:
//   1. computeShelterMatches — scores shelter pets against an adopter's answers
//   2. identifySpecies       — substring search across a species dataset
//   3. matchLostToFound      — distance + species matching of lost/found reports

import { greatCircleKm } from './geo.ts';
import type { GeoPoint } from './geo.ts';

// --- Shelter matching -------------------------------------------------------

export interface ShelterMatchAnswers {
  species: string;
  size: string;
  energy: string;
  kids: boolean;
  experience: string;
}

export interface ShelterPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  temperament: string[];
  shelter: string;
  contact: string;
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

/** The default shelter registry shown in the /interact Shelter Match tab. */
export const DEFAULT_PETS: ShelterPet[] = [
  { id: 'pet-1', name: 'Luna', species: 'Dog', breed: 'Labrador Mix', age: 3, temperament: ['gentle', 'energetic', 'kid-friendly'], shelter: 'City Animal Shelter', contact: '555-0101' },
  { id: 'pet-2', name: 'Shadow', species: 'Cat', breed: 'Domestic Shorthair', age: 2, temperament: ['calm', 'independent', 'quiet'], shelter: 'Feline Rescue', contact: '555-0102' },
  { id: 'pet-3', name: 'Max', species: 'Dog', breed: 'German Shepherd', age: 5, temperament: ['loyal', 'protective', 'active'], shelter: 'K-9 Rescue', contact: '555-0103' },
  { id: 'pet-4', name: 'Whiskers', species: 'Cat', breed: 'Persian', age: 4, temperament: ['calm', 'affectionate', 'quiet'], shelter: 'Purrfect Home', contact: '555-0104' },
  { id: 'pet-5', name: 'Buddy', species: 'Dog', breed: 'Beagle', age: 1, temperament: ['energetic', 'friendly', 'playful'], shelter: 'Happy Tails', contact: '555-0105' },
  { id: 'pet-6', name: 'Cleo', species: 'Cat', breed: 'Siamese', age: 2, temperament: ['vocal', 'social', 'playful'], shelter: 'Feline Rescue', contact: '555-0106' },
  { id: 'pet-7', name: 'Rex', species: 'Dog', breed: 'Golden Retriever', age: 4, temperament: ['gentle', 'kid-friendly', 'energetic'], shelter: 'City Animal Shelter', contact: '555-0107' },
  { id: 'pet-8', name: 'Milo', species: 'Rabbit', breed: 'Holland Lop', age: 1, temperament: ['gentle', 'quiet', 'kid-friendly'], shelter: 'Small Wonders', contact: '555-0108' },
];

/**
 * Score every pet in `pets` (default: the /interact registry) against the
 * adopter's answers. Returns matches sorted by score descending; scores are
 * capped at 99. A base of 50 is awarded to every pet, then bonuses for
 * species, temperament, kid-friendliness, size, and first-time experience.
 */
export function computeShelterMatches(
  answers: ShelterMatchAnswers,
  pets: ShelterPet[] = DEFAULT_PETS,
): ShelterMatch[] {
  return pets
    .map((pet) => {
      let score = 50;
      const reasons: string[] = [];

      if (answers.species === 'Any' || answers.species.toLowerCase() === pet.species.toLowerCase()) {
        score += 20;
        reasons.push(`Species match: ${pet.species}`);
      }
      if (answers.energy === 'Calm' && pet.temperament.includes('calm')) {
        score += 15;
        reasons.push('Temperament: calm');
      }
      if (answers.energy === 'Active' && (pet.temperament.includes('energetic') || pet.temperament.includes('active'))) {
        score += 15;
        reasons.push('Temperament: active');
      }
      if (answers.kids && pet.temperament.includes('kid-friendly')) {
        score += 15;
        reasons.push('Good with kids');
      }
      if (answers.size === 'Small' && ['Cat', 'Rabbit'].includes(pet.species)) {
        score += 10;
        reasons.push('Size match');
      }
      if (answers.size === 'Large' && pet.species === 'Dog') {
        score += 10;
        reasons.push('Size match');
      }
      if (answers.experience === 'First-time' && pet.age > 2) {
        score += 5;
        reasons.push('Mature & stable');
      }

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
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// --- Species identification -------------------------------------------------

export interface IdentifiableSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  category: string;
  conservationStatus: string;
  habitat?: string[];
}

/**
 * Substring search over a species dataset: matches common name, scientific
 * name, any habitat term, category, or conservation status. Returns the top
 * `limit` matches (default 6), in dataset order.
 */
export function identifySpecies(
  query: string,
  animals: IdentifiableSpecies[],
  limit = 6,
): IdentifiableSpecies[] {
  const q = query.toLowerCase();
  return animals
    .filter(
      (a) =>
        a.commonName.toLowerCase().includes(q) ||
        a.scientificName.toLowerCase().includes(q) ||
        a.habitat?.some((h) => h.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q) ||
        a.conservationStatus.toLowerCase().includes(q),
    )
    .slice(0, limit);
}

// --- Lost-pet ↔ found-pet matching ------------------------------------------

/** Beyond this distance (km) a lost/found pair is never considered a match. */
export const LOST_MATCH_MAX_KM = 60;

/**
 * Match a lost-pet report against a found-pet report. The species must match
 * and the found location must be within `LOST_MATCH_MAX_KM` of the last-seen
 * point; the score decays linearly from 100 (same spot) by 1.6 per km.
 */
export function matchLostToFound(
  lost: { species: string; lastSeen: GeoPoint },
  found: { species: string; location: GeoPoint },
): number {
  if (lost.species !== found.species) return 0;
  const distKm = greatCircleKm(lost.lastSeen, found.location);
  if (distKm > LOST_MATCH_MAX_KM) return 0;
  return Math.round(Math.max(0, 100 - distKm * 1.6));
}
