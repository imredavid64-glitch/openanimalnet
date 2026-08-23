import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadUserSightings, SIGHTING_STORAGE_KEY } from './userSightings.ts';

/** Minimal window + localStorage stand-in so the loader can be tested in Node. */
function stubStorage(initial: Record<string, string> | null = null) {
  let store: Record<string, string> = initial ?? {};
  (globalThis as any).window = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  };
}

test('loadUserSightings: empty when nothing is stored', () => {
  stubStorage();
  assert.deepEqual(loadUserSightings(), []);
});

test('loadUserSightings: returns valid stored sightings', () => {
  stubStorage({
    [SIGHTING_STORAGE_KEY]: JSON.stringify([
      { id: 's1', animalId: 'lion-001', species: 'African Lion', location: { lat: -2.3, lng: 35.0 }, timestamp: '2026-08-18T00:00:00Z', notes: 'Saw a pride', verified: false, reportedBy: 'A' },
      { id: 's2', animalId: 'cheetah-001', species: 'Cheetah', location: { lat: -19.3, lng: 22.5 }, timestamp: '2026-08-17T00:00:00Z', verified: true, reportedBy: 'B' },
    ]),
  });
  const result = loadUserSightings();
  assert.equal(result.length, 2);
  assert.equal(result[0].verified, false);
  assert.equal(result[1].verified, true);
  assert.equal(result[1].species, 'Cheetah');
});

test('loadUserSightings: drops entries with invalid or out-of-range coordinates', () => {
  stubStorage({
    [SIGHTING_STORAGE_KEY]: JSON.stringify([
      { id: 'bad1', location: { lat: 'nope', lng: 5 } },
      { id: 'bad2', location: { lat: 91, lng: 0 } },
      { id: 'bad3', location: { lat: 0, lng: -181 } },
      { id: 'bad4', location: null },
      { id: 'good', location: { lat: -66.7, lng: 140.0 }, verified: true },
    ]),
  });
  const result = loadUserSightings();
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'good');
});

test('loadUserSightings: corrupt JSON and wrong shapes fall back to empty', () => {
  stubStorage({ [SIGHTING_STORAGE_KEY]: '{not json' });
  assert.deepEqual(loadUserSightings(), []);
  stubStorage({ [SIGHTING_STORAGE_KEY]: JSON.stringify({ not: 'an array' }) });
  assert.deepEqual(loadUserSightings(), []);
  stubStorage({ [SIGHTING_STORAGE_KEY]: null as any });
  assert.deepEqual(loadUserSightings(), []);
});

test('loadUserSightings: server-side (no window) returns empty', () => {
  const saved = { window: (globalThis as any).window, localStorage: (globalThis as any).localStorage };
  delete (globalThis as any).window;
  delete (globalThis as any).localStorage;
  try {
    assert.deepEqual(loadUserSightings(), []);
  } finally {
    if (saved.window) (globalThis as any).window = saved.window;
    if (saved.localStorage) (globalThis as any).localStorage = saved.localStorage;
  }
});
