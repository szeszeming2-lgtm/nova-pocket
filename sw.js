// Super One service worker: saves the app (and then the dictionary + map) so it opens with no internet.
const CORE_V = 'np-core-1b93123209a6', DATA_V = 'np-data-ec8cfcba76d3';
const CORE = ["index.html", "app.js", "style.css", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon.png", "data/world.json", "data/countries.json"], DATA = ["data/dict/0.json", "data/dict/a.json", "data/dict/b.json", "data/dict/c.json", "data/dict/d.json", "data/dict/e.json", "data/dict/f.json", "data/dict/g.json", "data/dict/h.json", "data/dict/i.json", "data/dict/index.json", "data/dict/j.json", "data/dict/k.json", "data/dict/l.json", "data/dict/m.json", "data/dict/n.json", "data/dict/o.json", "data/dict/p.json", "data/dict/q.json", "data/dict/r.json", "data/dict/s.json", "data/dict/t.json", "data/dict/u.json", "data/dict/v.json", "data/dict/w.json", "data/dict/x.json", "data/dict/y.json", "data/dict/z.json", "data/bible/BBE.json", "data/bible/KJV.json", "data/bible/NHEB.json"];
const tell = msg => self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(cs => cs.forEach(c => c.postMessage(msg)));
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_V);
    try {
      await Promise.all(CORE.map(async f => { const r = await fetch(new Request(f, { cache: 'reload' })); if (!r.ok) throw new Error(f + ' ' + r.status); await cache.put(f, r); }));
      await cache.put('__core_complete', new Response(CORE_V));
    } catch (e) { await tell({ type: 'failed', error: String(e) }); throw e; }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('np-') && k !== CORE_V && k !== DATA_V) await caches.delete(k);
    await self.clients.claim(); await tell({ type: 'core-done' });
  })());
});
let saving = null;
function cacheData() {
  if (saving) return saving;
  saving = (async () => {
    const cache = await caches.open(DATA_V);
    if (await cache.match('__data_complete')) { await tell({ type: 'data-done' }); return; }
    let done = 0;
    for (const f of DATA) {
      if (!(await cache.match(f))) {
        let ok = false;
        for (let t = 0; t < 3 && !ok; t++) { try { const r = await fetch(new Request(f, { cache: 'reload' })); if (r.ok) { await cache.put(f, r); ok = true; } } catch (e) { } }
        if (!ok) { await tell({ type: 'failed', error: 'could not save ' + f }); saving = null; return; }
      }
      done++; await tell({ type: 'data-progress', done, total: DATA.length });
    }
    await cache.put('__data_complete', new Response(DATA_V)); await tell({ type: 'data-done' });
  })();
  return saving;
}
self.addEventListener('message', event => { if (event.data && event.data.type === 'cacheData') event.waitUntil(cacheData()); });
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith((async () => {
    if (req.mode === 'navigate') {
      const page = await caches.match('index.html', { cacheName: CORE_V });
      if (page) return page;
      try { return await fetch(req); } catch (e) { return new Response('<h1>Super One</h1><p>Open me once with internet so I can save myself for offline use.</p>', { headers: { 'Content-Type': 'text/html' } }); }
    }
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(req); } catch (e) { return new Response('', { status: 504, statusText: 'offline' }); }
  })());
});
