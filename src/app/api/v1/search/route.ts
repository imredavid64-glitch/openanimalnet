import { NextResponse } from 'next/server';
import { searchAllSources, autocompleteGBIF, getSpeciesDetailGBIF } from '@/lib/globalSearch';
import { applyRateLimit } from '@/lib/apiRateLimit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/search?q=<query>&limit=20&sources=local,gbif,wikipedia
 * Universal species search across all sources
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);
  const sourcesParam = searchParams.get('sources') ?? 'local,gbif,wikipedia,wikidata';
  const sources = sourcesParam.split(',').map(s => s.trim());

  if (!query || query.length < 1) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const results = await searchAllSources(query, {
      includeLocal: sources.includes('local'),
      includeGBIF: sources.includes('gbif'),
      includeWikipedia: sources.includes('wikipedia'),
      includeWikidata: sources.includes('wikidata'),
      limit,
    });
    return NextResponse.json({ success: true, data: results, query });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}

/**
 * POST /api/v1/search
 * Body: { query, limit?, sources?, autocomplete? }
 * Supports autocomplete mode for typeahead
 */
export async function POST(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { query, limit = 20, sources = ['local', 'gbif', 'wikipedia', 'wikidata'], autocomplete = false, usageKey } = body;

    if (autocomplete && query) {
      const results = await autocompleteGBIF(query, limit);
      return NextResponse.json({ success: true, data: results, query });
    }

    if (usageKey) {
      const detail = await getSpeciesDetailGBIF(usageKey);
      return NextResponse.json({ success: true, data: detail ? [detail] : [] });
    }

    if (!query || query.length < 1) {
      return NextResponse.json({ success: true, data: [] });
    }

    const results = await searchAllSources(query, {
      includeLocal: sources.includes('local'),
      includeGBIF: sources.includes('gbif'),
      includeWikipedia: sources.includes('wikipedia'),
      includeWikidata: sources.includes('wikidata'),
      limit,
    });
    return NextResponse.json({ success: true, data: results, query });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}