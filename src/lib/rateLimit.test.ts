import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit, getClientIp } from './rateLimit.ts';

test('allows requests under the limit', () => {
  const ip = '1.2.3.4';
  for (let i = 0; i < 5; i++) {
    const result = rateLimit(ip, 60_000, 5);
    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 5 - i - 1);
  }
});

test('blocks once the limit is reached', () => {
  const ip = '5.6.7.8';
  for (let i = 0; i < 5; i++) rateLimit(ip, 60_000, 5);
  const blocked = rateLimit(ip, 60_000, 5);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterSec >= 1);
});

test('tracks different IPs independently', () => {
  const ipA = '10.0.0.1';
  const ipB = '10.0.0.2';
  for (let i = 0; i < 3; i++) rateLimit(ipA, 60_000, 3);
  assert.equal(rateLimit(ipA, 60_000, 3).allowed, false);
  assert.equal(rateLimit(ipB, 60_000, 3).allowed, true);
});

test('expires entries after the window', async () => {
  const ip = '192.168.0.1';
  const windowMs = 50;
  assert.equal(rateLimit(ip, windowMs, 1).allowed, true);
  assert.equal(rateLimit(ip, windowMs, 1).allowed, false);
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(rateLimit(ip, windowMs, 1).allowed, true);
});

test('getClientIp prefers x-forwarded-for first value', () => {
  const request = new Request('http://localhost/api', {
    headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' },
  });
  assert.equal(getClientIp(request), '203.0.113.5');
});

test('getClientIp falls back to x-real-ip then unknown', () => {
  const withRealIp = new Request('http://localhost/api', {
    headers: { 'x-real-ip': '203.0.113.9' },
  });
  assert.equal(getClientIp(withRealIp), '203.0.113.9');

  const bare = new Request('http://localhost/api');
  assert.equal(getClientIp(bare), 'unknown');
});
