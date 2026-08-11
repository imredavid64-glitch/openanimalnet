import { NextRequest, NextResponse } from 'next/server';
import { sampleAnimals } from '@/data/sample/animals';
import { filterAndSortAnimals } from '@/lib/animalFiltering';
import { applyRateLimit } from '@/lib/apiRateLimit';
import { API_CACHE_CONTROL } from '@/lib/apiHeaders';
import type { Animal, AnimalCategory, AnimalFilter, ApiResponse, ConservationStatus, DataCategory } from '@/types/animal/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/animals
 * List species with optional filters: category, conservationStatus,
 * dataCategories, isMonitored, search — plus page/limit pagination.
 */
export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request);
  if (limited) return limited;

  const params = request.nextUrl.searchParams;

  const filters: AnimalFilter = {};
  const categories = params.get('category');
  if (categories) {
    filters.categories = categories.split(',').filter(Boolean) as AnimalCategory[];
  }
  const statuses = params.get('conservationStatus');
  if (statuses) {
    filters.conservationStatus = statuses.split(',').filter(Boolean) as ConservationStatus[];
  }
  const dataCats = params.get('dataCategories');
  if (dataCats) {
    filters.dataCategories = dataCats.split(',').filter(Boolean) as DataCategory[];
  }
  const isMonitored = params.get('isMonitored');
  if (isMonitored === 'true') filters.isMonitored = true;
  if (isMonitored === 'false') filters.isMonitored = false;

  const search = params.get('search') ?? '';
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') ?? '20', 10) || 20));

  const filtered = filterAndSortAnimals(sampleAnimals, filters, search, 'name', 'asc');
  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  const response: ApiResponse<Animal[]> = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  return NextResponse.json(response, {
    headers: { 'Cache-Control': API_CACHE_CONTROL },
  });
}
