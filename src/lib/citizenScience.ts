/**
 * Citizen Science Observation Workflow
 * - Record observations with photo, GPS, species ID
 * - Offline-first with background sync
 * - Verification queue with expert review
 * - Badges and reputation system
 * All client-side, no database required
 */

import { sampleAnimals } from '@/data/sample/animals';
import { queueSighting, queueObservation, getPendingCounts, useOfflineSync } from '@/lib/offlineSync';
import type { Animal } from '@/types/animal/types';

export interface Observation {
  id: string;
  userId: string;
  userName: string;
  speciesId: string;
  speciesName: string;
  scientificName: string;
  confidence: number; // 0-100
  identificationMethod: 'ai' | 'manual' | 'field_guide' | 'expert';
  coordinates: { latitude: number; longitude: number; accuracy: number };
  timestamp: number;
  photos: string[]; // base64 data URLs
  notes: string;
  habitat: string[];
  behavior?: string;
  count: number;
  lifeStage?: 'egg' | 'larva' | 'juvenile' | 'adult' | 'senescent';
  sex?: 'male' | 'female' | 'unknown';
  verified: 'pending' | 'verified' | 'rejected' | 'needs_review';
  verifiedBy?: string;
  verifiedAt?: number;
  verificationNotes?: string;
  badges?: string[];
}

export interface UserProfile {
  userId: string;
  userName: string;
  joinedAt: number;
  observationsCount: number;
  verifiedCount: number;
  speciesCount: number;
  badges: Badge[];
  reputation: number; // 0-1000
  level: 'Naturalist' | 'Contributor' | 'Expert' | 'Curator';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  earnedAt?: number;
}

const BADGES: Badge[] = [
  { id: 'first_obs', name: 'First Sighting', description: 'Recorded your first observation', icon: '🌱', rarity: 'common' },
  { id: 'ten_obs', name: 'Getting Started', description: '10 observations recorded', icon: '🌿', rarity: 'common' },
  { id: 'fifty_obs', name: 'Regular Observer', description: '50 observations recorded', icon: '🌳', rarity: 'uncommon' },
  { id: 'hundred_obs', name: 'Dedicated Naturalist', description: '100 observations recorded', icon: '🌲', rarity: 'uncommon' },
  { id: 'ten_species', name: 'Species Collector', description: 'Observed 10 different species', icon: '🦋', rarity: 'common' },
  { id: 'fifty_species', name: 'Biodiversity Champion', description: 'Observed 50 different species', icon: '🦜', rarity: 'rare' },
  { id: 'hundred_species', name: 'Master Naturalist', description: 'Observed 100 different species', icon: '🦅', rarity: 'legendary' },
  { id: 'rare_species', name: 'Rare Find', description: 'Observed a CR/EN species', icon: '💎', rarity: 'rare' },
  { id: 'night_owl', name: 'Night Owl', description: 'Observation between 10pm-5am', icon: '🦉', rarity: 'uncommon' },
  { id: 'early_bird', name: 'Early Bird', description: 'Observation before 6am', icon: '🌅', rarity: 'uncommon' },
  { id: 'photo_master', name: 'Photo Master', description: '10 observations with photos', icon: '📸', rarity: 'uncommon' },
  { id: 'streak_week', name: 'Week Streak', description: 'Observations 7 days in a row', icon: '🔥', rarity: 'rare' },
  { id: 'streak_month', name: 'Month Streak', description: 'Observations 30 days in a row', icon: '⚡', rarity: 'legendary' },
  { id: 'verified_expert', name: 'Verified Expert', description: '10 observations verified by experts', icon: '✅', rarity: 'legendary' },
];

// Generate user ID and name
export function getCurrentUser(): { userId: string; userName: string } {
  if (typeof window === 'undefined') return { userId: 'demo', userName: 'Demo User' };
  
  let userId = localStorage.getItem('cs-user-id');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('cs-user-id', userId);
  }
  
  let userName = localStorage.getItem('cs-user-name');
  if (!userName) {
    const adjectives = ['Curious', 'Keen', 'Wild', 'Swift', 'Bright', 'Deep', 'Sharp', 'Calm'];
    const nouns = ['Observer', 'Naturalist', 'Explorer', 'Watcher', 'Tracker', 'Scout', 'Ranger', 'Guardian'];
    const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    userName = `${adjectives[hash % adjectives.length]} ${nouns[hash % nouns.length]}`;
    localStorage.setItem('cs-user-name', userName);
  }
  
  return { userId, userName };
}

