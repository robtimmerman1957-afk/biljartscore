// Biljartscore v1.17 - PWA cache update
const CACHE = 'biljartscore-v1.17';

const CORE = [
  '/',
  '/index.html',
  '/scorebord.html',
  '/scorebord-tv.html',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const isNav = req.mode === 'navigate' ||
                (req.headers.get('accept') || '').includes('text/html');

  if (isNav) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(r => 
      r || fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
        return res;
      }))
  );
});
