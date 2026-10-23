// Catalogue de départ. « src » indique l'origine : constructeur, ou "≈" quand la valeur est typique/estimée.
// Pour la balistique, la vitesse mesurée au chrono sur VOTRE arme est toujours préférable.
// Armes : barrel = canon (mm), twist = pas de rayure (1 tour en x pouces), sight = hauteur d'axe lunette typique (cm).
(function(){
const W=(type,brand,model,cal,barrel,twist,sight)=>({type,brand,model,cal,barrel,twist,sight:sight||(cal===".22 LR"||cal===".17 HMR"||cal===".22 WMR"?4.5:5.0)});
const R22="Carabine 22 LR / petit calibre", VER="Carabine à verrou (gros calibre)", PREC="Précision / châssis longue distance", SEMI="Semi-automatique", CH="Chasse";
const weapon=[
  W(R22,"Bergara","B-14R HMR (.22 LR)",".22 LR",457,16,5.0),
  W(R22,"Bergara","B-14R Carbon (.22 LR)",".22 LR",457,16,5.0),
  W(R22,"CZ","457 Varmint (.22 LR)",".22 LR",525,16),
  W(R22,"CZ","457 MTR (.22 LR)",".22 LR",525,16),
  W(R22,"CZ","457 Synthetic (.22 LR)",".22 LR",525,16),
  W(R22,"CZ","457 Varmint (.17 HMR)",".17 HMR",525,9),
  W(R22,"CZ","457 Varmint (.22 WMR)",".22 WMR",525,16),
  W(R22,"Tikka","T1x MTR (.22 LR)",".22 LR",508,16.5),
  W(R22,"Tikka","T1x MTR (.17 HMR)",".17 HMR",508,9),
  W(R22,"Sako","Finnfire II (.22 LR)",".22 LR",559,16.5),
  W(R22,"Anschütz","1416 D HB (.22 LR)",".22 LR",585,16.5),
  W(R22,"Anschütz","1761 HB (.22 LR)",".22 LR",585,16.5),
  W(R22,"Savage","Mark II FV-SR (.22 LR)",".22 LR",419,16),
  W(R22,"Savage","93R17 (.17 HMR)",".17 HMR",533,9),
  W(R22,"Ruger","American Rimfire (.22 LR)",".22 LR",559,16),
  W(R22,"Browning","T-Bolt (.22 LR)",".22 LR",559,16),
  W(R22,"Lithgow","LA101 Crossover (.22 LR)",".22 LR",553,16),
  W(SEMI,"Ruger","10/22 Carbine (.22 LR)",".22 LR",470,16),
  W(SEMI,"Ruger","10/22 Target (.22 LR)",".22 LR",508,16),
  W(SEMI,"Smith & Wesson","M&P 15-22 (.22 LR)",".22 LR",419,15,6.5),
  W(SEMI,"Générique","AR-15 16\" (.223 Rem)",".223 Rem",406,7,7.0),
  W(SEMI,"Générique","AR-10 18\" (.308 Win)",".308 Win",457,10,7.0),
  W(VER,"Bergara","B-14 Ridge (.308 Win)",".308 Win",559,10),
  W(VER,"Tikka","T3x Lite (.308 Win)",".308 Win",570,11),
  W(VER,"Tikka","T3x Varmint (.223 Rem)",".223 Rem",597,8),
  W(VER,"Howa","1500 HCR (.308 Win)",".308 Win",610,10),
  W(VER,"Remington","700 SPS Tactical (.308 Win)",".308 Win",508,10),
  W(VER,"Sako","S20 Precision (.308 Win)",".308 Win",610,11),
  W(PREC,"Bergara","B-14 HMR (.308 Win)",".308 Win",610,10),
  W(PREC,"Bergara","B-14 HMR (6.5 Creedmoor)","6.5 Creedmoor",610,8),
  W(PREC,"Tikka","T3x TAC A1 (.308 Win)",".308 Win",610,11,5.5),
  W(PREC,"Tikka","T3x TAC A1 (6.5 Creedmoor)","6.5 Creedmoor",610,8,5.5),
  W(PREC,"Sako","TRG 22 (.308 Win)",".308 Win",660,11,5.5),
  W(PREC,"Sako","TRG 42 (.338 Lapua Mag)",".338 Lapua Mag",690,10,6.0),
  W(PREC,"Ruger","Precision Rifle (.308 Win)",".308 Win",610,10,5.5),
  W(PREC,"Ruger","Precision Rifle (6.5 Creedmoor)","6.5 Creedmoor",610,8,5.5),
  W(PREC,"Savage","110 Elite Precision (6.5 Creedmoor)","6.5 Creedmoor",660,8,5.5),
  W(CH,"Blaser","R8 Professional (.308 Win)",".308 Win",580,11),
  W(CH,"Browning","X-Bolt (.30-06)",".30-06",560,10),
  W(CH,"Mauser","M18 (.308 Win)",".308 Win",560,11),
  W(CH,"Générique","Carabine de chasse (.30-06)",".30-06",560,10)
];


// ---- Gammes complètes des grandes marques (modèle × calibre). Pas de rayure usuels du calibre et longueurs de canon
// typiques du modèle : valeurs « ≈ » à vérifier sur votre arme (gravure du canon / notice).
(function(){
  const TW={".22 LR":16,".17 HMR":9,".22 WMR":16,".17 Mach 2":9,".204 Ruger":12,".222 Rem":14,".223 Rem":8,".22-250 Rem":12,"22 Creedmoor":7.5,
    ".243 Win":10,"6mm Creedmoor":7.5,"6mm ARC":7.5,".25-06 Rem":10,"6.5 Creedmoor":8,"6.5 PRC":8,"6.5x55 SE":8,"6.5x47 Lapua":8,".260 Rem":8,
    ".270 Win":10,".270 WSM":10,"7mm-08 Rem":9.5,"7mm PRC":8,"7mm Rem Mag":9.5,"7x64":8.7,"8x57 IS":9.5,".308 Win":10,".30-06":10,"7.62x39":9.5,
    ".300 WSM":10,".300 Win Mag":10,".300 PRC":9,".338 Win Mag":10,".338 Lapua Mag":10,"9.3x62":14,".350 Legend":16,".450 Bushmaster":24};
  const ADD=(type,brand,family,cals,barrel,o)=>{o=o||{};cals.forEach(c=>{
    const b=typeof barrel==="object"?(barrel[c]||barrel._):barrel;
    weapon.push(Object.assign(W(type,brand,`${family} (${c})`,c,b,(o.tw&&o.tw[c])||TW[c]||10,o.sight),
      {src:o.src||"≈ pas usuel du calibre, canon typique du modèle"},o.rail!=null?{rail:o.rail}:{}));});};
  const RF=[".22 LR",".17 HMR",".22 WMR"],MAG={_:610,".300 Win Mag":660,"7mm Rem Mag":660,".300 PRC":660,"6.5 PRC":610,"7mm PRC":610};
  // ===== Bergara
  ADD(R22,"Bergara","B-14R Steel",[".22 LR"],457,{sight:5.0});
  ADD(R22,"Bergara","B-14R Carbon",[".22 LR"],457,{sight:5.0});
  ADD(R22,"Bergara","B-14R Trainer (HMR)",[".22 LR"],457,{sight:5.0});
  ADD(R22,"Bergara","B-14R Trainer Carbon",[".22 LR"],457,{sight:5.0});
  ADD(R22,"Bergara","BMR Steel",RF,508);ADD(R22,"Bergara","BMR Carbon",RF,457);
  ADD(SEMI,"Bergara","BXR",[".22 LR"],419);
  const BHMR=[".223 Rem",".22-250 Rem",".243 Win","6mm Creedmoor","6.5 Creedmoor","6.5 PRC",".308 Win","7mm PRC",".300 Win Mag"];
  ADD(PREC,"Bergara","B-14 HMR",BHMR,{_:610,".300 Win Mag":660,".308 Win":610,".223 Rem":610},{tw:{".223 Rem":8,"6.5 PRC":8}});
  ADD(PREC,"Bergara","B-14 HMR Pro",["6.5 Creedmoor","6.5 PRC",".308 Win",".300 PRC"],610);
  ADD(PREC,"Bergara","B-14 BMP",["6.5 Creedmoor",".308 Win"],610,{sight:5.5});
  ADD(PREC,"Bergara","B-14 Squared HMR",["6.5 Creedmoor","6.5 PRC",".308 Win"],610);
  ADD(PREC,"Bergara","Premier Competition",["6.5 Creedmoor",".308 Win","6mm Creedmoor"],660,{sight:5.5});
  ADD(PREC,"Bergara","Premier Long Range 2.0",["6.5 Creedmoor","6.5 PRC",".308 Win","7mm PRC",".300 Win Mag",".300 PRC"],MAG);
  const BHUNT=[".243 Win","6.5 Creedmoor","6.5 PRC",".270 Win",".308 Win",".30-06","7mm PRC","7mm Rem Mag",".300 Win Mag"];
  ["B-14 Ridge","B-14 Ridge SP","B-14 Ridge Carbon","B-14 Hunter","B-14 Wilderness Ridge","B-14 Wilderness Hunter","B-14 Wilderness HMR","B-14 Timber"].forEach(f=>ADD(VER,"Bergara",f,BHUNT,{_:559,"6.5 PRC":610,"7mm PRC":610,"7mm Rem Mag":610,".300 Win Mag":610}));
  ["Premier Mountain 2.0","Premier Canyon","Premier Highlander","Premier Ridgeback","Premier Approach","Premier Divide","Premier MG Lite"].forEach(f=>ADD(CH,"Bergara",f,["6.5 Creedmoor","6.5 PRC",".308 Win","7mm PRC",".300 Win Mag",".300 PRC"],{_:559,"6.5 PRC":610,"7mm PRC":610,".300 Win Mag":610,".300 PRC":610}));
  // ===== CZ
  [["457 Varmint",525],["457 Varmint MTR",525],["457 MTR",525],["457 Synthetic",525],["457 Jaguar",520],["457 Lux",625],["457 American",610],
   ["457 Premium",625],["457 Royal",520],["457 Thumbhole Varmint",525],["457 Silhouette",520],["457 Pro Varmint",410],["457 LRP",610],
   ["457 Precision Trainer",610],["457 Varmint Precision Chassis",610],["457 Scout",410]].forEach(([f,b])=>ADD(R22,"CZ",f,f.includes("Scout")?[".22 LR"]:RF,b));
  ADD(R22,"CZ","457 Training Rifle",[".22 LR"],630);ADD(SEMI,"CZ","512",[".22 LR",".22 WMR"],520);ADD(R22,"CZ","455 Varmint (ancien)",RF,525);
  const C600=[".223 Rem",".243 Win","6.5 Creedmoor",".270 Win",".308 Win",".30-06","7mm Rem Mag",".300 Win Mag","8x57 IS","9.3x62"];
  ["600 Alpha","600 Lux","600 American","600 Ergo"].forEach(f=>ADD(VER,"CZ",f,C600,{_:510,".300 Win Mag":610,"7mm Rem Mag":610}));
  ADD(PREC,"CZ","600 Range",[".223 Rem","6.5 Creedmoor",".308 Win"],610);ADD(SEMI,"CZ","600 Trail",[".223 Rem","7.62x39"],410);
  ADD(PREC,"CZ","TSR",[".308 Win","6.5 Creedmoor"],610,{sight:5.5});ADD(VER,"CZ","557 Varmint (ancien)",[".223 Rem",".243 Win",".308 Win"],660);
  // ===== Tikka
  ADD(R22,"Tikka","T1x MTR",[".22 LR",".17 HMR"],{_:508},{tw:{".22 LR":16.5}});ADD(R22,"Tikka","T1x UPR",[".22 LR",".17 HMR"],508,{tw:{".22 LR":16.5}});
  const T3=[".204 Ruger",".222 Rem",".223 Rem",".22-250 Rem",".243 Win","6.5 Creedmoor","6.5x55 SE","6.5 PRC","7mm-08 Rem",".270 Win","8x57 IS",".308 Win",".30-06","9.3x62","7mm Rem Mag",".300 WSM",".300 Win Mag"];
  const TB={_:570,"6.5 PRC":610,"7mm Rem Mag":620,".300 Win Mag":620,".300 WSM":620},TT={".223 Rem":8,".308 Win":11,".30-06":11,".300 Win Mag":11,".300 WSM":11};
  ["T3x Lite","T3x Lite Roughtech","T3x Hunter","T3x Forest","T3x Superlite","T3x Laminated Stainless","T3x Battue Lite","T3x Arctic","T3x Strata"].forEach(f=>ADD(VER,"Tikka",f,T3,TB,{tw:TT}));
  ADD(VER,"Tikka","T3x Varmint",[".204 Ruger",".222 Rem",".223 Rem",".22-250 Rem",".243 Win","6.5 Creedmoor",".308 Win"],600,{tw:TT});
  ADD(VER,"Tikka","T3x Super Varmint",[".223 Rem",".22-250 Rem",".243 Win","6.5 Creedmoor",".308 Win"],600,{tw:TT});
  ["T3x CTR","T3x UPR","T3x Compact Tactical"].forEach(f=>ADD(PREC,"Tikka",f,[".223 Rem","6.5 Creedmoor",".308 Win"],{_:508,"6.5 Creedmoor":610},{tw:TT}));
  ADD(PREC,"Tikka","T3x TAC A1",[".223 Rem","6mm Creedmoor","6.5 Creedmoor","6.5 PRC",".308 Win",".300 Win Mag"],{_:610,".308 Win":610,".300 Win Mag":660},{tw:TT,sight:5.5});
  // ===== Sako
  ADD(R22,"Sako","Finnfire II",[".22 LR",".17 HMR"],{_:559});ADD(R22,"Sako","Quad",RF.concat([".17 Mach 2"]),{_:559});
  const S20=[".243 Win","6.5 Creedmoor","6.5 PRC",".270 Win",".308 Win",".30-06","7mm Rem Mag",".300 Win Mag",".300 PRC"];
  ADD(VER,"Sako","S20 Hunter",S20,{_:610,".300 Win Mag":660,".300 PRC":660,"7mm Rem Mag":660},{tw:{".308 Win":11,".30-06":11,".300 Win Mag":11}});
  ADD(PREC,"Sako","S20 Precision",S20,{_:610,".300 Win Mag":660,".300 PRC":660,"7mm Rem Mag":660},{tw:{".308 Win":11,".30-06":11,".300 Win Mag":11},sight:5.5});
  ["90 Adventure","90 Peak","90 Bavarian","90 Hunter","90 Quest","85 Hunter","85 Finnlight"].forEach(f=>ADD(CH,"Sako",f,[".222 Rem",".223 Rem",".243 Win","6.5 Creedmoor","6.5x55 SE",".270 Win","7mm-08 Rem",".308 Win",".30-06","8x57 IS","9.3x62","7mm Rem Mag",".300 Win Mag",".338 Win Mag"],{_:570,"7mm Rem Mag":620,".300 Win Mag":620,".338 Win Mag":620},{tw:{".308 Win":11,".30-06":11,".300 Win Mag":11}}));
  ADD(PREC,"Sako","TRG 22 A1",[".308 Win","6.5 Creedmoor"],{_:660},{tw:{".308 Win":11},sight:5.5});
  ADD(PREC,"Sako","TRG 42 A1",[".338 Lapua Mag",".300 Win Mag"],{_:690},{tw:{".300 Win Mag":11},sight:6.0});
  ADD(PREC,"Sako","TRG 22",[".308 Win","6.5 Creedmoor"],660,{tw:{".308 Win":11},sight:5.5});ADD(PREC,"Sako","TRG 42",[".338 Lapua Mag",".300 Win Mag"],690,{tw:{".300 Win Mag":11},sight:6.0});
  // ===== Ruger
  ["10/22 Carbine","10/22 Sporter","10/22 Takedown","10/22 Target","10/22 Competition"].forEach(f=>ADD(SEMI,"Ruger",f,[".22 LR"],f.includes("Target")||f.includes("Competition")?508:470));
  ADD(R22,"Ruger","American Rimfire",RF,559);ADD(R22,"Ruger","Precision Rimfire",RF,457,{sight:5.5});
  ADD(PREC,"Ruger","Precision Rifle (RPR)",[".223 Rem","6mm Creedmoor","6.5 Creedmoor",".308 Win","6.5 PRC",".300 Win Mag",".300 PRC",".338 Lapua Mag"],{_:610,".308 Win":508,".223 Rem":508,"6.5 PRC":660,".300 Win Mag":660,".300 PRC":660,".338 Lapua Mag":660},{sight:5.5,rail:20});
  ["American Gen II Standard","American Gen II Predator","American Gen II Ranch","American Hunter","Hawkeye Hunter","Hawkeye Long-Range Target","Hawkeye African"].forEach(f=>ADD(VER,"Ruger",f,f.includes("African")?[".375 Ruger",".416 Ruger"].filter(()=>false).concat([".30-06",".300 Win Mag",".338 Win Mag"]):[".223 Rem",".243 Win","6.5 Creedmoor","6.5 PRC",".270 Win",".308 Win",".30-06","7mm PRC",".300 Win Mag",".350 Legend",".450 Bushmaster"],{_:560,"6.5 PRC":610,"7mm PRC":610,".300 Win Mag":610,".350 Legend":420,".450 Bushmaster":420}));
  // ===== Savage
  ["Mark II FV-SR","Mark II BTV","B22 FV-SR","B22 Precision","B22 Magnum FV-SR","A22 Pro Varmint"].forEach(f=>ADD(f.startsWith("A22")?SEMI:R22,"Savage",f,f.includes("Magnum")?[".22 WMR",".17 HMR"]:f.startsWith("A22")?[".22 LR"]:[".22 LR"],f.includes("Precision")?457:f.includes("FV-SR")?419:533));
  ADD(R22,"Savage","93R17",[".17 HMR"],533);ADD(R22,"Savage","93 FV-SR",[".22 WMR"],419);
  const SV=[".223 Rem",".243 Win","6mm Creedmoor","6.5 Creedmoor","6.5 PRC",".308 Win","7mm PRC",".300 Win Mag",".300 PRC",".338 Lapua Mag"];
  ADD(PREC,"Savage","110 Elite Precision",SV,{_:660,".308 Win":660,".300 PRC":760,".338 Lapua Mag":760},{sight:5.5});
  ADD(PREC,"Savage","110 Precision",SV.slice(0,8),{_:610,".223 Rem":508,".308 Win":508},{sight:5.5});
  ADD(PREC,"Savage","110 Tactical",[".223 Rem","6.5 Creedmoor",".308 Win"],{_:610,".308 Win":508});
  ["110 Long Range Hunter","110 High Country","110 Ultralite","110 Apex Hunter XP","Axis II","Impulse Hog Hunter"].forEach(f=>ADD(VER,"Savage",f,[".223 Rem",".243 Win","6.5 Creedmoor",".270 Win",".308 Win",".30-06","7mm Rem Mag",".300 Win Mag"],{_:559,"7mm Rem Mag":610,".300 Win Mag":610}));
  ADD(PREC,"Savage","10 BA Stealth",[".223 Rem","6.5 Creedmoor",".308 Win"],610);ADD(VER,"Savage","12 FV",[".223 Rem",".22-250 Rem",".243 Win"],660,{tw:{".223 Rem":9}});
  // ===== Howa
  const HW=[".223 Rem",".22-250 Rem",".243 Win","6mm ARC","6.5 Creedmoor","6.5 PRC",".270 Win",".308 Win",".30-06","7mm Rem Mag",".300 Win Mag"];
  ["1500 Hogue","1500 Superlite","1500 Carbon Stalker"].forEach(f=>ADD(VER,"Howa",f,HW,{_:560,"6.5 PRC":610,"7mm Rem Mag":610,".300 Win Mag":610},{tw:{".223 Rem":9}}));
  ["1500 HCR","1500 APC Chassis","1500 KRG Bravo","1500 Oryx"].forEach(f=>ADD(PREC,"Howa",f,[".223 Rem","6mm Creedmoor","6.5 Creedmoor","6.5 PRC",".308 Win",".300 Win Mag"],{_:610,".300 Win Mag":660},{tw:{".223 Rem":9},sight:5.5}));
  ADD(VER,"Howa","Mini Action",[".223 Rem","6mm ARC","7.62x39",".350 Legend"],{_:508},{tw:{".223 Rem":9}});
  // ===== Remington
  const R7=[".223 Rem",".22-250 Rem",".243 Win","6.5 Creedmoor",".270 Win","7mm-08 Rem",".308 Win",".30-06","7mm Rem Mag",".300 Win Mag"];
  ["700 SPS","700 CDL","700 American Wilderness","700 Alpha 1"].forEach(f=>ADD(VER,"Remington",f,R7,{_:610,"7mm Rem Mag":660,".300 Win Mag":660},{tw:{".223 Rem":9,".308 Win":10}}));
  ["700 SPS Tactical","700 PCR","700 5-R","700 Long Range","700 Magpul"].forEach(f=>ADD(PREC,"Remington",f,[".223 Rem","6.5 Creedmoor",".308 Win",".300 Win Mag"],{_:610,".308 Win":610,".300 Win Mag":660},{tw:{".223 Rem":9}}));
  // ===== Browning
  ["T-Bolt Target","T-Bolt Sporter","T-Bolt Composite"].forEach(f=>ADD(R22,"Browning",f,RF,559,{tw:{".22 LR":16}}));
  ["X-Bolt Hunter","X-Bolt Pro","X-Bolt Stalker","X-Bolt Mountain Pro","X-Bolt Hell's Canyon","X-Bolt SF","X-Bolt Max Long Range","X-Bolt Target","X-Bolt 2 Speed"].forEach(f=>ADD(f.includes("Max")||f.includes("Target")?PREC:VER,"Browning",f,[".223 Rem",".243 Win","6.5 Creedmoor","6.5 PRC",".270 Win","7mm-08 Rem",".308 Win",".30-06","7mm PRC","7mm Rem Mag",".300 WSM",".300 Win Mag",".300 PRC"],{_:560,"6.5 PRC":610,"7mm PRC":610,"7mm Rem Mag":610,".300 Win Mag":610,".300 PRC":660,".300 WSM":585}));
  ["BAR MK3","BAR MK3 Composite","BLR Lightweight"].forEach(f=>ADD(SEMI,"Browning",f,[".243 Win",".270 Win",".308 Win",".30-06","7mm Rem Mag",".300 Win Mag","9.3x62"],{_:560,"7mm Rem Mag":610,".300 Win Mag":610}));
  // ===== Anschütz
  [["1416 D HB",585],["1416 D KL",585],["1416 D HB Beavertail",585],["1517 D HB",585],["1761 D HB",585],["1761 MPR",585],["1727 F",510],["1712 D HB",585],["54.30",660],["1903",650],["1907",660],["2013",660],["1710 D HB",585]].forEach(([f,b])=>ADD(R22,"Anschütz",f,f.startsWith("1517")?[".17 HMR"]:f.startsWith("1416")||f.startsWith("1712")||f.startsWith("1761")?[".22 LR",".17 HMR"].slice(0,f==="1761 MPR"?1:2):[".22 LR"],b,{tw:{".22 LR":16.5}}));
  // ===== Blaser
  ["R8 Professional","R8 Professional Success","R8 Ultimate","R8 Silence","R8 Success","R8 Kilimanjaro"].forEach(f=>ADD(CH,"Blaser",f,[".222 Rem",".223 Rem",".243 Win","6.5 Creedmoor","6.5x55 SE",".270 Win","7x64",".308 Win",".30-06","8x57 IS","9.3x62","7mm Rem Mag",".300 Win Mag",".338 Win Mag"],{_:580,"7mm Rem Mag":650,".300 Win Mag":650,".338 Win Mag":650},{tw:{".308 Win":11,".30-06":11,"7x64":8.7,"8x57 IS":9.5}}));
  ADD(PREC,"Blaser","R8 Ultimate LRS",[".308 Win","6.5 Creedmoor",".300 Win Mag",".338 Lapua Mag"],{_:650,".338 Lapua Mag":690},{sight:5.5});
  // ===== Mauser
  ["M18","M18 Pure","M12 Max","M12 Impact","M98 Standard"].forEach(f=>ADD(CH,"Mauser",f,[".222 Rem",".223 Rem",".243 Win","6.5 Creedmoor","6.5x55 SE",".270 Win","7x64",".308 Win",".30-06","8x57 IS","9.3x62","7mm Rem Mag",".300 Win Mag"],{_:560,"7mm Rem Mag":620,".300 Win Mag":620},{tw:{".308 Win":11,".30-06":11}}));
  // ===== Rimfire PR spécialisés
  ADD(R22,"Vudoo","V-22 (chassis)",[".22 LR",".17 HMR"],{_:610},{sight:5.5});ADD(R22,"Vudoo","V-22 Ryzen",[".22 LR"],{_:508},{sight:5.5});
  ADD(R22,"Lithgow","LA101 Crossover",RF,553);ADD(R22,"Lithgow","LA101 Bush",RF,419);
  ADD(R22,"Zermatt","Bighorn TL3 (.22 LR, montage custom)",[".22 LR"],610,{sight:5.5});
  ADD(R22,"MasterPiece Arms","BA Rimfire Trainer",[".22 LR"],610,{sight:5.5});
  ADD(R22,"Kimber","84M / Adirondack Rimfire",[".22 LR"],457);
})();
// ---- Sabatti : gamme complète générée (modèle × calibre). Pas = constructeur ; « ≈ » = longueur de canon estimée.
(function(){
  const TW={".223 Rem":12,".243 Win":10,".270 Win":10,"6mm Creedmoor":7.5,"6.5x47 Lapua":8,"6.5x55 SE":8.5,"6.5 Creedmoor":8,"6.5 PRC":8,".260 Rem":8.25,
    "7mm Rem Mag":9.5,"7mm Rem SAUM":8.25,".284 Shehane":8,".30-06":11,".308 Win":11,".300 Win Mag":11,".338 Win Mag":10,".458 Win Mag":14};
  const add=(type,model,cals,barrel,src,extra)=>cals.forEach(c=>{const tw=(extra&&extra.tw&&extra.tw[c])||TW[c]||10;
    weapon.push(Object.assign(W(type,"Sabatti",`${model} (${c})`,c,barrel,tw,type===PREC?5.5:5.0),{src},extra&&extra.rail!=null?{rail:extra.rail}:{}));});
  const ROVER=[".223 Rem",".243 Win",".270 Win","6.5x47 Lapua","6.5x55 SE","6.5 Creedmoor","6.5 PRC","7mm Rem Mag",".30-06",".308 Win",".300 Win Mag",".338 Win Mag"];
  // précision / tir sportif
  add(PREC,"Urban Sniper 20\"",[".308 Win","6.5x47 Lapua","6.5 Creedmoor","7mm Rem SAUM"],510,"constructeur : canon 51 cm, rails 0/10/20 MOA",{tw:{".308 Win":11.5},rail:20});
  add(PREC,"Urban Sniper 24\"",[".308 Win","6.5x47 Lapua","6.5 Creedmoor","7mm Rem SAUM"],610,"canon 61 cm, rails 0/10/20 MOA",{tw:{".308 Win":11.5},rail:20});
  add(PREC,"STR",[".308 Win","6.5 Creedmoor",".300 Win Mag"],660,"essai : canon 26\", rail 20 MOA",{tw:{".308 Win":11.5},rail:20});
  add(PREC,"STR Sport F-Class",[".308 Win","6.5 Creedmoor"],760,"≈ canon");
  add(PREC,"ST-18",[".308 Win","6mm Creedmoor","6.5 Creedmoor",".260 Rem"],610,"≈ canon");
  add(PREC,"ST Sport",[".308 Win","6.5 Creedmoor"],610,"≈ canon");
  add(PREC,"Tactical EVO",[".308 Win",".300 Win Mag","6.5x47 Lapua","6.5 Creedmoor","6mm Creedmoor",".284 Shehane"],709,"canon 27,9\"");
  add(PREC,"TLD",[".308 Win","6.5x47 Lapua","6.5 Creedmoor",".284 Shehane"],660,"≈ canon");
  add(PREC,"TLD White Fluted",[".308 Win","6.5 Creedmoor"],660,"≈ canon");
  add(VER,"Tactical Scout",[".223 Rem",".308 Win","6.5x47 Lapua","6.5 Creedmoor"],510,"≈ canon",{tw:{".223 Rem":8,".308 Win":11.5}});
  // Rover (nouvelle génération) : 10 variantes
  add(CH,"Rover Hunter",ROVER,559,"≈ canon 22\"");
  add(CH,"Rover Hunter Classic",ROVER,559,"≈ canon 22\"");
  add(CH,"Rover Hunter Classic Pro",ROVER,559,"≈ canon 22\"");
  add(CH,"Rover Pathfinder",ROVER,559,"≈ canon");
  add(CH,"Rover Shooter",ROVER,610,"≈ canon 24\"");
  add(CH,"Rover Thumbhole",ROVER,559,"≈ canon");
  add(CH,"Rover Ranger",ROVER,559,"≈ canon");
  add(CH,"Rover Alaskan",[".30-06",".308 Win",".300 Win Mag",".338 Win Mag",".458 Win Mag"],559,"≈ canon");
  add(VER,"Rover Scout",[".223 Rem",".308 Win","6.5 Creedmoor"],457,"≈ canon court");
  add(VER,"Rover Patrol",[".223 Rem",".308 Win","6.5 Creedmoor"],457,"≈ canon court");
  add(CH,"Saphire",[".243 Win","6.5 Creedmoor",".308 Win",".270 Win","6.5x55 SE",".30-06","7mm Rem Mag",".300 Win Mag"],560,"pas constructeur, ≈ canon",{tw:{"6.5x55 SE":8,"7mm Rem Mag":8.25,".300 Win Mag":11.5}});
})();
// Lunettes : focal FFP (1er plan, réticule valable à tous les grossissements) / SFP (2e plan),
// calMag = grossissement auquel les graduations du réticule sont justes (SFP), reticle = dessin utilisé.
const S=(brand,model,unit,click,focal,reticle,mag,calMag,src)=>({brand,model,unit,click:String(click),focal,reticle,mag,calMag:calMag||"",src:src||""});
const SRC="≈ (valeurs typiques de la gamme, à vérifier sur la notice)";
const scope=[
  Object.assign(S("Discovery Optics","ED-PRS GEN II 5-25x56 SFIR FFP-Z MRAD","MRAD",0.1,"FFP","disc-ffpz","5-25","","schéma constructeur fourni par l'utilisateur"),{travelE:36,photo:{img:"reticles/discovery-ed-prs-gen2-ffp-z.webp",cx:450,cy:447.5,ppu:32.44}}),
  Object.assign(S("Discovery Optics","ED-PRS GEN II 5-25x56 SFIR FFP-Z MOA","MOA",0.25,"FFP","moa-hash","5-25","","≈"),{travelE:122}),
  S("Discovery Optics","HD 5-25x50 SFIR FFP","MRAD",0.1,"FFP","mrad-hash","5-25","","≈"),
  S("Discovery Optics","VT-Z 4-16x44 SFP","MOA",0.25,"SFP","mildot","4-16",16,"≈"),
  Object.assign(S("Discovery Optics","ED-PRS GEN II 4-20x52 (MIL FFP-Z éclairé (arbre))","MRAD",0.1,"FFP","mrad-tree","4-20","",SRC),{retName:"MIL FFP-Z éclairé (arbre)",travelE:36}),
  Object.assign(S("Discovery Optics","ED-PRS GEN II 6-30x56 (MIL FFP-Z éclairé (arbre))","MRAD",0.1,"FFP","mrad-tree","6-30","",SRC),{retName:"MIL FFP-Z éclairé (arbre)",travelE:30}),
  Object.assign(S("Discovery Optics","ED-ELR 5-40x56 (MIL FFP-Z éclairé (arbre))","MRAD",0.1,"FFP","mrad-tree","5-40","",SRC),{retName:"MIL FFP-Z éclairé (arbre)",travelE:29}),
  Object.assign(S("Discovery Optics","ED-LHT GEN II 3-15x50 (MIL FFP éclairé)","MRAD",0.1,"FFP","mrad-hash","3-15","",SRC),{retName:"MIL FFP éclairé",travelE:22}),
  Object.assign(S("Discovery Optics","ED-LHT GEN II 4.5-22x50 (MIL FFP éclairé)","MRAD",0.1,"FFP","mrad-hash","4.5-22","",SRC),{retName:"MIL FFP éclairé",travelE:22}),
  Object.assign(S("Discovery Optics","ED-AR 1-6x24 (BDC éclairé)","MRAD",0.1,"FFP","bdc","1-6","",SRC),{retName:"BDC éclairé",travelE:20}),
  Object.assign(S("Discovery Optics","HD GEN II 5-30x56 (MIL FFP éclairé (arbre))","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"MIL FFP éclairé (arbre)",travelE:30}),
  Object.assign(S("Discovery Optics","HD GEN II 4-24x50 (MIL FFP éclairé (arbre))","MRAD",0.1,"FFP","mrad-tree","4-24","",SRC),{retName:"MIL FFP éclairé (arbre)",travelE:27}),
  Object.assign(S("Discovery Optics","HD GEN II 3-18x50 (MIL FFP éclairé (arbre))","MRAD",0.1,"FFP","mrad-tree","3-18","",SRC),{retName:"MIL FFP éclairé (arbre)",travelE:25}),
  Object.assign(S("Discovery Optics","HD 4-16x44 (MIL FFP éclairé)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"MIL FFP éclairé",travelE:22}),
  Object.assign(S("Discovery Optics","HD 3-12x44 (MIL FFP éclairé)","MRAD",0.1,"FFP","mrad-hash","3-12","",SRC),{retName:"MIL FFP éclairé",travelE:22}),
  Object.assign(S("Discovery Optics","HT 4-16x44 (Mil-Dot SFP éclairé)","MOA",0.25,"SFP","mildot","4-16","16",SRC),{retName:"Mil-Dot SFP éclairé",travelE:76}),
  Object.assign(S("Discovery Optics","HT 6-24x50 (Mil-Dot SFP éclairé)","MOA",0.25,"SFP","mildot","6-24","24",SRC),{retName:"Mil-Dot SFP éclairé",travelE:76}),
  Object.assign(S("Discovery Optics","HS 4-16x44 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"MIL FFP",travelE:22}),
  Object.assign(S("Discovery Optics","HS 6-24x50 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"MIL FFP",travelE:22}),
  Object.assign(S("Discovery Optics","VT-R 3-9x40 (Mil-Dot SFP)","MOA",0.25,"SFP","mildot","3-9","9",SRC),{retName:"Mil-Dot SFP",travelE:55}),
  Object.assign(S("Discovery Optics","VT-R 3-12x42 (Mil-Dot SFP)","MOA",0.25,"SFP","mildot","3-12","12",SRC),{retName:"Mil-Dot SFP",travelE:55}),
  Object.assign(S("Discovery Optics","VT-R 4-16x42 (Mil-Dot SFP)","MOA",0.25,"SFP","mildot","4-16","16",SRC),{retName:"Mil-Dot SFP",travelE:55}),
  Object.assign(S("Discovery Optics","VT-Z 3-12x44 (Mil-Dot SFP éclairé)","MOA",0.25,"SFP","mildot","3-12","12",SRC),{retName:"Mil-Dot SFP éclairé",travelE:62}),
  Object.assign(S("Discovery Optics","VT-Z 4-16x44 (Mil-Dot SFP éclairé)","MOA",0.25,"SFP","mildot","4-16","16",SRC),{retName:"Mil-Dot SFP éclairé",travelE:62}),
  Object.assign(S("Discovery Optics","VT-Z 6-24x44 (Mil-Dot SFP éclairé)","MOA",0.25,"SFP","mildot","6-24","24",SRC),{retName:"Mil-Dot SFP éclairé",travelE:62}),
  Object.assign(S("Discovery Optics","VT-T 3-12x44 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","3-12","",SRC),{retName:"MIL FFP",travelE:20}),
  Object.assign(S("Discovery Optics","VT-T 4.5-18x44 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","4.5-18","",SRC),{retName:"MIL FFP",travelE:20}),
  Object.assign(S("Vortex","Razor HD Gen III 6-36x56 (EBR-7D MRAD)","MRAD",0.1,"FFP","mrad-tree","6-36","",SRC),{retName:"EBR-7D MRAD",travelE:28}),
  Object.assign(S("Vortex","Razor HD Gen III 6-36x56 (EBR-7D MOA)","MOA",0.25,"FFP","moa-hash","6-36","",SRC),{retName:"EBR-7D MOA",travelE:96}),
  Object.assign(S("Vortex","Razor HD Gen III 1-10x24 (EBR-9 MRAD)","MRAD",0.1,"FFP","mrad-hash","1-10","",SRC),{retName:"EBR-9 MRAD",travelE:29}),
  Object.assign(S("Vortex","Razor HD Gen II 4.5-27x56 (EBR-7C MRAD)","MRAD",0.1,"FFP","mrad-tree","4.5-27","",SRC),{retName:"EBR-7C MRAD",travelE:25}),
  Object.assign(S("Vortex","Razor HD Gen II 4.5-27x56 (EBR-7C MOA)","MOA",0.25,"FFP","moa-hash","4.5-27","",SRC),{retName:"EBR-7C MOA",travelE:86}),
  Object.assign(S("Vortex","Razor HD Gen II 4.5-27x56 (EBR-2C MRAD)","MRAD",0.1,"FFP","mrad-hash","4.5-27","",SRC),{retName:"EBR-2C MRAD",travelE:25}),
  Object.assign(S("Vortex","Razor HD Gen II 3-18x50 (EBR-7C MRAD)","MRAD",0.1,"FFP","mrad-tree","3-18","",SRC),{retName:"EBR-7C MRAD",travelE:30}),
  Object.assign(S("Vortex","Razor HD Gen II 3-18x50 (EBR-7C MOA)","MOA",0.25,"FFP","moa-hash","3-18","",SRC),{retName:"EBR-7C MOA",travelE:103}),
  Object.assign(S("Vortex","Razor HD Gen II 3-18x50 (EBR-2C MRAD)","MRAD",0.1,"FFP","mrad-hash","3-18","",SRC),{retName:"EBR-2C MRAD",travelE:30}),
  Object.assign(S("Vortex","Viper PST Gen II 5-25x50 (EBR-7C MRAD)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"EBR-7C MRAD",travelE:26}),
  Object.assign(S("Vortex","Viper PST Gen II 5-25x50 (EBR-7C MOA)","MOA",0.25,"FFP","moa-hash","5-25","",SRC),{retName:"EBR-7C MOA",travelE:89}),
  Object.assign(S("Vortex","Viper PST Gen II 5-25x50 (EBR-2C MRAD)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"EBR-2C MRAD",travelE:26}),
  Object.assign(S("Vortex","Viper PST Gen II 3-15x44 (EBR-7C MRAD)","MRAD",0.1,"FFP","mrad-tree","3-15","",SRC),{retName:"EBR-7C MRAD",travelE:31}),
  Object.assign(S("Vortex","Viper PST Gen II 3-15x44 (EBR-7C MOA)","MOA",0.25,"FFP","moa-hash","3-15","",SRC),{retName:"EBR-7C MOA",travelE:107}),
  Object.assign(S("Vortex","Viper PST Gen II 3-15x44 (EBR-2C MRAD)","MRAD",0.1,"FFP","mrad-hash","3-15","",SRC),{retName:"EBR-2C MRAD",travelE:31}),
  Object.assign(S("Vortex","Viper PST Gen II 2-10x32 (EBR-4 MRAD)","MRAD",0.1,"FFP","mrad-hash","2-10","",SRC),{retName:"EBR-4 MRAD",travelE:31}),
  Object.assign(S("Vortex","Venom 5-25x56 (EBR-7C MRAD)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"EBR-7C MRAD",travelE:27}),
  Object.assign(S("Vortex","Venom 5-25x56 (EBR-7C MOA)","MOA",0.25,"FFP","moa-hash","5-25","",SRC),{retName:"EBR-7C MOA",travelE:93}),
  Object.assign(S("Vortex","Venom 3-15x44 (EBR-7C MRAD)","MRAD",0.1,"FFP","mrad-tree","3-15","",SRC),{retName:"EBR-7C MRAD",travelE:31}),
  Object.assign(S("Vortex","Venom 3-15x44 (EBR-7C MOA)","MOA",0.25,"FFP","moa-hash","3-15","",SRC),{retName:"EBR-7C MOA",travelE:107}),
  Object.assign(S("Vortex","Strike Eagle 5-25x56 (EBR-7C MRAD)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"EBR-7C MRAD",travelE:27}),
  Object.assign(S("Vortex","Strike Eagle 5-25x56 (EBR-7C MOA)","MOA",0.25,"FFP","moa-hash","5-25","",SRC),{retName:"EBR-7C MOA",travelE:93}),
  Object.assign(S("Vortex","Strike Eagle 3-18x44 (EBR-7C MRAD)","MRAD",0.1,"FFP","mrad-tree","3-18","",SRC),{retName:"EBR-7C MRAD",travelE:27}),
  Object.assign(S("Vortex","Strike Eagle 3-18x44 (EBR-7C MOA)","MOA",0.25,"FFP","moa-hash","3-18","",SRC),{retName:"EBR-7C MOA",travelE:93}),
  Object.assign(S("Vortex","Diamondback Tactical 6-24x50 (EBR-2C MRAD)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"EBR-2C MRAD",travelE:19}),
  Object.assign(S("Vortex","Diamondback Tactical 6-24x50 (EBR-2C MOA)","MOA",0.25,"FFP","moa-hash","6-24","",SRC),{retName:"EBR-2C MOA",travelE:65}),
  Object.assign(S("Vortex","Diamondback Tactical 4-16x44 (EBR-2C MRAD)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"EBR-2C MRAD",travelE:22}),
  Object.assign(S("Vortex","Diamondback Tactical 4-16x44 (EBR-2C MOA)","MOA",0.25,"FFP","moa-hash","4-16","",SRC),{retName:"EBR-2C MOA",travelE:76}),
  Object.assign(S("Vortex","Diamondback 4-12x40 (Dead-Hold BDC)","MOA",0.25,"SFP","bdc","4-12","12",SRC),{retName:"Dead-Hold BDC",travelE:58}),
  Object.assign(S("Vortex","Diamondback 3-9x40 (Dead-Hold BDC)","MOA",0.25,"SFP","bdc","3-9","9",SRC),{retName:"Dead-Hold BDC",travelE:58}),
  Object.assign(S("Vortex","Diamondback 4-16x42 (Dead-Hold BDC)","MOA",0.25,"SFP","bdc","4-16","16",SRC),{retName:"Dead-Hold BDC",travelE:69}),
  Object.assign(S("Vortex","Crossfire II 4-12x44 (Dead-Hold BDC)","MOA",0.25,"SFP","bdc","4-12","12",SRC),{retName:"Dead-Hold BDC",travelE:65}),
  Object.assign(S("Vortex","Crossfire II 4-12x44 (V-Plex)","MOA",0.25,"SFP","mildot","4-12","12",SRC),{retName:"V-Plex",travelE:65}),
  Object.assign(S("Vortex","Crossfire II 6-24x50 (Dead-Hold BDC)","MOA",0.25,"SFP","bdc","6-24","24",SRC),{retName:"Dead-Hold BDC",travelE:58}),
  Object.assign(S("Vortex","Crossfire II 6-24x50 (V-Plex)","MOA",0.25,"SFP","mildot","6-24","24",SRC),{retName:"V-Plex",travelE:58}),
  Object.assign(S("Vortex","Crossfire II 3-9x40 (Dead-Hold BDC)","MOA",0.25,"SFP","bdc","3-9","9",SRC),{retName:"Dead-Hold BDC",travelE:58}),
  Object.assign(S("Vortex","Crossfire II 3-9x40 (V-Plex)","MOA",0.25,"SFP","mildot","3-9","9",SRC),{retName:"V-Plex",travelE:58}),
  Object.assign(S("Vortex","Viper HS 4-16x44 (Dead-Hold BDC)","MOA",0.25,"SFP","bdc","4-16","16",SRC),{retName:"Dead-Hold BDC",travelE:76}),
  Object.assign(S("Vortex","Golden Eagle HD 15-60x52 (ECR-1 MOA)","MOA",0.125,"SFP","moa-hash","15-60","60",SRC),{retName:"ECR-1 MOA",travelE:52}),
  Object.assign(S("Athlon","Cronus BTR Gen2 4.5-29x56 (APLR3 FFP IR MIL)","MRAD",0.1,"FFP","mrad-tree","4.5-29","",SRC),{retName:"APLR3 FFP IR MIL",travelE:34}),
  Object.assign(S("Athlon","Ares ETR 4.5-30x56 (APRS1 FFP IR MIL)","MRAD",0.1,"FFP","mrad-tree","4.5-30","",SRC),{retName:"APRS1 FFP IR MIL",travelE:30}),
  Object.assign(S("Athlon","Ares BTR Gen2 4.5-27x50 (APLR2 FFP IR MIL)","MRAD",0.1,"FFP","mrad-tree","4.5-27","",SRC),{retName:"APLR2 FFP IR MIL",travelE:30}),
  Object.assign(S("Athlon","Ares BTR Gen2 4.5-27x50 (APLR2 FFP IR MOA)","MOA",0.25,"FFP","moa-hash","4.5-27","",SRC),{retName:"APLR2 FFP IR MOA",travelE:103}),
  Object.assign(S("Athlon","Ares BTR Gen2 2.5-15x50 (APLR2 FFP IR MIL)","MRAD",0.1,"FFP","mrad-tree","2.5-15","",SRC),{retName:"APLR2 FFP IR MIL",travelE:30}),
  Object.assign(S("Athlon","Ares BTR Gen2 2.5-15x50 (APLR2 FFP IR MOA)","MOA",0.25,"FFP","moa-hash","2.5-15","",SRC),{retName:"APLR2 FFP IR MOA",travelE:103}),
  Object.assign(S("Athlon","Ares UHD 3.6-29x56 (APLR6 FFP IR MIL)","MRAD",0.1,"FFP","mrad-tree","3.6-29","",SRC),{retName:"APLR6 FFP IR MIL",travelE:30}),
  Object.assign(S("Athlon","Argos BTR Gen2 6-24x50 (APMR FFP IR MIL)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"APMR FFP IR MIL",travelE:26}),
  Object.assign(S("Athlon","Argos BTR Gen2 6-24x50 (APMR FFP IR MOA)","MOA",0.25,"FFP","moa-hash","6-24","",SRC),{retName:"APMR FFP IR MOA",travelE:89}),
  Object.assign(S("Athlon","Argos BTR Gen2 8-34x56 (APMR FFP IR MIL)","MRAD",0.1,"FFP","mrad-hash","8-34","",SRC),{retName:"APMR FFP IR MIL",travelE:23}),
  Object.assign(S("Athlon","Argos BTR Gen2 8-34x56 (APMR FFP IR MOA)","MOA",0.25,"FFP","moa-hash","8-34","",SRC),{retName:"APMR FFP IR MOA",travelE:79}),
  Object.assign(S("Athlon","Midas TAC 6-24x50 (APRS2 FFP IR MIL)","MRAD",0.1,"FFP","mrad-tree","6-24","",SRC),{retName:"APRS2 FFP IR MIL",travelE:25}),
  Object.assign(S("Athlon","Midas TAC 6-24x50 (APRS2 FFP IR MOA)","MOA",0.25,"FFP","moa-hash","6-24","",SRC),{retName:"APRS2 FFP IR MOA",travelE:86}),
  Object.assign(S("Athlon","Midas TAC 5-25x56 (APRS2 FFP IR MIL)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"APRS2 FFP IR MIL",travelE:27}),
  Object.assign(S("Athlon","Midas TAC 5-25x56 (APRS2 FFP IR MOA)","MOA",0.25,"FFP","moa-hash","5-25","",SRC),{retName:"APRS2 FFP IR MOA",travelE:93}),
  Object.assign(S("Athlon","Heras SPR 4-24x50 (APRS5 FFP IR MIL)","MRAD",0.1,"FFP","mrad-tree","4-24","",SRC),{retName:"APRS5 FFP IR MIL",travelE:27}),
  Object.assign(S("Athlon","Talos BTR 4-14x44 (APMR FFP MIL)","MRAD",0.1,"FFP","mrad-hash","4-14","",SRC),{retName:"APMR FFP MIL",travelE:22}),
  Object.assign(S("Athlon","Neos 4-12x40 (BDC 500)","MOA",0.25,"SFP","bdc","4-12","12",SRC),{retName:"BDC 500",travelE:58}),
  Object.assign(S("Athlon","Neos 4-12x40 (Mil-Dot)","MOA",0.25,"SFP","mildot","4-12","12",SRC),{retName:"Mil-Dot",travelE:58}),
  Object.assign(S("Athlon","Neos 6-18x44 (BDC 500)","MOA",0.25,"SFP","bdc","6-18","18",SRC),{retName:"BDC 500",travelE:58}),
  Object.assign(S("Athlon","Neos 6-18x44 (Mil-Dot)","MOA",0.25,"SFP","mildot","6-18","18",SRC),{retName:"Mil-Dot",travelE:58}),
  Object.assign(S("Vector Optics","Continental 5-30x56 (VCT-34FFP MIL)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"VCT-34FFP MIL",travelE:26}),
  Object.assign(S("Vector Optics","Continental 5-30x56 (VCT-34FFP MOA)","MOA",0.25,"FFP","moa-hash","5-30","",SRC),{retName:"VCT-34FFP MOA",travelE:89}),
  Object.assign(S("Vector Optics","Continental 3-18x50 (VCT-34FFP MIL)","MRAD",0.1,"FFP","mrad-tree","3-18","",SRC),{retName:"VCT-34FFP MIL",travelE:26}),
  Object.assign(S("Vector Optics","Continental 3-18x50 (VCT-34FFP MOA)","MOA",0.25,"FFP","moa-hash","3-18","",SRC),{retName:"VCT-34FFP MOA",travelE:89}),
  Object.assign(S("Vector Optics","Continental 4-24x56 (VCT-34FFP MIL)","MRAD",0.1,"FFP","mrad-tree","4-24","",SRC),{retName:"VCT-34FFP MIL",travelE:26}),
  Object.assign(S("Vector Optics","Continental 4-24x56 (VCT-34FFP MOA)","MOA",0.25,"FFP","moa-hash","4-24","",SRC),{retName:"VCT-34FFP MOA",travelE:89}),
  Object.assign(S("Vector Optics","Taurus 5-30x56 (VTC-1 MIL FFP)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"VTC-1 MIL FFP",travelE:26}),
  Object.assign(S("Vector Optics","Taurus 4-24x56 (VTC-1 MIL FFP)","MRAD",0.1,"FFP","mrad-tree","4-24","",SRC),{retName:"VTC-1 MIL FFP",travelE:26}),
  Object.assign(S("Vector Optics","Marksman 6-24x50 (VMR-1 MIL FFP)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"VMR-1 MIL FFP",travelE:25}),
  Object.assign(S("Vector Optics","Marksman 4.5-18x50 (VMR-1 MIL FFP)","MRAD",0.1,"FFP","mrad-hash","4.5-18","",SRC),{retName:"VMR-1 MIL FFP",travelE:25}),
  Object.assign(S("Vector Optics","Sentinel-X 6-24x50 (VEC-MFL MIL FFP)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"VEC-MFL MIL FFP",travelE:25}),
  Object.assign(S("Vector Optics","Sentinel-X 4-16x44 (VEC-MFL MIL FFP)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"VEC-MFL MIL FFP",travelE:25}),
  Object.assign(S("Vector Optics","Sentinel-X 10-40x50 (VEC-MFL MIL FFP)","MRAD",0.1,"FFP","mrad-hash","10-40","",SRC),{retName:"VEC-MFL MIL FFP",travelE:20}),
  Object.assign(S("Vector Optics","Veyron 6-24x44 (VEC-Veyron MIL FFP)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"VEC-Veyron MIL FFP",travelE:20}),
  Object.assign(S("Vector Optics","Veyron 4-16x44 (VEC-Veyron MIL FFP)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"VEC-Veyron MIL FFP",travelE:20}),
  Object.assign(S("Vector Optics","Orion Pro Max 4-16x44 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"MIL FFP",travelE:20}),
  Object.assign(S("Vector Optics","Orion Pro Max 6-24x50 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"MIL FFP",travelE:20}),
  Object.assign(S("Vector Optics","Hugo 6-24x50 (Mil-Dot SFP)","MOA",0.25,"SFP","mildot","6-24","24",SRC),{retName:"Mil-Dot SFP",travelE:69}),
  Object.assign(S("Vector Optics","Hugo 4-16x44 (Mil-Dot SFP)","MOA",0.25,"SFP","mildot","4-16","16",SRC),{retName:"Mil-Dot SFP",travelE:69}),
  Object.assign(S("Vector Optics","Matiz 3-9x40 (Duplex)","MOA",0.25,"SFP","duplex","3-9","9",SRC),{retName:"Duplex",travelE:55}),
  Object.assign(S("Vector Optics","Matiz 4-12x40 (Duplex)","MOA",0.25,"SFP","duplex","4-12","12",SRC),{retName:"Duplex",travelE:55}),
  Object.assign(S("Arken","EP5 5-25x56 (VPR MIL)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"VPR MIL",travelE:29}),
  Object.assign(S("Arken","EP5 5-25x56 (VPR MOA)","MOA",0.25,"FFP","moa-hash","5-25","",SRC),{retName:"VPR MOA",travelE:100}),
  Object.assign(S("Arken","EP5 4-16x50 (VPR MIL)","MRAD",0.1,"FFP","mrad-tree","4-16","",SRC),{retName:"VPR MIL",travelE:30}),
  Object.assign(S("Arken","EP5 4-16x50 (VPR MOA)","MOA",0.25,"FFP","moa-hash","4-16","",SRC),{retName:"VPR MOA",travelE:103}),
  Object.assign(S("Arken","EP6 5-30x56 (VHR MIL)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"VHR MIL",travelE:30}),
  Object.assign(S("Arken","SH4 Gen2 6-24x50 (VPR MIL)","MRAD",0.1,"FFP","mrad-tree","6-24","",SRC),{retName:"VPR MIL",travelE:26}),
  Object.assign(S("Arken","SH4 Gen2 6-24x50 (VPR MOA)","MOA",0.25,"FFP","moa-hash","6-24","",SRC),{retName:"VPR MOA",travelE:89}),
  Object.assign(S("Arken","SH4 Gen2 4-16x50 (VPR MIL)","MRAD",0.1,"FFP","mrad-tree","4-16","",SRC),{retName:"VPR MIL",travelE:26}),
  Object.assign(S("Arken","SH4 Gen2 4-16x50 (VPR MOA)","MOA",0.25,"FFP","moa-hash","4-16","",SRC),{retName:"VPR MOA",travelE:89}),
  Object.assign(S("Arken","EPL4 6-24x50 (VPR MIL)","MRAD",0.1,"FFP","mrad-tree","6-24","",SRC),{retName:"VPR MIL",travelE:26}),
  Object.assign(S("Element Optics","Titan 5-25x56 (EHR-1C MRAD)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"EHR-1C MRAD",travelE:27}),
  Object.assign(S("Element Optics","Titan 5-25x56 (EHR-1C MOA)","MOA",0.25,"FFP","moa-hash","5-25","",SRC),{retName:"EHR-1C MOA",travelE:93}),
  Object.assign(S("Element Optics","Titan 3-18x50 (EHR-1C MRAD)","MRAD",0.1,"FFP","mrad-tree","3-18","",SRC),{retName:"EHR-1C MRAD",travelE:27}),
  Object.assign(S("Element Optics","Titan 3-18x50 (EHR-1C MOA)","MOA",0.25,"FFP","moa-hash","3-18","",SRC),{retName:"EHR-1C MOA",travelE:93}),
  Object.assign(S("Element Optics","Nexus Gen 2 5-20x50 (APR-2D MRAD)","MRAD",0.1,"FFP","mrad-tree","5-20","",SRC),{retName:"APR-2D MRAD",travelE:30}),
  Object.assign(S("Element Optics","Nexus 5-20x50 (APR-1D MRAD)","MRAD",0.1,"FFP","mrad-tree","5-20","",SRC),{retName:"APR-1D MRAD",travelE:30}),
  Object.assign(S("Element Optics","Helix 6-24x50 (APR-1C MRAD)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"APR-1C MRAD",travelE:23}),
  Object.assign(S("Element Optics","Helix 6-24x50 (APR-1C MOA)","MOA",0.25,"FFP","moa-hash","6-24","",SRC),{retName:"APR-1C MOA",travelE:79}),
  Object.assign(S("Element Optics","Helix 4-16x44 (APR-1C MRAD)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"APR-1C MRAD",travelE:23}),
  Object.assign(S("Element Optics","Helix 4-16x44 (APR-1C MOA)","MOA",0.25,"FFP","moa-hash","4-16","",SRC),{retName:"APR-1C MOA",travelE:79}),
  Object.assign(S("Element Optics","Helix 2.0 6-24x50 (APR-2C MRAD)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"APR-2C MRAD",travelE:23}),
  Object.assign(S("Element Optics","Theos 6-24x50 (APR-2C SFP)","MOA",0.25,"SFP","bdc","6-24","24",SRC),{retName:"APR-2C SFP",travelE:72}),
  Object.assign(S("Primary Arms","GLx 4-16x50 (Athena BPR MIL)","MRAD",0.1,"FFP","mrad-tree","4-16","",SRC),{retName:"Athena BPR MIL",travelE:25}),
  Object.assign(S("Primary Arms","GLx 4-16x50 (ACSS Athena MOA)","MOA",0.25,"FFP","moa-hash","4-16","",SRC),{retName:"ACSS Athena MOA",travelE:86}),
  Object.assign(S("Primary Arms","GLx 6-24x50 (Athena BPR MIL)","MRAD",0.1,"FFP","mrad-tree","6-24","",SRC),{retName:"Athena BPR MIL",travelE:25}),
  Object.assign(S("Primary Arms","GLx 6-24x50 (ACSS Athena MOA)","MOA",0.25,"FFP","moa-hash","6-24","",SRC),{retName:"ACSS Athena MOA",travelE:86}),
  Object.assign(S("Primary Arms","PLx 6-30x56 (Athena BPR MIL)","MRAD",0.1,"FFP","mrad-tree","6-30","",SRC),{retName:"Athena BPR MIL",travelE:25}),
  Object.assign(S("Primary Arms","SLx 5-25x56 (ACSS Athena BPR MIL)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"ACSS Athena BPR MIL",travelE:25}),
  Object.assign(S("Primary Arms","SLx 5-25x56 (MIL-R)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"MIL-R",travelE:25}),
  Object.assign(S("Primary Arms","SLx 4-16x44 (ACSS Athena BPR MIL)","MRAD",0.1,"FFP","mrad-tree","4-16","",SRC),{retName:"ACSS Athena BPR MIL",travelE:22}),
  Object.assign(S("Primary Arms","SLx 4-16x44 (MIL-R)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"MIL-R",travelE:22}),
  Object.assign(S("Primary Arms","SLx 3-18x50 (ACSS Athena BPR MIL)","MRAD",0.1,"FFP","mrad-tree","3-18","",SRC),{retName:"ACSS Athena BPR MIL",travelE:25}),
  Object.assign(S("Primary Arms","SLx 3-18x50 (MIL-R)","MRAD",0.1,"FFP","mrad-hash","3-18","",SRC),{retName:"MIL-R",travelE:25}),
  Object.assign(S("Riton","5 Conquer 5-30x56 (Riton PRS MIL)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"Riton PRS MIL",travelE:30}),
  Object.assign(S("Riton","5 Conquer 3-24x50 (Riton PRS MIL)","MRAD",0.1,"FFP","mrad-tree","3-24","",SRC),{retName:"Riton PRS MIL",travelE:30}),
  Object.assign(S("Riton","3 Conquer 6-24x50 (MOA FFP)","MOA",0.25,"FFP","moa-hash","6-24","",SRC),{retName:"MOA FFP",travelE:72}),
  Object.assign(S("Riton","3 Conquer 6-24x50 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"MIL FFP",travelE:21}),
  Object.assign(S("Riton","3 Conquer 4-16x44 (MOA FFP)","MOA",0.25,"FFP","moa-hash","4-16","",SRC),{retName:"MOA FFP",travelE:72}),
  Object.assign(S("Riton","3 Conquer 4-16x44 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"MIL FFP",travelE:21}),
  Object.assign(S("Sightmark","Presidio 5-30x56 (LR2 MIL)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"LR2 MIL",travelE:30}),
  Object.assign(S("Sightmark","Presidio 3-18x50 (LR2 MIL)","MRAD",0.1,"FFP","mrad-tree","3-18","",SRC),{retName:"LR2 MIL",travelE:30}),
  Object.assign(S("Sightmark","Citadel 5-30x56 (LR2 MIL)","MRAD",0.1,"FFP","mrad-hash","5-30","",SRC),{retName:"LR2 MIL",travelE:26}),
  Object.assign(S("Sightmark","Citadel 3-18x50 (LR2 MIL)","MRAD",0.1,"FFP","mrad-hash","3-18","",SRC),{retName:"LR2 MIL",travelE:26}),
  Object.assign(S("Bushnell","Elite Tactical XRS3 6-36x56 (G4P MIL)","MRAD",0.1,"FFP","mrad-tree","6-36","",SRC),{retName:"G4P MIL",travelE:30}),
  Object.assign(S("Bushnell","Elite Tactical DMR3 3.5-21x50 (G4P MIL)","MRAD",0.1,"FFP","mrad-tree","3.5-21","",SRC),{retName:"G4P MIL",travelE:30}),
  Object.assign(S("Bushnell","Match Pro ED 5-30x56 (Deploy MIL 2)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"Deploy MIL 2",travelE:30}),
  Object.assign(S("Bushnell","Match Pro 6-24x50 (Deploy MIL)","MRAD",0.1,"FFP","mrad-tree","6-24","",SRC),{retName:"Deploy MIL",travelE:23}),
  Object.assign(S("Bushnell","Engage 6-24x50 (Deploy MIL)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"Deploy MIL",travelE:23}),
  Object.assign(S("Bushnell","Engage 6-24x50 (Deploy MOA)","MOA",0.25,"FFP","moa-hash","6-24","",SRC),{retName:"Deploy MOA",travelE:79}),
  Object.assign(S("Bushnell","Engage 4-16x44 (Deploy MIL)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"Deploy MIL",travelE:23}),
  Object.assign(S("Bushnell","Engage 4-16x44 (Deploy MOA)","MOA",0.25,"FFP","moa-hash","4-16","",SRC),{retName:"Deploy MOA",travelE:79}),
  Object.assign(S("Bushnell","Engage 3-12x42 (Deploy MIL)","MRAD",0.1,"FFP","mrad-hash","3-12","",SRC),{retName:"Deploy MIL",travelE:23}),
  Object.assign(S("Bushnell","Engage 3-12x42 (Deploy MOA)","MOA",0.25,"FFP","moa-hash","3-12","",SRC),{retName:"Deploy MOA",travelE:79}),
  Object.assign(S("Bushnell","Nitro 5-20x44 (Deploy MOA SFP)","MOA",0.25,"SFP","bdc","5-20","20",SRC),{retName:"Deploy MOA SFP",travelE:79}),
  Object.assign(S("Bushnell","Nitro 6-24x50 (Deploy MOA SFP)","MOA",0.25,"SFP","bdc","6-24","24",SRC),{retName:"Deploy MOA SFP",travelE:79}),
  Object.assign(S("Burris","XTR Pro 5.5-30x56 (SCR 2 Mil)","MRAD",0.1,"FFP","mrad-tree","5.5-30","",SRC),{retName:"SCR 2 Mil",travelE:35}),
  Object.assign(S("Burris","XTR III 5.5-30x56 (SCR 2 Mil)","MRAD",0.1,"FFP","mrad-tree","5.5-30","",SRC),{retName:"SCR 2 Mil",travelE:35}),
  Object.assign(S("Burris","XTR III 5.5-30x56 (SCR MOA)","MOA",0.25,"FFP","moa-hash","5.5-30","",SRC),{retName:"SCR MOA",travelE:120}),
  Object.assign(S("Burris","XTR III 3.3-18x50 (SCR 2 Mil)","MRAD",0.1,"FFP","mrad-tree","3.3-18","",SRC),{retName:"SCR 2 Mil",travelE:35}),
  Object.assign(S("Burris","XTR III 3.3-18x50 (SCR MOA)","MOA",0.25,"FFP","moa-hash","3.3-18","",SRC),{retName:"SCR MOA",travelE:120}),
  Object.assign(S("Burris","Veracity PH 4-20x50 (Ballistic Plex)","MOA",0.25,"FFP","moa-hash","4-20","",SRC),{retName:"Ballistic Plex",travelE:79}),
  Object.assign(S("Burris","Fullfield IV 4-16x50 (Ballistic Plex E1)","MOA",0.25,"SFP","bdc","4-16","16",SRC),{retName:"Ballistic Plex E1",travelE:58}),
  Object.assign(S("Burris","Fullfield IV 3-12x42 (Ballistic Plex E1)","MOA",0.25,"SFP","bdc","3-12","12",SRC),{retName:"Ballistic Plex E1",travelE:58}),
  Object.assign(S("Leupold","Mark 5HD 5-25x56 (PR2-MIL)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"PR2-MIL",travelE:30}),
  Object.assign(S("Leupold","Mark 5HD 5-25x56 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"Tremor 3",travelE:30}),
  Object.assign(S("Leupold","Mark 5HD 5-25x56 (PR2-MOA)","MOA",0.25,"FFP","moa-hash","5-25","",SRC),{retName:"PR2-MOA",travelE:103}),
  Object.assign(S("Leupold","Mark 5HD 7-35x56 (PR2-MIL)","MRAD",0.1,"FFP","mrad-hash","7-35","",SRC),{retName:"PR2-MIL",travelE:23}),
  Object.assign(S("Leupold","Mark 5HD 7-35x56 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","7-35","",SRC),{retName:"Tremor 3",travelE:23}),
  Object.assign(S("Leupold","Mark 5HD 7-35x56 (PR2-MOA)","MOA",0.25,"FFP","moa-hash","7-35","",SRC),{retName:"PR2-MOA",travelE:79}),
  Object.assign(S("Leupold","Mark 5HD 3.6-18x44 (PR2-MIL)","MRAD",0.1,"FFP","mrad-hash","3.6-18","",SRC),{retName:"PR2-MIL",travelE:29}),
  Object.assign(S("Leupold","Mark 5HD 3.6-18x44 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","3.6-18","",SRC),{retName:"Tremor 3",travelE:29}),
  Object.assign(S("Leupold","Mark 5HD 3.6-18x44 (PR2-MOA)","MOA",0.25,"FFP","moa-hash","3.6-18","",SRC),{retName:"PR2-MOA",travelE:100}),
  Object.assign(S("Leupold","Mark 4HD 4.5-18x52 (PR2-MIL)","MRAD",0.1,"FFP","mrad-hash","4.5-18","",SRC),{retName:"PR2-MIL",travelE:25}),
  Object.assign(S("Leupold","Mark 4HD 4.5-18x52 (TMR)","MRAD",0.1,"FFP","mrad-hash","4.5-18","",SRC),{retName:"TMR",travelE:25}),
  Object.assign(S("Leupold","Mark 4HD 6-24x52 (PR2-MIL)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"PR2-MIL",travelE:25}),
  Object.assign(S("Leupold","Mark 4HD 6-24x52 (TMR)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"TMR",travelE:25}),
  Object.assign(S("Leupold","Mark 3HD 4-12x40 (TMR)","MRAD",0.1,"SFP","mrad-hash","4-12","12",SRC),{retName:"TMR",travelE:18}),
  Object.assign(S("Leupold","Mark 3HD 6-18x50 (TMR)","MRAD",0.1,"SFP","mrad-hash","6-18","18",SRC),{retName:"TMR",travelE:18}),
  Object.assign(S("Leupold","VX-6HD 3-18x44 (CDS-ZL2 TMOA)","MOA",0.25,"SFP","moa-hash","3-18","18",SRC),{retName:"CDS-ZL2 TMOA",travelE:72}),
  Object.assign(S("Leupold","VX-6HD 3-18x44 (Duplex)","MOA",0.25,"SFP","duplex","3-18","18",SRC),{retName:"Duplex",travelE:72}),
  Object.assign(S("Leupold","VX-6HD 4-24x52 (CDS-ZL2 TMOA)","MOA",0.25,"SFP","moa-hash","4-24","24",SRC),{retName:"CDS-ZL2 TMOA",travelE:72}),
  Object.assign(S("Leupold","VX-6HD 4-24x52 (Duplex)","MOA",0.25,"SFP","duplex","4-24","24",SRC),{retName:"Duplex",travelE:72}),
  Object.assign(S("Leupold","VX-5HD 3-15x44 (Duplex)","MOA",0.25,"SFP","duplex","3-15","15",SRC),{retName:"Duplex",travelE:72}),
  Object.assign(S("Leupold","VX-5HD 3-15x44 (Impact-29 MOA)","MOA",0.25,"SFP","moa-hash","3-15","15",SRC),{retName:"Impact-29 MOA",travelE:72}),
  Object.assign(S("Leupold","VX-5HD 4-20x52 (Duplex)","MOA",0.25,"SFP","duplex","4-20","20",SRC),{retName:"Duplex",travelE:69}),
  Object.assign(S("Leupold","VX-5HD 4-20x52 (Impact-29 MOA)","MOA",0.25,"SFP","moa-hash","4-20","20",SRC),{retName:"Impact-29 MOA",travelE:69}),
  Object.assign(S("Leupold","VX-3HD 4.5-14x40 (Duplex)","MOA",0.25,"SFP","duplex","4.5-14","14",SRC),{retName:"Duplex",travelE:58}),
  Object.assign(S("Leupold","VX-3HD 4.5-14x40 (Wind-Plex)","MOA",0.25,"SFP","bdc","4.5-14","14",SRC),{retName:"Wind-Plex",travelE:58}),
  Object.assign(S("Leupold","VX-3HD 3.5-10x40 (Duplex)","MOA",0.25,"SFP","duplex","3.5-10","10",SRC),{retName:"Duplex",travelE:58}),
  Object.assign(S("Leupold","VX-3HD 3.5-10x40 (Wind-Plex)","MOA",0.25,"SFP","bdc","3.5-10","10",SRC),{retName:"Wind-Plex",travelE:58}),
  Object.assign(S("Leupold","VX-Freedom 4-12x40 (Duplex)","MOA",0.25,"SFP","duplex","4-12","12",SRC),{retName:"Duplex",travelE:58}),
  Object.assign(S("Leupold","VX-Freedom 4-12x40 (Rimfire MOA)","MOA",0.25,"SFP","bdc","4-12","12",SRC),{retName:"Rimfire MOA",travelE:58}),
  Object.assign(S("Leupold","VX-Freedom 3-9x40 (Duplex)","MOA",0.25,"SFP","duplex","3-9","9",SRC),{retName:"Duplex",travelE:58}),
  Object.assign(S("Leupold","VX-Freedom 3-9x40 (Rimfire MOA)","MOA",0.25,"SFP","bdc","3-9","9",SRC),{retName:"Rimfire MOA",travelE:58}),
  Object.assign(S("Sightron","SIII 10-50x60 (MOA-H)","MOA",0.125,"SFP","moa-hash","10-50","50",SRC),{retName:"MOA-H",travelE:58}),
  Object.assign(S("Sightron","SIII 8-32x56 (MOA-H)","MOA",0.125,"SFP","moa-hash","8-32","32",SRC),{retName:"MOA-H",travelE:58}),
  Object.assign(S("Sightron","SVIII 5-40x56 (MRAD-ED)","MRAD",0.1,"FFP","mrad-tree","5-40","",SRC),{retName:"MRAD-ED",travelE:26}),
  Object.assign(S("Sightron","S-TAC 4-20x50 (MH-4)","MOA",0.25,"SFP","moa-hash","4-20","20",SRC),{retName:"MH-4",travelE:69}),
  Object.assign(S("Trijicon","Tenmile HX 6-24x50 (MRAD Ranging)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"MRAD Ranging",travelE:26}),
  Object.assign(S("Trijicon","Tenmile HX 3-18x44 (MRAD Ranging)","MRAD",0.1,"FFP","mrad-hash","3-18","",SRC),{retName:"MRAD Ranging",travelE:26}),
  Object.assign(S("Trijicon","Credo HX 2.5-15x56 (MOA Precision)","MOA",0.25,"SFP","moa-hash","2.5-15","15",SRC),{retName:"MOA Precision",travelE:69}),
  Object.assign(S("Sig Sauer","Tango6T 5-30x56 (MRAD Milling DWLR)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"MRAD Milling DWLR",travelE:30}),
  Object.assign(S("Sig Sauer","Tango-MSR 5-30x56 (MR5 MIL)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"MR5 MIL",travelE:30}),
  Object.assign(S("Sig Sauer","Whiskey5 5-25x52 (BDX-R2 Digital)","MOA",0.25,"SFP","bdc","5-25","25",SRC),{retName:"BDX-R2 Digital",travelE:76}),
  Object.assign(S("Sig Sauer","Whiskey5 3-15x52 (BDX-R2 Digital)","MOA",0.25,"SFP","bdc","3-15","15",SRC),{retName:"BDX-R2 Digital",travelE:76}),
  Object.assign(S("Nightforce","ATACR 7-35x56 (Mil-XT)","MRAD",0.1,"FFP","mrad-tree","7-35","",SRC),{retName:"Mil-XT",travelE:27}),
  Object.assign(S("Nightforce","ATACR 7-35x56 (Mil-C)","MRAD",0.1,"FFP","mrad-hash","7-35","",SRC),{retName:"Mil-C",travelE:27}),
  Object.assign(S("Nightforce","ATACR 7-35x56 (MOAR)","MOA",0.25,"FFP","moa-hash","7-35","",SRC),{retName:"MOAR",travelE:93}),
  Object.assign(S("Nightforce","ATACR 7-35x56 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","7-35","",SRC),{retName:"Tremor 3",travelE:27}),
  Object.assign(S("Nightforce","ATACR 5-25x56 (Mil-XT)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"Mil-XT",travelE:27}),
  Object.assign(S("Nightforce","ATACR 5-25x56 (Mil-C)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"Mil-C",travelE:27}),
  Object.assign(S("Nightforce","ATACR 5-25x56 (MOAR)","MOA",0.25,"FFP","moa-hash","5-25","",SRC),{retName:"MOAR",travelE:93}),
  Object.assign(S("Nightforce","ATACR 5-25x56 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"Tremor 3",travelE:27}),
  Object.assign(S("Nightforce","ATACR 4-20x50 (Mil-XT)","MRAD",0.1,"FFP","mrad-tree","4-20","",SRC),{retName:"Mil-XT",travelE:29}),
  Object.assign(S("Nightforce","ATACR 4-20x50 (Mil-C)","MRAD",0.1,"FFP","mrad-hash","4-20","",SRC),{retName:"Mil-C",travelE:29}),
  Object.assign(S("Nightforce","ATACR 4-20x50 (MOAR)","MOA",0.25,"FFP","moa-hash","4-20","",SRC),{retName:"MOAR",travelE:100}),
  Object.assign(S("Nightforce","ATACR 4-20x50 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","4-20","",SRC),{retName:"Tremor 3",travelE:29}),
  Object.assign(S("Nightforce","ATACR 4-16x42 (Mil-XT)","MRAD",0.1,"FFP","mrad-tree","4-16","",SRC),{retName:"Mil-XT",travelE:29}),
  Object.assign(S("Nightforce","ATACR 4-16x42 (Mil-C)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"Mil-C",travelE:29}),
  Object.assign(S("Nightforce","ATACR 4-16x42 (MOAR)","MOA",0.25,"FFP","moa-hash","4-16","",SRC),{retName:"MOAR",travelE:100}),
  Object.assign(S("Nightforce","ATACR 4-16x42 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","4-16","",SRC),{retName:"Tremor 3",travelE:29}),
  Object.assign(S("Nightforce","NX8 4-32x50 (Mil-C)","MRAD",0.1,"FFP","mrad-hash","4-32","",SRC),{retName:"Mil-C",travelE:29}),
  Object.assign(S("Nightforce","NX8 4-32x50 (Mil-XT)","MRAD",0.1,"FFP","mrad-tree","4-32","",SRC),{retName:"Mil-XT",travelE:29}),
  Object.assign(S("Nightforce","NX8 4-32x50 (MOAR)","MOA",0.25,"FFP","moa-hash","4-32","",SRC),{retName:"MOAR",travelE:100}),
  Object.assign(S("Nightforce","NX8 2.5-20x50 (Mil-C)","MRAD",0.1,"FFP","mrad-hash","2.5-20","",SRC),{retName:"Mil-C",travelE:31}),
  Object.assign(S("Nightforce","NX8 2.5-20x50 (Mil-XT)","MRAD",0.1,"FFP","mrad-tree","2.5-20","",SRC),{retName:"Mil-XT",travelE:31}),
  Object.assign(S("Nightforce","NX8 2.5-20x50 (MOAR)","MOA",0.25,"FFP","moa-hash","2.5-20","",SRC),{retName:"MOAR",travelE:107}),
  Object.assign(S("Nightforce","NXS 5.5-22x56 (Mil-R)","MRAD",0.1,"FFP","mrad-hash","5.5-22","",SRC),{retName:"Mil-R",travelE:29}),
  Object.assign(S("Nightforce","NXS 5.5-22x56 (MOAR)","MOA",0.25,"FFP","moa-hash","5.5-22","",SRC),{retName:"MOAR",travelE:100}),
  Object.assign(S("Nightforce","NXS 8-32x56 (Mil-R)","MRAD",0.1,"FFP","mrad-hash","8-32","",SRC),{retName:"Mil-R",travelE:18}),
  Object.assign(S("Nightforce","NXS 8-32x56 (MOAR)","MOA",0.25,"FFP","moa-hash","8-32","",SRC),{retName:"MOAR",travelE:62}),
  Object.assign(S("Nightforce","SHV 5-20x56 (Mil-R)","MRAD",0.1,"SFP","mrad-hash","5-20","20",SRC),{retName:"Mil-R",travelE:23}),
  Object.assign(S("Nightforce","SHV 5-20x56 (MOAR)","MOA",0.25,"SFP","moa-hash","5-20","20",SRC),{retName:"MOAR",travelE:79}),
  Object.assign(S("Nightforce","SHV 4-14x56 (Mil-R)","MRAD",0.1,"SFP","mrad-hash","4-14","14",SRC),{retName:"Mil-R",travelE:23}),
  Object.assign(S("Nightforce","SHV 4-14x56 (MOAR)","MOA",0.25,"SFP","moa-hash","4-14","14",SRC),{retName:"MOAR",travelE:79}),
  Object.assign(S("Nightforce","Competition 15-55x52 (CTR-3 MOA)","MOA",0.125,"SFP","moa-hash","15-55","55",SRC),{retName:"CTR-3 MOA",travelE:38}),
  Object.assign(S("Schmidt & Bender","PM II 5-25x56 (P4FL MRAD)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"P4FL MRAD",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 5-25x56 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"Tremor 3",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 5-25x56 (H59)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"H59",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 5-25x56 (MSR2)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"MSR2",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 3-27x56 (P4FL MRAD)","MRAD",0.1,"FFP","mrad-hash","3-27","",SRC),{retName:"P4FL MRAD",travelE:34}),
  Object.assign(S("Schmidt & Bender","PM II 3-27x56 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","3-27","",SRC),{retName:"Tremor 3",travelE:34}),
  Object.assign(S("Schmidt & Bender","PM II 3-27x56 (H59)","MRAD",0.1,"FFP","mrad-hash","3-27","",SRC),{retName:"H59",travelE:34}),
  Object.assign(S("Schmidt & Bender","PM II 3-27x56 (MSR2)","MRAD",0.1,"FFP","mrad-hash","3-27","",SRC),{retName:"MSR2",travelE:34}),
  Object.assign(S("Schmidt & Bender","PM II 5-45x56 (P4FL MRAD)","MRAD",0.1,"FFP","mrad-hash","5-45","",SRC),{retName:"P4FL MRAD",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 5-45x56 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","5-45","",SRC),{retName:"Tremor 3",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 5-45x56 (H59)","MRAD",0.1,"FFP","mrad-hash","5-45","",SRC),{retName:"H59",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 5-45x56 (MSR2)","MRAD",0.1,"FFP","mrad-hash","5-45","",SRC),{retName:"MSR2",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 3-20x50 (P4FL MRAD)","MRAD",0.1,"FFP","mrad-hash","3-20","",SRC),{retName:"P4FL MRAD",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 3-20x50 (Tremor 3)","MRAD",0.1,"FFP","mrad-tree","3-20","",SRC),{retName:"Tremor 3",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 3-20x50 (H59)","MRAD",0.1,"FFP","mrad-hash","3-20","",SRC),{retName:"H59",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II 3-20x50 (MSR2)","MRAD",0.1,"FFP","mrad-hash","3-20","",SRC),{retName:"MSR2",travelE:26}),
  Object.assign(S("Schmidt & Bender","PM II Ultra Short 5-20x50 (H59)","MRAD",0.1,"FFP","mrad-hash","5-20","",SRC),{retName:"H59",travelE:26}),
  Object.assign(S("Schmidt & Bender","Polar T96 3-12x50 (A7 (Duplex))","MOA",0.25,"SFP","duplex","3-12","12",SRC),{retName:"A7 (Duplex)",travelE:69}),
  Object.assign(S("Schmidt & Bender","Exos 2.5-13x50 (FD7)","MOA",0.25,"SFP","duplex","2.5-13","13",SRC),{retName:"FD7",travelE:69}),
  Object.assign(S("Kahles","K525i DLR 5-25x56 (SKMR3)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"SKMR3",travelE:30}),
  Object.assign(S("Kahles","K525i DLR 5-25x56 (Mil4+)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"Mil4+",travelE:30}),
  Object.assign(S("Kahles","K525i DLR 5-25x56 (AMR)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"AMR",travelE:30}),
  Object.assign(S("Kahles","K525i 5-25x56 (SKMR3)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"SKMR3",travelE:26}),
  Object.assign(S("Kahles","K525i 5-25x56 (Mil4+)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"Mil4+",travelE:26}),
  Object.assign(S("Kahles","K525i 5-25x56 (MOAK)","MOA",0.25,"FFP","moa-hash","5-25","",SRC),{retName:"MOAK",travelE:89}),
  Object.assign(S("Kahles","K624i 6-24x56 (SKMR3)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"SKMR3",travelE:29}),
  Object.assign(S("Kahles","K624i 6-24x56 (Mil4+)","MRAD",0.1,"FFP","mrad-tree","6-24","",SRC),{retName:"Mil4+",travelE:29}),
  Object.assign(S("Kahles","K318i 3.5-18x50 (SKMR4)","MRAD",0.1,"FFP","mrad-hash","3.5-18","",SRC),{retName:"SKMR4",travelE:29}),
  Object.assign(S("Kahles","K318i 3.5-18x50 (Mil4+)","MRAD",0.1,"FFP","mrad-tree","3.5-18","",SRC),{retName:"Mil4+",travelE:29}),
  Object.assign(S("Kahles","K328i 3-28x56 (SKMR4)","MRAD",0.1,"FFP","mrad-hash","3-28","",SRC),{retName:"SKMR4",travelE:29}),
  Object.assign(S("Kahles","Helia 5 2.4-12x56 (4-Dot)","MOA",0.25,"SFP","duplex","2.4-12","12",SRC),{retName:"4-Dot",travelE:69}),
  Object.assign(S("Kahles","Helia 5 3.5-18x50 (4-Dot)","MOA",0.25,"SFP","duplex","3.5-18","18",SRC),{retName:"4-Dot",travelE:69}),
  Object.assign(S("Zeiss","LRP S5 5-25x56 (ZF-MRi)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"ZF-MRi",travelE:26}),
  Object.assign(S("Zeiss","LRP S5 5-25x56 (ZF-MOAi)","MOA",0.25,"FFP","moa-hash","5-25","",SRC),{retName:"ZF-MOAi",travelE:89}),
  Object.assign(S("Zeiss","LRP S5 3-18x50 (ZF-MRi)","MRAD",0.1,"FFP","mrad-hash","3-18","",SRC),{retName:"ZF-MRi",travelE:26}),
  Object.assign(S("Zeiss","LRP S5 3-18x50 (ZF-MOAi)","MOA",0.25,"FFP","moa-hash","3-18","",SRC),{retName:"ZF-MOAi",travelE:89}),
  Object.assign(S("Zeiss","LRP S3 6-36x56 (ZF-MRi)","MRAD",0.1,"FFP","mrad-hash","6-36","",SRC),{retName:"ZF-MRi",travelE:25}),
  Object.assign(S("Zeiss","LRP S3 6-36x56 (ZF-MOAi)","MOA",0.25,"FFP","moa-hash","6-36","",SRC),{retName:"ZF-MOAi",travelE:86}),
  Object.assign(S("Zeiss","LRP S3 4-25x50 (ZF-MRi)","MRAD",0.1,"FFP","mrad-hash","4-25","",SRC),{retName:"ZF-MRi",travelE:25}),
  Object.assign(S("Zeiss","LRP S3 4-25x50 (ZF-MOAi)","MOA",0.25,"FFP","moa-hash","4-25","",SRC),{retName:"ZF-MOAi",travelE:86}),
  Object.assign(S("Zeiss","Conquest V4 6-24x50 (ZMOAi-T20)","MOA",0.25,"SFP","moa-hash","6-24","24",SRC),{retName:"ZMOAi-T20",travelE:79}),
  Object.assign(S("Zeiss","Conquest V4 6-24x50 (ZBR-1 MRAD)","MRAD",0.1,"SFP","mrad-hash","6-24","24",SRC),{retName:"ZBR-1 MRAD",travelE:23}),
  Object.assign(S("Zeiss","Conquest V4 4-16x44 (ZMOAi-T20)","MOA",0.25,"SFP","moa-hash","4-16","16",SRC),{retName:"ZMOAi-T20",travelE:79}),
  Object.assign(S("Zeiss","Conquest V4 4-16x44 (ZBR-1 MRAD)","MRAD",0.1,"SFP","mrad-hash","4-16","16",SRC),{retName:"ZBR-1 MRAD",travelE:23}),
  Object.assign(S("Zeiss","Conquest V6 5-30x50 (ZMOA-2)","MOA",0.25,"SFP","moa-hash","5-30","30",SRC),{retName:"ZMOA-2",travelE:100}),
  Object.assign(S("Zeiss","Conquest V6 3-18x50 (ZMOA-2)","MOA",0.25,"SFP","moa-hash","3-18","18",SRC),{retName:"ZMOA-2",travelE:100}),
  Object.assign(S("Zeiss","V8 4.8-35x60 (Reticle 60)","MOA",0.25,"SFP","duplex","4.8-35","35",SRC),{retName:"Reticle 60",travelE:79}),
  Object.assign(S("Swarovski","dS Gen II 5-25x52 (Écran balistique numérique)","MOA",0.25,"SFP","bdc","5-25","25",SRC),{retName:"Écran balistique numérique",travelE:69}),
  Object.assign(S("Swarovski","X5i 5-25x56 (PLEX-I 1/4 MOA)","MOA",0.25,"SFP","moa-hash","5-25","25",SRC),{retName:"PLEX-I 1/4 MOA",travelE:96}),
  Object.assign(S("Swarovski","X5i 5-25x56 (4W-I MRAD)","MRAD",0.1,"SFP","mrad-hash","5-25","25",SRC),{retName:"4W-I MRAD",travelE:28}),
  Object.assign(S("Swarovski","X5i 3.5-18x50 (PLEX-I 1/4 MOA)","MOA",0.25,"SFP","moa-hash","3.5-18","18",SRC),{retName:"PLEX-I 1/4 MOA",travelE:96}),
  Object.assign(S("Swarovski","X5i 3.5-18x50 (4W-I MRAD)","MRAD",0.1,"SFP","mrad-hash","3.5-18","18",SRC),{retName:"4W-I MRAD",travelE:28}),
  Object.assign(S("Swarovski","Z8i+ 3.5-28x50 (4A-300)","MOA",0.25,"SFP","duplex","3.5-28","28",SRC),{retName:"4A-300",travelE:58}),
  Object.assign(S("Swarovski","Z8i+ 2.3-18x56 (4A-300)","MOA",0.25,"SFP","duplex","2.3-18","18",SRC),{retName:"4A-300",travelE:58}),
  Object.assign(S("Swarovski","Z6i 5-30x50 (BRX-I)","MOA",0.25,"SFP","duplex","5-30","30",SRC),{retName:"BRX-I",travelE:58}),
  Object.assign(S("Leica","PRS 5-30x56 (L-4a MRAD)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"L-4a MRAD",travelE:30}),
  Object.assign(S("Leica","Amplus 6 3-18x44 (L-4a)","MOA",0.25,"SFP","duplex","3-18","18",SRC),{retName:"L-4a",travelE:69}),
  Object.assign(S("Leica","Amplus 6 2.5-15x56 (L-4a)","MOA",0.25,"SFP","duplex","2.5-15","15",SRC),{retName:"L-4a",travelE:69}),
  Object.assign(S("Meopta","Optika6 5-30x56 (MRAD FFP RD)","MRAD",0.1,"FFP","mrad-hash","5-30","",SRC),{retName:"MRAD FFP RD",travelE:30}),
  Object.assign(S("Meopta","Optika6 5-30x56 (MOA FFP)","MOA",0.25,"FFP","moa-hash","5-30","",SRC),{retName:"MOA FFP",travelE:103}),
  Object.assign(S("Meopta","Optika6 3-18x56 (MRAD FFP RD)","MRAD",0.1,"FFP","mrad-hash","3-18","",SRC),{retName:"MRAD FFP RD",travelE:30}),
  Object.assign(S("Meopta","Optika6 3-18x56 (MOA FFP)","MOA",0.25,"FFP","moa-hash","3-18","",SRC),{retName:"MOA FFP",travelE:103}),
  Object.assign(S("Meopta","Optika6 4.5-27x50 (MRAD FFP RD)","MRAD",0.1,"FFP","mrad-hash","4.5-27","",SRC),{retName:"MRAD FFP RD",travelE:30}),
  Object.assign(S("Meopta","Optika6 4.5-27x50 (MOA FFP)","MOA",0.25,"FFP","moa-hash","4.5-27","",SRC),{retName:"MOA FFP",travelE:103}),
  Object.assign(S("Meopta","MeoPro Optika6 5-30x56 (MRAD-WEXT)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"MRAD-WEXT",travelE:30}),
  Object.assign(S("Meopta","Meostar R2 2.5-15x56 (4C)","MOA",0.25,"SFP","duplex","2.5-15","15",SRC),{retName:"4C",travelE:69}),
  Object.assign(S("Tract","Toric 4.5-30x56 (TMR MRAD)","MRAD",0.1,"FFP","mrad-hash","4.5-30","",SRC),{retName:"TMR MRAD",travelE:30}),
  Object.assign(S("Tract","Toric 4.5-30x56 (TMR MOA)","MOA",0.25,"FFP","moa-hash","4.5-30","",SRC),{retName:"TMR MOA",travelE:103}),
  Object.assign(S("Tract","Toric 2-12x42 (TMR MRAD)","MRAD",0.1,"FFP","mrad-hash","2-12","",SRC),{retName:"TMR MRAD",travelE:30}),
  Object.assign(S("Tract","Toric 2-12x42 (TMR MOA)","MOA",0.25,"FFP","moa-hash","2-12","",SRC),{retName:"TMR MOA",travelE:103}),
  Object.assign(S("Tract","Toric UHD 3-15x50 (Mil FFP)","MRAD",0.1,"FFP","mrad-hash","3-15","",SRC),{retName:"Mil FFP",travelE:30}),
  Object.assign(S("March","FX 5-42x56 (FML-TR1 MIL)","MRAD",0.1,"FFP","mrad-tree","5-42","",SRC),{retName:"FML-TR1 MIL",travelE:34}),
  Object.assign(S("March","FX 5-42x56 (FML-3 MIL)","MRAD",0.1,"FFP","mrad-hash","5-42","",SRC),{retName:"FML-3 MIL",travelE:34}),
  Object.assign(S("March","FX 4.5-28x52 (FML-TR1 MIL)","MRAD",0.1,"FFP","mrad-tree","4.5-28","",SRC),{retName:"FML-TR1 MIL",travelE:34}),
  Object.assign(S("March","FX 4.5-28x52 (FML-3 MIL)","MRAD",0.1,"FFP","mrad-hash","4.5-28","",SRC),{retName:"FML-3 MIL",travelE:34}),
  Object.assign(S("March","FX 3-24x52 (FML-TR1 MIL)","MRAD",0.1,"FFP","mrad-tree","3-24","",SRC),{retName:"FML-TR1 MIL",travelE:34}),
  Object.assign(S("March","FX 3-24x52 (FML-3 MIL)","MRAD",0.1,"FFP","mrad-hash","3-24","",SRC),{retName:"FML-3 MIL",travelE:34}),
  Object.assign(S("March","High Master 10-60x56 (Fine Cross MTR)","MOA",0.125,"SFP","moa-hash","10-60","60",SRC),{retName:"Fine Cross MTR",travelE:52}),
  Object.assign(S("Minox","Long Range ZP5 THLR 5-25x56 (MR4 MIL)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"MR4 MIL",travelE:26}),
  Object.assign(S("GPO","Spectra 6x 4-24x50 (G4 MIL)","MRAD",0.1,"FFP","mrad-hash","4-24","",SRC),{retName:"G4 MIL",travelE:26}),
  Object.assign(S("Delta Optical","Stryker 4.5-30x56 (DLR-1 MRAD)","MRAD",0.1,"FFP","mrad-tree","4.5-30","",SRC),{retName:"DLR-1 MRAD",travelE:30}),
  Object.assign(S("Delta Optical","Javelin 4.5-30x56 (DLR-2 MRAD)","MRAD",0.1,"FFP","mrad-tree","4.5-30","",SRC),{retName:"DLR-2 MRAD",travelE:30}),
  Object.assign(S("Delta Optical","Titanium 4-24x50 (4A)","MOA",0.25,"SFP","duplex","4-24","24",SRC),{retName:"4A",travelE:79}),
  Object.assign(S("Steiner","T6Xi 5-30x56 (SCR2 Mil)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"SCR2 Mil",travelE:30}),
  Object.assign(S("Steiner","T6Xi 5-30x56 (SCR MOA)","MOA",0.25,"FFP","moa-hash","5-30","",SRC),{retName:"SCR MOA",travelE:103}),
  Object.assign(S("Steiner","T6Xi 3-18x56 (SCR2 Mil)","MRAD",0.1,"FFP","mrad-tree","3-18","",SRC),{retName:"SCR2 Mil",travelE:30}),
  Object.assign(S("Steiner","T6Xi 3-18x56 (SCR MOA)","MOA",0.25,"FFP","moa-hash","3-18","",SRC),{retName:"SCR MOA",travelE:103}),
  Object.assign(S("Steiner","T5Xi 5-25x56 (SCR Mil)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"SCR Mil",travelE:24}),
  Object.assign(S("Steiner","T5Xi 5-25x56 (MSR2 Mil)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"MSR2 Mil",travelE:24}),
  Object.assign(S("Steiner","T5Xi 3-15x50 (SCR Mil)","MRAD",0.1,"FFP","mrad-hash","3-15","",SRC),{retName:"SCR Mil",travelE:24}),
  Object.assign(S("Steiner","T5Xi 3-15x50 (MSR2 Mil)","MRAD",0.1,"FFP","mrad-hash","3-15","",SRC),{retName:"MSR2 Mil",travelE:24}),
  Object.assign(S("Steiner","M7Xi 4-28x56 (MSR2 Mil)","MRAD",0.1,"FFP","mrad-hash","4-28","",SRC),{retName:"MSR2 Mil",travelE:24}),
  Object.assign(S("Steiner","M7Xi 4-28x56 (SCR Mil)","MRAD",0.1,"FFP","mrad-hash","4-28","",SRC),{retName:"SCR Mil",travelE:24}),
  Object.assign(S("Tangent Theta","Professional Marksman 5-25x56 (Gen 3 XR MIL)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"Gen 3 XR MIL",travelE:27}),
  Object.assign(S("Tangent Theta","Professional Marksman 5-25x56 (TT315M MIL)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"TT315M MIL",travelE:27}),
  Object.assign(S("Tangent Theta","Professional Marksman 7-35x56 (Gen 3 XR MIL)","MRAD",0.1,"FFP","mrad-tree","7-35","",SRC),{retName:"Gen 3 XR MIL",travelE:24}),
  Object.assign(S("Tangent Theta","Professional Marksman 7-35x56 (TT315M MIL)","MRAD",0.1,"FFP","mrad-hash","7-35","",SRC),{retName:"TT315M MIL",travelE:24}),
  Object.assign(S("ZCO","ZC527 5-27x56 (MPCT3 MIL)","MRAD",0.1,"FFP","mrad-tree","5-27","",SRC),{retName:"MPCT3 MIL",travelE:27}),
  Object.assign(S("ZCO","ZC527 5-27x56 (MPCT2 MIL)","MRAD",0.1,"FFP","mrad-hash","5-27","",SRC),{retName:"MPCT2 MIL",travelE:27}),
  Object.assign(S("ZCO","ZC840 8-40x56 (MPCT3 MIL)","MRAD",0.1,"FFP","mrad-tree","8-40","",SRC),{retName:"MPCT3 MIL",travelE:22}),
  Object.assign(S("US Optics","B-Series 5-25x52 (Mil Scale Gen2 XR)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"Mil Scale Gen2 XR",travelE:25}),
  Object.assign(S("Blaser","B2 4-20x52 (4A)","MOA",0.25,"SFP","duplex","4-20","20",SRC),{retName:"4A",travelE:69}),
  Object.assign(S("Hawke","Frontier 30 FFP 5-30x56 (Mil Pro)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"Mil Pro",travelE:30}),
  Object.assign(S("Hawke","Frontier 34 FFP 5-30x56 (Mil Pro)","MRAD",0.1,"FFP","mrad-tree","5-30","",SRC),{retName:"Mil Pro",travelE:30}),
  Object.assign(S("Hawke","Sidewinder 30 FFP 4-16x50 (FFP MIL)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"FFP MIL",travelE:25}),
  Object.assign(S("Hawke","Sidewinder 30 FFP 4-16x50 (FFP MOA)","MOA",0.25,"FFP","moa-hash","4-16","",SRC),{retName:"FFP MOA",travelE:86}),
  Object.assign(S("Hawke","Sidewinder 30 FFP 6-24x56 (FFP MIL)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"FFP MIL",travelE:25}),
  Object.assign(S("Hawke","Sidewinder 30 FFP 6-24x56 (FFP MOA)","MOA",0.25,"FFP","moa-hash","6-24","",SRC),{retName:"FFP MOA",travelE:86}),
  Object.assign(S("Hawke","Sidewinder 30 SF 6-24x56 (10x Half Mil)","MRAD",0.1,"SFP","mrad-hash","6-24","24",SRC),{retName:"10x Half Mil",travelE:24}),
  Object.assign(S("Hawke","Sidewinder 30 SF 6-24x56 (20x 1/2 Mil)","MRAD",0.1,"SFP","mrad-hash","6-24","24",SRC),{retName:"20x 1/2 Mil",travelE:24}),
  Object.assign(S("Hawke","Vantage 30 WA SF 4-16x50 (Mil-Dot)","MOA",0.25,"SFP","mildot","4-16","16",SRC),{retName:"Mil-Dot",travelE:58}),
  Object.assign(S("Hawke","Vantage 30 WA SF 4-16x50 (IR Mil-Dot)","MOA",0.25,"SFP","moa-hash","4-16","16",SRC),{retName:"IR Mil-Dot",travelE:58}),
  Object.assign(S("Hawke","Vantage 30 WA SF 6-24x50 (Mil-Dot)","MOA",0.25,"SFP","mildot","6-24","24",SRC),{retName:"Mil-Dot",travelE:58}),
  Object.assign(S("Hawke","Vantage 30 WA SF 6-24x50 (IR Mil-Dot)","MOA",0.25,"SFP","moa-hash","6-24","24",SRC),{retName:"IR Mil-Dot",travelE:58}),
  Object.assign(S("Hawke","Vantage 4-12x40 (Mil-Dot)","MOA",0.25,"SFP","mildot","4-12","12",SRC),{retName:"Mil-Dot",travelE:58}),
  Object.assign(S("Hawke","Vantage 4-12x40 (30/30 Duplex)","MOA",0.25,"SFP","duplex","4-12","12",SRC),{retName:"30/30 Duplex",travelE:58}),
  Object.assign(S("Hawke","Vantage 3-9x40 (Mil-Dot)","MOA",0.25,"SFP","mildot","3-9","9",SRC),{retName:"Mil-Dot",travelE:58}),
  Object.assign(S("Hawke","Vantage 3-9x40 (30/30 Duplex)","MOA",0.25,"SFP","duplex","3-9","9",SRC),{retName:"30/30 Duplex",travelE:58}),
  Object.assign(S("Hawke","Airmax 30 FFP 4-16x50 (FFP MIL)","MRAD",0.1,"FFP","mrad-hash","4-16","",SRC),{retName:"FFP MIL",travelE:20}),
  Object.assign(S("Hawke","Airmax 30 FFP 6-24x50 (FFP MIL)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"FFP MIL",travelE:20}),
  Object.assign(S("Hawke","Airmax 4-12x40 (AMX)","MOA",0.25,"SFP","bdc","4-12","12",SRC),{retName:"AMX",travelE:52}),
  Object.assign(S("Hawke","Airmax 6-24x44 (AMX)","MOA",0.25,"SFP","bdc","6-24","24",SRC),{retName:"AMX",travelE:52}),
  Object.assign(S("MTC","Viper Pro 5-30x50 (SCB2)","MOA",0.25,"SFP","bdc","5-30","30",SRC),{retName:"SCB2",travelE:58}),
  Object.assign(S("MTC","Viper Pro 3-18x50 (SCB2)","MOA",0.25,"SFP","bdc","3-18","18",SRC),{retName:"SCB2",travelE:58}),
  Object.assign(S("MTC","Copperhead 4-16x44 (SCB2)","MOA",0.25,"SFP","bdc","4-16","16",SRC),{retName:"SCB2",travelE:58}),
  Object.assign(S("UTG","Accushot 4-16x44 (Mil-Dot 36-color)","MOA",0.25,"SFP","mildot","4-16","16",SRC),{retName:"Mil-Dot 36-color",travelE:52}),
  Object.assign(S("UTG","Accushot 3-12x44 (Mil-Dot 36-color)","MOA",0.25,"SFP","mildot","3-12","12",SRC),{retName:"Mil-Dot 36-color",travelE:52}),
  Object.assign(S("Konus","Konuspro 6-24x50 (Mil-Dot 30/30)","MOA",0.25,"SFP","mildot","6-24","24",SRC),{retName:"Mil-Dot 30/30",travelE:52}),
  Object.assign(S("Konus","Konuspro 4-16x44 (Mil-Dot 30/30)","MOA",0.25,"SFP","mildot","4-16","16",SRC),{retName:"Mil-Dot 30/30",travelE:52}),
  Object.assign(S("Konus","Konuspro 3-12x50 (Mil-Dot 30/30)","MOA",0.25,"SFP","mildot","3-12","12",SRC),{retName:"Mil-Dot 30/30",travelE:52}),
  Object.assign(S("Konus","Konus Arena 6-24x50 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"MIL FFP",travelE:20}),
  Object.assign(S("Nikko Stirling","Diamond 4-16x44 (Mil-Dot)","MOA",0.25,"SFP","mildot","4-16","16",SRC),{retName:"Mil-Dot",travelE:58}),
  Object.assign(S("Nikko Stirling","Diamond 6-24x56 (Mil-Dot)","MOA",0.25,"SFP","mildot","6-24","24",SRC),{retName:"Mil-Dot",travelE:58}),
  Object.assign(S("Falcon","X50 5-25x50 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","5-25","",SRC),{retName:"MIL FFP",travelE:26}),
  Object.assign(S("Falcon","X50 4-20x50 (MIL FFP)","MRAD",0.1,"FFP","mrad-hash","4-20","",SRC),{retName:"MIL FFP",travelE:26}),
  Object.assign(S("Bresser","TrueView 4-16x44 (Mil-Dot)","MOA",0.25,"SFP","mildot","4-16","16",SRC),{retName:"Mil-Dot",travelE:52}),
  Object.assign(S("Crimson Trace","Hardline Pro 6-24x50 (MR1-MIL)","MRAD",0.1,"FFP","mrad-hash","6-24","",SRC),{retName:"MR1-MIL",travelE:25}),
  Object.assign(S("Crimson Trace","5-Series 5-25x56 (MR2-MIL)","MRAD",0.1,"FFP","mrad-tree","5-25","",SRC),{retName:"MR2-MIL",travelE:30}),
  S("Générique","Tourelles 0.1 MRAD, réticule MRAD FFP","MRAD",0.1,"FFP","mrad-hash",""),
  S("Générique","Tourelles 1/4 MOA, réticule Mil-Dot SFP","MOA",0.25,"SFP","mildot","",10),
  S("Générique","Tourelles 1/4 MOA, réticule Duplex","MOA",0.25,"SFP","duplex","")
];
// Munitions : v0 m/s (canon d'essai du fabricant), bc = coefficient balistique G1.
// bcK : "C" = CB publié par le fabricant, "V" = CB calculé d'après les vitesses publiées par le fabricant, "E" = CB estimé (non publié)
const A=(type,brand,model,cal,gr,v0,bc,src,bcK)=>({type,brand,model,cal,gr,v0,bc,src:src||"≈",bcK:bcK||"E"});
const M="Match / précision",E="Entraînement",HV="Haute vitesse",SUB="Subsonique",CHA="Chasse";
const NP=" · CB ≈ (non publié)";
const ammo=[
  A(E,"SK","Standard Plus 40 gr",".22 LR",40,327,0.167,"calculé d'après la table de vitesses publiée par SK (0-100 m, canon 660 mm)","V"),
  A(M,"SK","Rifle Match 40 gr",".22 LR",40,327,0.167,"calculé d'après la table de vitesses publiée par SK (0-100 m, canon 660 mm)","V"),
  A(M,"SK","Magazine 40 gr",".22 LR",40,327,0.167,"calculé d'après la table de vitesses publiée par SK (0-100 m, canon 660 mm)","V"),
  A(M,"SK","Long Range Match 40 gr",".22 LR",40,335,0.155,"calculé d'après la table de vitesses publiée par SK (0-100 m, canon 660 mm) jusqu'à 200 m","V"),
  A(M,"SK","Biathlon Sport 40 gr",".22 LR",40,337,0.176,"calculé d'après la table de vitesses publiée par SK (0-100 m, canon 660 mm) (canon 550 mm)","V"),
  A(E,"SK","Semi-Auto Rifle 40 gr",".22 LR",40,345,0.183,"calculé d'après la table de vitesses publiée par SK (0-100 m, canon 660 mm)","V"),
  A(HV,"SK","High Velocity Match 40 gr",".22 LR",40,385,0.192,"calculé d'après la table de vitesses publiée par SK (0-100 m, canon 660 mm) jusqu'à 200 m","V"),
  A(M,"SK","Pistol Match 40 gr",".22 LR",40,286,0.131,"calculé d'après la table de vitesses publiée par SK (0-100 m, canon 660 mm) (canon 150 mm, 0-50 m)","V"),
  A(M,"SK","Pistol Match Special 40 gr",".22 LR",40,291,0.131,"calculé d'après la table de vitesses publiée par SK (0-100 m, canon 660 mm) (canon 150 mm, 0-50 m)","V"),
  A(M,"Lapua","Center-X 40 gr",".22 LR",40,327,0.172,"CB G1 0.172 publié par Lapua (catalogue rimfire 2022, toutes les 40 gr), V0 constructeur","C"),
  A(M,"Lapua","Midas+ 40 gr",".22 LR",40,327,0.172,"CB G1 0.172 publié par Lapua (catalogue rimfire 2022, toutes les 40 gr), V0 constructeur","C"),
  A(M,"Lapua","X-Act 40 gr",".22 LR",40,327,0.172,"CB G1 0.172 publié par Lapua (catalogue rimfire 2022, toutes les 40 gr), V0 constructeur","C"),
  A(M,"Lapua","Polar Biathlon 40 gr",".22 LR",40,337,0.172,"CB G1 0.172 publié par Lapua (catalogue rimfire 2022, toutes les 40 gr), V0 constructeur","C"),
  A(M,"Lapua","Pistol King 40 gr",".22 LR",40,285,0.172,"CB G1 0.172 publié par Lapua (catalogue rimfire 2022, toutes les 40 gr), V0 constructeur","C"),
  A(M,"Lapua","Pistol OSP 40 gr",".22 LR",40,280,0.172,"CB G1 0.172 publié par Lapua (catalogue rimfire 2022, toutes les 40 gr), V0 constructeur","C"),
  A(M,"Lapua","Long Range 40 gr",".22 LR",40,327,0.172,"CB G1 0.172 publié par Lapua (catalogue rimfire 2022, toutes les 40 gr), V0 ≈","C"),
  A(M,"Lapua","Multi Match 40 gr",".22 LR",40,327,0.172,"CB G1 0.172 publié par Lapua (catalogue rimfire 2022, toutes les 40 gr), V0 ≈","C"),
  A(M,"Lapua","Super Club 40 gr",".22 LR",40,327,0.172,"CB G1 0.172 publié par Lapua (catalogue rimfire 2022, toutes les 40 gr), V0 ≈","C"),
  A(E,"Top Shot","SV Target 40 gr",".22 LR",40,326,0.167,"CB non publié par Top Shot (Frankonia) : estimé comme les 40 gr vitesse standard SK/Lapua ; V0 constructeur 326 m/s","E"),
  A(M,"Top Shot","Competition Black Edition SV 40 gr",".22 LR",40,326,0.167,"CB non publié par Top Shot (Frankonia) : estimé comme les 40 gr vitesse standard SK/Lapua ; V0 constructeur 326 m/s","E"),
  A(E,"Geco","Semi Auto 40 gr",".22 LR",40,350,0.151,"calculé d'après les vitesses publiées par Geco (350/315/294 m/s à 0/50/100 m, canon 420 mm)","V"),
  A(E,"Geco","Rifle 40 gr",".22 LR",40,330,0.115,"calculé d'après les vitesses publiées par Geco (330/300/270 m/s à 0/50/100 m, canon 650 mm)","V"),
  A(M,"RWS","R100 40 gr",".22 LR",40,345,0.136,"CB et V0 publiés par RWS (canon 650 mm)","C"),
  A(M,"RWS","R50 40 gr",".22 LR",40,330,0.136,"CB et V0 publiés par RWS (canon 650 mm)","C"),
  A(M,"RWS","Special Match 40 gr",".22 LR",40,330,0.132,"CB et V0 publiés par RWS (canon 650 mm)","C"),
  A(M,"RWS","Rifle Match S 40 gr",".22 LR",40,345,0.132,"CB et V0 publiés par RWS (canon 650 mm)","C"),
  A(M,"RWS","Rifle Match 40 gr",".22 LR",40,330,0.132,"CB et V0 publiés par RWS (canon 650 mm)","C"),
  A(E,"RWS","Target Rifle 40 gr",".22 LR",40,330,0.132,"CB et V0 publiés par RWS (canon 650 mm)","C"),
  A(M,"RWS","R Plus Long Range 43 gr",".22 LR",43,355,0.137,"CB et V0 publiés par RWS (canon 650 mm)","C"),
  A(M,"RWS","Pistol Match 40 gr",".22 LR",40,275,0.132,"CB et V0 publiés par RWS (canon 130 mm)","C"),
  A(M,"RWS","Long Range Match 40 gr",".22 LR",40,345,0.134,"CB non publié par RWS pour ce modèle : estimé comme les autres RWS (0.132-0.136) ; V0 constructeur","E"),
  A(M,"RWS","Pistol Match SR 40 gr",".22 LR",40,260,0.134,"CB non publié par RWS pour ce modèle : estimé comme les autres RWS (0.132-0.136) ; V0 constructeur","E"),
  A(M,"RWS","P25 Rapid Fire 40 gr",".22 LR",40,260,0.134,"CB non publié par RWS pour ce modèle : estimé comme les autres RWS (0.132-0.136) ; V0 constructeur","E"),
  A(M,"RWS","Target Pistol 40 gr",".22 LR",40,285,0.134,"CB non publié par RWS pour ce modèle : estimé comme les autres RWS (0.132-0.136) ; V0 constructeur","E"),
  A(E,"CCI","Standard Velocity 40 gr",".22 LR",40,326,0.120,"CB et V0 publiés par CCI","C"),
  A(M,"CCI","Green Tag 40 gr",".22 LR",40,326,0.120,"CB et V0 publiés par CCI","C"),
  A(M,"CCI","Pistol Match 40 gr",".22 LR",40,326,0.120,"CB et V0 publiés par CCI","C"),
  A(HV,"CCI","Mini-Mag 40 gr",".22 LR",40,376,0.130,"CB et V0 publiés par CCI","C"),
  A(HV,"CCI","Mini-Mag HP 36 gr",".22 LR",36,384,0.125,"CB et V0 publiés par CCI","C"),
  A(E,"CCI","Clean-22 40 gr",".22 LR",40,376,0.130,"CB et V0 publiés par CCI","C"),
  A(E,"CCI","Blazer 40 gr",".22 LR",40,376,0.133,"CB et V0 publiés par CCI","C"),
  A(E,"CCI","AR Tactical 40 gr",".22 LR",40,366,0.120,"CB et V0 publiés par CCI","C"),
  A(HV,"CCI","Velocitor 40 gr",".22 LR",40,437,0.125,"CB et V0 publiés par CCI","C"),
  A(HV,"CCI","Stinger 32 gr",".22 LR",32,500,0.084,"CB et V0 publiés par CCI","C"),
  A(SUB,"CCI","Subsonic HP 40 gr",".22 LR",40,320,0.120,"CB et V0 publiés par CCI","C"),
  A(SUB,"CCI","22 Suppressor 45 gr",".22 LR",45,296,0.125,"CB et V0 publiés par CCI","C"),
  A(SUB,"CCI","Quiet-22 40 gr",".22 LR",40,216,0.120,"CB et V0 publiés par CCI","C"),
  A(M,"Federal","Gold Medal Target 40 gr",".22 LR",40,329,0.138,"CB et V0 publiés par Federal","C"),
  A(M,"Federal","Gold Medal Match 40 gr",".22 LR",40,329,0.092,"CB et V0 publiés par Federal","C"),
  A(M,"Federal","Gold Medal 1200 fps 40 gr",".22 LR",40,366,0.138,"CB et V0 publiés par Federal","C"),
  A(E,"Federal","Champion 40 gr",".22 LR",40,378,0.139,"CB et V0 publiés par Federal","C"),
  A(HV,"Federal","AutoMatch 40 gr",".22 LR",40,366,0.138,"CB et V0 publiés par Federal","C"),
  A(HV,"Federal","Champion HP 36 gr",".22 LR",36,384,0.125,"CB et V0 publiés par Federal","C"),
  A(SUB,"Federal","American Eagle Suppressor 45 gr",".22 LR",45,296,0.130,"CB et V0 publiés par Federal","C"),
  A(CHA,"Federal","Hunter Match 40 gr",".22 LR",40,366,0.138,"CB non publié par Federal pour ce modèle : estimé comme Gold Medal 40 gr ; V0 constructeur","E"),
  A(HV,"Winchester","Super-X 40 gr",".22 LR",40,351,0.130,"CB non publié par Winchester (« no ballistics data ») : estimé ; V0 constructeur 1150 fps","E"),
  A(HV,"Winchester","Super-X HP 37 gr",".22 LR",37,390,0.120,"CB non publié par Winchester (« no ballistics data ») : estimé ; V0 ≈","E"),
  A(CHA,"Winchester","Power-Point 40 gr",".22 LR",40,390,0.125,"CB non publié par Winchester (« no ballistics data ») : estimé ; V0 ≈","E"),
  A(E,"Winchester","M-22 40 gr",".22 LR",40,383,0.130,"CB non publié par Winchester (« no ballistics data ») : estimé ; V0 ≈","E"),
  A(E,"Winchester","Wildcat 40 gr",".22 LR",40,390,0.130,"CB non publié par Winchester (« no ballistics data ») : estimé ; V0 ≈","E"),
  A(HV,"Remington","Thunderbolt 40 gr",".22 LR",40,383,0.116,"CB et V0 publiés par Remington (1255 fps, 1091 fps à 50 yd, 988 fps à 100 yd)","C"),
  A(HV,"Remington","Golden Bullet 40 gr",".22 LR",40,381,0.120,"CB non publié pour ce modèle : estimé d'après le Thunderbolt (0.116)","E"),
  A(HV,"Remington","Golden Bullet HP 36 gr",".22 LR",36,390,0.115,"CB non publié pour ce modèle : estimé d'après le Thunderbolt (0.116)","E"),
  A(E,"Remington","Target 40 gr",".22 LR",40,350,0.120,"CB non publié pour ce modèle : estimé d'après le Thunderbolt (0.116)","E"),
  A(SUB,"Remington","Subsonic HP 38 gr",".22 LR",38,320,0.120,"CB non publié pour ce modèle : estimé d'après le Thunderbolt (0.116)","E"),
  A(E,"Norma","Tac-22 40 gr",".22 LR",40,330,0.132,"CB G1 et V0 publiés par Norma (V50 295, V100 270 m/s)","C"),
  A(M,"Norma","Match-22 40 gr",".22 LR",40,330,0.132,"CB et V0 publiés par Norma (V50 294, V100 270 m/s)","C"),
  A(M,"Eley","Tenex 40 gr",".22 LR",40,326,0.165,"Eley publie un CB de 0.112 en modèle RA4 (pas G1), non utilisable tel quel : G1 estimé ; vitesse du lot imprimée sur chaque boîte","E"),
  A(M,"Eley","Tenex Biathlon 40 gr",".22 LR",40,335,0.165,"Eley publie un CB de 0.112 en modèle RA4 (pas G1), non utilisable tel quel : G1 estimé ; vitesse du lot imprimée sur chaque boîte","E"),
  A(M,"Eley","Match 40 gr",".22 LR",40,324,0.165,"Eley publie un CB de 0.112 en modèle RA4 (pas G1), non utilisable tel quel : G1 estimé ; vitesse du lot imprimée sur chaque boîte","E"),
  A(M,"Eley","Team 40 gr",".22 LR",40,326,0.165,"Eley publie un CB de 0.112 en modèle RA4 (pas G1), non utilisable tel quel : G1 estimé ; vitesse du lot imprimée sur chaque boîte","E"),
  A(M,"Eley","Ultra Long Range 40 gr",".22 LR",40,326,0.165,"Eley publie un CB de 0.112 en modèle RA4 (pas G1), non utilisable tel quel : G1 estimé ; vitesse du lot imprimée sur chaque boîte","E"),
  A(E,"Eley","Club 40 gr",".22 LR",40,331,0.165,"Eley publie un CB de 0.112 en modèle RA4 (pas G1), non utilisable tel quel : G1 estimé ; vitesse du lot imprimée sur chaque boîte","E"),
  A(E,"Eley","Sport 40 gr",".22 LR",40,331,0.165,"Eley publie un CB de 0.112 en modèle RA4 (pas G1), non utilisable tel quel : G1 estimé ; vitesse du lot imprimée sur chaque boîte","E"),
  A(E,"Eley","Target 40 gr",".22 LR",40,331,0.165,"Eley publie un CB de 0.112 en modèle RA4 (pas G1), non utilisable tel quel : G1 estimé ; vitesse du lot imprimée sur chaque boîte","E"),
  A(E,"Aguila","Super Extra SV 40 gr",".22 LR",40,326,0.150,"CB non publié par Aguila : estimé selon le type de balle ; V0 ≈","E"),
  A(HV,"Aguila","Super Extra HV 40 gr",".22 LR",40,381,0.135,"CB non publié par Aguila : estimé selon le type de balle ; V0 ≈","E"),
  A(HV,"Aguila","Super Extra HP 38 gr",".22 LR",38,390,0.125,"CB non publié par Aguila : estimé selon le type de balle ; V0 ≈","E"),
  A(HV,"Aguila","Interceptor 40 gr",".22 LR",40,448,0.130,"CB non publié par Aguila : estimé selon le type de balle ; V0 ≈","E"),
  A(HV,"Aguila","Super Maximum 30 gr",".22 LR",30,533,0.095,"CB non publié par Aguila : estimé selon le type de balle ; V0 ≈","E"),
  A(SUB,"Aguila","SSS 60 gr",".22 LR",60,290,0.190,"CB non publié par Aguila : estimé selon le type de balle ; V0 ≈","E"),
  A(SUB,"Aguila","Subsonic 38 gr",".22 LR",38,312,0.125,"CB non publié par Aguila : estimé selon le type de balle ; V0 ≈","E"),
  A(SUB,"Aguila","Super Colibri 20 gr",".22 LR",20,152,0.080,"CB non publié par Aguila : estimé selon le type de balle ; V0 ≈","E"),
  A(M,"Fiocchi","Exacta Super Match 40 gr",".22 LR",40,320,0.150,"CB non publié par Fiocchi : estimé selon le type de balle ; V0 ≈","E"),
  A(M,"Fiocchi","Exacta Pistol Super Match 40 gr",".22 LR",40,300,0.150,"CB non publié par Fiocchi : estimé selon le type de balle ; V0 ≈","E"),
  A(E,"Fiocchi","Training 40 gr",".22 LR",40,330,0.150,"CB non publié par Fiocchi : estimé selon le type de balle ; V0 ≈","E"),
  A(HV,"Fiocchi","High Velocity 40 gr",".22 LR",40,375,0.135,"CB non publié par Fiocchi : estimé selon le type de balle ; V0 ≈","E"),
  A(M,"Wolf","Match Target 40 gr",".22 LR",40,329,0.150,"CB non publié par Wolf : estimé selon le type de balle ; V0 ≈","E"),
  A(M,"Wolf","Match Extra 40 gr",".22 LR",40,329,0.150,"CB non publié par Wolf : estimé selon le type de balle ; V0 ≈","E"),
  A(M,"Wolf","Match Gold 40 gr",".22 LR",40,329,0.150,"CB non publié par Wolf : estimé selon le type de balle ; V0 ≈","E"),
  A(E,"Sellier & Bellot","Club 40 gr",".22 LR",40,320,0.150,"CB non publié par Sellier & Bellot : estimé selon le type de balle ; V0 ≈","E"),
  A(HV,"Sellier & Bellot","High Velocity 40 gr",".22 LR",40,375,0.135,"CB non publié par Sellier & Bellot : estimé selon le type de balle ; V0 ≈","E"),
  A(SUB,"Sellier & Bellot","Subsonic 40 gr",".22 LR",40,315,0.150,"CB non publié par Sellier & Bellot : estimé selon le type de balle ; V0 ≈","E"),
  A(M,"PMC","Scoremaster 40 gr",".22 LR",40,318,0.150,"CB non publié par PMC : estimé selon le type de balle ; V0 ≈","E"),
  A(HV,"PMC","Zapper 40 gr",".22 LR",40,375,0.135,"CB non publié par PMC : estimé selon le type de balle ; V0 ≈","E"),
  A(E,"Magtech","Standard Velocity 40 gr",".22 LR",40,326,0.150,"CB non publié par Magtech : estimé selon le type de balle ; V0 ≈","E"),
  A(M,"Armscor","Precision 40 gr",".22 LR",40,330,0.150,"CB non publié par Armscor : estimé selon le type de balle ; V0 ≈","E"),
  A(M,"Prvi Partizan","Match 40 gr",".22 LR",40,330,0.150,"CB non publié par Prvi Partizan : estimé selon le type de balle ; V0 ≈","E"),
  A(CHA,"Hornady","V-Max 17 gr",".17 HMR",17,777,0.127,"calculé d'après les vitesses publiées par Hornady (2550/1902/1379 fps à 0/100/200 yd)","V"),
  A(CHA,"Hornady","NTX 15.5 gr",".17 HMR",15.5,770,0.110,"CB non publié sur la fiche Hornady : estimé ; V0 constructeur 2525 fps","E"),
  A(CHA,"CCI","V-Max 17 gr",".17 HMR",17,777,0.128,"CB et V0 publiés par CCI","C"),
  A(CHA,"CCI","TNT 17 gr",".17 HMR",17,777,0.100,"CB et V0 publiés par CCI","C"),
  A(CHA,"CCI","GamePoint 20 gr",".17 HMR",20,724,0.125,"CB et V0 publiés par CCI","C"),
  A(CHA,"CCI","A17 17 gr",".17 HMR",17,808,0.125,"CB non publié : estimé ; V0 constructeur 2650 fps","E"),
  A(CHA,"Federal","V-Max 17 gr",".17 HMR",17,777,0.127,"CB non publié : même balle que Hornady V-Max 17 gr","E"),
  A(CHA,"Winchester","Varmint HV 17 gr",".17 HMR",17,777,0.127,"CB non publié par Winchester (« no ballistics data ») : estimé","E"),
  A(CHA,"CCI","Maxi-Mag 40 gr",".22 WMR",40,572,0.114,"CB et V0 publiés par CCI","C"),
  A(CHA,"CCI","V-Max 30 gr",".22 WMR",30,671,0.116,"CB et V0 publiés par CCI","C"),
  A(CHA,"CCI","Maxi-Mag TMJ 40 gr",".22 WMR",40,572,0.114,"CB non publié pour ce modèle : estimé d'après Maxi-Mag/V-Max CCI ; V0 constructeur","E"),
  A(CHA,"CCI","Maxi-Mag TNT 30 gr",".22 WMR",30,671,0.110,"CB non publié pour ce modèle : estimé d'après Maxi-Mag/V-Max CCI ; V0 constructeur","E"),
  A(CHA,"CCI","GamePoint 40 gr",".22 WMR",40,572,0.114,"CB non publié pour ce modèle : estimé d'après Maxi-Mag/V-Max CCI ; V0 constructeur","E"),
  A(CHA,"Hornady","V-Max 30 gr",".22 WMR",30,671,0.116,"CB non publié sur la fiche Hornady : même balle que CCI V-Max 30 gr (0.116) ; V0 constructeur 2200 fps","E"),
  A(CHA,"Hornady","FTX Critical Defense 45 gr",".22 WMR",45,503,0.098,"≈","E"),
  A(CHA,"Hornady","V-Max 17 gr (.17 Mach 2)",".17 Mach 2",17,640,0.127,"calculé d'après les vitesses publiées par Hornady (2100/1531/1133 fps à 0/100/200 yd)","V"),
  A(CHA,"Hornady","V-Max 20 gr",".17 Hornet",20,1105,0.185,"CB publié par Hornady","C"),
  A(CHA,"Hornady","V-Max 35 gr",".22 Hornet",35,930,0.109,"CB publié par Hornady","C"),
  A(M,"Federal","Gold Medal Match 69 gr SMK",".223 Rem",69,899,0.301,"CB publié par Federal","C"),
  A(M,"Federal","Gold Medal Match 77 gr SMK",".223 Rem",77,838,0.372,"CB publié par Federal","C"),
  A(M,"Hornady","BTHP Match 75 gr",".223 Rem",75,850,0.395,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Hornady","ELD Match 73 gr",".223 Rem",73,883,0.398,"CB publié par Hornady","C"),
  A(CHA,"Hornady","V-Max 55 gr",".223 Rem",55,987,0.255,"CB publié par Hornady","C"),
  A(M,"Lapua","Scenar 69 gr",".223 Rem",69,900,0.333,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Norma","Golden Target 69 gr",".223 Rem",69,880,0.320,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(E,"Sellier & Bellot","FMJ 55 gr",".223 Rem",55,975,0.243,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Sellier & Bellot","HPBT 69 gr",".223 Rem",69,870,0.301,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(E,"Geco","FMJ 55 gr",".223 Rem",55,960,0.243,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Geco","Target 69 gr",".223 Rem",69,880,0.301,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Federal","Gold Medal Match 168 gr SMK",".308 Win",168,808,0.462,"CB publié par Federal","C"),
  A(M,"Federal","Gold Medal Match 175 gr SMK",".308 Win",175,792,0.505,"CB publié par Federal","C"),
  A(M,"Federal","Gold Medal Berger 185 gr",".308 Win",185,777,0.560,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Hornady","ELD Match 168 gr",".308 Win",168,823,0.523,"CB publié par Hornady","C"),
  A(M,"Hornady","ELD Match 178 gr",".308 Win",178,792,0.547,"CB publié par Hornady","C"),
  A(M,"Lapua","Scenar 167 gr",".308 Win",167,820,0.470,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Lapua","Scenar-L 155 gr",".308 Win",155,860,0.508,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Lapua","Scenar 185 gr",".308 Win",185,770,0.500,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Norma","Golden Target 168 gr",".308 Win",168,800,0.475,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Sako","Racehead 168 gr",".308 Win",168,800,0.470,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"RWS","Target Elite Plus 168 gr",".308 Win",168,790,0.470,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Geco","Target 168 gr",".308 Win",168,790,0.447,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(E,"Sellier & Bellot","HPBT 168 gr",".308 Win",168,800,0.447,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(E,"Sellier & Bellot","FMJ 147 gr",".308 Win",147,838,0.398,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Geco","Plus 165 gr",".308 Win",165,810,0.400,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"RWS","EVO 165 gr",".308 Win",165,810,0.420,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Norma","Oryx 165 gr",".308 Win",165,800,0.300,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Hornady","ELD Match 140 gr","6.5 Creedmoor",140,826,0.646,"CB publié par Hornady","C"),
  A(M,"Hornady","ELD Match 147 gr","6.5 Creedmoor",147,821,0.697,"CB publié par Hornady","C"),
  A(M,"Federal","Gold Medal Berger 130 gr","6.5 Creedmoor",130,869,0.560,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Federal","Gold Medal Match 140 gr SMK","6.5 Creedmoor",140,823,0.535,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Lapua","Scenar-L 136 gr","6.5 Creedmoor",136,830,0.578,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Norma","Golden Target 130 gr","6.5 Creedmoor",130,850,0.580,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Sellier & Bellot","HPBT 140 gr","6.5 Creedmoor",140,810,0.535,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Hornady","ELD-X 143 gr","6.5 Creedmoor",143,823,0.625,"CB publié par Hornady","C"),
  A(CHA,"Federal","Power-Shok 150 gr SP",".30-06",150,887,0.314,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Hornady","ELD-X 178 gr",".30-06",178,838,0.552,"CB publié par Hornady","C"),
  A(M,"Lapua","Scenar 250 gr",".338 Lapua Mag",250,905,0.648,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Lapua","Scenar 300 gr",".338 Lapua Mag",300,825,0.736,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Hornady","ELD Match 285 gr",".338 Lapua Mag",285,838,0.789,"CB publié par Hornady","C"),
  A(CHA,"Hornady","ELD-X 90 gr",".243 Win",90,960,0.409,"CB publié par Hornady","C"),
  A(M,"Hornady","ELD Match 105 gr",".243 Win",105,899,0.536,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Hornady","ELD-X 145 gr",".270 Win",145,905,0.536,"CB publié par Hornady","C"),
  A(M,"Hornady","ELD Match 108 gr","6mm Creedmoor",108,902,0.536,"CB publié par Hornady","C"),
  A(M,"Lapua","Scenar 123 gr","6.5x47 Lapua",123,880,0.547,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Lapua","Scenar 139 gr","6.5x55 SE",139,860,0.615,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Norma","Golden Target 130 gr (6.5x55 SE)","6.5x55 SE",130,820,0.580,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Hornady","ELD Match 147 gr (6.5 PRC)","6.5 PRC",147,887,0.697,"CB publié par Hornady","C"),
  A(CHA,"Hornady","ELD-X 162 gr","7mm Rem Mag",162,896,0.631,"CB publié par Hornady","C"),
  A(CHA,"Hornady","ELD-X 200 gr",".300 Win Mag",200,869,0.597,"CB publié par Hornady","C"),
  A(M,"Federal","Gold Medal Berger 215 gr",".300 Win Mag",215,866,0.691,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Hornady","SST 225 gr",".338 Win Mag",225,853,0.515,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Hornady","DGX 500 gr",".458 Win Mag",500,652,0.295,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Hornady","V-Max 32 gr",".204 Ruger",32,1288,0.210,"CB publié par Hornady","C"),
  A(CHA,"Hornady","V-Max 50 gr",".222 Rem",50,957,0.242,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Hornady","V-Max 55 gr (.22-250 Rem)",".22-250 Rem",55,1122,0.255,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Hornady","ELD Match 108 gr (6mm ARC)","6mm ARC",108,838,0.536,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Hornady","ELD-X 150 gr","7mm-08 Rem",150,853,0.574,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Hornady","ELD Match 180 gr","7mm PRC",180,914,0.796,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(M,"Hornady","ELD Match 225 gr",".300 PRC",225,856,0.777,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Federal","Nosler Partition 180 gr",".300 WSM",180,908,0.474,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"RWS","EVO 159 gr","7x64",159,820,0.440,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"RWS","ID Classic 196 gr","8x57 IS",196,771,0.350,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Norma","Oryx 232 gr","9.3x62",232,800,0.300,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(E,"Sellier & Bellot","FMJ 123 gr","7.62x39",123,721,0.295,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Winchester","Power-Point 150 gr",".350 Legend",150,709,0.193,"CB ≈ (valeur typique de la balle, à vérifier)","E"),
  A(CHA,"Hornady","FTX 250 gr",".450 Bushmaster",250,671,0.210,"CB ≈ (valeur typique de la balle, à vérifier)","E")
];
const RN={"ED-PRS GEN II 5-25x56 SFIR FFP-Z MRAD": "Arbre de Noël MIL éclairé Discovery (FFP-Z) : centre rouge ±1 mil, horizontale ±9 mil, arbre de tenue de 2 à 10 mil", "ED-PRS GEN II 5-25x56 SFIR FFP-Z MOA": "Graduations MOA éclairé, FFP, Zero Stop (Z) ; nom non publié", "HD 5-25x50 SFIR FFP": "Réticule MIL FFP (nom non publié)", "VT-Z 4-16x44 SFP": "Mil-Dot (≈)", "Viper PST Gen II 5-25x50 EBR-7C MRAD": "EBR-7C (MRAD)", "Viper PST Gen II 5-25x50 EBR-7C MOA": "EBR-7C (MOA)", "Strike Eagle 5-25x56 EBR-7C MRAD": "EBR-7C (MRAD)", "Venom 5-25x56 EBR-7C MRAD": "EBR-7C (MRAD)", "Diamondback Tactical 6-24x50 EBR-2C MRAD": "EBR-2C (MRAD)", "Razor HD Gen III 6-36x56 EBR-7D MRAD": "EBR-7D (MRAD)", "Crossfire II 4-12x44 Dead-Hold BDC": "Dead-Hold BDC", "Ares BTR Gen2 4.5-27x50 APLR2 MRAD": "APLR2 FFP IR MIL", "Argos BTR Gen2 6-24x50 APMR MRAD": "APMR FFP IR MIL", "Talos BTR 4-14x44 MRAD": "APMR FFP MIL (≈)", "Continental 5-30x56 MRAD": "Arbre MIL FFP (≈, selon version)", "Taurus 5-30x56 MRAD": "Arbre MIL FFP (≈, selon version)", "Marksman 6-24x50 FFP": "MIL FFP (≈)", "EP5 5-25x56 VPR MRAD": "VPR MIL", "Nexus 5-20x50 APR-1D MRAD": "APR-1D MRAD", "Helix 6-24x50 APR-1C MRAD": "APR-1C MRAD", "Match Pro 6-24x50 Deploy MIL": "Deploy MIL", "Sidewinder 30 FFP 4-16x50 MRAD": "FFP MIL (≈)", "Vantage 4-12x40 Mil-Dot": "Mil-Dot", "Mark 5HD 5-25x56 PR2-MIL": "PR2-MIL", "VX-5HD 3-15x44 Duplex": "Duplex", "VX-3HD 4.5-14x40 Duplex": "Duplex", "ATACR 5-25x56 Mil-XT": "Mil-XT", "NX8 4-32x50 Mil-C": "Mil-C", "SHV 4-14x56 MOAR": "MOAR", "PM II 5-25x56 P4FL MRAD": "P4FL", "K525i 5-25x56 SKMR": "SKMR3", "LRP S5 5-25x56 ZF-MRi": "ZF-MRi", "Conquest V4 6-24x50 ZMOAi": "ZMOAi-T20", "Optika6 5-30x56 FFP MRAD": "MRAD FFP (≈)", "Toric 4.5-30x56 MRAD": "MIL FFP (≈)"};
scope.forEach(e=>{e.retName=e.retName||RN[e.model]||"";});
window.CATALOG={weapon,scope,ammo};
// anciennes clés de lunettes (avant v4.0) → nouvelles
window.AMMO_REN={"Top Shot|Standard Velocity 40 gr": "Top Shot|SV Target 40 gr", "SK|Magazine Rifle Match 40 gr": "SK|Magazine 40 gr", "CCI|Suppressor 45 gr": "CCI|22 Suppressor 45 gr", "Federal|Gold Medal UltraMatch 40 gr": "Federal|Gold Medal Match 40 gr", "American Eagle|Suppressor 45 gr": "Federal|American Eagle Suppressor 45 gr", "Eley|Biathlon Match 40 gr": "Eley|Tenex Biathlon 40 gr"};
window.SCOPE_REN={"Vortex|Viper PST Gen II 5-25x50 EBR-7C MRAD": "Vortex|Viper PST Gen II 5-25x50 (EBR-7C MRAD)", "Vortex|Viper PST Gen II 5-25x50 EBR-7C MOA": "Vortex|Viper PST Gen II 5-25x50 (EBR-7C MOA)", "Vortex|Strike Eagle 5-25x56 EBR-7C MRAD": "Vortex|Strike Eagle 5-25x56 (EBR-7C MRAD)", "Vortex|Venom 5-25x56 EBR-7C MRAD": "Vortex|Venom 5-25x56 (EBR-7C MRAD)", "Vortex|Diamondback Tactical 6-24x50 EBR-2C MRAD": "Vortex|Diamondback Tactical 6-24x50 (EBR-2C MRAD)", "Vortex|Razor HD Gen III 6-36x56 EBR-7D MRAD": "Vortex|Razor HD Gen III 6-36x56 (EBR-7D MRAD)", "Vortex|Crossfire II 4-12x44 Dead-Hold BDC": "Vortex|Crossfire II 4-12x44 (Dead-Hold BDC)", "Element Optics|Nexus 5-20x50 APR-1D MRAD": "Element Optics|Nexus 5-20x50 (APR-1D MRAD)", "Element Optics|Helix 6-24x50 APR-1C MRAD": "Element Optics|Helix 6-24x50 (APR-1C MRAD)", "Bushnell|Match Pro 6-24x50 Deploy MIL": "Bushnell|Match Pro 6-24x50 (Deploy MIL)", "Hawke|Vantage 4-12x40 Mil-Dot": "Hawke|Vantage 4-12x40 (Mil-Dot)", "Leupold|Mark 5HD 5-25x56 PR2-MIL": "Leupold|Mark 5HD 5-25x56 (PR2-MIL)", "Leupold|VX-5HD 3-15x44 Duplex": "Leupold|VX-5HD 3-15x44 (Duplex)", "Leupold|VX-3HD 4.5-14x40 Duplex": "Leupold|VX-3HD 4.5-14x40 (Duplex)", "Nightforce|ATACR 5-25x56 Mil-XT": "Nightforce|ATACR 5-25x56 (Mil-XT)", "Nightforce|NX8 4-32x50 Mil-C": "Nightforce|NX8 4-32x50 (Mil-C)", "Nightforce|SHV 4-14x56 MOAR": "Nightforce|SHV 4-14x56 (MOAR)", "Schmidt & Bender|PM II 5-25x56 P4FL MRAD": "Schmidt & Bender|PM II 5-25x56 (P4FL MRAD)", "Zeiss|LRP S5 5-25x56 ZF-MRi": "Zeiss|LRP S5 5-25x56 (ZF-MRi)", "Athlon|Ares BTR Gen2 4.5-27x50 APLR2 MRAD": "Athlon|Ares BTR Gen2 4.5-27x50 (APLR2 FFP IR MIL)", "Athlon|Argos BTR Gen2 6-24x50 APMR MRAD": "Athlon|Argos BTR Gen2 6-24x50 (APMR FFP IR MIL)", "Athlon|Talos BTR 4-14x44 MRAD": "Athlon|Talos BTR 4-14x44 (APMR FFP MIL)", "Vector Optics|Continental 5-30x56 MRAD": "Vector Optics|Continental 5-30x56 (VCT-34FFP MIL)", "Vector Optics|Taurus 5-30x56 MRAD": "Vector Optics|Taurus 5-30x56 (VTC-1 MIL FFP)", "Vector Optics|Marksman 6-24x50 FFP": "Vector Optics|Marksman 6-24x50 (VMR-1 MIL FFP)", "Arken|EP5 5-25x56 VPR MRAD": "Arken|EP5 5-25x56 (VPR MIL)", "Hawke|Sidewinder 30 FFP 4-16x50 MRAD": "Hawke|Sidewinder 30 FFP 4-16x50 (FFP MIL)", "Kahles|K525i 5-25x56 SKMR": "Kahles|K525i 5-25x56 (SKMR3)", "Zeiss|Conquest V4 6-24x50 ZMOAi": "Zeiss|Conquest V4 6-24x50 (ZMOAi-T20)", "Meopta|Optika6 5-30x56 FFP MRAD": "Meopta|Optika6 5-30x56 (MRAD FFP RD)", "Tract|Toric 4.5-30x56 MRAD": "Tract|Toric 4.5-30x56 (TMR MRAD)"};
})();

// Réticules : explications affichées dans l'onglet Réticule.
window.RETICLES={
  "disc-ffpz":{name:"Discovery ED-PRS GEN II FFP-Z (MIL, arbre de Noël)",unit:"MRAD",
    text:"Centre rouge éclairé : point central et croix graduée jusqu'à 1 mil (barres aux extrémités). Ligne horizontale graduée jusqu'à 9 mil : grand trait à chaque mil, demi-mil au-dessus, petits traits tous les 0,2 mil en dessous ; chiffres tous les 2 mil. Verticale graduée tous les 0,2 mil, 4 mil au-dessus et 11 mil en dessous. Sous le centre, 9 lignes de tenue de 2 à 10 mil (chiffrées 2, 4, 6, 8, 10), de plus en plus larges (±1,6 à ±5,6 mil), graduées pour tenir à la fois la chute et le vent. Les flèches des montants épais pointent à 10 mil (horizontale) et 12 mil (bas). Premier plan focal : toutes ces valeurs sont justes à tous les grossissements."},
  "mrad-tree":{name:"MRAD « arbre de Noël » (EBR-7, Mil-XT, APLR, VPR…)",unit:"MRAD",
    text:"Croix graduée tous les 0,2 mil (petits traits) avec un chiffre à chaque mil. Sous le centre, une grille de points espacés de 1 mil (« arbre ») permet de viser en tenant compte à la fois de la chute (lignes vers le bas) et du vent (points à gauche/droite) sans toucher aux tourelles. Le point orange montre où placer la cible pour la solution de tir actuelle."},
  "mrad-hash":{name:"MRAD à graduations (EBR-2C, PR2-MIL, Mil-C, SKMR…)",unit:"MRAD",
    text:"Croix graduée en milliradians : grands traits tous les 1 mil (chiffrés), petits traits tous les 0,5 ou 0,2 mil. 1 mil = 10 cm à 100 m = 5 cm à 50 m. Utilisez les graduations pour mesurer un écart d'impact, estimer une distance ou viser en « tenue » au lieu de cliquer."},
  "mildot":{name:"Mil-Dot",unit:"MRAD",
    text:"Points espacés de 1 mil sur chaque branche (centre à centre), gros traits au-delà de 5 mil. Réticule classique d'estimation de distance. Attention : sur une lunette en MOA avec réticule Mil-Dot, les tourelles et le réticule n'ont pas la même unité ; et en second plan focal, l'écart des points n'est juste qu'au grossissement de calibration."},
  "moa-hash":{name:"MOA à graduations (MOAR, ZMOAi, EBR-7C MOA…)",unit:"MOA",
    text:"Graduations en minutes d'angle : traits tous les 1 MOA, plus longs tous les 5 MOA. 1 MOA ≈ 2,9 cm à 100 m. Pratique avec des tourelles en 1/4 MOA : 4 clics = 1 graduation."},
  "duplex":{name:"Duplex (croix fine + montants épais)",unit:"MOA",
    text:"Croix fine au centre et montants épais à l'extérieur, sans graduations. Le réticule ne sert qu'à viser au centre : toute correction doit se faire aux tourelles (en clics). L'onglet Tir vous donne le nombre de clics."},
  "bdc":{name:"BDC (compensation de chute par repères)",unit:"MOA",
    text:"Repères sous le centre prévus pour des distances données avec une munition « type ». Les distances réelles dépendent de VOTRE munition et du grossissement (SFP) : utilisez la position du point orange plutôt que les distances gravées par le fabricant."}
};

// Cibles : dimensions en mm. kind : rings (anneaux, diamètres du 10 au 1), gong (rond), rect, ipsc, ang (taille angulaire fixe : MOA ou mil).
(function(){
  const rings=(d10,step,n,black,inner)=>({kind:"rings",rings:Array.from({length:n},(_,i)=>d10+i*step),black,inner});
  const T=[];
  const add=(group,name,o,src)=>T.push(Object.assign({group,name,src:src||"règlement ISSF"},o));
  add("Cibles de compétition (ISSF / FFTir)","C50 carabine 50 m",rings(10.4,16,10,112.4,5));
  add("Cibles de compétition (ISSF / FFTir)","C10 carabine 10 m",rings(0.5,5,10,30.5,0));
  add("Cibles de compétition (ISSF / FFTir)","C50 pistolet 50 m / 25 m précision",rings(50,50,10,200,25));
  add("Cibles de compétition (ISSF / FFTir)","C10 pistolet 10 m",rings(11.5,16,10,59.5,5));
  add("Cibles de compétition (ISSF / FFTir)","C300 carabine 300 m",rings(100,100,10,600,50));
  [50,75,100,125,150,200,250,300,400,500].forEach(d=>add("Gongs ronds",`Gong Ø ${d/10} cm`,{kind:"gong",w:d,h:d},"dimensions nominales"));
  [[100,100],[150,150],[200,200],[250,250],[300,300],[200,300],[300,450],[450,600]].forEach(([w,h])=>add("Plaques rectangulaires",`Plaque ${w/10}×${h/10} cm`,{kind:"rect",w,h},"dimensions nominales"));
  add("Silhouettes","Silhouette IPSC (≈ 46×76 cm)",{kind:"ipsc",w:460,h:760},"≈");
  add("Silhouettes","Mini-silhouette IPSC 1/3 (≈ 15×25 cm)",{kind:"ipsc",w:153,h:253},"≈");
  add("Silhouettes","Plaque tête/« headshot » (≈ 15×23 cm)",{kind:"rect",w:150,h:230},"≈");
  [[0.5,"MOA"],[1,"MOA"],[1.5,"MOA"],[2,"MOA"],[3,"MOA"],[0.5,"MRAD"],[1,"MRAD"],[1.5,"MRAD"],[2,"MRAD"]].forEach(([a,u])=>
    add("Gongs à taille angulaire (PR)",`Gong ${String(a).replace(".",",")} ${u==="MOA"?"MOA":"mil"}`,{kind:"gong",ang:a,angU:u},"taille proportionnelle à la distance"));
  window.TARGETS=T;
})();
