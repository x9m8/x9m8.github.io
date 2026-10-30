const CACHE = 'pdfwb-v1';
const SHELL = ['./', './index.html', './manifest.json', './x9m8-logo-white.png', './x9m8-logo.png', './sample-scan.pdf',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs',
  'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.1/tesseract.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u))))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = e.request.url;
  if (e.request.method !== 'GET') return;
  if (u.includes('generativelanguage.googleapis.com')) return; // AI calls are never cached
  // network-first for the app shell so updates arrive; cache-first for libraries and tesseract data
  const cacheFirst = /cdnjs\.cloudflare\.com|jsdelivr|tessdata|tesseract/.test(u);
  e.respondWith(cacheFirst
    ? caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; }))
    : fetch(e.request).then(res => { if (res.ok && new URL(u).origin === location.origin) caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; }).catch(() => caches.match(e.request)));
});
