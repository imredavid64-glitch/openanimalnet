import { NextResponse } from 'next/server';
import { sampleMonitoringData } from '@/data/sample/animals';
import { applyRateLimit } from '@/lib/apiRateLimit';
import { API_CACHE_CONTROL } from '@/lib/apiHeaders';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/monitoring/stats
 * Aggregated monitoring statistics for the dashboard: totals, active alerts,
 * coverage by category, and the population trend series.
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const response: ApiResponse<typeof sampleMonitoringData> = {
    success: true,
    data: sampleMonitoringData,
  };
  return NextResponse.json(response, {
    headers: { 'Cache-Control': API_CACHE_CONTROL },
  });
}
