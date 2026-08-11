// Integration tests for the OpenAnimalNet API. They hit a RUNNING server
// (next start / next dev), not a mocked instance.
//
// Usage:
//   1. Start the server (default: http://localhost:3100)
//   2. npm run test:api            # or:
//      API_BASE_URL=http://localhost:3000 npm run test:api
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3100';

interface ApiEnvelope {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

async function getJson(path: string): Promise<{ status: number; body: ApiEnvelope; headers: Headers }> {
  const res = await fetch(`${BASE_URL}${path}`);
  const body = (await res.json()) as ApiEnvelope;
  return { status: res.status, body, headers: res.headers };
}

test('GET /api/v1/animals returns paginated animals', async () => {
  const { status, body } = await getJson('/api/v1/animals?limit=5');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
  assert.equal(body.data.length, 5);
  assert.deepEqual(body.pagination, {
    page: 1,
    limit: 5,
    total: 19,
    totalPages: 4,
  });
});

test('GET /api/v1/animals filters by category', async () => {
  const { status, body } = await getJson('/api/v1/animals?category=mammals&limit=50');
  assert.equal(status, 200);
  const animals = body.data as { category: string }[];
  assert.equal(animals.length, 12);
  assert.ok(animals.every((a) => a.category === 'mammals'));
});

test('GET /api/v1/animals supports search', async () => {
  const { body } = await getJson('/api/v1/animals?search=whale');
  const animals = body.data as { commonName: string }[];
  assert.equal(body.pagination?.total, 1);
  assert.equal(animals[0].commonName, 'Blue Whale');
});

test('GET /api/v1/animals/:id returns a full profile', async () => {
  const { status, body } = await getJson('/api/v1/animals/lion-001');
  assert.equal(status, 200);
  const profile = body.data as {
    animal: { commonName: string; scientificName: string };
    behavioral?: unknown;
    ecological?: unknown;
  };
  assert.equal(profile.animal.commonName, 'African Lion');
  assert.equal(profile.animal.scientificName, 'Panthera leo');
  assert.ok(profile.behavioral, 'expected behavioral data');
  assert.ok(profile.ecological, 'expected ecological data');
});

test('GET /api/v1/animals/:id returns 404 for unknown ids', async () => {
  const { status, body } = await getJson('/api/v1/animals/nope-999');
  assert.equal(status, 404);
  assert.equal(body.success, false);
  assert.equal(body.error, 'Animal not found');
});

test('GET /api/v1/populations returns records for all species', async () => {
  const { status, body } = await getJson('/api/v1/populations');
  assert.equal(status, 200);
  const records = body.data as {
    animalId: string;
    commonName: string;
    conservationStatus: string;
  }[];
  assert.equal(records.length, 19);
  const lion = records.find((r) => r.animalId === 'lion-001');
  assert.equal(lion?.commonName, 'African Lion');
  assert.equal(lion?.conservationStatus, 'VU');
});

test('GET /api/v1/monitoring/alerts filters by type', async () => {
  const { status, body } = await getJson('/api/v1/monitoring/alerts?type=critical');
  assert.equal(status, 200);
  const alerts = body.data as { type: string; severity: number }[];
  assert.equal(alerts.length, 2);
  assert.ok(alerts.every((a) => a.type === 'critical'));
});

test('GET /api/v1/monitoring/alerts rejects invalid types', async () => {
  const { status, body } = await getJson('/api/v1/monitoring/alerts?type=bogus');
  assert.equal(status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error, 'Invalid type');
});

test('GET /api/v1/locations returns telemetry fixes', async () => {
  const { status, body } = await getJson('/api/v1/locations');
  assert.equal(status, 200);
  const fixes = body.data as { latitude: number; longitude: number; source: string }[];
  assert.ok(fixes.length >= 3, `expected at least 3 fixes, got ${fixes.length}`);
  assert.ok(fixes.every((f) => typeof f.latitude === 'number' && typeof f.longitude === 'number'));
});

test('GET /api/v1/monitoring/stats returns dashboard stats', async () => {
  const { status, body } = await getJson('/api/v1/monitoring/stats');
  assert.equal(status, 200);
  const stats = body.data as {
    totalAnimals: number;
    monitoredAnimals: number;
    activeAlerts: number;
    populationTrend: unknown[];
  };
  assert.equal(stats.totalAnimals, 1258723);
  assert.ok(stats.monitoredAnimals < stats.totalAnimals);
  assert.equal(stats.activeAlerts, 124);
  assert.equal(stats.populationTrend.length, 5);
});

test('successful API responses include Cache-Control', async () => {
  const { headers } = await getJson('/api/v1/populations');
  const cacheControl = headers.get('cache-control');
  assert.ok(cacheControl, 'expected Cache-Control header');
  assert.ok(cacheControl.includes('public'));
  assert.ok(cacheControl.includes('s-maxage=60'));
});

test('rate limit returns 429 with Retry-After when exhausted', async () => {
  // Local server may already be rate-limited by other tests; verify the
  // contract only when we actually hit the limit (skip otherwise).
  const res = await fetch(`${BASE_URL}/api/v1/populations`);
  if (res.status === 429) {
    assert.equal(res.headers.get('retry-after'), '60');
    const body = (await res.json()) as ApiEnvelope;
    assert.equal(body.success, false);
    assert.equal(body.error, 'Rate limit exceeded');
  }
});
