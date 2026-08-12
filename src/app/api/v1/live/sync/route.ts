import { NextResponse } from 'next/server';
import { syncGbfForAnimal } from '@/lib/liveGbf';
import { applyRateLimit } from '@/lib/apiRateLimit';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/live/sync?id=<animalId>
 * Live GBIF sync for one species: recent georeferenced occurrences with a
 * fetchedAt timestamp. Response is cacheable for 60s (matching the server's
 * in-instance TTL), so the badge can poll cheaply.
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing ?id=<animalId>' }, { status: 400 });
  }

  try {
    const sync = await syncGbfForAnimal(id);
    const response: ApiResponse<typeof sync> = { success: true, data: sync };
    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GBIF sync failed';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
