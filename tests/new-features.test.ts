// Tests for the new API routes added in the feature sprint.
// They hit a RUNNING server (next start / next dev).
//
// Usage:
//   API_BASE_URL=http://localhost:3002 npm run test:api
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3100';

interface ApiEnvelope {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

async function getJson(path: string): Promise<{ status: number; body: ApiEnvelope; headers: Headers }> {
  const res = await fetch(`${BASE_URL}${path}`);
  const body = (await res.json()) as ApiEnvelope;
  return { status: res.status, body, headers: res.headers };
}

async function postJson(path: string, data: unknown): Promise<{ status: number; body: ApiEnvelope }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = (await res.json()) as ApiEnvelope;
  return { status: res.status, body };
}

async function deleteJson(path: string): Promise<{ status: number; body: ApiEnvelope }> {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE' });
  const body = (await res.json()) as ApiEnvelope;
  return { status: res.status, body };
}

// ─── Search ───────────────────────────────────────────────

test('GET /api/v1/search returns results for known species', async () => {
  const { status, body } = await getJson('/api/v1/search?q=lion');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  const data = body.data as { results: unknown[]; sources: Record<string, number> };
  assert.ok(data.results.length > 0, 'expected at least one result');
  assert.ok(data.sources, 'expected sources object');
});

test('GET /api/v1/search returns empty for gibberish', async () => {
  const { status, body } = await getJson('/api/v1/search?q=xyzzyzzzzz');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  const data = body.data as { results: unknown[] };
  assert.equal(data.results.length, 0);
});

// ─── Identify ─────────────────────────────────────────────

test('POST /api/v1/identify returns matches for valid image', async () => {
  // Send a minimal 1x1 PNG as base64
  const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const { status, body } = await postJson('/api/v1/identify', { image: tinyPng, topK: 3 });
  assert.equal(status, 200);
  assert.equal(body.success, true);
  const results = body.data as { confidence: number; commonName: string }[];
  assert.ok(results.length > 0 && results.length <= 3);
  assert.ok(results[0].commonName, 'expected commonName');
  assert.ok(typeof results[0].confidence === 'number');
});

test('POST /api/v1/identify rejects missing image', async () => {
  const { status, body } = await postJson('/api/v1/identify', {});
  assert.equal(status, 400);
  assert.equal(body.success, false);
});

// ─── Subscriptions ────────────────────────────────────────

test('POST /api/v1/subscriptions creates a subscription', async () => {
  const { status, body } = await postJson('/api/v1/subscriptions', {
    email: 'test@example.com',
    speciesIds: ['lion-001'],
    alertTypes: ['critical'],
  });
  assert.equal(status, 201);
  assert.equal(body.success, true);
  const sub = body.data as { id: string; email: string };
  assert.ok(sub.id, 'expected id');
  assert.equal(sub.email, 'test@example.com');
});

test('GET /api/v1/subscriptions returns subscriptions for email', async () => {
  const { status, body } = await getJson('/api/v1/subscriptions?email=test@example.com');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  const subs = body.data as { email: string }[];
  assert.ok(subs.length > 0);
  assert.equal(subs[0].email, 'test@example.com');
});

test('DELETE /api/v1/subscriptions removes a subscription', async () => {
  // Create then delete
  const created = await postJson('/api/v1/subscriptions', {
    email: 'delete@example.com',
    speciesIds: ['tiger-001'],
    alertTypes: ['warning'],
  });
  const subId = (created.body.data as { id: string }).id;
  const { status, body } = await deleteJson(`/api/v1/subscriptions?id=${subId}`);
  assert.equal(status, 200);
  assert.equal(body.success, true);
});

// ─── Annotations ──────────────────────────────────────────

test('POST /api/v1/annotations creates an annotation', async () => {
  const { status, body } = await postJson('/api/v1/annotations', {
    animalId: 'lion-001',
    author: 'testuser',
    content: 'Observed hunting at dusk.',
    category: 'observation',
  });
  assert.equal(status, 201);
  assert.equal(body.success, true);
  const ann = body.data as { id: string; author: string };
  assert.ok(ann.id);
  assert.equal(ann.author, 'testuser');
});

test('GET /api/v1/annotations returns annotations for species', async () => {
  const { status, body } = await getJson('/api/v1/annotations?animalId=lion-001');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  const anns = body.data as { animalId: string }[];
  assert.ok(anns.length > 0);
  assert.equal(anns[0].animalId, 'lion-001');
});

// ─── Webhooks ─────────────────────────────────────────────

test('POST /api/v1/webhooks registers a webhook', async () => {
  const { status, body } = await postJson('/api/v1/webhooks', {
    url: 'https://example.com/hook',
    events: ['alert.critical'],
  });
  assert.equal(status, 201);
  assert.equal(body.success, true);
  const wh = body.data as { id: string; url: string };
  assert.ok(wh.id);
  assert.equal(wh.url, 'https://example.com/hook');
});

test('GET /api/v1/webhooks lists webhooks', async () => {
  const { status, body } = await getJson('/api/v1/webhooks');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  const whs = body.data as { url: string }[];
  assert.ok(whs.length > 0);
});

// ─── Export ───────────────────────────────────────────────

test('GET /api/v1/export returns GeoJSON by default', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/export`);
  assert.equal(res.status, 200);
  const ct = res.headers.get('content-type') ?? '';
  assert.ok(ct.includes('json') || ct.includes('geojson'), `expected JSON content type, got ${ct}`);
  const body = await res.json();
  assert.equal(body.type, 'FeatureCollection');
  assert.ok(Array.isArray(body.features));
  assert.ok(body.features.length > 0);
});

test('GET /api/v1/export returns CSV when format=csv', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/export?format=csv`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('commonName'), 'CSV should contain header');
  const lines = text.trim().split('\n');
  assert.ok(lines.length > 1, 'CSV should have data rows');
});

// ─── Feed ─────────────────────────────────────────────────

test('GET /api/v1/feed returns Atom feed by default', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/feed`);
  assert.equal(res.status, 200);
  const ct = res.headers.get('content-type') ?? '';
  assert.ok(ct.includes('atom+xml'), `expected Atom content type, got ${ct}`);
  const text = await res.text();
  assert.ok(text.includes('<feed'), 'should be an Atom feed');
  assert.ok(text.includes('<entry'), 'should contain entries');
});

test('GET /api/v1/feed?format=rss returns RSS feed', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/feed?format=rss`);
  assert.equal(res.status, 200);
  const ct = res.headers.get('content-type') ?? '';
  assert.ok(ct.includes('rss+xml'), `expected RSS content type, got ${ct}`);
  const text = await res.text();
  assert.ok(text.includes('<rss'), 'should be an RSS feed');
  assert.ok(text.includes('<item'), 'should contain items');
});

// ─── AI Chat ──────────────────────────────────────────────

test('GET /api/v1/ai/chat returns aiConfigured status', async () => {
  const { status, body } = await getJson('/api/v1/ai/chat');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(typeof body.data === 'object');
  assert.ok('aiConfigured' in (body.data as object));
});

test('POST /api/v1/ai/chat returns 501 when GEMINI_API_KEY not set', async () => {
  const { status, body } = await postJson('/api/v1/ai/chat', { query: 'Hello' });
  assert.equal(status, 501);
  assert.equal(body.success, false);
  assert.equal(body.code, 'AI_DISABLED');
});

test('POST /api/v1/ai/chat rejects missing query', async () => {
  const { status, body } = await postJson('/api/v1/ai/chat', {});
  assert.equal(status, 400);
  assert.equal(body.success, false);
});