// AdQ — Service Worker
// Necessário para instalação PWA no Chrome/GitHub Pages

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

// Cache simples para funcionamento offline básico
var CACHE = 'adq-v1';
self.addEventListener('fetch', function(e) {
  // Deixa passar requisições para Firebase/Autentique normalmente
  if (e.request.url.includes('firestore') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('autentique')) {
    return;
  }
  // Para o próprio HTML: network first, cache fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function(r) {
        var clone = r.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return r;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
  }
});
