// Service worker : l'appli fonctionne hors ligne une fois ouverte (cartes et météo exigent le réseau).
const CACHE="lunette-v4.20";
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
  "ligne.js",
  "maplibre/maplibre-gl.css",
  "maplibre/maplibre-gl.js",
  "manifest.webmanifest",
  "reticles/discovery-ed-prs-gen2-ffp-z.webp",
];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin||u.pathname.endsWith(".apk"))return; // tuiles et météo : réseau direct
  // réseau d'abord (mise à jour immédiate), cache si hors ligne
  // réseau faible : au-delà de 4 s on sert la copie gardée, la version réseau la remplace pour la prochaine fois
  const net=fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}return r;});
  e.respondWith(new Promise(res=>{let done=false;const hit=()=>caches.match(e.request,{ignoreSearch:true});
    const t=setTimeout(()=>hit().then(h=>{if(h&&!done){done=true;res(h);}}),4000);
    net.then(r=>{if(!done){done=true;clearTimeout(t);res(r);}}).catch(()=>hit().then(h=>{if(!done){done=true;clearTimeout(t);res(h||Response.error());}}));}));
});
