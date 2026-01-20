
const CACHE_NAME = 'gold-master-pwa-v2';
const OFFLINE_URL = '/index.html';

// Install: Cache the offline page (App Shell) to satisfy PWA requirements
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We only cache the entry point. The inner React Logic (OnlineGuard) will handle the "No Internet" UI.
      // This is crucial for Chrome to show the "Install" button.
      return cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Strategy: Network First, falling back to Cache (App Shell) only for HTML navigation.
  // This allows the app to "load" offline (triggering PWA recognition), 
  // but then your React App stops the user from doing anything.
  
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // For all other assets (API, scripts, etc), try Network only.
  // If it fails, the browser throws error, which is handled by your app's Error Boundaries or OnlineGuard.
  event.respondWith(fetch(event.request));
});
