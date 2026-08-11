import { NextResponse } from 'next/server';
import { sampleAnimals, sampleAnimalData } from '@/data/sample/animals';
import { applyRateLimit } from '@/lib/apiRateLimit';
import { API_CACHE_CONTROL } from '@/lib/apiHeaders';
import type { ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

interface PopulationRecord {
  animalId: string;
  commonName: string;
  scientificName: string;
  conservationStatus: string;
  populationEstimate?: number;
  aerialSurveyCounts?: number;
  cameraTrapCaptureRates?: number;
  rangeContractionPercentage?: number;
}

/**
 * GET /api/v1/populations
 * Population estimates and conservation metrics for all species.
 */
export async function GET(request: Request) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const data: PopulationRecord[] = sampleAnimals.map((animal) => {
    const animalData = sampleAnimalData.find((d) => d.animal.id === animal.id);
    const abundance = animalData?.population?.abundance;
    const conservation = animalData?.population?.conservation;
    return {
      animalId: animal.id,
      commonName: animal.commonName,
      scientificName: animal.scientificName,
      conservationStatus: animal.conservationStatus,
      populationEstimate: animal.populationEstimate,
      aerialSurveyCounts: abundance?.aerialSurveyCounts,
      cameraTrapCaptureRates: abundance?.cameraTrapCaptureRates,
      rangeContractionPercentage: conservation?.rangeContractionPercentage,
    };
  });

  const response: ApiResponse<PopulationRecord[]> = {
    success: true,
    data,
  };
  return NextResponse.json(response, {
    headers: { 'Cache-Control': API_CACHE_CONTROL },
  });
}
