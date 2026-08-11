import { NextResponse } from 'next/server';
import { sampleAnimals, sampleAnimalData } from '@/data/sample/animals';
import { applyRateLimit } from '@/lib/apiRateLimit';
import { API_CACHE_CONTROL } from '@/lib/apiHeaders';
import type { AnimalData, ApiResponse } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/animals/:id
 * Full profile for a single species, including all five data categories.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const animal = sampleAnimals.find((a) => a.id === params.id);
  if (!animal) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Animal not found',
      message: `No species with id "${params.id}" exists in the database.`,
    };
    return NextResponse.json(response, { status: 404 });
  }

  const animalData =
    sampleAnimalData.find((d) => d.animal.id === animal.id) ?? ({ animal } as AnimalData);
  const response: ApiResponse<AnimalData> = {
    success: true,
    data: animalData,
  };
  return NextResponse.json(response, {
    headers: { 'Cache-Control': API_CACHE_CONTROL },
  });
}
