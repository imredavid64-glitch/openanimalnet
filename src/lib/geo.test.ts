import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  greatCircleKm,
  routeDistanceKm,
  formatKm,
  formatDurationDays,
  distanceToSegmentKm,
  distanceToRouteKm,
} from './geo.ts';

test('greatCircleKm: zero distance for identical points', () => {
  assert.equal(greatCircleKm({ latitude: 10, longitude: 20 }, { latitude: 10, longitude: 20 }), 0);
});

test('greatCircleKm: quarter circumference is ~10,000 km (equator)', () => {
  const km = greatCircleKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 90 });
  // 90° of longitude at the equator ≈ 10,019 km
  assert.ok(Math.abs(km - 10019) < 15, `expected ~10019 km, got ${km}`);
});

test('greatCircleKm: pole-to-pole is ~20,000 km', () => {
  const km = greatCircleKm({ latitude: 90, longitude: 0 }, { latitude: -90, longitude: 0 });
  assert.ok(Math.abs(km - 20015) < 20, `expected ~20015 km, got ${km}`);
});

test('greatCircleKm: symmetric (a->b same as b->a)', () => {
  const a = { latitude: 12.5, longitude: -45 };
  const b = { latitude: -33.9, longitude: 151.2 };
  assert.ok(Math.abs(greatCircleKm(a, b) - greatCircleKm(b, a)) < 1e-9);
});

test('routeDistanceKm: single segment equals greatCircleKm', () => {
  const a = { latitude: 64.1, longitude: -21.9 };
  const b = { latitude: 30, longitude: -30 };
  assert.equal(routeDistanceKm([a, b]), greatCircleKm(a, b));
});

test('routeDistanceKm: multi-point route is the sum of its segments', () => {
  const pts = [
    { latitude: 64.1, longitude: -21.9 },
    { latitude: 30, longitude: -30 },
    { latitude: -20, longitude: -10 },
    { latitude: -65, longitude: -30 },
  ];
  let expected = 0;
  for (let i = 0; i < pts.length - 1; i++) expected += greatCircleKm(pts[i], pts[i + 1]);
  assert.equal(routeDistanceKm(pts), expected);
});

test('routeDistanceKm: Arctic tern fall leg spans roughly pole to pole (~15,000+ km)', () => {
  const km = routeDistanceKm([
    { latitude: 64.1, longitude: -21.9 },
    { latitude: 30, longitude: -30 },
    { latitude: -20, longitude: -10 },
    { latitude: -65, longitude: -30 },
  ]);
  assert.ok(km > 15000 && km < 18000, `expected ~16,000 km, got ${km}`);
});

test('formatKm: thousands get commas, millions are compact', () => {
  assert.equal(formatKm(12345), '~12,345 km');
  assert.equal(formatKm(16000000), '~16.0M km');
});

test('formatDurationDays: days and months', () => {
  assert.equal(formatDurationDays(30), '~30 days');
  assert.equal(formatDurationDays(90), '~3 months');
  assert.equal(formatDurationDays(75), '~3 months');
});

test('distanceToSegmentKm: point on the segment is ~0', () => {
  const a = { latitude: 0, longitude: 0 };
  const b = { latitude: 0, longitude: 10 };
  const on = { latitude: 0, longitude: 5 };
  assert.ok(distanceToSegmentKm(on, a, b) < 1);
});

test('distanceToSegmentKm: offset from a parallel is the meridian distance', () => {
  const a = { latitude: 0, longitude: 0 };
  const b = { latitude: 0, longitude: 10 };
  const off = { latitude: 1, longitude: 5 }; // ~111 km north of the segment
  const d = distanceToSegmentKm(off, a, b);
  assert.ok(d > 100 && d < 125, `expected ~111 km, got ${d}`);
});

test('distanceToRouteKm: nearest point beyond the segment clamps to the endpoint', () => {
  const pts = [{ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 10 }];
  const beyond = { latitude: 0, longitude: 15 }; // 5° east of the far endpoint ≈ 556 km
  const d = distanceToRouteKm(beyond, pts);
  assert.ok(d > 500 && d < 620, `expected ~556 km, got ${d}`);
});

test('distanceToRouteKm: empty route is infinity', () => {
  assert.equal(distanceToRouteKm({ latitude: 0, longitude: 0 }, []), Number.POSITIVE_INFINITY);
});
