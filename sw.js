
const CACHE_NAME = 'gold-master-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Stale While Revalidate for static, Network First for data
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like APIs usually, but cache fonts/cdn
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If we have a cached response, return it, but also update the cache in background
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Check if valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
          return networkResponse;
        }
        // Clone and cache
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
           // Don't cache API calls aggressively
           if(!event.request.url.includes('turso.io') && !event.request.url.includes('allorigins')) {
               cache.put(event.request, responseToCache);
           }
        });
        return networkResponse;
      }).catch(() => {
         // Offline fallback if needed
      });

      return cachedResponse || fetchPromise;
    })
  );
});
