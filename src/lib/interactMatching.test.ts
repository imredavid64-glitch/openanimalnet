import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeShelterMatches,
  identifySpecies,
  matchLostToFound,
  LOST_MATCH_MAX_KM,
} from './interactMatching.ts';
import type { IdentifiableSpecies, ShelterPet, ShelterMatchAnswers } from './interactMatching.ts';

// --- Shelter matching -------------------------------------------------------

const NEUTRAL: ShelterMatchAnswers = { species: 'Any', size: 'Any', energy: 'Any', kids: false, experience: 'Experienced' };

test('computeShelterMatches: neutral answers award the base score to every pet', () => {
  const results = computeShelterMatches(NEUTRAL);
  assert.equal(results.length, 8);
  // 'Any' species still grants the +20 species bonus, so every pet scores 70.
  for (const m of results) {
    assert.equal(m.matchScore, 70);
    assert.equal(m.adopted, false);
  }
  // Sorted descending.
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i - 1].matchScore >= results[i].matchScore);
  }
});

test('computeShelterMatches: species preference ranks the chosen species first', () => {
  const results = computeShelterMatches({ ...NEUTRAL, species: 'Cat' });
  const cats = results.filter((m) => m.species === 'Cat');
  const dogs = results.filter((m) => m.species === 'Dog');
  assert.equal(cats.length, 3);
  assert.equal(dogs.length, 4);
  assert.equal(cats[0].matchScore, 70); // 50 base + 20 species
  assert.equal(dogs[0].matchScore, 50); // no species bonus
  assert.equal(results[0].species, 'Cat');
  // Every cat outranks every dog.
  assert.ok(cats[2].matchScore > dogs[0].matchScore);
});

test('computeShelterMatches: calm-energy pets are boosted', () => {
  const results = computeShelterMatches({ ...NEUTRAL, species: 'Cat', energy: 'Calm' });
  const byName = Object.fromEntries(results.map((m) => [m.petName, m.matchScore]));
  assert.equal(byName['Shadow'], 85); // calm cat: 50 + 20 + 15
  assert.equal(byName['Whiskers'], 85);
  assert.equal(byName['Cleo'], 70); // vocal/social/playful — no calm bonus
});

test('computeShelterMatches: kid-friendly pets are boosted when kids are present', () => {
  const results = computeShelterMatches({ ...NEUTRAL, species: 'Dog', kids: true });
  const byName = Object.fromEntries(results.map((m) => [m.petName, m.matchScore]));
  assert.equal(byName['Luna'], 85); // 50 + 20 species + 15 kids
  assert.equal(byName['Rex'], 85);
  assert.equal(byName['Max'], 70); // loyal/protective/active — no kids bonus
  assert.equal(byName['Buddy'], 70);
});

test('computeShelterMatches: size preference boosts cats/rabbits for Small', () => {
  const results = computeShelterMatches({ ...NEUTRAL, species: 'Cat', size: 'Small' });
  const byName = Object.fromEntries(results.map((m) => [m.petName, m.matchScore]));
  assert.equal(byName['Shadow'], 80); // cat + small: 50 + 20 + 10
  assert.equal(byName['Milo'], 60); // rabbit + small, no species bonus: 50 + 10
  assert.equal(byName['Luna'], 50); // dog, no bonuses at all
});

test('computeShelterMatches: first-time adopters get a mature-pet bonus', () => {
  const results = computeShelterMatches({ ...NEUTRAL, species: 'Dog', experience: 'First-time' });
  const byName = Object.fromEntries(results.map((m) => [m.petName, m.matchScore]));
  assert.equal(byName['Max'], 75); // age 5 > 2: 50 + 20 + 5
  assert.equal(byName['Buddy'], 70); // age 1: no bonus
});

test('computeShelterMatches: score is capped at 99', () => {
  const perfect: ShelterPet = {
    id: 'p1', name: 'Perfect', species: 'Dog', breed: 'Test', age: 5,
    temperament: ['energetic', 'kid-friendly'], shelter: 'S', contact: '1',
  };
  const answers: ShelterMatchAnswers = {
    species: 'Dog', size: 'Large', energy: 'Active', kids: true, experience: 'First-time',
  };
  // Raw score 50 + 20 + 15 + 15 + 10 + 5 = 115 → clamped to 99.
  const results = computeShelterMatches(answers, [perfect]);
  assert.equal(results[0].matchScore, 99);
});

test('computeShelterMatches: reasons describe each awarded bonus', () => {
  const results = computeShelterMatches({ ...NEUTRAL, species: 'Dog', size: 'Large', kids: true });
  const luna = results.find((m) => m.petName === 'Luna')!;
  assert.deepEqual(luna.matchReasons, ['Species match: Dog', 'Good with kids', 'Size match']);
});

test('computeShelterMatches: accepts a custom pet registry', () => {
  const custom: ShelterPet[] = [
    { id: 'x1', name: 'Rex', species: 'Cat', breed: 'Test', age: 1, temperament: [], shelter: 'S', contact: '1' },
  ];
  const results = computeShelterMatches({ ...NEUTRAL, species: 'Cat' }, custom);
  assert.equal(results.length, 1);
  assert.equal(results[0].petId, 'x1');
  assert.equal(results[0].matchScore, 70);
  assert.equal(computeShelterMatches(NEUTRAL, []).length, 0);
});

// --- Species identification -------------------------------------------------

