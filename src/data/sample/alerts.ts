import { sampleAnimals } from './animals';
import { Animal } from '@/types/animal/types';

export interface SampleAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  animal: Animal;
  message: string;
  timestamp: Date;
  severity: number;
  location: { lat: number; lng: number };
  action: string;
}

// Sample alerts — timestamps are fixed so server-rendered HTML matches the
// client on hydration (Date.now() here caused React hydration errors).
export const sampleAlerts: SampleAlert[] = [
  {
    id: 'alert-001',
    type: 'critical',
    animal: sampleAnimals[1],
    message: 'Elephant herd approaching human settlement in Kenya',
    timestamp: new Date('2026-08-10T11:45:00'),
    severity: 9,
    location: { lat: -1.2921, lng: 36.8219 },
    action: 'Immediate intervention required',
  },
  {
    id: 'alert-002',
    type: 'warning',
    animal: sampleAnimals[0],
    message: 'Lion pride showing unusual movement patterns',
    timestamp: new Date('2026-08-10T10:45:00'),
    severity: 6,
    location: { lat: -2.3333, lng: 35.0833 },
    action: 'Monitor closely',
  },
  {
    id: 'alert-003',
    type: 'info',
    animal: sampleAnimals[3],
    message: 'New bald eagle nest discovered in Alaska',
    timestamp: new Date('2026-08-10T09:45:00'),
    severity: 3,
    location: { lat: 61.3707, lng: -152.3978 },
    action: 'Document and verify',
  },
  {
    id: 'alert-004',
    type: 'critical',
    animal: sampleAnimals[2],
    message: 'Tiger sighting near village in India',
    timestamp: new Date('2026-08-10T08:45:00'),
    severity: 8,
    location: { lat: 23.0, lng: 88.0 },
    action: 'Alert local authorities',
  },
  {
    id: 'alert-005',
    type: 'warning',
    animal: sampleAnimals[4],
    message: 'Blue whale migration path deviation detected',
    timestamp: new Date('2026-08-10T07:45:00'),
    severity: 7,
    location: { lat: -30.0, lng: -120.0 },
    action: 'Investigate environmental factors',
  },
];
