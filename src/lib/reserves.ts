// Protected areas and biosphere reserves data definitions

export interface ProtectedArea {
  id: string;
  name: string;
  country: string;
  type: 'National Park' | 'Marine Protected Area' | 'Biosphere Reserve' | 'Wildlife Sanctuary';
  areaSqKm: number;
  establishedYear: number;
  coordinates: { lat: number; lng: number };
  keySpecies: string[];
  threatLevel: 'Low' | 'Moderate' | 'High';
}

export const PROTECTED_AREAS: ProtectedArea[] = [
  {
    id: 'pa-001',
    name: 'Serengeti-Mara Ecosystem',
    country: 'Tanzania & Kenya',
    type: 'National Park',
    areaSqKm: 30000,
    establishedYear: 1951,
    coordinates: { lat: -2.3333, lng: 34.8333 },
    keySpecies: ['African Lion', 'Giraffe'],
    threatLevel: 'Moderate',
  },
  {
    id: 'pa-002',
    name: 'Chitwan National Park',
    country: 'Nepal',
    type: 'National Park',
    areaSqKm: 952,
    establishedYear: 1973,
    coordinates: { lat: 27.5000, lng: 84.5000 },
    keySpecies: ['Bengal Tiger'],
    threatLevel: 'Low',
  },
  {
    id: 'pa-003',
    name: 'Great Barrier Reef Marine Park',
    country: 'Australia',
    type: 'Marine Protected Area',
    areaSqKm: 344400,
    establishedYear: 1975,
    coordinates: { lat: -18.2871, lng: 147.6992 },
    keySpecies: ['Humpback Whale', 'Leatherback Turtle'],
    threatLevel: 'High',
  },
  {
    id: 'pa-004',
    name: 'Svalbard Protected Area Network',
    country: 'Norway',
    type: 'Wildlife Sanctuary',
    areaSqKm: 39800,
    establishedYear: 1973,
    coordinates: { lat: 78.0000, lng: 16.0000 },
    keySpecies: ['Polar Bear', 'Arctic Tern'],
    threatLevel: 'Moderate',
  },
  {
    id: 'pa-005',
    name: 'Monarch Butterfly Biosphere Reserve',
    country: 'Mexico',
    type: 'Biosphere Reserve',
    areaSqKm: 562,
    establishedYear: 2000,
    coordinates: { lat: 19.4500, lng: -100.2500 },
    keySpecies: ['Monarch Butterfly'],
    threatLevel: 'High',
  },
];
