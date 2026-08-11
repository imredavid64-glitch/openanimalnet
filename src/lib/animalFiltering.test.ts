import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortAnimals } from './animalFiltering.ts';
import type { Animal } from '../types/animal/types.ts';

const baseAnimal = (overrides: Partial<Animal>): Animal => ({
  id: 'test-001',
  commonName: 'Test Animal',
  scientificName: 'Testus animalis',
  category: 'mammals',
  conservationStatus: 'LC',
  taxonomy: {
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Testudines',
    family: 'Testidae',
    genus: 'Testus',
    species: 'animalis',
  },
  location: {
    latitude: 0,
    longitude: 0,
    timestamp: new Date('2024-01-01'),
    source: 'test',
  },
  habitat: ['forest'],
  populationEstimate: 100,
  isMonitored: false,
  lastUpdated: new Date('2024-01-01'),
  dataCategories: ['biological', 'population'],
  ...overrides,
});

const sample = [
  baseAnimal({
    id: 'lion',
    commonName: 'African Lion',
    scientificName: 'Panthera leo',
    category: 'mammals',
    conservationStatus: 'VU',
    populationEstimate: 20000,
    isMonitored: true,
  }),
  baseAnimal({
    id: 'eagle',
    commonName: 'Bald Eagle',
    scientificName: 'Haliaeetus leucocephalus',
    category: 'birds',
    conservationStatus: 'LC',
    populationEstimate: 316700,
    isMonitored: true,
    habitat: ['coastal', 'lake'],
    dataCategories: ['biological', 'behavioral', 'ecological', 'population'],
  }),
  baseAnimal({
    id: 'whale',
    commonName: 'Blue Whale',
    scientificName: 'Balaenoptera musculus',
    category: 'marine',
    conservationStatus: 'EN',
    populationEstimate: 10000,
    isMonitored: false,
    habitat: ['open ocean', 'deep sea'],
  }),
];

test('returns all animals with no filters', () => {
  const result = filterAndSortAnimals(sample, {}, '', 'name', 'asc');
  assert.equal(result.length, 3);
});

test('filters by category', () => {
  const result = filterAndSortAnimals(sample, { categories: ['mammals'] }, '', 'name', 'asc');
  assert.deepEqual(result.map((a) => a.id), ['lion']);
});

test('filters by conservation status', () => {
  const result = filterAndSortAnimals(sample, { conservationStatus: ['EN', 'VU'] }, '', 'name', 'asc');
  assert.deepEqual(result.map((a) => a.id), ['lion', 'whale']);
});

test('filters by data category', () => {
  const result = filterAndSortAnimals(
    sample,
    { dataCategories: ['behavioral'] },
    '',
    'name',
    'asc'
  );
  assert.deepEqual(result.map((a) => a.id), ['eagle']);
});

test('filters by monitored status', () => {
  const result = filterAndSortAnimals(sample, { isMonitored: true }, '', 'name', 'asc');
  assert.deepEqual(result.map((a) => a.id), ['lion', 'eagle']);
});

test('search matches common name (case-insensitive)', () => {
  const result = filterAndSortAnimals(sample, {}, 'BLUE', 'name', 'asc');
  assert.deepEqual(result.map((a) => a.id), ['whale']);
});

test('search matches habitat', () => {
  const result = filterAndSortAnimals(sample, {}, 'coastal', 'name', 'asc');
  assert.deepEqual(result.map((a) => a.id), ['eagle']);
});

test('search matches scientific name', () => {
  const result = filterAndSortAnimals(sample, {}, 'haliaeetus', 'name', 'asc');
  assert.deepEqual(result.map((a) => a.id), ['eagle']);
});

test('sorts by population ascending and descending', () => {
  const asc = filterAndSortAnimals(sample, {}, '', 'population', 'asc');
  assert.deepEqual(asc.map((a) => a.id), ['whale', 'lion', 'eagle']);

  const desc = filterAndSortAnimals(sample, {}, '', 'population', 'desc');
  assert.deepEqual(desc.map((a) => a.id), ['eagle', 'lion', 'whale']);
});

test('sorts by conservation severity (EN before VU before LC)', () => {
  const result = filterAndSortAnimals(sample, {}, '', 'status', 'asc');
  assert.deepEqual(result.map((a) => a.id), ['whale', 'lion', 'eagle']);
});

test('sorts by monitored status (unmonitored first, stable within groups)', () => {
  const asc = filterAndSortAnimals(sample, {}, '', 'monitored', 'asc');
  assert.deepEqual(asc.map((a) => a.id), ['whale', 'lion', 'eagle']);
});

test('combines filters and search', () => {
  const result = filterAndSortAnimals(
    sample,
    { isMonitored: true, categories: ['mammals', 'birds'] },
    'eagle',
    'name',
    'asc'
  );
  assert.deepEqual(result.map((a) => a.id), ['eagle']);
});

test('does not mutate the input array', () => {
  const input = [...sample];
  filterAndSortAnimals(input, { categories: ['marine'] }, '', 'name', 'asc');
  assert.equal(input.length, 3);
});
