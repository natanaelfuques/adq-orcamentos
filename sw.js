const CACHE = 'adq-v3';
const ASSETS = [
  '/adq-orcamentos/',
  '/adq-orcamentos/index.html',
  '/adq-orcamentos/manifest.json',
  '/adq-orcamentos/favicon.ico',
  '/adq-orcamentos/icon-192.png',
  '/adq-orcamentos/icon-512.png',
  '/adq-orcamentos/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
