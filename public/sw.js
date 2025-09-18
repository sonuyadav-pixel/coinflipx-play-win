// Service Worker for Asset Caching
const CACHE_NAME = 'coinflipx-v1';
const STATIC_ASSETS = [
  '/src/assets/golden-coin.png',
  '/src/assets/golden-coin1.png',
  '/src/assets/golden-coin3.png',
  '/src/assets/gold-sparkle.png',
  '/src/assets/hero-srk.jpg',
  '/src/assets/coin-toss-animation.mp4',
  '/coin-flip-animation.mp4',
  '/coin-toss.mp4'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { 
          cache: 'no-cache' 
        })));
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // Only handle requests for our assets
  if (event.request.url.includes('/assets/') || 
      event.request.url.includes('.mp4') || 
      event.request.url.includes('.png') || 
      event.request.url.includes('.jpg')) {
    
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Serving from cache:', event.request.url);
            return cachedResponse;
          }
          
          // If not in cache, fetch from network and cache it
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              cache.put(event.request, responseClone);
              console.log('Cached new asset:', event.request.url);
            }
            return networkResponse;
          }).catch(() => {
            console.log('Network failed for:', event.request.url);
            return new Response('Asset not available offline', { 
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        });
      })
    );
  }
});

// Background sync for prefetching
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PREFETCH_ASSETS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return Promise.all(
          urls.map(url => 
            fetch(url).then(response => {
              if (response && response.status === 200) {
                cache.put(url, response.clone());
              }
            }).catch(() => {
              console.log('Prefetch failed for:', url);
            })
          )
        );
      })
    );
  }
});