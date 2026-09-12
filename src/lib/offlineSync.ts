/**
 * Offline Sync & Background Sync Hooks
 * Handles queuing sightings/observations when offline,
 * registering background sync, and online/offline detection.
 */

import { useEffect, useState, useCallback } from 'react';

export interface PendingItem {
  id: string;
  type: 'sighting' | 'observation';
  data: any;
  timestamp: number;
  retries: number;
}

const DB_NAME = 'OpenAnimalNet';
const DB_VERSION = 1;
const STORES = {
  SIGHTINGS: 'pendingSightings',
  OBSERVATIONS: 'pendingObservations',
  CACHED_SPECIES: 'cachedSpecies',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const target = event.target as IDBOpenDBRequest;
        const db = target.result;
        if (!db.objectStoreNames.contains(STORES.SIGHTINGS)) {
          db.createObjectStore(STORES.SIGHTINGS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.OBSERVATIONS)) {
          db.createObjectStore(STORES.OBSERVATIONS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.CACHED_SPECIES)) {
          db.createObjectStore(STORES.CACHED_SPECIES, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

// Generic store operations
async function addToStore<T extends PendingItem>(storeName: string, item: T): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function updateInStore<T extends PendingItem>(storeName: string, item: T): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Queue a sighting for background sync
export async function queueSighting(data: any): Promise<string> {
  const id = `sighting-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const item: PendingItem = {
    id,
    type: 'sighting',
    data,
    timestamp: Date.now(),
    retries: 0,
  };
  await addToStore(STORES.SIGHTINGS, item);
  await registerBackgroundSync('sync-sightings');
  return id;
}

// Queue an observation for background sync
export async function queueObservation(data: any): Promise<string> {
  const id = `observation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const item: PendingItem = {
    id,
    type: 'observation',
    data,
    timestamp: Date.now(),
    retries: 0,
  };
  await addToStore(STORES.OBSERVATIONS, item);
  await registerBackgroundSync('sync-observations');
  return id;
}

// Register background sync with Service Worker
async function registerBackgroundSync(tag: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
    return; // Background sync not supported
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);
  } catch (err) {
    console.warn('Background sync registration failed:', err);
  }
}

// Get pending counts
export async function getPendingCounts(): Promise<{ sightings: number; observations: number }> {
  const [sightings, observations] = await Promise.all([
    getAllFromStore<PendingItem>(STORES.SIGHTINGS),
    getAllFromStore<PendingItem>(STORES.OBSERVATIONS),
  ]);
  return { sightings: sightings.length, observations: observations.length };
}

// Get all pending items (for UI)
export async function getPendingItems(): Promise<PendingItem[]> {
  const [sightings, observations] = await Promise.all([
    getAllFromStore<PendingItem>(STORES.SIGHTINGS),
    getAllFromStore<PendingItem>(STORES.OBSERVATIONS),
  ]);
  return [...sightings, ...observations].sort((a, b) => a.timestamp - b.timestamp);
}

// Remove synced item
export async function removePendingItem(type: 'sighting' | 'observation', id: string): Promise<void> {
  const storeName = type === 'sighting' ? STORES.SIGHTINGS : STORES.OBSERVATIONS;
  await deleteFromStore(storeName, id);
}

// Increment retry count
export async function incrementRetry(type: 'sighting' | 'observation', id: string): Promise<void> {
  const storeName = type === 'sighting' ? STORES.SIGHTINGS : STORES.OBSERVATIONS;
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.retries += 1;
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Cache species for offline browsing
export async function cacheSpeciesForOffline(species: any[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CACHED_SPECIES, 'readwrite');
    const store = tx.objectStore(STORES.CACHED_SPECIES);
    let completed = 0;
    const total = species.length;
    if (total === 0) { resolve(); return; }
    for (const s of species) {
      const request = store.put(s);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(request.error);
    }
  });
}

// Get cached species count
export async function getCachedSpeciesCount(): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CACHED_SPECIES, 'readonly');
    const store = tx.objectStore(STORES.CACHED_SPECIES);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get cached species (for offline browsing)
export async function getCachedSpecies(): Promise<any[]> {
  return getAllFromStore(STORES.CACHED_SPECIES);
}

/**
 * React hook for online/offline status and pending sync
 */
export function useOfflineSync() {
  const [online, setOnline] = useState(true);
  const [pendingCounts, setPendingCounts] = useState({ sightings: 0, observations: 0 });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Initial online status
    setOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setOnline(true);
      // Trigger sync check when coming online
      checkAndSync();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial pending counts
    loadPendingCounts();

    // Periodic check
    const interval = setInterval(loadPendingCounts, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const loadPendingCounts = useCallback(async () => {
    try {
      const counts = await getPendingCounts();
      setPendingCounts(counts);
    } catch (err) {
      console.warn('Failed to load pending counts:', err);
    }
  }, []);

  const checkAndSync = useCallback(async () => {
    if (!online || isSyncing) return;
    const { sightings, observations } = await getPendingCounts();
    if (sightings === 0 && observations === 0) return;

    setIsSyncing(true);
    try {
      // The Service Worker handles actual sync via background sync events
      // We just trigger registration here
      if (sightings > 0) await registerBackgroundSync('sync-sightings');
      if (observations > 0) await registerBackgroundSync('sync-observations');
      await loadPendingCounts();
    } catch (err) {
      console.warn('Sync trigger failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [online, isSyncing]);

  const queueSightingData = useCallback(async (data: any) => {
    const id = await queueSighting(data);
    await loadPendingCounts();
    return id;
  }, []);

  const queueObservationData = useCallback(async (data: any) => {
    const id = await queueObservation(data);
    await loadPendingCounts();
    return id;
  }, []);

  return {
    online,
    pendingCounts,
    isSyncing,
    queueSighting: queueSightingData,
    queueObservation: queueObservationData,
    refresh: loadPendingCounts,
  };
}

/**
 * Hook for detecting if we're in a PWA context
 */
export function usePWA() {
  const [isPWA, setIsPWA] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsPWA(isStandalone || isIOSStandalone);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
  }, []);

  const install = async () => {
    if (!installPrompt) return false;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    setInstallPrompt(null);
    return result.outcome === 'accepted';
  };

  return { isPWA, installPrompt: !!installPrompt, install };
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}