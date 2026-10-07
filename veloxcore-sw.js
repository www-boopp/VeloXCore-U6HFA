/* VeloXCore service worker: online-first. Only the app shell is cached for an
   offline fallback; account and wallet data requests are never cached. */
var CACHE = 'veloxcore-shell-v2';
var SHELL = ['./', './index.html', './veloxcore-manifest.webmanifest',
  './veloxcore-icon-180.png', './veloxcore-icon-192.png', './veloxcore-icon-512.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('veloxcore-shell-') === 0 && k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // external/API data: never touched
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
      return res;
    }).catch(function () {
      return caches.match('./index.html').then(function (r) { return r || caches.match('./'); });
    }));
    return;
  }
  if (SHELL.some(function (p) { return url.pathname.endsWith(p.replace('./', '/')) && p !== './'; })) {
    event.respondWith(fetch(req).catch(function () { return caches.match(req); }));
  }
});
