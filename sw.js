const V='shahn-v3';
const STATIC=['index.html','manifest.json','icon-192.png','icon-512.png'];
const keyOf=u=>{const x=new URL(u);const n=x.pathname.split('/').pop()||'index.html';return STATIC.includes(n)?new Request(x.origin+x.pathname.replace(/[^/]*$/,'')+n):null};
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>Promise.all(STATIC.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET'||!r.url.startsWith(location.origin))return;
 const key=keyOf(r.url);
 if(!key)return;
 e.respondWith(fetch(r).then(res=>{
  const cc=(res.headers.get('cache-control')||'').toLowerCase();
  if(res.ok&&res.type==='basic'&&!cc.includes('no-store')){const copy=res.clone();e.waitUntil(caches.open(V).then(h=>h.put(key,copy)))}
  return res;
 }).catch(()=>caches.match(key)));
});
