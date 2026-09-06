import { NextResponse } from 'next/server';
import { universalSearch } from '@/lib/universalSearch';
import { applyRateLimit } from '@/lib/apiRateLimit';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/search?q=lion
 * Universal species search across GBIF, Wikipedia, Wikidata, and iNaturalist.
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const q = new URL(request.url).searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json(
      { success: false, error: 'Missing ?q=<search query>' },
      { status: 400 },
    );
  }

  try {
    const data = await universalSearch(q.trim());
    const response: ApiResponse<typeof data> = { success: true, data };
    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=600' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}