// Get user profile from localStorage
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      userId: 'demo',
      userName: 'Demo User',
      joinedAt: Date.now(),
      observationsCount: 0,
      verifiedCount: 0,
      speciesCount: 0,
      badges: [],
      reputation: 0,
      level: 'Naturalist',
    };
  }

  const stored = localStorage.getItem('cs-user-profile');
  if (stored) return JSON.parse(stored);

  const { userId, userName } = getCurrentUser();
  const profile: UserProfile = {
    userId,
    userName,
    joinedAt: Date.now(),
    observationsCount: 0,
    verifiedCount: 0,
    speciesCount: 0,
    badges: [],
    reputation: 0,
    level: 'Naturalist',
  };
  localStorage.setItem('cs-user-profile', JSON.stringify(profile));
  return profile;
}

// Save user profile
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cs-user-profile', JSON.stringify(profile));
}

// Get user observations from localStorage
export function getUserObservations(): Observation[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('cs-observations');
  return stored ? JSON.parse(stored) : [];
}

// Save observation
export function saveObservation(obs: Observation): void {
  if (typeof window === 'undefined') return;
  const observations = getUserObservations();
  observations.unshift(obs);
  localStorage.setItem('cs-observations', JSON.stringify(observations));
  
  // Update profile
  const profile = getUserProfile();
  profile.observationsCount = observations.length;
  profile.speciesCount = new Set(observations.map(o => o.speciesId)).size;
  profile.verifiedCount = observations.filter(o => o.verified === 'verified').length;
  
  // Calculate reputation
  profile.reputation = Math.min(1000, 
    profile.observationsCount * 5 + 
    profile.verifiedCount * 10 + 
    profile.speciesCount * 2
  );
  
  // Update level
  if (profile.reputation >= 800) profile.level = 'Curator';
  else if (profile.reputation >= 500) profile.level = 'Expert';
  else if (profile.reputation >= 200) profile.level = 'Contributor';
  else profile.level = 'Naturalist';
  
  // Check badges
  checkAndAwardBadges(profile, observations);
  
  saveUserProfile(profile);
}

// Check and award badges
function checkAndAwardBadges(profile: UserProfile, observations: Observation[]): void {
  const earnedIds = new Set(profile.badges.map(b => b.id));
  const now = Date.now();
  const speciesSet = new Set(observations.map(o => o.speciesId));
  
  // Observation count badges
  checkBadge(profile, 'first_obs', observations.length >= 1, now);
  checkBadge(profile, 'ten_obs', observations.length >= 10, now);
  checkBadge(profile, 'fifty_obs', observations.length >= 50, now);
  checkBadge(profile, 'hundred_obs', observations.length >= 100, now);
  
  // Species count badges
  checkBadge(profile, 'ten_species', speciesSet.size >= 10, now);
  checkBadge(profile, 'fifty_species', speciesSet.size >= 50, now);
  checkBadge(profile, 'hundred_species', speciesSet.size >= 100, now);
  
  // Rare species badge
  const hasRare = observations.some(o => {
    const animal = sampleAnimals.find(a => a.id === o.speciesId);
    return animal && ['CR', 'EN'].includes(animal.conservationStatus);
  });
  checkBadge(profile, 'rare_species', hasRare, now);
  
  // Time-based badges
  const latestHour = new Date(observations[0]?.timestamp ?? now).getHours();
  checkBadge(profile, 'night_owl', latestHour >= 22 || latestHour <= 5, now);
  checkBadge(profile, 'early_bird', latestHour >= 4 && latestHour < 6, now);
  
  // Photo badge
  const withPhotos = observations.filter(o => o.photos.length > 0).length;
  checkBadge(profile, 'photo_master', withPhotos >= 10, now);
  
  // Streak badges (simplified)
  checkBadge(profile, 'streak_week', calculateStreak(observations) >= 7, now);
  checkBadge(profile, 'streak_month', calculateStreak(observations) >= 30, now);
  
  // Verified expert
  checkBadge(profile, 'verified_expert', profile.verifiedCount >= 10, now);
}

