 const CACHE = 'laozhuang-v1';
 const URLS = ['./index.html', './manifest.json', './icon.svg', './data.js', './app.js'];
 self.addEventListener('install', e => {
   e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)).then(() => self.skipWaiting()));
 });
 self.addEventListener('activate', e => {
   e.waitUntil(clients.claim());
 });
 self.addEventListener('fetch', e => {
   e.respondWith(
     caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('离线中', { status: 503 })))
   );
 });
