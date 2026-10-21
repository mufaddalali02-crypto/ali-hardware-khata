const CACHE='ah-khata-v2';
const ASSETS=['./','./index.html','./logo.png?v=2','./icon-192.png?v=2','./icon-512.png?v=2','./icon-192-maskable.png?v=2','./icon-512-maskable.png?v=2','./manifest.webmanifest'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{
      const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  // icons/manifest/logo: network-first so updates always win, cache as offline fallback
  e.respondWith(fetch(r).then(res=>{
    try{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}catch(x){}
    return res;
  }).catch(()=>caches.match(r)));
});
