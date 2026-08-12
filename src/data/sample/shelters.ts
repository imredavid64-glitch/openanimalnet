// Sample shelter & rescue registry — illustrative data for the companion-animal
// tools (/reunite): lost-and-found matching, shelter/foster outreach, and
// adoption matching. Real shelters in real cities (locations approximate);
// pets are representative profiles. Coordinates power distance-based matching.
import type { GeoPoint } from '@/lib/geo';

export interface Shelter {
  id: string;
  name: string;
  city: string;
  country: string;
  location: GeoPoint;
  phone: string;
  services: string[]; // adoption | foster | vet-care | lost-and-found | outreach
  petCapacity: number;
  /** Wheelchair-accessible facilities / service-animal support. */
  accessibility?: boolean;
}

export interface AdoptablePet {
  id: string;
  shelterId: string;
  name: string;
  species: 'dog' | 'cat' | 'rabbit' | 'bird';
  breed: string;
  ageYears: number;
  size: 'small' | 'medium' | 'large';
  energy: 'low' | 'medium' | 'high';
  goodWithKids: boolean;
  goodWithPets: boolean;
  trained: boolean;
  bio: string;
}

export interface LostPetReport {
  id: string;
  petName: string;
  species: 'dog' | 'cat' | 'rabbit' | 'bird';
  description: string;
  lastSeen: GeoPoint;
  lastSeenLabel: string;
  reportedAt: string; // ISO date
}

export interface FoundPetReport {
  id: string;
  species: 'dog' | 'cat' | 'rabbit' | 'bird';
  description: string;
  location: GeoPoint;
  foundAt: string; // ISO date
  shelterId?: string; // which shelter is holding the pet
}

export const sampleShelters: Shelter[] = [
  {
    id: 'shelter-001',
    name: 'Amboseli Wildlife & Rescue',
    city: 'Kimana, Kajiado',
    country: 'Kenya',
    location: { latitude: -2.78, longitude: 37.55 },
    phone: '+254 700 123 456',
    services: ['adoption', 'foster', 'vet-care', 'lost-and-found', 'outreach'],
    petCapacity: 120,
  },
  {
    id: 'shelter-002',
    name: 'Nairobi Companion Animal Rescue',
    city: 'Nairobi',
    country: 'Kenya',
    location: { latitude: -1.2864, longitude: 36.8172 },
    phone: '+254 722 456 789',
    services: ['adoption', 'foster', 'vet-care', 'lost-and-found'],
    petCapacity: 85,
    accessibility: true,
  },
  {
    id: 'shelter-003',
    name: 'Serengeti Conservation & Vet Post',
    city: 'Seronera',
    country: 'Tanzania',
    location: { latitude: -2.42, longitude: 34.82 },
    phone: '+255 784 555 010',
    services: ['vet-care', 'lost-and-found', 'outreach'],
    petCapacity: 40,
  },
  {
    id: 'shelter-004',
    name: 'Corbett Animal Care Centre',
    city: 'Ramanagar, Uttarakhand',
    country: 'India',
    location: { latitude: 29.41, longitude: 79.13 },
    phone: '+91 987 654 3210',
    services: ['adoption', 'foster', 'vet-care', 'lost-and-found'],
    petCapacity: 200,
    accessibility: true,
  },
  {
    id: 'shelter-005',
    name: 'Tsavo Livestock & Wildlife Vet',
    city: 'Voi',
    country: 'Kenya',
    location: { latitude: -3.39, longitude: 38.57 },
    phone: '+254 733 908 112',
    services: ['vet-care', 'outreach', 'lost-and-found'],
    petCapacity: 60,
  },
];

export const sampleAdoptablePets: AdoptablePet[] = [
  {
    id: 'pet-001', shelterId: 'shelter-001', name: 'Kito', species: 'dog', breed: 'Africanis mix',
    ageYears: 2, size: 'medium', energy: 'high', goodWithKids: true, goodWithPets: true, trained: false,
    bio: 'Friendly village dog found near the Kimana corridor — loves walks and people.',
  },
  {
    id: 'pet-002', shelterId: 'shelter-002', name: 'Malaika', species: 'cat', breed: 'Domestic shorthair',
    ageYears: 1, size: 'small', energy: 'medium', goodWithKids: true, goodWithPets: false, trained: true,
    bio: 'Gentle indoor cat surrendered by a family relocating abroad.',
  },
  {
    id: 'pet-003', shelterId: 'shelter-004', name: 'Chiku', species: 'rabbit', breed: 'Rex',
    ageYears: 3, size: 'small', energy: 'low', goodWithKids: true, goodWithPets: true, trained: true,
    bio: 'Calm rex rabbit from a foster home; litter-trained and easygoing.',
  },
  {
    id: 'pet-004', shelterId: 'shelter-002', name: 'Simba Jr', species: 'dog', breed: 'Retriever mix',
    ageYears: 4, size: 'large', energy: 'medium', goodWithKids: true, goodWithPets: true, trained: true,
    bio: 'Steady, leash-trained retriever mix looking for a garden to guard.',
  },
  {
    id: 'pet-005', shelterId: 'shelter-004', name: 'Pari', species: 'bird', breed: 'Budgerigar',
    ageYears: 1, size: 'small', energy: 'medium', goodWithKids: true, goodWithPets: false, trained: false,
    bio: 'Chatty young budgie from a rescue surrender.',
  },
  {
    id: 'pet-006', shelterId: 'shelter-001', name: 'Tembo', species: 'dog', breed: 'Boerboel cross',
    ageYears: 5, size: 'large', energy: 'low', goodWithKids: false, goodWithPets: false, trained: true,
    bio: 'Protective large breed needing an experienced, adult-only home.',
  },
];

export const sampleLostPets: LostPetReport[] = [
  {
    id: 'lost-001', petName: 'Bella', species: 'dog', description: 'Tan labrador with a red collar',
    lastSeen: { latitude: -1.2921, longitude: 36.8219 }, lastSeenLabel: 'Nairobi — Westlands',
    reportedAt: '2026-08-09',
  },
  {
    id: 'lost-002', petName: 'Whiskers', species: 'cat', description: 'Grey tabby, microchipped',
    lastSeen: { latitude: 29.45, longitude: 79.05 }, lastSeenLabel: 'Corbett — Ramnagar outskirts',
    reportedAt: '2026-08-08',
  },
];

export const sampleFoundPets: FoundPetReport[] = [
  {
    id: 'found-001', species: 'dog', description: 'Tan labrador-type dog, red collar, friendly',
    location: { latitude: -1.3105, longitude: 36.7661 }, foundAt: '2026-08-10', shelterId: 'shelter-002',
  },
  {
    id: 'found-002', species: 'cat', description: 'Grey tabby found near a grain market',
    location: { latitude: 29.49, longitude: 79.01 }, foundAt: '2026-08-09', shelterId: 'shelter-004',
  },
  {
    id: 'found-003', species: 'dog', description: 'White-and-tan puppy, no collar',
    location: { latitude: -2.78, longitude: 37.55 }, foundAt: '2026-08-11', shelterId: 'shelter-001',
  },
];
