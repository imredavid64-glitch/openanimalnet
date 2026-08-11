import type { Animal, AnimalFilter, ConservationStatus } from '../types/animal/types';

export type AnimalSortBy = 'name' | 'population' | 'status' | 'monitored';
export type SortDirection = 'asc' | 'desc';

/**
 * Pure filtering + sorting for the animal database.
 * Extracted from the /animal page so the logic can be unit-tested.
 */
export function filterAndSortAnimals(
  animals: Animal[],
  filters: AnimalFilter,
  searchQuery: string,
  sortBy: AnimalSortBy,
  sortDirection: SortDirection
): Animal[] {
  let filteredAnimals = [...animals];

  // Apply category filter
  if (filters.categories && filters.categories.length > 0) {
    filteredAnimals = filteredAnimals.filter((animal) =>
      filters.categories!.includes(animal.category)
    );
  }

  // Apply conservation status filter
  if (filters.conservationStatus && filters.conservationStatus.length > 0) {
    filteredAnimals = filteredAnimals.filter((animal) =>
      filters.conservationStatus!.includes(animal.conservationStatus)
    );
  }

  // Apply data category filter
  if (filters.dataCategories && filters.dataCategories.length > 0) {
    filteredAnimals = filteredAnimals.filter((animal) =>
      filters.dataCategories!.some((cat) => animal.dataCategories.includes(cat))
    );
  }

  // Apply monitored filter
  if (filters.isMonitored !== undefined) {
    filteredAnimals = filteredAnimals.filter(
      (animal) => animal.isMonitored === filters.isMonitored
    );
  }

  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredAnimals = filteredAnimals.filter(
      (animal) =>
        animal.commonName.toLowerCase().includes(query) ||
        animal.scientificName.toLowerCase().includes(query) ||
        animal.description?.toLowerCase().includes(query) ||
        animal.habitat?.some((h) => h.toLowerCase().includes(query))
    );
  }

  // Apply sorting
  filteredAnimals.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return sortDirection === 'asc'
          ? a.commonName.localeCompare(b.commonName)
          : b.commonName.localeCompare(a.commonName);
      case 'population': {
        const aPop = a.populationEstimate || 0;
        const bPop = b.populationEstimate || 0;
        return sortDirection === 'asc' ? aPop - bPop : bPop - aPop;
      }
      case 'status': {
        // Order by conservation status severity
        const statusOrder: ConservationStatus[] = ['EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC', 'DD', 'NE'];
        const aIndex = statusOrder.indexOf(a.conservationStatus);
        const bIndex = statusOrder.indexOf(b.conservationStatus);
        return sortDirection === 'asc' ? aIndex - bIndex : bIndex - aIndex;
      }
      case 'monitored':
        return sortDirection === 'asc'
          ? Number(a.isMonitored) - Number(b.isMonitored)
          : Number(b.isMonitored) - Number(a.isMonitored);
      default:
        return 0;
    }
  });

  return filteredAnimals;
}
