/* Keep the app online-first: never cache wallet screens or account data. */
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

/* A fetch listener enables Chrome's installability checks without storing data. */
self.addEventListener('fetch', function (event) {});
