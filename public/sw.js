// PWA Service Worker for offline caching with background sync.
// Plain JavaScript — browsers parse service workers as-is (no TS transforms).

const CACHE_NAME = 'openanimalnet-v1.23.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const API_CACHE = `${CACHE_NAME}-api`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

// App shell routes to pre-cache
const APP_SHELL = [
  '/',
  '/animal',
  '/migration',
  '/gallery',
  '/compare',
  '/search',
  '/identify',
  '/analytics',
  '/habitat-viz',
  '/subscriptions',
  '/annotations',
  '/data/export',
  '/site.webmanifest',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Same-origin only
  if (url.origin !== self.location.origin) return;

  // API requests: network-first with 60s timeout, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, 60000));
    return;
  }

  // Images: cache-first
  if (
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/_next/image') ||
    request.destination === 'image'
  ) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Navigation: stale-while-revalidate
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Everything else: cache-first
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// ─── Caching Strategies ──────────────────────────────────

async function networkFirst(request, cacheName, timeout = 10000) {
  const cache = await caches.open(cacheName);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached ?? caches.match('/'));

  return cached ?? fetchPromise;
}

// ─── Background Sync ──────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-observations') {
    event.waitUntil(syncObservations());
  }
  if (event.tag === 'sync-annotations') {
    event.waitUntil(syncAnnotations());
  }
});

async function syncObservations() {
  const cache = await caches.open(`${CACHE_NAME}-pending`);
  const requests = await cache.keys();
  for (const req of requests) {
    if (req.url.includes('sync-observations')) {
      try {
        const body = await cache.match(req).then(r => r?.text());
        if (body) {
          await fetch('/api/v1/live/observations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          });
          await cache.delete(req);
        }
      } catch {}
    }
  }
}

async function syncAnnotations() {
  const cache = await caches.open(`${CACHE_NAME}-pending`);
  const requests = await cache.keys();
  for (const req of requests) {
    if (req.url.includes('sync-annotations')) {
      try {
        const body = await cache.match(req).then(r => r?.text());
        if (body) {
          await fetch('/api/v1/annotations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          });
          await cache.delete(req);
        }
      } catch {}
    }
  }
}

// ─── Push Notifications ──────────────────────────────────

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'OpenAnimalNet', body: 'New alert' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: data.url ?? '/',
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    );
  }
});