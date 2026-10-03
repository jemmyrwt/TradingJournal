const CACHE_NAME="tradevault-v4";
const APP_FILES=[
 "./","./index.html","./manifest.json","./css/style.css",
 "./js/app.js","./js/storage.js","./js/ui.js","./js/trades.js","./js/risk.js",
 "./js/calendar.js","./js/analytics.js","./js/playbook.js","./js/backtesting.js",
 "./js/reviews.js","./js/settings.js","./icons/192.svg","./icons/512.svg"
];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_FILES)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET") return;
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{
   if(!res||res.status!==200)return res;
   const clone=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request,clone)); return res;
 }).catch(()=>e.request.mode==="navigate"?caches.match("./index.html"):undefined)));
});