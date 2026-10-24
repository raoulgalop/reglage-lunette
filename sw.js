// Service worker : l'appli fonctionne hors ligne une fois ouverte (cartes et météo exigent le réseau).
const CACHE="lunette-v4.7";
const FILES=[
  "./",
  "catalog.js",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "index.html",
  "leaflet/images/layers-2x.png",
  "leaflet/images/layers.png",
  "leaflet/images/marker-icon-2x.png",
  "leaflet/images/marker-icon.png",
  "leaflet/images/marker-shadow.png",
  "leaflet/leaflet.css",
  "leaflet/leaflet.js",
  "manifest.webmanifest",
  "reticles/discovery-ed-prs-gen2-ffp-z.webp",
];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin)return; // tuiles et météo : réseau direct
  // réseau d'abord (mise à jour immédiate), cache si hors ligne
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return r;})
    .catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
