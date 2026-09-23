import { test, describe } from 'node:test';
import assert from 'node:assert';
import { threatFactors, primaryThreatMatches } from '../data/sample/threat-factors.ts';
import { sampleAnimals } from '../data/sample/animals.ts';

describe('threat-factors dataset', () => {
  test('covers all 42 species in sampleAnimals', () => {
    const animalIds = new Set(sampleAnimals.map(a => a.id));
    assert.strictEqual(threatFactors.length, animalIds.size);
    for (const f of threatFactors) {
      assert.ok(animalIds.has(f.animalId));
    }
  });

  test('every factor has scores within 0–100', () => {
    for (const f of threatFactors) {
      assert.ok(f.poaching >= 0 && f.poaching <= 100);
      assert.ok(f.climate >= 0 && f.climate <= 100);
      assert.ok(f.habitatLoss >= 0 && f.habitatLoss <= 100);
      assert.ok(f.invasiveSpecies >= 0 && f.invasiveSpecies <= 100);
    }
  });

  test('primaryThreat is one of the max-scored dimensions', () => {
    for (const f of threatFactors) {
      assert.ok(primaryThreatMatches(f));
    }
  });

  test('primaryThreat is a valid dimension', () => {
    const valid = ['poaching', 'climate', 'habitatLoss', 'invasiveSpecies'];
    for (const f of threatFactors) {
      assert.ok(valid.includes(f.primaryThreat));
    }
  });

  test('rationale is a non-empty string', () => {
    for (const f of threatFactors) {
      assert.ok(typeof f.rationale === 'string');
      assert.ok(f.rationale.length > 10);
    }
  });

  test('commonName matches the animal in sampleAnimals', () => {
    for (const f of threatFactors) {
      const animal = sampleAnimals.find(a => a.id === f.animalId);
      assert.ok(animal);
      assert.strictEqual(animal?.commonName, f.commonName);
    }
  });
});