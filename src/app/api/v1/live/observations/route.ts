import { NextResponse } from 'next/server';
import { fetchObservationsForAnimals } from '@/lib/liveObservations';
import { applyRateLimit } from '@/lib/apiRateLimit';
import { broadcastAlert } from '@/lib/liveHub';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

const MAX_IDS = 40;

// Crowdsourced observations submitted by clients (the SW queues these offline
// via background sync and replays them with POST when connectivity returns).
// In production, persist to a database. In-memory for demo.
const submitted: SubmittedObservation[] = [];

interface SubmittedObservation {
  id: string;
  animalId: string;
  species?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  reportedBy?: string;
  timestamp: string;
}

/**
 * GET /api/v1/live/observations?ids=lion-001,tiger-001
 * Recent georeferenced GBIF observations for a batch of species (the globe's
 * live-observations layer fetches exactly the species currently in view).
 * Results are cached server-side for 60s per species; a failing species is
 * skipped rather than failing the whole batch.
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const idsParam = new URL(request.url).searchParams.get('ids') ?? '';
  const ids = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Missing ?ids=<animalId>,<animalId>…' },
      { status: 400 },
    );
  }
  if (ids.length > MAX_IDS) {
    return NextResponse.json(
      { success: false, error: `Too many ids — max ${MAX_IDS} per request` },
      { status: 400 },
    );
  }

  try {
    const data = await fetchObservationsForAnimals(ids);
    const response: ApiResponse<typeof data> = { success: true, data };
    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GBIF observations failed';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

/**
 * POST /api/v1/live/observations
 * Accept a crowdsourced wildlife observation (replayed by the service worker's
 * background sync). Broadcasts an SSE alert so connected live clients see it.
 */
export async function POST(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const body = await request.json();
  const { animalId, species, latitude, longitude, notes, reportedBy } = body;

  if (!animalId || typeof animalId !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Required field: animalId' },
      { status: 400 },
    );
  }
  if (latitude != null && (typeof latitude !== 'number' || latitude < -90 || latitude > 90)) {
    return NextResponse.json(
      { success: false, error: 'Invalid latitude' },
      { status: 400 },
    );
  }
  if (longitude != null && (typeof longitude !== 'number' || longitude < -180 || longitude > 180)) {
    return NextResponse.json(
      { success: false, error: 'Invalid longitude' },
      { status: 400 },
    );
  }

  const observation: SubmittedObservation = {
    id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    animalId,
    species: typeof species === 'string' ? species.slice(0, 200) : undefined,
    latitude,
    longitude,
    notes: typeof notes === 'string' ? notes.slice(0, 2000) : undefined,
    reportedBy: typeof reportedBy === 'string' ? reportedBy.slice(0, 100) : undefined,
    timestamp: new Date().toISOString(),
  };
  submitted.push(observation);

  broadcastAlert({
    type: 'info',
    id: observation.id,
    animalId: observation.animalId,
    message: `New crowd-sourced observation of ${observation.species || observation.animalId}`,
    timestamp: observation.timestamp,
  });

  const response: ApiResponse<SubmittedObservation> = { success: true, data: observation };
  return NextResponse.json(response, {
    status: 201,
    headers: { 'Cache-Control': 'no-store' },
  });
}
