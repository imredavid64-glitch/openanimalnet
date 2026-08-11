import { NextResponse } from 'next/server';
import { sampleAnimalData } from '@/data/sample/animals';
import { applyRateLimit } from '@/lib/apiRateLimit';
import { API_CACHE_CONTROL } from '@/lib/apiHeaders';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

interface LocationRecord {
  animalId: string;
  commonName: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  source: string;
  timestamp: Date;
}

/**
 * GET /api/v1/locations
 * Recent tracking locations for monitored animals (from telemetry data).
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const data: LocationRecord[] = [];
  for (const entry of sampleAnimalData) {
    const coords = entry.behavioral?.telemetry?.gpsCoordinates ?? [];
    for (const coord of coords) {
      data.push({
        animalId: entry.animal.id,
        commonName: entry.animal.commonName,
        latitude: coord.latitude,
        longitude: coord.longitude,
        altitude: coord.altitude,
        accuracy: coord.accuracy,
        source: coord.source,
        timestamp: coord.timestamp,
      });
    }
  }

  const response: ApiResponse<LocationRecord[]> = {
    success: true,
    data,
  };
  return NextResponse.json(response, {
    headers: { 'Cache-Control': API_CACHE_CONTROL },
  });
}
