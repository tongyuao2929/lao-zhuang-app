const CACHE = 'laozhuang-v55';
const URLS = [
  './index.html',
  './manifest.json',
  './icon.svg',
  './app.js?v=20260703-xuanli-281-polish',
  './data/index.json?v=20260703-xuanli-281-polish',
  './data/quotes.json?v=20260703-xuanli-281-polish'
];
 self.addEventListener('install', e => {
   e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)).then(() => self.skipWaiting()));
 });
 self.addEventListener('activate', e => {
   e.waitUntil(clients.claim());
 });
 self.addEventListener('fetch', e => {
   e.respondWith(
     fetch(e.request)
       .then(r => {
         const copy = r.clone();
         caches.open(CACHE).then(c => c.put(e.request, copy));
         return r;
       })
       .catch(() => caches.match(e.request).then(r => r || new Response('离线中', { status: 503 })))
   );
 });
