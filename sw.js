const CACHE = 'calfamiglia-v2';
const FILES = ['./calendario_famiglia.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting(); // attiva subito senza aspettare
});

self.addEventListener('activate', e => {
  // Elimina cache vecchie automaticamente
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Le chiamate Firebase non vanno mai in cache
  if(e.request.url.includes('firebasedatabase') || e.request.url.includes('firebaseio')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
