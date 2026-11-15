const V='shahn-v4';
const SCOPE=new URL(self.registration.scope);
const FILES=['index.html','manifest.json','icon-192.png','icon-512.png'];
const PATHS=new Set(FILES.map(f=>new URL(f,SCOPE).pathname).concat([SCOPE.pathname]));
const INDEX=new URL('index.html',SCOPE).href;
const keyOf=u=>{
 const x=new URL(u);
 if(x.origin!==SCOPE.origin||!PATHS.has(x.pathname))return null;
 return new Request(x.pathname===SCOPE.pathname?INDEX:x.origin+x.pathname);
};
self.addEventListener('install',e=>e.waitUntil(
 caches.open(V).then(c=>c.addAll(FILES.map(f=>new URL(f,SCOPE).href))).then(()=>self.skipWaiting())
));
self.addEventListener('activate',e=>e.waitUntil(
 caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>clients.claim())
));
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET')return;
 const key=keyOf(r.url);
 if(!key)return;
 e.respondWith(fetch(r).then(res=>{
  const cc=(res.headers.get('cache-control')||'').toLowerCase();
  if(res.ok&&res.type==='basic'&&!cc.includes('no-store')){
   const copy=res.clone();
   e.waitUntil(caches.open(V).then(c=>c.put(key,copy)));
  }
  return res;
 }).catch(async()=>{
  const c=await caches.open(V);
  return (await c.match(key))||Response.error();
 }));
});