function checkBadge(profile: UserProfile, badgeId: string, condition: boolean, now: number): void {
  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return;
  
  const earnedIds = new Set(profile.badges.map(b => b.id));
  
  if (condition && !earnedIds.has(badgeId)) {
    profile.badges.push({ ...badge, earnedAt: now });
  }
}

function calculateStreak(observations: Observation[]): number {
  if (observations.length === 0) return 0;
  const dates = [...new Set(observations.map(o => new Date(o.timestamp).toDateString()))].sort();
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]).getTime() - new Date(dates[i-1]).getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// Get all badges (with earned status)
export function getAllBadges(profile?: UserProfile): (Badge & { earned: boolean })[] {
  const userProfile = profile ?? getUserProfile();
  const earnedIds = new Set(userProfile.badges.map(b => b.id));
  return BADGES.map(b => ({ ...b, earned: earnedIds.has(b.id) }));
}

// Record new observation (with offline sync)
export async function recordObservation(
  data: Omit<Observation, 'id' | 'userId' | 'userName' | 'verified' | 'badges'>
): Promise<string> {
  const { userId, userName } = getCurrentUser();
  
  const observation: Observation = {
    ...data,
    id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    userId,
    userName,
    verified: 'pending',
    badges: [],
  };
  
  // Save locally
  saveObservation(observation);
  
  // Queue for background sync if offline
  const online = navigator.onLine;
  if (!online) {
    await queueSighting(observation);
  }
  
  return observation.id;
}

// Search species for identification
export function searchSpeciesForObservation(query: string): Animal[] {
  const q = query.toLowerCase().trim();
  if (!q) return sampleAnimals.slice(0, 20);
  
  return sampleAnimals
    .filter(a => 
      a.commonName.toLowerCase().includes(q) ||
      a.scientificName.toLowerCase().includes(q) ||
      a.habitat?.some(h => h.toLowerCase().includes(q))
    )
    .slice(0, 20);
}

// Get species by ID
export function getSpeciesById(speciesId: string): Animal | undefined {
  return sampleAnimals.find(a => a.id === speciesId);
}

// Export observations for sharing
export function exportObservations(format: 'json' | 'csv' | 'geojson' = 'json'): string {
  const observations = getUserObservations();
  
  if (format === 'json') {
    return JSON.stringify(observations, null, 2);
  }
  
  if (format === 'csv') {
    const headers = ['ID', 'Species', 'Scientific Name', 'Date', 'Latitude', 'Longitude', 'Count', 'Confidence', 'Verified'];
    const rows = observations.map(o => [
      o.id,
      o.speciesName,
      o.scientificName,
      new Date(o.timestamp).toISOString(),
      o.coordinates.latitude,
      o.coordinates.longitude,
      o.count,
      o.confidence,
      o.verified,
    ]);
    return [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  }
  
  if (format === 'geojson') {
    const features = observations.map(o => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [o.coordinates.longitude, o.coordinates.latitude],
      },
      properties: {
        id: o.id,
        species: o.speciesName,
        scientificName: o.scientificName,
        timestamp: o.timestamp,
        count: o.count,
        confidence: o.confidence,
        verified: o.verified,
      },
    }));
    return JSON.stringify({ type: 'FeatureCollection', features }, null, 2);
  }
  
  return '';
}

// Get leaderboard (from localStorage - in real app would be from server)
export function getLeaderboard(): Array<{ userName: string; observations: number; species: number; reputation: number }> {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('cs-leaderboard');
  if (stored) return JSON.parse(stored);
  
  // Generate demo leaderboard
  const demo = [
    { userName: 'Curious Naturalist', observations: 247, species: 89, reputation: 923 },
    { userName: 'Keen Explorer', observations: 189, species: 67, reputation: 756 },
    { userName: 'Wild Watcher', observations: 156, species: 54, reputation: 634 },
    { userName: 'Swift Observer', observations: 134, species: 48, reputation: 567 },
    { userName: 'Bright Tracker', observations: 98, species: 42, reputation: 423 },
  ];
  localStorage.setItem('cs-leaderboard', JSON.stringify(demo));
  return demo;
}