// PWA Service Worker for OpenAnimalNet
// Features:
// - Cache-first for static assets (CSS, JS, images, fonts)
// - Stale-while-revalidate for API responses
// - Network-first for HTML pages (with offline fallback)
// - Background sync for pending sightings/observations
// - Offline page with cached species data

const CACHE_NAME = 'openanimalnet-v1.23.0';
const STATIC_CACHE = 'openanimalnet-static-v1';
const API_CACHE = 'openanimalnet-api-v1';
const IMAGE_CACHE = 'openanimalnet-images-v1';
const OFFLINE_CACHE = 'openanimalnet-offline-v1';

// Assets to precache (app shell)
const PRECACHE_URLS = [
  '/',
  '/animal',
  '/migration',
  '/gallery',
  '/compare',
  '/analytics',
  '/identify',
  '/ai',
  '/search',
  '/site.webmanifest',
  '/offline',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first - for static assets that don't change often
  cacheFirst: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    } catch {
      return new Response('Offline', { status: 503 });
    }
  },

  // Stale while revalidate - for API responses
  staleWhileRevalidate: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    }).catch(() => cached);
    return cached ?? fetchPromise;
  },

  // Network first - for HTML pages
  networkFirst: async (request, cacheName, offlineFallback = '/offline') => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;
      // For navigation requests, show offline page
      if (request.mode === 'navigate') {
        return cache.match(offlineFallback) ?? new Response('Offline', { status: 503 });
      }
      return new Response('Offline', { status: 503 });
    }
  },
};

// Install - precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(new Request(url, { credentials: 'same-origin' })))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => ![CACHE_NAME, STATIC_CACHE, API_CACHE, IMAGE_CACHE, OFFLINE_CACHE].includes(key))
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - route requests to appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // API routes - stale while revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // Images - cache first with long TTL
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|webp|svg|ico)$/i)) {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Static assets - cache first
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'font') {
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages - network first with offline fallback
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(CACHE_STRATEGIES.networkFirst(request, CACHE_NAME));
    return;
  }

  // Default - network first
  event.respondWith(CACHE_STRATEGIES.networkFirst(request, CACHE_NAME));
});

// Background Sync for pending sightings
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sightings') {
    event.waitUntil(syncPendingSightings());
  }
  if (event.tag === 'sync-observations') {
    event.waitUntil(syncPendingObservations());
  }
});

// Push notifications (for alerts)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url ?? '/' },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view' && event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

// Sync pending sightings from IndexedDB
async function syncPendingSightings() {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingSightings', 'readonly');
    const store = tx.objectStore('pendingSightings');
    const sightings = await getAll(store);

    for (const sighting of sightings) {
      try {
        const response = await fetch('/api/v1/sightings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sighting),
        });
        if (response.ok) {
          // Remove from pending queue
          const delTx = db.transaction('pendingSightings', 'readwrite');
          await delTx.objectStore('pendingSightings').delete(sighting.id);
          await delTx.done;
        }
      } catch (err) {
        console.warn('Failed to sync sighting:', err);
      }
    }
  } catch (err) {
    console.warn('Background sync failed:', err);
  }
}

// Sync pending observations
async function syncPendingObservations() {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingObservations', 'readonly');
    const store = tx.objectStore('pendingObservations');
    const observations = await getAll(store);

    for (const obs of observations) {
      try {
        const response = await fetch('/api/v1/observations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(obs),
        });
        if (response.ok) {
          const delTx = db.transaction('pendingObservations', 'readwrite');
          await delTx.objectStore('pendingObservations').delete(obs.id);
          await delTx.done;
        }
      } catch (err) {
        console.warn('Failed to sync observation:', err);
      }
    }
  } catch (err) {
    console.warn('Background sync failed:', err);
  }
}

// IndexedDB helpers
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OpenAnimalNet', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingSightings')) {
        db.createObjectStore('pendingSightings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingObservations')) {
        db.createObjectStore('pendingObservations', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cachedSpecies')) {
        db.createObjectStore('cachedSpecies', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAll(store: IDBObjectStore): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Periodic sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-species-data') {
    event.waitUntil(refreshSpeciesCache());
  }
});

async function refreshSpeciesCache() {
  try {
    const response = await fetch('/api/v1/animals?limit=500');
    if (response.ok) {
      const data = await response.json();
      const db = await openDB();
      const tx = db.transaction('cachedSpecies', 'readwrite');
      const store = tx.objectStore('cachedSpecies');
      for (const species of data.data) {
        await store.put(species);
      }
      await tx.done;
    }
  } catch (err) {
    console.warn('Species cache refresh failed:', err);
  }
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  if (event.data?.type === 'CACHE_SPECIES') {
    event.waitUntil(cacheSpeciesForOffline(event.data.species));
  }
});

async function cacheSpeciesForOffline(species: any[]) {
  const db = await openDB();
  const tx = db.transaction('cachedSpecies', 'readwrite');
  const store = tx.objectStore('cachedSpecies');
  for (const s of species) {
    await store.put(s);
  }
  await tx.done;
}