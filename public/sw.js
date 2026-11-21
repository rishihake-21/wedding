/**
 * Lightweight repeat-visit Service Worker (Phase 10).
 * - Network-first for HTML navigations so late date/venue updates always show immediately.
 * - Cache-first for hashed JS/CSS/font/asset bundles for instant repeat visits on slow networks.
 */

const CACHE_NAME = 'vrindavan-invite-v1';
const SHELL_ASSETS = ['/', '/index.html', '/icon.svg', '/og-card.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match('/index.html')),
    );
    return;
  }

  if (url.pathname.startsWith('/assets/') || /\.(js|css|svg|woff2|webp|avif|glb|mp3|ogg)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return res;
          }),
      ),
    );
  }
});
