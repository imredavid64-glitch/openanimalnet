import { NextResponse } from 'next/server';
import { fetchObservationsForAnimals } from '@/lib/liveObservations';
import { applyRateLimit } from '@/lib/apiRateLimit';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

const MAX_IDS = 40;

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
