import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  observationRecency,
  recencyColor,
  RECENCY_COLORS,
  RECENCY_LABELS,
} from './observations.ts';

const DAY = 86_400_000;

/** ISO timestamp `msAgo` milliseconds before now. */
function iso(msAgo: number): string {
  return new Date(Date.now() - msAgo).toISOString();
}

test('observationRecency: no date is "old"', () => {
  assert.equal(observationRecency(undefined), 'old');
  assert.equal(observationRecency(''), 'old');
});

test('observationRecency: unparseable dates are "old"', () => {
  assert.equal(observationRecency('not-a-date'), 'old');
});

test('observationRecency: fresh observations fall in the week band', () => {
  assert.equal(observationRecency(iso(0)), 'week');
  assert.equal(observationRecency(iso(1 * DAY)), 'week');
  assert.equal(observationRecency(iso(7 * DAY - 60_000)), 'week'); // just under 7 days
});

test('observationRecency: the month band starts just after a week', () => {
  assert.equal(observationRecency(iso(7 * DAY + 60_000)), 'month');
  assert.equal(observationRecency(iso(30 * DAY - 60_000)), 'month'); // just under 30 days
});

test('observationRecency: the year band starts just after 30 days', () => {
  assert.equal(observationRecency(iso(30 * DAY + 60_000)), 'year');
  assert.equal(observationRecency(iso(365 * DAY - 60_000)), 'year'); // just under a year
});

test('observationRecency: older than a year is "old"', () => {
  assert.equal(observationRecency(iso(365 * DAY + 60_000)), 'old');
  assert.equal(observationRecency(iso(5 * 365 * DAY)), 'old');
});

test('observationRecency: future-dated records are treated as fresh', () => {
  assert.equal(observationRecency(iso(-DAY)), 'week');
});

test('recencyColor: maps each band to its documented color', () => {
  assert.equal(recencyColor(iso(1 * DAY)), RECENCY_COLORS.week);
  assert.equal(recencyColor(iso(10 * DAY)), RECENCY_COLORS.month);
  assert.equal(recencyColor(iso(100 * DAY)), RECENCY_COLORS.year);
  assert.equal(recencyColor(undefined), RECENCY_COLORS.old);
  assert.equal(recencyColor('garbage'), RECENCY_COLORS.old);
});

test('recency color bands are all distinct and labelled', () => {
  const colors = Object.values(RECENCY_COLORS);
  assert.equal(new Set(colors).size, 4);
  assert.deepEqual(Object.keys(RECENCY_LABELS), ['week', 'month', 'year', 'old']);
});
