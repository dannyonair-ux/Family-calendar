const CACHE = 'calfamiglia-v4';
const FILES = ['./calendario_famiglia.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
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
  // Firebase e gstatic sempre dalla rete
  if(e.request.url.includes('firebasedatabase') ||
     e.request.url.includes('firebaseio') ||
     e.request.url.includes('gstatic')) {
    e.respondWith(fetch(e.request).catch(()=>new Response('')));
    return;
  }
  // Network first, fallback cache
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

// Gestione notifiche push (per future implementazioni)
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./calendario_famiglia.html'));
});
