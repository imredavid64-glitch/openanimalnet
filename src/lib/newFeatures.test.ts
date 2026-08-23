import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchAudioSignature } from './acoustics';
import { RANGER_QUESTIONS, RANGER_BADGES } from './challenge';
import { BIOMES } from './habitat';
import { exportSpeciesGeoJSON, exportSpeciesCSV } from './exportUtils';

test('acoustics: matches frequency to signature correctly', () => {
  const matches = matchAudioSignature(250);
  assert.ok(matches.length > 0);
  assert.equal(matches[0].signature.speciesId, 'humpback-whale');
  assert.ok(matches[0].matchScore > 80);
});

test('challenge: questions and badges are well-formed', () => {
  assert.ok(RANGER_QUESTIONS.length >= 5);
  assert.ok(RANGER_BADGES.length >= 3);
  RANGER_QUESTIONS.forEach((q) => {
    assert.ok(q.options.includes(q.correctAnswer));
  });
});

test('habitat: biomes have key species and temperature ranges', () => {
  assert.ok(BIOMES.length >= 4);
  BIOMES.forEach((b) => {
    assert.ok(b.keySpecies.length > 0);
    assert.equal(b.temperatureRangeC.length, 2);
  });
});

test('exportUtils: GeoJSON and CSV formats export successfully', () => {
  const geojson = exportSpeciesGeoJSON();
  assert.equal(geojson.type, 'FeatureCollection');
  assert.ok(geojson.features.length > 0);

  const csv = exportSpeciesCSV();
  assert.ok(typeof csv === 'string');
  const lines = csv.split('\n');
  assert.ok(lines.length > 1);
  assert.ok(lines[0].includes('commonName'));
});
