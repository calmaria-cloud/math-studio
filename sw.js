const CACHE='math-studio-e5f59109d899';
const ROOT=new URL('./',self.location).href;
const ASSETS=['index.html','manifest.webmanifest','icon-192.png','icon-512.png'].map(p=>new URL(p,ROOT).href);
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(const url of ASSETS) {
    const response=await fetch(url,{cache:'reload',credentials:'same-origin'});
    if(!response.ok || response.redirected) throw new Error('Offline resource unavailable');
    await cache.put(url,response);
  }
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys()) if(key.startsWith('math-studio-') && key!==CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET' || url.origin!==self.location.origin)return;
  const isEntry=event.request.mode==='navigate' && (url.pathname===new URL(ROOT).pathname || url.pathname===new URL('index.html',ROOT).pathname);
  if(isEntry) {
    event.respondWith(caches.open(CACHE).then(cache=>cache.match(ASSETS[0])).then(hit=>hit || fetch(event.request)));return;
  }
  if(ASSETS.includes(url.href)) event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(hit=>hit || fetch(event.request)));
});
