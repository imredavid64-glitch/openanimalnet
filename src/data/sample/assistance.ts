// Sample assistance-animal registry — assistance-animal organizations and
// accessible facilities. Locations are approximate and the directory is a
// representative sample, not an exhaustive list: verify directly with each
// organization before relying on it (each card links to the org's own site).
import type { GeoPoint } from '@/lib/geo';

export type AssistanceService =
  | 'guide-dogs'
  | 'mobility'
  | 'medical-alert'
  | 'psychiatric'
  | 'therapy'
  | 'training'
  | 'certification';

export const ASSISTANCE_SERVICE_LABELS: Record<AssistanceService, string> = {
  'guide-dogs': 'Guide dogs',
  mobility: 'Mobility assistance',
  'medical-alert': 'Medical alert',
  psychiatric: 'Psychiatric service dogs',
  therapy: 'Therapy programs',
  training: 'Training',
  certification: 'Certification',
};

export interface AssistanceOrg {
  id: string;
  name: string;
  city: string;
  country: string;
  location: GeoPoint;
  phone: string;
  website: string;
  services: AssistanceService[];
  accreditation?: string;
  note?: string;
}

export type FacilityType = 'clinic' | 'grooming' | 'boarding' | 'public-space' | 'training-center';

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  clinic: 'Accessible vet clinic',
  grooming: 'Accessible grooming',
  boarding: 'Accessible boarding',
  'public-space': 'Service-animal welcome public space',
  'training-center': 'Training centre',
};

export interface AccessibleFacility {
  id: string;
  name: string;
  type: FacilityType;
  city: string;
  country: string;
  location: GeoPoint;
  phone: string;
  features: string[];
}

export const sampleAssistanceOrgs: AssistanceOrg[] = [
  {
    id: 'assist-001',
    name: 'Guide Dogs for the Blind',
    city: 'San Rafael, CA',
    country: 'United States',
    location: { latitude: 37.9735, longitude: -122.5311 },
    phone: '+1 800 295 4050',
    website: 'https://www.guidedogs.com',
    services: ['guide-dogs', 'training'],
    accreditation: 'Assistance Dogs International (ADI) member',
    note: 'One of the largest guide-dog schools in North America — free to recipients.',
  },
  {
    id: 'assist-002',
    name: 'Canine Companions',
    city: 'Santa Rosa, CA',
    country: 'United States',
    location: { latitude: 38.44, longitude: -122.71 },
    phone: '+1 800 572 2275',
    website: 'https://canine.org',
    services: ['mobility', 'psychiatric', 'training'],
    accreditation: 'Accredited by Assistance Dogs International',
  },
  {
    id: 'assist-003',
    name: 'Medical Detection Dogs',
    city: 'Milton Keynes',
    country: 'United Kingdom',
    location: { latitude: 52.04, longitude: -0.76 },
    phone: '+44 1908 226 660',
    website: 'https://www.medicaldetectiondogs.org.uk',
    services: ['medical-alert', 'training'],
  },
  {
    id: 'assist-004',
    name: 'Hearing Dogs for Deaf People',
    city: 'Saunderton, Buckinghamshire',
    country: 'United Kingdom',
    location: { latitude: 51.68, longitude: -0.83 },
    phone: '+44 1844 348 100',
    website: 'https://www.hearingdogs.org.uk',
    services: ['medical-alert', 'training'],
  },
  {
    id: 'assist-005',
    name: 'Service Dogs India',
    city: 'New Delhi',
    country: 'India',
    location: { latitude: 28.6139, longitude: 77.209 },
    phone: '+91 11 4000 0000',
    website: 'https://www.servicedogsindia.org',
    services: ['mobility', 'psychiatric', 'medical-alert', 'training'],
    note: 'Trains assistance dogs for physical and psychiatric disabilities.',
  },
  {
    id: 'assist-006',
    name: 'Kenya Society for the Blind — guide dog programme',
    city: 'Nairobi',
    country: 'Kenya',
    location: { latitude: -1.2864, longitude: 36.8172 },
    phone: '+254 20 221 6168',
    website: 'https://www.ksblind.org',
    services: ['guide-dogs', 'training', 'certification'],
    note: 'Vision-loss services; check the current guide-dog programme status directly.',
  },
];

export const sampleAccessibleFacilities: AccessibleFacility[] = [
  {
    id: 'fac-001',
    name: 'Nairobi Veterinary Centre (Kitisuru)',
    type: 'clinic',
    city: 'Nairobi',
    country: 'Kenya',
    location: { latitude: -1.2404, longitude: 36.7909 },
    phone: '+254 720 123 456',
    features: ['Wheelchair-accessible entrance', 'Service animals welcome', 'Step-free examination rooms'],
  },
  {
    id: 'fac-002',
    name: 'Voi Animal Clinic & Wildlife Vet',
    type: 'clinic',
    city: 'Voi',
    country: 'Kenya',
    location: { latitude: -3.39, longitude: 38.57 },
    phone: '+254 733 908 112',
    features: ['Wheelchair-accessible', 'Service-animal friendly', 'Farm & companion animals'],
  },
  {
    id: 'fac-003',
    name: 'Paws & Prams Accessible Boarding',
    type: 'boarding',
    city: 'Corbett, Ramnagar',
    country: 'India',
    location: { latitude: 29.41, longitude: 79.13 },
    phone: '+91 981 234 5678',
    features: ['Step-free kennels', 'Handlers may stay on site', 'Medical-alert dog experienced staff'],
  },
  {
    id: 'fac-004',
    name: 'Serengeti Visitor Centre',
    type: 'public-space',
    city: 'Seronera',
    country: 'Tanzania',
    location: { latitude: -2.42, longitude: 34.82 },
    phone: '+255 784 555 010',
    features: ['Service animals welcome', 'Accessible viewing deck', 'Sensory-friendly hours'],
  },
  {
    id: 'fac-005',
    name: 'Westlands Accessible Grooming',
    type: 'grooming',
    city: 'Nairobi',
    country: 'Kenya',
    location: { latitude: -1.2669, longitude: 36.8075 },
    phone: '+254 711 222 333',
    features: ['Low-height grooming tables', 'Wheelchair-accessible wash bays', 'Appointments for assistance dogs'],
  },
];
