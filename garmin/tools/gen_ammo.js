// Extrait le catalogue de munitions de l'appli Android (sans les calibres de poing) vers resources/jsonData/ammo.json
// Usage : node tools/gen_ammo.js resources/jsonData/ammo.json [chemin de catalog.js]
const fs=require('fs');global.window={};eval(fs.readFileSync(process.argv[3]||'../catalog.js','utf8'));
const PISTOL=new Set(["9x19",".45 ACP",".38 Spl",".40 S&W","9x18 Makarov","7.62x25","10mm Auto",".380 ACP",".45 Colt","7.63x25 Mauser","4.6x30"]);
const a=window.CATALOG.ammo.filter(e=>!PISTOL.has(e.cal));
const calOrder=[...new Set(a.map(e=>e.cal))];
// tri : .22 LR d'abord puis ordre alphabétique naturel
calOrder.sort((x,y)=>x===".22 LR"?-1:y===".22 LR"?1:x.localeCompare(y,'fr',{numeric:true}));
const out={c:calOrder,a:a.map(e=>[calOrder.indexOf(e.cal),(e.brand+" "+e.model).slice(0,30),e.v0,e.bc,e.bcK==="E"?1:0])};
out.a.sort((p,q)=>p[0]-q[0]||p[1].localeCompare(q[1]));
fs.writeFileSync(process.argv[2],JSON.stringify(out));
console.log(a.length,'munitions',calOrder.length,'calibres', JSON.stringify(out).length,'octets');
