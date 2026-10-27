/* ================= ligne de tir : relief, bâtiments et obstacles entre le tireur et la cible =================
   Relief : IGN RGE ALTI (France, 1 à 5 m) → tuiles Terrarium (monde, ≈30 m) → Open-Meteo (90 m).
   Bâtiments : IGN BD TOPO (hauteur de chaque bâtiment) → OpenStreetMap hors de France.
   La balle est suivie avec la tourelle réglée pour la distance : elle passe au-dessus de la ligne de visée. */
(function(){
if(!S.los)S.los={};
const LS=Object.assign({post:"0.3",postX:10,tgt:"sol",tgtX:2,obs:[],obsKey:""},S.los);S.los=LS;
const R0=6371008.8,MARGIN=0.25,CELL=0.004;
const XDB={get:k=>TileDB.get("x:"+k).then(v=>v&&v.j),put:(k,j)=>TileDB.put("x:"+k,{j,d:Date.now()})};
const enu=o=>{const c=Math.cos(o.lat*DEG);return {f:(lat,lon)=>[(lon-o.lon)*DEG*R0*c,(lat-o.lat)*DEG*R0],inv:(x,y)=>({lat:o.lat+y/(DEG*R0),lon:o.lon+x/(DEG*R0*c)})};};
const fr=(v,n)=>fx(v,n).replace(".",",");

/* ---------- hauteurs du tireur et de la cible ---------- */
window.losSH=()=>LS.post==="x"?Math.max(0,pf(LS.postX)||0):+LS.post;
window.losTH=()=>{
  if(LS.tgt==="x")return Math.max(0,pf(LS.tgtX)||0);
  if(LS.tgt==="etage")return Math.max(0,Math.round(pf(LS.tgtX)||0))*3+1.5;
  if(LS.tgt==="toit"){const b=LC.data&&LC.data.tb;return b?b.rel+0.3:0.5;}
  return 0.5;
};

/* ---------- relief Terrarium (tuiles PNG gardées comme les tuiles de carte) ---------- */
const TZ=15,TT=new Map(),TV=new Map();
function tXY(lat,lon,z){const n=2**z,s=Math.sin(lat*DEG);return [(lon+180)/360*n,(0.5-Math.log((1+s)/(1-s))/(4*Math.PI))*n];}
function terrTile(x,y){const k=TZ+"/"+x+"/"+y;if(TV.has(k))return Promise.resolve(TV.get(k));if(TT.has(k))return TT.get(k);
  const p=(async()=>{const o=await tileSrc(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${k}.png`);
    const img=new Image();await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=o.src;});
    const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d");g.drawImage(img,0,0);URL.revokeObjectURL(o.src);
    const d=g.getImageData(0,0,256,256).data,e=new Float32Array(65536);for(let i=0;i<65536;i++)e[i]=d[4*i]*256+d[4*i+1]+d[4*i+2]/256-32768;
    TV.set(k,e);return e;})().catch(()=>null).finally(()=>TT.delete(k));
  TT.set(k,p);return p;}
async function terrLoad(s,w,n,e){const a=tXY(n,w,TZ),b=tXY(s,e,TZ),L=[];
  if((Math.floor(b[0])-Math.floor(a[0])+1)*(Math.floor(b[1])-Math.floor(a[1])+1)>64)return false;
  for(let x=Math.floor(a[0]);x<=Math.floor(b[0]);x++)for(let y=Math.floor(a[1]);y<=Math.floor(b[1]);y++)L.push(terrTile(x,y));
  return (await Promise.all(L)).every(Boolean);}
function terrAt(lat,lon){const[x,y]=tXY(lat,lon,TZ),tx=Math.floor(x),ty=Math.floor(y),e=TV.get(TZ+"/"+tx+"/"+ty);if(!e)return NaN;
  const px=Math.min(254.999,Math.max(0,(x-tx)*256-0.5)),py=Math.min(254.999,Math.max(0,(y-ty)*256-0.5)),i=Math.floor(px),j=Math.floor(py),u=px-i,v=py-j,k=j*256+i;
  return e[k]*(1-u)*(1-v)+e[k+1]*u*(1-v)+e[k+256]*(1-u)*v+e[k+257]*u*v;}

/* ---------- bâtiments (cellules de 0,004° gardées hors ligne) ---------- */
function bldParseIGN(j,lonC){const out=[];(j.features||[]).forEach((f,n)=>{const g=f.geometry;if(!g)return;const P=f.properties||{};
  const polys=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];
  polys.forEach(pl=>{let r=pl[0];if(!r||r.length<3)return;r=r.map(c=>Math.abs(c[0]-lonC)<Math.abs(c[1]-lonC)?[c[1],c[0]]:[c[0],c[1]]); // [lat,lon]
    const top=pf(P.altitude_maximale_toit),sol=pf(P.altitude_minimale_sol),et=pf(P.nombre_d_etages);
    let h=pf(P.hauteur),est=false;if(!(h>0))h=et>0?et*3+1:(top>sol?top-sol:NaN);if(!(h>0)){h=6;est=true;}
    out.push({id:"i"+(f.id||P.cleabs||n),r,h,top:top>0?top:null,est});});});return out;}
function bldParseOSM(j){return (j.elements||[]).filter(e=>e.geometry&&e.geometry.length>2).map(e=>{const t=e.tags||{};let h=pf(t.height),est=false;
  if(!(h>0)){const l=pf(t["building:levels"]);h=l>0?l*3+1:NaN;}if(!(h>0)){h=6;est=true;}
  return {id:"o"+e.id,r:e.geometry.map(p=>[p.lat,p.lon]),h,top:null,est};});}
async function bldCell(i,j,net=true){const k=`bat:${i},${j}`,hit=await XDB.get(k);if(hit)return hit;if(!net)return null;
  const s=i*CELL,w=j*CELL,n=s+CELL,e=w+CELL;let r=null;
  try{const u=`https://data.geopf.fr/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=BDTOPO_V3:batiment&OUTPUTFORMAT=application/json&COUNT=5000&SRSNAME=EPSG:4326&BBOX=${s},${w},${n},${e},urn:ogc:def:crs:EPSG::4326`;
    const q=await fetchT(u,15000);if(!q.ok)throw 0;const L=bldParseIGN(await q.json(),w+CELL/2);
    if(L.length||(s>41&&s<51.2&&w>-5.3&&w<9.7))r={L,src:"ign"};}catch(x){}
  if(!r)try{const q=await fetchT("https://overpass-api.de/api/interpreter?data="+encodeURIComponent(`[out:json][timeout:20];way["building"](${s},${w},${n},${e});out geom tags;`),20000);
    if(q.ok)r={L:bldParseOSM(await q.json()),src:"osm"};}catch(x){}
  if(r)XDB.put(k,r);return r;}
async function bldLoad(s,w,n,e,net=true){const I0=Math.floor(s/CELL),I1=Math.floor(n/CELL),J0=Math.floor(w/CELL),J1=Math.floor(e/CELL);
  if((I1-I0+1)*(J1-J0+1)>80)return {L:[],src:"trop",miss:0};
  const jobs=[];for(let i=I0;i<=I1;i++)for(let j=J0;j<=J1;j++)jobs.push(bldCell(i,j,net));
  const R=await Promise.all(jobs),seen=new Set(),L=[];let miss=0;const src=new Set();
  R.forEach(r=>{if(!r){miss++;return;}src.add(r.src);r.L.forEach(b=>{if(!seen.has(b.id)){seen.add(b.id);L.push(b);}});});
  return {L,src:[...src].join("+")||"aucune",miss};}
// bâtiments en coordonnées locales (m), avec une grille pour aller vite
function bldIndex(L,E){const G=new Map(),A=[];L.forEach(b=>{const r=b.r.map(p=>E.f(p[0],p[1]));let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;r.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
    const o=Object.assign({},b,{xy:r,bb:[x0,y0,x1,y1]});A.push(o);for(let gx=Math.floor(x0/20);gx<=Math.floor(x1/20);gx++)for(let gy=Math.floor(y0/20);gy<=Math.floor(y1/20);gy++){const k=gx+","+gy;(G.get(k)||G.set(k,[]).get(k)).push(o);}});
  return {A,at(x,y){const c=G.get(Math.floor(x/20)+","+Math.floor(y/20));if(!c)return null;for(const b of c){if(x<b.bb[0]||x>b.bb[2]||y<b.bb[1]||y>b.bb[3])continue;
    let ins=false;const r=b.xy;for(let i=0,k=r.length-1;i<r.length;k=i++){if((r[i][1]>y)!==(r[k][1]>y)&&x<(r[k][0]-r[i][0])*(y-r[i][1])/(r[k][1]-r[i][1])+r[i][0])ins=!ins;}if(ins)return b;}return null;}};}
const bTop=(b,g)=>b.top!=null&&b.top>g-2&&b.top<g+400?b.top:g+b.h; // sommet absolu du bâtiment

/* ---------- trajectoire du setup en cours, tourelle réglée pour la distance ---------- */
function traj(D,flat){const p=P(),c=conditions();if(flat){c.site=0;}
  const tr=fly(Object.assign({p,alpha:zeroAngle(p),maxX:D+1},c)),end=tr(D);if(!end)return null;
  return d=>{const r=tr(Math.min(Math.max(d,0),D));return r?r.y-end.y*d/D:0;};} // y par rapport à la visée (m)
function clr(z,lo,hi){return z>hi?z-hi:z<lo?lo-z:-Math.min(hi-z,z-lo);}

/* ---------- relief le long de la ligne ---------- */
async function profileZ(a,b,N){
  const key=`prof:${[a.lat,a.lon,b.lat,b.lon].map(v=>v.toFixed(6)).join(",")}:${N}`,hit=await XDB.get(key);if(hit)return hit;
  const ok=z=>z&&z.length>1&&z.every(v=>isFinite(v)&&v>-500);
  const resamp=z=>Array.from({length:N+1},(_,i)=>{const t=i/N*(z.length-1),k=Math.min(z.length-2,Math.floor(t)),u=t-k;return z[k]*(1-u)+z[k+1]*u;});
  let r=null;
  try{const u=`https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevationLine.json?lon=${a.lon}|${b.lon}&lat=${a.lat}|${b.lat}&resource=ign_rge_alti_wld&delimiter=|&indent=false&measures=false&zonly=false&profile_mode=simple&sampling=${Math.min(N+1,2000)}`;
    const q=await fetchT(u,15000);if(q.ok){const j=await q.json(),z=(j.elevations||[]).map(e=>typeof e==="number"?e:pf(e.z));if(ok(z))r={z:resamp(z),src:"ign"};}}catch(x){}
  if(!r){const s=Math.min(a.lat,b.lat)-1e-4,n=Math.max(a.lat,b.lat)+1e-4,w=Math.min(a.lon,b.lon)-1e-4,e=Math.max(a.lon,b.lon)+1e-4;
    if(await terrLoad(s,w,n,e)){const z=Array.from({length:N+1},(_,i)=>terrAt(a.lat+(b.lat-a.lat)*i/N,a.lon+(b.lon-a.lon)*i/N));if(ok(z))r={z,src:"terrarium"};}}
  if(!r)try{const M=Math.min(N,99),la=[],lo=[];for(let i=0;i<=M;i++){la.push((a.lat+(b.lat-a.lat)*i/M).toFixed(6));lo.push((a.lon+(b.lon-a.lon)*i/M).toFixed(6));}
    const q=await fetchT(`https://api.open-meteo.com/v1/elevation?latitude=${la}&longitude=${lo}`,10000),j=await q.json();if(ok(j.elevation))r={z:resamp(j.elevation),src:"om"};}catch(x){}
  if(r)XDB.put(key,r);return r;}
const SRC={ign:"IGN RGE ALTI (1 à 5 m)",terrarium:"Terrarium (≈30 m, moins précis)",om:"Open-Meteo (90 m, approximatif)"};

/* ---------- calcul de la ligne ---------- */
let LC={key:null,data:null,seq:0,res:null};
async function losRun(force){
  const msg=$("losMsg");
  if(!(S.shooter&&S.target)){LC.key=null;LC.data=null;LC.res=null;msg.textContent="Placez le tireur (GPS) et touchez la cible sur la carte : l'appli vérifie si le relief, les bâtiments ou un obstacle coupent la trajectoire.";losDraw();return;}
  const key=[S.shooter.lat,S.shooter.lon,S.target.lat,S.target.lon].map(v=>v.toFixed(6)).join(",");
  if(LS.obsKey!==key){if(LS.obsKey&&LS.obs.length)toast("Obstacles ajoutés à la main effacés : la ligne de tir a changé.");LS.obs=[];LS.obsKey=key;renderObs();}
  if(LC.key===key&&LC.data&&!force){losDraw();return;}
  const seq=++LC.seq,a=S.shooter,b=S.target,H=haversine(a,b);
  if(H<5||H>3000){LC.key=key;LC.data=null;msg.textContent=H<5?"Cible trop proche.":"Au-delà de 3 km, la ligne de tir n'est pas vérifiée.";losDraw();return;}
  msg.textContent="Lecture du relief et des bâtiments…";
  const N=Math.max(30,Math.min(800,Math.ceil(H/1.5))),m=60/(DEG*R0),cl=Math.cos(a.lat*DEG);
  const [pz,bl]=await Promise.all([profileZ(a,b,N),bldLoad(Math.min(a.lat,b.lat)-m,Math.min(a.lon,b.lon)-m/cl,Math.max(a.lat,b.lat)+m,Math.max(a.lon,b.lon)+m/cl)]);
  if(seq!==LC.seq)return;
  LC.key=key;
  if(!pz){LC.data=null;msg.textContent="Relief indisponible (pas de réseau et zone jamais chargée). Utilisez « Garder relief et bâtiments » avant d'aller sur le terrain.";losDraw();return;}
  const E=enu(a),I=bldIndex(bl.L,E),T=E.f(b.lat,b.lon),pts=[];
  const ux=T[0]/H,uy=T[1]/H,nx=-uy,ny=ux,tb0=I.at(T[0],T[1]),sb=I.at(0,0);
  for(let i=0;i<=N;i++){const d=H*i/N,x=ux*d,y=uy*d,g=pz.z[i];let top=null,bd=null;
    for(const o of [0,-0.5,0.5]){const bb=I.at(x+nx*o,y+ny*o);if(bb&&bb!==tb0&&bb!==sb){const t=bTop(bb,g);if(top==null||t>top){top=t;bd=bb;}}}
    pts.push({d,x,y,g,top,bd});}
  const gT=pz.z[N];
  LC.data={H,N,pts,src:pz.src,bsrc:bl.src,bn:bl.L.length,bmiss:bl.miss,az:bearing(a,b),
    tb:tb0?{h:tb0.h,rel:bTop(tb0,gT)-gT,est:tb0.est}:null,sb:sb?{rel:bTop(sb,pz.z[0])-pz.z[0]}:null,I,E};
  if(pz.src==="ign"&&(Math.abs((a.alt??-1e4)-pz.z[0])>0.05||Math.abs((b.alt??-1e4)-gT)>0.05)){a.alt=pz.z[0];b.alt=gT;geoApply();}
  else geoApply();
}
function geoApply(){_ug(false);} // recalcule site et distance avec les hauteurs (puis compute → losDraw)

function losEval(){const D=LC.data;if(!D)return null;
  const D3=num("tDist")||D.H,y=traj(D3);if(!y)return null;
  const sh=losSH(),th=losTH(),z0=D.pts[0].g+sh,z1=D.pts[D.N].g+th,k=D3/D.H;
  let worst={c:1e9},wl={c:1e9},hit=false,ymax={v:-1e9};const P2=[];
  for(const q of D.pts){const f=q.d/D.H,los=z0+f*(z1-z0),yy=y(q.d*k),b=los+yy;
    const obs=[];if(q.top!=null)obs.push([-1e9,q.top,"b",q.bd]);
    LS.obs.forEach(o=>{if(Math.abs(q.d-o.d)<=1)obs.push([q.g+(+o.lo||0),q.g+(+o.hi||0),"m",o]);});
    let c=b-q.g,cs=null,cl=los-q.g;for(const o of obs){const v=clr(b,o[0],o[1]);if(v<c){c=v;cs=o;}cl=Math.min(cl,clr(los,o[0],o[1]));}
    if(q.d>2&&q.d<D.H-2&&c<0)hit=true;
    const r={d:q.d,g:q.g,los,b,c:hit?Math.min(c,-0.01):c,cl,cs,top:q.top};P2.push(r);
    if(yy>ymax.v)ymax={v:yy,d:q.d};
    if(q.d>2&&q.d<D.H-2){if(c<worst.c)worst={c,d:q.d,cs,b,g:q.g};if(cl<wl.c)wl={c:cl,d:q.d};}}
  const st=worst.c<0?"bad":worst.c<MARGIN?"warn":"ok";
  return LC.res={pts:P2,worst,wl,st,z0,z1,sh,th,ymax};}
function causeTxt(w){const o=w.cs;if(!o)return "le relief";if(o[2]==="b")return `un bâtiment de ${fr(o[3].h,0)} m${o[3].est?" (hauteur supposée)":""}`;return "l'obstacle ajouté à la main";}

/* ---------- affichage ---------- */
const CC={ok:"#34d399",warn:"#fbbf24",bad:"#f87171"};const ccol=c=>c<0?CC.bad:c<MARGIN?CC.warn:CC.ok;
function losDraw(){
  const cv=$("losCv"),V=$("losVerdict"),info=$("losInfo"),D=LC.data;
  if(!D){cv.style.display="none";V.innerHTML="";info.innerHTML="";$("losTgtInfo").textContent="";return;}
  const R=losEval();if(!R){cv.style.display="none";V.innerHTML='<div class="verdict v-warn"><b>Distance hors portée pour cette munition</b></div>';info.innerHTML="";return;}
  cv.style.display="block";$("losMsg").textContent="";
  const r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=r.width||320,h=190;cv.width=w*dpr;cv.height=h*dpr;cv.style.height=h+"px";
  const c=cv.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);
  let lo=1e9,hi=-1e9;R.pts.forEach(q=>{lo=Math.min(lo,q.g);hi=Math.max(hi,q.b,q.los,q.top??-1e9);});LS.obs.forEach(o=>{const q=R.pts.find(p=>Math.abs(p.d-o.d)<=1);if(q)hi=Math.max(hi,q.g+(+o.hi||0));});
  hi=Math.max(hi,R.z1+0.5);lo-=Math.max(1,(hi-lo)*.08);hi+=Math.max(.5,(hi-lo)*.06);
  const L=34,Rr=8,T=8,B=20,X=d=>L+d/D.H*(w-L-Rr),Y=z=>T+(hi-z)/(hi-lo)*(h-T-B);
  c.fillStyle="#0b0e11";c.fillRect(0,0,w,h);c.font="10px ui-monospace,monospace";c.lineWidth=1;
  const st=D.H>600?200:D.H>250?100:50;c.strokeStyle="#2c333d";c.fillStyle="#9aa4b1";c.textAlign="center";
  for(let d=0;d<=D.H;d+=st){c.beginPath();c.moveTo(X(d),T);c.lineTo(X(d),h-B);c.stroke();c.fillText(d+" m",Math.min(X(d),w-18),h-6);}
  c.textAlign="right";const zs=Math.max(1,Math.ceil((hi-lo)/5));for(let z=Math.ceil(lo/zs)*zs;z<=hi;z+=zs)c.fillText(Math.round(z),L-4,Y(z)+3);
  // bâtiments puis sol
  c.fillStyle="#6b6660";R.pts.forEach((q,i)=>{if(q.top==null)return;const d1=i?R.pts[i-1].d:q.d;c.fillRect(X(d1),Y(q.top),Math.max(1.2,X(q.d)-X(d1)+.6),Y(q.g)-Y(q.top));});
  const tg=R.pts[R.pts.length-1];if(D.tb){c.fillStyle="#5c5650";c.fillRect(X(D.H)-5,Y(tg.g+D.tb.rel),6,Y(tg.g)-Y(tg.g+D.tb.rel));}
  if(D.sb){c.fillStyle="#5c5650";c.fillRect(X(0),Y(R.pts[0].g+D.sb.rel),6,Y(R.pts[0].g)-Y(R.pts[0].g+D.sb.rel));}
  c.beginPath();c.moveTo(X(0),h-B);R.pts.forEach(q=>c.lineTo(X(q.d),Y(q.g)));c.lineTo(X(D.H),h-B);c.closePath();c.fillStyle="#3b3326";c.fill();
  c.beginPath();R.pts.forEach(q=>c.lineTo(X(q.d),Y(q.g)));c.strokeStyle="#a58b5c";c.lineWidth=1.5;c.stroke();
  c.fillStyle="rgba(74,160,90,.85)";LS.obs.forEach(o=>{const q=R.pts.find(p=>Math.abs(p.d-o.d)<=1);if(q)c.fillRect(X(o.d)-2,Y(q.g+(+o.hi||0)),4,Y(q.g+(+o.lo||0))-Y(q.g+(+o.hi||0)));});
  c.setLineDash([4,4]);c.strokeStyle="#60a5fa";c.lineWidth=1.2;c.beginPath();c.moveTo(X(0),Y(R.z0));c.lineTo(X(D.H),Y(R.z1));c.stroke();c.setLineDash([]);
  c.lineWidth=2.6;for(let i=1;i<R.pts.length;i++){const a=R.pts[i-1],b=R.pts[i];c.strokeStyle=ccol(Math.min(a.c,b.c));c.beginPath();c.moveTo(X(a.d),Y(a.b));c.lineTo(X(b.d),Y(b.b));c.stroke();}
  c.fillStyle="#60a5fa";c.beginPath();c.arc(X(0),Y(R.z0),4,0,7);c.fill();c.fillStyle="#f59e0b";c.fillRect(X(D.H)-3,Y(R.z1)-6,6,12);
  if(R.worst.c<1e8){c.strokeStyle="#fff";c.lineWidth=1.5;c.beginPath();c.arc(X(R.worst.d),Y(R.worst.b),9,0,7);c.stroke();}
  const ex=Math.round((D.H/(w-L-Rr))/((hi-lo)/(h-T-B)));c.fillStyle="#9aa4b1";c.textAlign="left";c.fillText(ex>1?`hauteurs ×${ex}`:"hauteurs réelles",L+4,T+10);
  c.fillStyle="#60a5fa";c.fillText("- - visée",L+4,T+22);c.fillStyle="#34d399";c.fillText("— balle",L+64,T+22);
  if(LC.tap!=null){const q=R.pts.reduce((a,b)=>Math.abs(b.d-LC.tap)<Math.abs(a.d-LC.tap)?b:a);c.strokeStyle="rgba(255,255,255,.5)";c.beginPath();c.moveTo(X(q.d),T);c.lineTo(X(q.d),h-B);c.stroke();}
  // verdict
  const W=R.worst;let t,s;
  if(R.st==="bad"){t=`Bloqué à ${Math.round(W.d)} m par ${causeTxt(W)}`;const miss=-W.c>=1?`${fr(-W.c,1)} m`:`${fr(-W.c*100,0)} cm`,over=!W.cs||W.cs[0]<-1e8||!(+W.cs[3].lo);
    s=R.wl.c>0?`Vous verrez la cible, mais pas la balle : elle monte plus haut que la ligne de visée et touche l'obstacle (${miss} de trop).`:over?`La cible n'est pas visible d'ici. Il manque ${miss} pour passer au-dessus.`:`La ligne de visée est elle aussi coupée. La balle traverse l'obstacle sur ${miss}.`;}
  else if(R.st==="warn"){t=`Rasant à ${Math.round(W.d)} m`;s=`Il ne reste que ${fr(W.c*100,0)} cm de marge avec ${causeTxt(W)}, moins que la dispersion et le vent. À éviter.`;}
  else{t="Ligne de tir dégagée";s=W.c<1e8?`Point le plus serré à ${Math.round(W.d)} m : ${fr(W.c,1)} m de marge.`:"";}
  V.innerHTML=`<div class="verdict v-${R.st}"><span class="dot"></span><div><b>${t}</b><span>${s}</span></div></div>`;
  const rows=[["Relief",SRC[D.src]],["Bâtiments",D.bsrc==="trop"?"zone trop grande":D.bsrc==="aucune"?"indisponibles (pas de réseau)":`${D.bn} dans la zone · ${D.bsrc.replace("ign","IGN BD TOPO").replace("osm","OpenStreetMap")}${D.bmiss?` (${D.bmiss} morceau(x) manquant(s))`:""}`],
    ["Arme au-dessus du sol",`${fr(R.sh,1)} m${D.sb?` (bâtiment de ${fr(D.sb.rel,0)} m sous le tireur)`:""}`],["Cible au-dessus du sol",`${fr(R.th,1)} m`],
    ["Balle au plus haut",`${fr(R.ymax.v,2)} m au-dessus de la visée, à ${Math.round(R.ymax.d)} m`]];
  if(LC.tap!=null){const q=R.pts.reduce((a,b)=>Math.abs(b.d-LC.tap)<Math.abs(a.d-LC.tap)?b:a);rows.push([`À ${Math.round(q.d)} m`,`balle à ${fr(q.b-q.g,1)} m du sol, ${fr((q.b-q.los)*100,0)} cm ${q.b>=q.los?"au-dessus":"sous"} la visée${q.top!=null?`, toit à ${fr(q.top-q.g,0)} m`:""}`]);}
  info.innerHTML=rows.map(r=>`<span>${r[0]}</span><span>${r[1]}</span>`).join("");
  $("losTgtInfo").textContent=LS.tgt==="toit"?(D.tb?`Toit du bâtiment sous la cible : ${fr(D.tb.rel,0)} m${D.tb.est?" (hauteur supposée)":""}.`:"Aucun bâtiment connu sous la cible : cible prise à 0,5 m du sol."):"";
}

/* ---------- obstacles ajoutés à la main ---------- */
function renderObs(){const el=$("losObs");if(!el)return;el.innerHTML=LS.obs.map((o,i)=>`<div class="obsr"><span>${fr(+o.d,0)} m · ${+o.lo?`de ${fr(+o.lo,1)} à `:"jusqu'à "}${fr(+o.hi,1)} m${o.n?" · "+esc(o.n):""}</span><button class="btn sm" data-i="${i}">✕</button></div>`).join("");}
$("losObs").onclick=e=>{const b=e.target.closest("button");if(!b)return;LS.obs.splice(+b.dataset.i,1);renderObs();losDraw();save();};
$("losObsAdd").onclick=()=>{const f=$("losObsForm");f.style.display=f.style.display==="none"?"block":"none";if(LC.tap!=null)$("loD").value=Math.round(LC.tap);};
$("loOk").onclick=()=>{const o={d:pf($("loD").value),lo:pf($("loLo").value)||0,hi:pf($("loHi").value),n:$("loN").value.trim()};
  if(!(o.d>0)||!(o.hi>o.lo)){toast("Indiquez la distance depuis le tireur et une hauteur haute plus grande que la basse.");return;}
  LS.obs.push(o);$("losObsForm").style.display="none";renderObs();losDraw();save();};

/* ---------- réglages de hauteur ---------- */
function syncCtl(){setSeg("losPost",LS.post);setSeg("losTgt",LS.tgt);$("losPostX").value=LS.postX;$("losTgtX").value=LS.tgtX;
  $("losPostXRow").style.display=LS.post==="x"?"flex":"none";$("losTgtXRow").style.display=LS.tgt==="etage"||LS.tgt==="x"?"flex":"none";
  $("losTgtXLbl").firstChild.textContent=LS.tgt==="etage"?"Étage n° (0 = rez-de-chaussée)":"Hauteur de la cible au-dessus du sol (m)";}
const changedH=()=>{syncCtl();save();if(S.shooter&&S.target)geoApply();else losDraw();};
$("losPost").onclick=e=>{const b=e.target.closest("button");if(b){LS.post=b.dataset.v;changedH();}};
$("losTgt").onclick=e=>{const b=e.target.closest("button");if(b){LS.tgt=b.dataset.v;if(b.dataset.v==="x"&&!(pf(LS.tgtX)>=0))LS.tgtX=1;changedH();}};
$("losPostX").oninput=()=>{LS.postX=$("losPostX").value;changedH();};$("losTgtX").oninput=()=>{LS.tgtX=$("losTgtX").value;changedH();};
$("losCv").addEventListener("click",e=>{if(!LC.data)return;const r=$("losCv").getBoundingClientRect();LC.tap=Math.max(0,Math.min(LC.data.H,(e.clientX-r.left-34)/(r.width-42)*LC.data.H));losDraw();});
$("losRefresh").onclick=()=>{LC.key=null;losRun(true);};

/* ---------- zones atteignables et poste dégagé (relief Terrarium + bâtiments) ---------- */
let zLayer=null,bpLayer=null;
async function areaData(s,w,n,e){const ok=await terrLoad(s,w,n,e),bl=await bldLoad(s,w,n,e);return {ok,bl};}
function lineOk(A,Tp,zA,zT,y,I,ex){ // A,Tp en m locaux ; terrain Terrarium
  const H=Math.hypot(Tp[0]-A[0],Tp[1]-A[1]),n=Math.max(8,Math.ceil(H/3));let w=1e9;
  for(let i=1;i<n;i++){const f=i/n,d=f*H;if(d<10||d>H-3)continue; /* relief ≈30 m : abords immédiats du poste ignorés */const x=A[0]+(Tp[0]-A[0])*f,yy=A[1]+(Tp[1]-A[1])*f,ll=LC.E.inv(x,yy),g=terrAt(ll.lat,ll.lon);if(!isFinite(g))continue;
    const b=zA+f*(zT-zA)+y(d);let c=b-g;const bd=I.at(x,yy);if(bd&&!ex.includes(bd))c=Math.min(c,b-bTop(bd,g));if(c<w)w=c;}
  return w;}
async function zones(){
  if(zLayer){map.removeLayer(zLayer);zLayer=null;$("losZones").classList.remove("acc");return;}
  if(!map||!S.shooter){toast("Position du tireur inconnue.");return;}
  const B=map.getBounds(),a=S.shooter,cl=Math.cos(a.lat*DEG),Rm=Math.min(1200,Math.max(haversine(a,{lat:B.getNorth(),lon:a.lon}),haversine(a,{lat:a.lat,lon:B.getEast()}))),dl=Rm/(DEG*R0);
  const s=a.lat-dl,n=a.lat+dl,w=a.lon-dl/cl,e=a.lon+dl/cl;$("losZones").textContent="⏳ Calcul…";
  const A=await areaData(s,w,n,e);if(!A.ok){$("losZones").textContent="🗺 Zones atteignables";toast("Relief de la zone indisponible hors ligne. Chargez-le avec « Garder relief et bâtiments ».");return;}
  LC.E=LC.E||enu(a);const E=enu(a);LC.E=E;const I=bldIndex(A.bl.L,E),g0=terrAt(a.lat,a.lon),sb=I.at(0,0),zA=(sb&&LS.post==="x"?g0:g0)+losSH();
  const p=P(),c=conditions();c.site=0;const tr=fly(Object.assign({p,alpha:zeroAngle(p),maxX:Rm*1.5+1},c));
  const NG=64,cv=document.createElement("canvas");cv.width=cv.height=NG;const g=cv.getContext("2d");let k=0;
  for(let j=0;j<NG;j++){for(let i=0;i<NG;i++){const x=(i+.5)/NG*2*Rm-Rm,y=Rm-(j+.5)/NG*2*Rm,H=Math.hypot(x,y);if(H<8||H>Rm)continue;
      const ll=E.inv(x,y),gt=terrAt(ll.lat,ll.lon),tb=I.at(x,y);if(!isFinite(gt))continue;
      let th=0.5;if(LS.tgt==="toit"){if(!tb)continue;th=bTop(tb,gt)-gt+.3;}else if(tb&&LS.tgt==="sol")continue;else th=losTH();
      const end=tr(H);if(!end)continue;const yy=d=>{const r=tr(d);return r?r.y-end.y*d/H:0;};
      const v=lineOk([0,0],[x,y],zA,gt+th,yy,I,[tb,sb]);g.fillStyle=v<0?"rgba(248,113,113,.55)":v<MARGIN?"rgba(251,191,36,.5)":"rgba(52,211,153,.45)";g.fillRect(i,j,1,1);}
    if(++k%8===0)await new Promise(r=>setTimeout(r,0));}
  zLayer=L.imageOverlay(cv.toDataURL(),[[s,w],[n,e]],{opacity:.75,interactive:false}).addTo(map);zLayer.getElement().style.imageRendering="pixelated";
  $("losZones").textContent="🗺 Masquer les zones";$("losZones").classList.add("acc");
  toast(`Vert : atteignable · orange : rasant · rouge : masqué (cible ${LS.tgt==="toit"?"sur les toits":"à "+fr(losTH(),1)+" m"}). Relief ≈30 m${A.bl.L.length?`, ${A.bl.L.length} bâtiments`:""}.`);
}
async function bestPost(){
  if(bpLayer){map.removeLayer(bpLayer);bpLayer=null;}
  if(!(S.shooter&&S.target)){toast("Placez d'abord le tireur et la cible.");return;}
  const a=S.shooter,b=S.target,H=haversine(a,b),dl=(H+80)/(DEG*R0),cl=Math.cos(a.lat*DEG);$("losBest").textContent="⏳ Recherche…";
  const A=await areaData(Math.min(a.lat,b.lat)-80/(DEG*R0),Math.min(a.lon,b.lon)-80/(DEG*R0)/cl,Math.max(a.lat,b.lat)+80/(DEG*R0),Math.max(a.lon,b.lon)+80/(DEG*R0)/cl);
  $("losBest").textContent="🔎 Poste dégagé";if(!A.ok){toast("Relief indisponible hors ligne pour chercher un poste.");return;}
  const E=enu(a);LC.E=E;const I=bldIndex(A.bl.L,E),Tp=E.f(b.lat,b.lon),tb=I.at(Tp[0],Tp[1]),gt=terrAt(b.lat,b.lon),zT=gt+losTH(),p=P(),c=conditions();
  let best=null;
  for(let r=5;r<=80&&!best;r+=5)for(let k=0;k<24;k++){const an=k/24*2*Math.PI,x=r*Math.sin(an),y=r*Math.cos(an),ll=E.inv(x,y),g=terrAt(ll.lat,ll.lon),bd=I.at(x,y);
    if(!isFinite(g)||(bd&&LS.post!=="x"))continue;const Hc=Math.hypot(Tp[0]-x,Tp[1]-y);
    const tr=fly(Object.assign({p,alpha:zeroAngle(p),maxX:Hc+1},c)),end=tr(Hc);if(!end)continue;
    const v=lineOk([x,y],Tp,g+losSH(),zT,d=>{const q=tr(d);return q?q.y-end.y*d/Hc:0;},I,[tb,bd]);
    if(v>=MARGIN&&(!best||v>best.v))best={ll,r,v,an};}
  if(!best){toast("Aucun poste dégagé trouvé à moins de 80 m pour cette cible.");return;}
  const dir=["au nord","au nord-est","à l'est","au sud-est","au sud","au sud-ouest","à l'ouest","au nord-ouest"][Math.round(best.an/(Math.PI/4))%8];
  bpLayer=L.circleMarker([best.ll.lat,best.ll.lon],{radius:10,color:"#fff",weight:2,fillColor:"#16a34a",fillOpacity:1}).addTo(map)
    .bindPopup(`<b>Poste dégagé à ${best.r} m ${dir}</b><br>marge ≈ ${fr(best.v,1)} m (relief ≈30 m)<br><button class="btn sm acc" id="bpGo">Placer le tireur ici</button>`).openPopup();
  setTimeout(()=>{const g=document.getElementById("bpGo");if(g)g.onclick=()=>{S.shooter={lat:best.ll.lat,lon:best.ll.lon,alt:null};S.shooterManual=true;map.removeLayer(bpLayer);bpLayer=null;drawMarkers();updateGeo(true);};},50);
}
$("losZones").onclick=zones;$("losBest").onclick=bestPost;

/* ---------- postes de tir possibles autour de la cible ---------- */
let psLayer=null;
const DIR8=["nord","nord-est","est","sud-est","sud","sud-ouest","ouest","nord-ouest"];
function psClear(){if(psLayer){map.removeLayer(psLayer);psLayer=null;}$("losPosts").innerHTML="";$("losPs").textContent="📍 Postes possibles";$("losPs").classList.remove("acc");}
function psGo(pt){S.shooter={lat:pt.lat,lon:pt.lon,alt:null};S.shooterManual=true;psClear();drawMarkers();updateGeo(true);if(map)map.closePopup();toast("Tireur placé sur le poste choisi. Le GPS reprend la main avec le bouton 📍 GPS.");}
async function postes(){
  if(psLayer){psClear();return;}
  if(!map||!S.target){toast("Touchez d'abord la cible sur la carte.");return;}
  const b=S.target,mn=Math.max(10,pf(LS.pMin)||50),mx=Math.min(1200,Math.max(mn+20,pf(LS.pMax)||300)),dl=mx/(DEG*R0),cl=Math.cos(b.lat*DEG);
  $("losPs").textContent="⏳ Recherche des postes…";
  const A=await areaData(b.lat-dl,b.lon-dl/cl,b.lat+dl,b.lon+dl/cl);
  if(!A.ok){$("losPs").textContent="📍 Postes possibles";toast("Relief de la zone indisponible (pas de réseau ?). Chargez-le avec « Garder relief et bâtiments ».");return;}
  const E=enu(b);LC.E=E;const I=bldIndex(A.bl.L,E),gt=terrAt(b.lat,b.lon),tb=I.at(0,0),th=LS.tgt==="toit"?(tb?bTop(tb,gt)-gt+.3:.5):losTH(),zT=gt+th,sh=losSH();
  const p=P(),c=conditions();c.site=0;const TR=new Map();
  const trOf=H=>{const k=Math.round(H/5)*5;if(!TR.has(k)){const tr=fly(Object.assign({p,alpha:zeroAngle(p),maxX:k+1},c)),end=tr(k);TR.set(k,end?{tr,end,k}:null);}return TR.get(k);};
  const me=S.shooter?E.f(S.shooter.lat,S.shooter.lon):null;
  const NG=80,cv=document.createElement("canvas");cv.width=cv.height=NG;const g=cv.getContext("2d"),cand=[];let n=0;
  for(let j=0;j<NG;j++){for(let i=0;i<NG;i++){const x=(i+.5)/NG*2*mx-mx,y=mx-(j+.5)/NG*2*mx,H=Math.hypot(x,y);if(H<mn||H>mx)continue;
      const ll=E.inv(x,y),gs=terrAt(ll.lat,ll.lon),bd=I.at(x,y);if(!isFinite(gs)||(bd&&LS.post!=="x"))continue;
      const T=trOf(H);if(!T){g.fillStyle="rgba(120,120,120,.35)";g.fillRect(i,j,1,1);continue;} // hors de portée de la munition
      const yy=d=>{const r=T.tr(d*T.k/H);return r?r.y-T.end.y*d/H:0;};
      const v=lineOk([x,y],[0,0],gs+sh,zT,yy,I,[tb,bd]);
      g.fillStyle=v<0?"rgba(248,113,113,.4)":v<MARGIN?"rgba(251,191,36,.45)":"rgba(52,211,153,.5)";g.fillRect(i,j,1,1);
      if(v>=MARGIN){const walk=me?Math.hypot(x-me[0],y-me[1]):0;cand.push({x,y,H,v,walk,ll,mil:toUnit(-T.end.y/T.k,p.unit),score:Math.min(v,1.5)-(me?walk/400:0)});}}
    if(++n%8===0)await new Promise(r=>setTimeout(r,0));}
  cand.sort((a,b)=>b.score-a.score);const pick=[];
  for(const q of cand){if(pick.every(o=>Math.hypot(o.x-q.x,o.y-q.y)>Math.max(30,mx/8)))pick.push(q);if(pick.length>=5)break;}
  psLayer=L.layerGroup().addTo(map);
  L.imageOverlay(cv.toDataURL(),[[b.lat-dl,b.lon-dl/cl],[b.lat+dl,b.lon+dl/cl]],{opacity:.75,interactive:false}).addTo(psLayer).getElement().style.imageRendering="pixelated";
  L.circle([b.lat,b.lon],{radius:mn,color:"#f59e0b",weight:1,fill:false,dashArray:"4 4",interactive:false}).addTo(psLayer);
  const info=q=>{const az=(Math.atan2(q.x,q.y)/DEG+360)%360,clk=Math.round(q.mil/p.click);
    return `à ${Math.round(q.H)} m de la cible, côté ${DIR8[Math.round(az/45)%8]} · marge ${fr(q.v,1)} m · élévation ≈ ${clk} clics${me?` · à ${Math.round(q.walk)} m de vous`:""}`;};
  pick.forEach((q,k)=>{const m=L.marker([q.ll.lat,q.ll.lon],{icon:L.divIcon({className:"",html:`<div class="psMk">${k+1}</div>`,iconSize:[26,26],iconAnchor:[13,13]})}).addTo(psLayer);
    m.bindPopup(`<b>Poste ${k+1}</b><br>${info(q)}<br><button class="btn sm acc" data-ps="${k}">Placer le tireur ici</button>`);
    m.on("popupopen",e=>{const bt=e.popup.getElement().querySelector("[data-ps]");if(bt)bt.onclick=()=>psGo(q.ll);});});
  $("losPosts").innerHTML=pick.length?pick.map((q,k)=>`<div class="obsr"><span><b>${k+1}.</b> ${info(q)}</span><button class="btn sm" data-ps="${k}">Choisir</button></div>`).join(""):
    `<p class="hint">Aucun poste dégagé entre ${mn} et ${mx} m de cette cible (position ${({"0.3":"couché","0.8":"assis","1.5":"debout","x":"en hauteur"})[LS.post]}). Essayez une autre position ou une autre plage de distance.</p>`;
  $("losPosts").onclick=e=>{const bt=e.target.closest("[data-ps]");if(bt)psGo(pick[+bt.dataset.ps].ll);};
  const all=[[b.lat,b.lon],...pick.map(q=>[q.ll.lat,q.ll.lon])];if(S.shooter)all.push([S.shooter.lat,S.shooter.lon]);map.fitBounds(all,{padding:[30,30],maxZoom:17});
  $("losPs").textContent="📍 Masquer les postes";$("losPs").classList.add("acc");
  toast(`${cand.length?pick.length+" poste(s) proposé(s)":"Aucun poste dégagé"} · vert : on touche la cible d'ici, rouge : masqué, gris : hors de portée. Relief ≈30 m${A.bl.L.length?`, ${A.bl.L.length} bâtiments`:""} : vérifiez chaque poste avec la coupe une fois choisi.`);
}
$("losPs").onclick=postes;
const psSet=()=>{LS.pMin=$("losPmin").value;LS.pMax=$("losPmax").value;save();};$("losPmin").oninput=psSet;$("losPmax").oninput=psSet;
$("losPmin").value=LS.pMin??50;$("losPmax").value=LS.pMax??300;

/* ---------- garder relief et bâtiments pour le hors ligne ---------- */
$("losKeep").onclick=async()=>{if(!map)return;const B=map.getBounds(),i=$("losKeepInfo");
  if(haversine({lat:B.getSouth(),lon:B.getWest()},{lat:B.getNorth(),lon:B.getEast()})>4000){i.textContent="Zone trop grande : zoomez sur le lieu de tir (moins de 3 km de large).";return;}
  i.textContent="Téléchargement du relief et des bâtiments…";const A=await areaData(B.getSouth(),B.getWest(),B.getNorth(),B.getEast());
  i.textContent=(A.ok?"Relief gardé":"Relief incomplet (réseau ?)")+` · ${A.bl.L.length} bâtiments gardés${A.bl.miss?`, ${A.bl.miss} morceau(x) en échec`:""}. Pensez aussi à « Garder cette zone » pour la carte.`;};

/* ---------- vue 3D (MapLibre, chargé à la demande) ---------- */
let ml=null,mlP=null;
function loadML(){if(window.maplibregl)return Promise.resolve();if(mlP)return mlP;
  mlP=new Promise((res,rej)=>{const l=document.createElement("link");l.rel="stylesheet";l.href="maplibre/maplibre-gl.css";document.head.appendChild(l);
    const s=document.createElement("script");s.src="maplibre/maplibre-gl.js";s.onload=res;s.onerror=()=>{mlP=null;rej();};document.head.appendChild(s);});return mlP;}
function seg3d(){const D=LC.data,R=LC.res;if(!D||!R)return {type:"FeatureCollection",features:[]};
  const F=[],a=S.shooter,E=enu(a),ux=D.pts[D.N].x/D.H,uy=D.pts[D.N].y/D.H,nx=-uy,ny=ux,step=Math.max(1,Math.round(D.N/250));
  const poly=(x0,y0,x1,y1,w)=>[[x0+nx*w,y0+ny*w],[x1+nx*w,y1+ny*w],[x1-nx*w,y1-ny*w],[x0-nx*w,y0-ny*w],[x0+nx*w,y0+ny*w]].map(p=>{const q=E.inv(p[0],p[1]);return [q.lon,q.lat];});
  const W=Math.max(1,D.H/150); // ruban élargi pour rester visible de loin
  for(let i=0;i+step<=D.N;i+=step){const p0=D.pts[i],p1=D.pts[i+step],r0=R.pts[i],r1=R.pts[i+step],cmin=Math.min(r0.c,r1.c),base=Math.max(0,(r0.b+r1.b)/2-(r0.g+r1.g)/2);
    F.push({type:"Feature",properties:{c:ccol(cmin),b:base,t:base+W*.8},geometry:{type:"Polygon",coordinates:[poly(p0.x,p0.y,p1.x,p1.y,W/2)]}});
    if((i/step)%2===0){const lb=Math.max(0,(r0.los+r1.los)/2-(r0.g+r1.g)/2);F.push({type:"Feature",properties:{c:"#60a5fa",b:lb,t:lb+W*.3},geometry:{type:"Polygon",coordinates:[poly(p0.x,p0.y,p1.x,p1.y,W/4)]}});}}
  return {type:"FeatureCollection",features:F};}
function bld3d(){const D=LC.data;if(!D)return {type:"FeatureCollection",features:[]};
  return {type:"FeatureCollection",features:D.I.A.map(b=>({type:"Feature",properties:{h:b.h,c:b.est?"#a8a29e":"#d6d3d1"},geometry:{type:"Polygon",coordinates:[b.r.map(p=>[p[1],p[0]])]}}))};}
async function open3d(){
  if(!(S.shooter&&S.target&&LC.data)){toast("Placez le tireur et la cible, puis attendez la vérification de la ligne.");return;}
  const ov=$("l3d");ov.style.display="flex";$("l3dMsg").textContent="Chargement de la vue 3D…";
  try{await loadML();}catch(e){$("l3dMsg").textContent="Moteur 3D introuvable.";return;}
  const gl=(()=>{try{const c=document.createElement("canvas");return c.getContext("webgl2")||c.getContext("webgl");}catch(e){return null;}})();
  if(!gl){$("l3dMsg").textContent="Ce téléphone ne permet pas la 3D (WebGL indisponible).";return;}
  if(!ml){
    maplibregl.addProtocol("lc",async(params)=>{const u=params.url.replace(/^lc:\/\//,"https://"),hit=await TileDB.get(u);if(hit&&hit.b)return {data:hit.b};
      const r=await fetchT(u,12000);if(!r.ok)throw new Error("HTTP "+r.status);const b=await r.arrayBuffer();TileDB.put(u,{b,t:r.headers.get("content-type")||"image/png",d:Date.now()});return {data:b};});
    ml=new maplibregl.Map({container:"l3dMap",attributionControl:{compact:true},maxPitch:80,style:{version:8,
      sources:{sat:{type:"raster",tiles:["lc://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],tileSize:256,maxzoom:19,attribution:"Esri"},
        dem:{type:"raster-dem",tiles:["lc://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],encoding:"terrarium",tileSize:256,maxzoom:15},
        bld:{type:"geojson",data:bld3d()},trj:{type:"geojson",data:seg3d()}},
      layers:[{id:"sat",type:"raster",source:"sat"},
        {id:"bld",type:"fill-extrusion",source:"bld",paint:{"fill-extrusion-color":["get","c"],"fill-extrusion-height":["get","h"],"fill-extrusion-base":0,"fill-extrusion-opacity":.82}},
        {id:"trj",type:"fill-extrusion",source:"trj",paint:{"fill-extrusion-color":["get","c"],"fill-extrusion-height":["get","t"],"fill-extrusion-base":["get","b"],"fill-extrusion-opacity":.95}}],
      terrain:{source:"dem",exaggeration:+seg("l3dEx")}}});
    ml.addControl(new maplibregl.NavigationControl({visualizePitch:true}),"top-right");
    ml.on("error",e=>console.log("3D",e&&e.error&&e.error.message));
    ml.on("load",()=>{$("l3dMsg").textContent="";});
    ml._mk=[];
  }else{ml.getSource("bld").setData(bld3d());ml.getSource("trj").setData(seg3d());ml.resize();$("l3dMsg").textContent="";}
  ml._mk.forEach(m=>m.remove());const mk=(p,col,t)=>{const el=document.createElement("div");el.className="mk3d";el.style.background=col;el.textContent=t;return new maplibregl.Marker({element:el,anchor:"bottom"}).setLngLat([p.lon,p.lat]).addTo(ml);};
  ml._mk=[mk(S.shooter,"#2563eb","Tireur"),mk(S.target,"#dc2626","Cible")];
  const a=S.shooter,b=S.target,cam=ml.cameraForBounds([[Math.min(a.lon,b.lon),Math.min(a.lat,b.lat)],[Math.max(a.lon,b.lon),Math.max(a.lat,b.lat)]],{padding:60,bearing:LC.data.az});
  ml.jumpTo({center:cam.center,zoom:Math.min(18,(cam.zoom||16)-0.3),bearing:LC.data.az,pitch:62});
  const vb=$("losVerdict").querySelector("b"),vs=$("losVerdict").querySelector("div span");
  $("l3dInfo").textContent=(vb?vb.textContent+". ":"")+(vs?vs.textContent:"")+" Ruban : vert = passe, orange = rasant, rouge = touche. Pointillés bleus = ligne de visée.";
  ml.once("idle",()=>$("l3dMsg").textContent="");setTimeout(()=>$("l3dMsg").textContent="",5000);
}
$("los3d").onclick=open3d;$("l3dClose").onclick=()=>{$("l3d").style.display="none";};
$("l3dEx").onclick=e=>{const b=e.target.closest("button");if(!b)return;setSeg("l3dEx",b.dataset.v);if(ml)ml.setTerrain({source:"dem",exaggeration:+b.dataset.v});};
$("l3dTop").onclick=()=>{if(!ml||!S.shooter)return;const a=S.shooter,b=S.target||a;ml.easeTo({center:[a.lon+(b.lon-a.lon)*.3,a.lat+(b.lat-a.lat)*.3],zoom:18,bearing:LC.data?LC.data.az:0,pitch:76});};

/* ---------- branchements sur l'appli ---------- */
const _ug=updateGeo;window._ugLos=_ug;
updateGeo=async function(fe){await _ug(fe);if(fe)await losRun();else if(!LC.data||LC.key!==[S.shooter&&S.shooter.lat,S.shooter&&S.shooter.lon,S.target&&S.target.lat,S.target&&S.target.lon].map(v=>v!=null?v.toFixed(6):"").join(","))losRun();};
const _cp=compute;compute=function(){_cp();try{losDraw();}catch(e){console.log(e);}};
const _dm=drawMarkers;drawMarkers=function(){_dm();if(!(S.shooter&&S.target)){LC.data=null;LC.key=null;LC.tap=null;losDraw();$("losMsg").textContent="Touchez la cible sur la carte : l'appli vérifie si le relief, les bâtiments ou un obstacle coupent la trajectoire.";}};
addEventListener("resize",()=>{clearTimeout(LC.rz);LC.rz=setTimeout(losDraw,150);});
syncCtl();renderObs();
if(S.shooter&&S.target)losRun();else $("losMsg").textContent="Touchez la cible sur la carte : l'appli vérifie si le relief, les bâtiments ou un obstacle coupent la trajectoire.";
window.losDebug={LC,losRun,losEval,terrAt,terrLoad,bldLoad};
})();
