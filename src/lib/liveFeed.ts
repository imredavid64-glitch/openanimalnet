// Live Wildlife Telemetry & Camera Trap Ticker types and simulation data

export interface LiveEvent {
  id: string;
  speciesId: string;
  commonName: string;
  eventType: 'collar_ping' | 'camera_trap' | 'acoustic_detection' | 'ranger_sighting';
  location: { lat: number; lng: number; name: string };
  timestamp: string;
  details: string;
  verifiedCount: number;
  flaggedCount: number;
}

export const INITIAL_LIVE_EVENTS: LiveEvent[] = [
  {
    id: 'evt-001',
    speciesId: 'tiger',
    commonName: 'Bengal Tiger',
    eventType: 'camera_trap',
    location: { lat: 27.5, lng: 84.5, name: 'Chitwan National Park, Nepal' },
    timestamp: '2 mins ago',
    details: 'Infrared motion camera triggered near waterhole. Adult female with cub.',
    verifiedCount: 14,
    flaggedCount: 0,
  },
  {
    id: 'evt-002',
    speciesId: 'humpback-whale',
    commonName: 'Humpback Whale',
    eventType: 'acoustic_detection',
    location: { lat: -20.2, lng: 149.0, name: 'Great Barrier Reef Hydrophone Array' },
    timestamp: '7 mins ago',
    details: 'Low-frequency breeding song sequence detected (250 Hz peak).',
    verifiedCount: 22,
    flaggedCount: 1,
  },
  {
    id: 'evt-003',
    speciesId: 'polar-bear',
    commonName: 'Polar Bear',
    eventType: 'collar_ping',
    location: { lat: 78.2, lng: 15.6, name: 'Svalbard Archipelago' },
    timestamp: '14 mins ago',
    details: 'GPS satellite collar transmission: active movement on pack ice edge.',
    verifiedCount: 9,
    flaggedCount: 0,
  },
  {
    id: 'evt-004',
    speciesId: 'monarch',
    commonName: 'Monarch Butterfly',
    eventType: 'ranger_sighting',
    location: { lat: 19.4, lng: -100.2, name: 'Michoacán Biosphere Reserve, Mexico' },
    timestamp: '25 mins ago',
    details: 'Overwintering roost density survey: high clustering reported.',
    verifiedCount: 31,
    flaggedCount: 0,
  },
  {
    id: 'evt-005',
    speciesId: 'african-elephant',
    commonName: 'African Bush Elephant',
    eventType: 'collar_ping',
    location: { lat: -2.3, lng: 37.1, name: 'Amboseli Ecosystem, Kenya' },
    timestamp: '41 mins ago',
    details: 'Infrasonic rumble telemetry relay and herd trajectory update.',
    verifiedCount: 45,
    flaggedCount: 2,
  },
];
