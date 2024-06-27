// service-worker.js
const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/index.html',
  "/studytools/index.html",
  "/studytools/outline/index.html",
  "/studytools/verses/index.html"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Fetch and cache new requests
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response to use it and cache it
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            // Handle fetch errors
            console.error('Error fetching data:', error);
          });
      })
  );
});