const SPECIES: IdentifiableSpecies[] = [
  { id: 'lion-001', commonName: 'African Lion', scientificName: 'Panthera leo', category: 'mammals', conservationStatus: 'VU', habitat: ['savanna', 'grassland'] },
  { id: 'tiger-001', commonName: 'Bengal Tiger', scientificName: 'Panthera tigris', category: 'mammals', conservationStatus: 'EN', habitat: ['forest', 'mangrove'] },
  { id: 'penguin-001', commonName: 'African Penguin', scientificName: 'Spheniscus demersus', category: 'birds', conservationStatus: 'CR', habitat: ['coast', 'island'] },
  { id: 'axolotl-001', commonName: 'Axolotl', scientificName: 'Ambystoma mexicanum', category: 'amphibians', conservationStatus: 'CR', habitat: ['freshwater'] },
  { id: 'vaquita-001', commonName: 'Vaquita', scientificName: 'Phocoena sinus', category: 'mammals', conservationStatus: 'CR', habitat: ['coastal'] },
  { id: 'elephant-001', commonName: 'African Bush Elephant', scientificName: 'Loxodonta africana', category: 'mammals', conservationStatus: 'EN', habitat: ['savanna', 'forest', 'desert'] },
  { id: 'bee-001', commonName: 'Western Honey Bee', scientificName: 'Apis mellifera', category: 'insects', conservationStatus: 'DD', habitat: ['meadow', 'forest'] },
];

test('identifySpecies: matches by common name', () => {
  const r = identifySpecies('lion', SPECIES);
  assert.deepEqual(r.map((s) => s.id), ['lion-001']);
});

test('identifySpecies: matches by scientific name', () => {
  const r = identifySpecies('panthera', SPECIES);
  assert.deepEqual(r.map((s) => s.id), ['lion-001', 'tiger-001']);
});

test('identifySpecies: matches by habitat', () => {
  const r = identifySpecies('savanna', SPECIES);
  assert.deepEqual(r.map((s) => s.id), ['lion-001', 'elephant-001']);
});

test('identifySpecies: matches by category', () => {
  const r = identifySpecies('insects', SPECIES);
  assert.deepEqual(r.map((s) => s.id), ['bee-001']);
});

test('identifySpecies: matches by conservation status code', () => {
  const r = identifySpecies('cr', SPECIES);
  assert.deepEqual(r.map((s) => s.id), ['penguin-001', 'axolotl-001', 'vaquita-001']);
});

test('identifySpecies: case-insensitive query', () => {
  const r = identifySpecies('PENGUIN', SPECIES);
  assert.deepEqual(r.map((s) => s.id), ['penguin-001']);
});

test('identifySpecies: empty query returns the first `limit` species', () => {
  const r = identifySpecies('', SPECIES);
  assert.equal(r.length, 6); // default limit, all 7 match
  assert.equal(r[0].id, 'lion-001');
});

test('identifySpecies: respects a custom limit', () => {
  assert.equal(identifySpecies('cr', SPECIES, 2).length, 2);
  assert.equal(identifySpecies('zzzz', SPECIES).length, 0);
});

// --- Lost-pet ↔ found-pet matching ------------------------------------------

test('matchLostToFound: species must match', () => {
  const dog = { species: 'dog', lastSeen: { latitude: -1.2921, longitude: 36.8219 } };
  const cat = { species: 'cat', location: { latitude: -1.2921, longitude: 36.8219 } };
  assert.equal(matchLostToFound(dog, cat), 0);
});

test('matchLostToFound: same location is a 100% match', () => {
  const p = { latitude: -1.2921, longitude: 36.8219 };
  assert.equal(matchLostToFound({ species: 'dog', lastSeen: p }, { species: 'dog', location: p }), 100);
});

test('matchLostToFound: Bella (Westlands) vs found dog (Nairobi) scores high', () => {
  // Real sample data: ~6.5 km apart → 100 − 6.5·1.6 ≈ 90.
  const lost = { species: 'dog', lastSeen: { latitude: -1.2921, longitude: 36.8219 } };
  const found = { species: 'dog', location: { latitude: -1.3105, longitude: 36.7661 } };
  const score = matchLostToFound(lost, found);
  assert.ok(score > 85 && score <= 90, `expected ~90, got ${score}`);
});

test('matchLostToFound: beyond the radius is a non-match', () => {
  // Amboseli found report is ~200 km from Bella's Westlands last-seen.
  const lost = { species: 'dog', lastSeen: { latitude: -1.2921, longitude: 36.8219 } };
  const far = { species: 'dog', location: { latitude: -2.78, longitude: 37.55 } };
  assert.equal(matchLostToFound(lost, far), 0);
});

test('matchLostToFound: score decays linearly with distance', () => {
  // 0.5° of longitude at the equator ≈ 55.6 km → 100 − 55.6·1.6 ≈ 11.
  const lost = { species: 'dog', lastSeen: { latitude: 0, longitude: 0 } };
  const near = { species: 'dog', location: { latitude: 0, longitude: 0.5 } };
  assert.equal(matchLostToFound(lost, near), 11);
  // 0.55° ≈ 61.2 km — just beyond the 60 km cutoff.
  const beyond = { species: 'dog', location: { latitude: 0, longitude: 0.55 } };
  assert.equal(matchLostToFound(lost, beyond), 0);
});

test('matchLostToFound: max distance constant is 60 km', () => {
  assert.equal(LOST_MATCH_MAX_KM, 60);
});
