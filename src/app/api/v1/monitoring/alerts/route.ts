import { NextRequest, NextResponse } from 'next/server';
import { sampleAlerts } from '@/data/sample/alerts';
import { applyRateLimit } from '@/lib/apiRateLimit';
import { API_CACHE_CONTROL } from '@/lib/apiHeaders';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/monitoring/alerts
 * Active monitoring alerts, filterable by severity type (critical|warning|info).
 */
export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const type = request.nextUrl.searchParams.get('type');

  let data = sampleAlerts;
  if (type === 'critical' || type === 'warning' || type === 'info') {
    data = sampleAlerts.filter((alert) => alert.type === type);
  } else if (type) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid type',
      message: 'type must be one of: critical, warning, info',
    };
    return NextResponse.json(response, { status: 400 });
  }

  const response: ApiResponse<typeof sampleAlerts> = {
    success: true,
    data,
  };
  return NextResponse.json(response, {
    headers: { 'Cache-Control': API_CACHE_CONTROL },
  });
}
