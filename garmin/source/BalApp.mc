import Toybox.Application;
import Toybox.Activity;
import Toybox.Lang;
import Toybox.Math;
import Toybox.Position;
import Toybox.Sensor;
import Toybox.Weather;
import Toybox.WatchUi;

const TABLE_MAX = 2000;  // portée maximale calculée (m)
const TABLE_STEP = 5;   // pas de la trajectoire stockée (m)
const N_PROFS = 20;     // munitions (voir tools/gen_settings.py)
const OMEGA = 7.292115e-5;  // rotation de la Terre (rad/s)

// Réglages communs, lus et écrits dans Application.Properties (modifiables aussi depuis Connect IQ sur le téléphone)
const KEYS = ["prof", "moa", "click", "dist", "step", "dFrom", "dTo", "dStep", "ws", "wc", "temp", "pAuto", "press", "corOn", "gpsAuto", "lat", "az", "shLat", "shLon", "tgLat", "tgLon", "hAll", "hCom"];
const R_EARTH = 6371000.0;
// Champs de chaque munition : p<n><suffixe>
const PSUF = ["n", "v", "b", "g", "z", "h"];

class BalApp extends Application.AppBase {

    var s;          // réglages (copie des Properties)
    var tbl;        // [ys, ts] tous les TABLE_STEP mètres
    var rng = 0;    // portée calculée (m) : seulement ce qui est affiché, pour ménager le processeur
    var need = 0;   // distance demandée au-delà de la portée calculée
    var tI;         // intégrale du temps de vol sur la distance (m·s), pour Coriolis
    var gpsOk = false;   // latitude venue du GPS
    var atm = [1.0, 340.0];  // [rapport de densité de l'air, vitesse du son] du dernier calcul
    var pUsed = 1013.0;  // pression utilisée pour le dernier calcul (hPa)
    var pAutoOk = false; // baromètre de la montre disponible

    function initialize() {
        AppBase.initialize();
    }

    function onStart(state) {
        load();
        recompute();
        if (s["gpsAuto"]) { askGps(); }
    }

    // Réglages modifiés depuis l'appli Connect IQ du téléphone
    function onSettingsChanged() {
        load();
        // poste de tir / cible saisis sur le téléphone
        if (s["shLat"] != 0.0 || s["shLon"] != 0.0) {
            s["lat"] = s["shLat"];
            if (s["tgLat"] != 0.0 || s["tgLon"] != 0.0) { applyTarget(); }
        }
        recompute();
        WatchUi.requestUpdate();
    }

    function onStop(state) {
        save();
    }

    function getInitialView() {
        return [new MainView(), new MainDelegate()];
    }

    // ---------- réglages ----------
    function load() {
        s = {};
        for (var i = 0; i < KEYS.size(); i++) { s[KEYS[i]] = Application.Properties.getValue(KEYS[i]); }
        s["prof"] = s["prof"] - 1;  // n° 1 à N_PROFS dans les réglages, index 0 dans le code
        if (s["prof"] < 0 || s["prof"] >= N_PROFS) { s["prof"] = 0; }
        // munition : [nom, V0 (m/s), CB, table 1 = G1 / 7 = G7, distance de zéro (m), hauteur lunette / canon (cm)]
        var profs = new [N_PROFS];
        for (var i = 0; i < N_PROFS; i++) {
            var p = new [PSUF.size()];
            for (var j = 0; j < PSUF.size(); j++) { p[j] = Application.Properties.getValue("p" + (i + 1) + PSUF[j]); }
            profs[i] = p;
        }
        s["profs"] = profs;
    }

    function save() {
        for (var i = 0; i < KEYS.size(); i++) {
            var v = s[KEYS[i]];
            Application.Properties.setValue(KEYS[i], KEYS[i].equals("prof") ? v + 1 : v);
        }
        var p = prof();
        for (var j = 0; j < PSUF.size(); j++) { Application.Properties.setValue("p" + (s["prof"] + 1) + PSUF[j], p[j]); }
    }

    function prof() {
        return s["profs"][s["prof"]];
    }

    // index des champs propres à la munition choisie
    function pIdx(key) {
        if (key.equals("v0")) { return 1; }
        if (key.equals("bc")) { return 2; }
        if (key.equals("g")) { return 3; }
        if (key.equals("zero")) { return 4; }
        if (key.equals("sight")) { return 5; }
        return -1;
    }

    function get(key) {
        if (key.equals("sight") && s["hAll"]) { return s["hCom"]; }
        var i = pIdx(key);
        return i > 0 ? prof()[i] : s[key];
    }

    function set(key, val) {
        var i = pIdx(key);
        if (key.equals("hAll") && val) { s["hCom"] = prof()[5]; }  // on part de la hauteur de la munition en cours
        if (key.equals("sight") && s["hAll"]) { s["hCom"] = val; }
        else if (i > 0) { prof()[i] = val; }
        else { s[key] = val; }
        if (key.equals("lat")) { gpsOk = false; }
        if (s["dTo"] < s["dFrom"]) { s["dTo"] = s["dFrom"]; }
        recompute();
        save();
    }

    // ---------- calcul ----------
    function pressure() {
        pAutoOk = false;
        if (s["pAuto"]) {
            var info = Activity.getActivityInfo();
            if (info != null && info.ambientPressure != null && info.ambientPressure > 50000) {
                pAutoOk = true;
                return info.ambientPressure / 100.0;
            }
        }
        return s["press"].toFloat();
    }

    function recompute() {
        pUsed = pressure();
        var at = Bal.atmo(s["temp"].toFloat(), pUsed);
        var pr = prof();
        var p = [pr[1].toFloat(), pr[2].toFloat(), get("sight").toFloat() / 100.0, at[0], at[1]];
        Bal.useG7(pr[3] == 7);
        var a = Bal.zeroAngle(p, pr[4].toFloat());
        var r = s["dist"] > s["dTo"] ? s["dist"] : s["dTo"];
        if (need > r) { r = need; }
        r = (r / 250 + 1) * 250;  // marge pour les écrans et les changements de distance
        rng = r > TABLE_MAX ? TABLE_MAX : r;
        need = 0;
        tbl = Bal.fly(p, a, rng.toFloat(), TABLE_STEP.toFloat());
        atm = at;
        // Coriolis : dz/dt = 2Ω sin(lat) · vx · t (la traînée freine aussi la dérive), donc z = 2Ω sin(lat) · ∫ t dx
        var ts = tbl[1];
        tI = new [ts.size()];
        tI[0] = 0.0;
        for (var i = 1; i < ts.size(); i++) {
            tI[i] = (ts[i] == null || tI[i - 1] == null) ? null : tI[i - 1] + TABLE_STEP * (ts[i] + ts[i - 1]) / 2.0;
        }
    }

    // ---------- position et cap ----------
    function askGps() {
        var info = Position.getInfo();
        if (info != null && info.position != null && info.accuracy != Position.QUALITY_NOT_AVAILABLE) { setPos(info); }
        Position.enableLocationEvents(Position.LOCATION_ONE_SHOT, method(:onPos));
    }

    function onPos(info) {
        setPos(info);
        WatchUi.requestUpdate();
    }

    function setPos(info) {
        if (info == null || info.position == null) { return; }
        var deg = info.position.toDegrees();
        if (deg[0].abs() < 0.0001 && deg[1].abs() < 0.0001) { return; }  // pas de position (0, 0)
        s["lat"] = deg[0].toFloat();
        gpsOk = true;
        Application.Properties.setValue("lat", s["lat"]);
    }

    // Cap de la montre (boussole) en degrés, ou null
    function heading() {
        var h = null;
        var si = Sensor.getInfo();
        if (si != null && si.heading != null) { h = si.heading; }
        if (h == null) {
            var ai = Activity.getActivityInfo();
            if (ai != null && ai.currentHeading != null) { h = ai.currentHeading; }
        }
        if (h == null) { return null; }
        var d = Math.round(Math.toDegrees(h)).toNumber() % 360;
        return d < 0 ? d + 360 : d;
    }

    // ---------- poste de tir et cible ----------
    // Position GPS actuelle [lat, lon] en degrés, ou null
    function here() {
        var info = Position.getInfo();
        if (info == null || info.position == null || info.accuracy == Position.QUALITY_NOT_AVAILABLE) { return null; }
        var d = info.position.toDegrees();
        if (d[0].abs() < 0.0001 && d[1].abs() < 0.0001) { return null; }
        return d;
    }

    function shooter() {
        if (s["shLat"] != 0.0 || s["shLon"] != 0.0) { return [s["shLat"], s["shLon"]]; }
        return here();
    }

    // Cible mémorisée, sinon projetée depuis le tireur avec l'azimut et la distance
    function target() {
        if (s["tgLat"] != 0.0 || s["tgLon"] != 0.0) { return [s["tgLat"], s["tgLon"]]; }
        var sh = shooter();
        if (sh == null) { return null; }
        var la = Math.toRadians(sh[0]);
        var az = Math.toRadians(s["az"].toFloat());
        var d = s["dist"].toFloat();
        return [sh[0] + Math.toDegrees(d * Math.cos(az) / R_EARTH), sh[1] + Math.toDegrees(d * Math.sin(az) / (R_EARTH * Math.cos(la)))];
    }

    // Distance (m) et azimut (°) de p1 vers p2
    function distAz(p1, p2) {
        var f1 = Math.toRadians(p1[0]);
        var f2 = Math.toRadians(p2[0]);
        var dl = Math.toRadians(p2[1] - p1[1]);
        var df = f2 - f1;
        var x = Math.sin(df / 2) * Math.sin(df / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2);
        var d = 2 * R_EARTH * Math.asin(Math.sqrt(x));
        var b = Math.toDegrees(Math.atan2(Math.sin(dl) * Math.cos(f2), Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl)));
        return [d, (Math.round(b).toNumber() + 360) % 360];
    }

    // « Je suis au poste de tir » / « Je suis à la cible » : renvoie un message
    function markShooter() {
        var p = here();
        if (p == null) { return "pas de position GPS"; }
        return markShooterAt(p);
    }

    function markShooterAt(p) {
        s["shLat"] = p[0].toFloat();
        s["shLon"] = p[1].toFloat();
        s["lat"] = s["shLat"];
        gpsOk = true;
        if (s["tgLat"] != 0.0 || s["tgLon"] != 0.0) { applyTarget(); }
        save();
        recompute();
        return "poste de tir mémorisé";
    }

    function markTarget() {
        var p = here();
        if (p == null) { return "pas de position GPS"; }
        if (s["shLat"] == 0.0 && s["shLon"] == 0.0) { return "mémorisez d'abord le poste de tir"; }
        return markTargetAt(p);
    }

    // cible posée sur la carte : le poste de tir est la position mémorisée, sinon la position GPS actuelle
    function markTargetAt(p) {
        if (s["shLat"] == 0.0 && s["shLon"] == 0.0) {
            var h = here();
            if (h == null) { return "placez d'abord le poste de tir"; }
            s["shLat"] = h[0].toFloat();
            s["shLon"] = h[1].toFloat();
        }
        s["tgLat"] = p[0].toFloat();
        s["tgLon"] = p[1].toFloat();
        applyTarget();
        save();
        recompute();
        return "cible à " + s["dist"] + " m, azimut " + s["az"] + "°";
    }

    function applyTarget() {
        var r = distAz([s["shLat"], s["shLon"]], [s["tgLat"], s["tgLon"]]);
        var d = Math.round(r[0]).toNumber();
        s["dist"] = d < 10 ? 10 : (d > TABLE_MAX ? TABLE_MAX : d);
        s["az"] = r[1];
    }

    function clearTarget() {
        s["tgLat"] = 0.0;
        s["tgLon"] = 0.0;
        s["shLat"] = 0.0;
        s["shLon"] = 0.0;
        save();
    }

    // ---------- météo ----------
    // Conditions Garmin (téléphone) : [température °C, vent km/h, d'où vient le vent (°), humidité %] ou null
    function garminWeather() {
        if (!(Toybox has :Weather)) { return null; }
        var c = Weather.getCurrentConditions();
        if (c == null) { return null; }
        return [c.temperature, c.windSpeed == null ? null : c.windSpeed * 3.6, c.windBearing, c.relativeHumidity];
    }

    function applyWeather() {
        var w = garminWeather();
        if (w == null) { return "météo Garmin indisponible"; }
        if (w[0] != null) { s["temp"] = Math.round(w[0]).toNumber(); }
        if (w[1] != null) { s["ws"] = Math.round(w[1]).toNumber(); }
        if (w[2] != null) {
            var rel = ((w[2].toNumber() - s["az"]) % 360 + 360) % 360;
            var c = Math.round(rel / 30.0).toNumber() % 12;
            s["wc"] = c == 0 ? 12 : c;
        }
        save();
        recompute();
        return "météo appliquée";
    }

    // Température du capteur de la montre (faussée par le poignet), altitude (m)
    function sensorTemp() {
        var si = Sensor.getInfo();
        return si != null ? si.temperature : null;
    }

    function altitude() {
        var ai = Activity.getActivityInfo();
        if (ai != null && ai.altitude != null) { return ai.altitude; }
        var pi = Position.getInfo();
        return pi != null ? pi.altitude : null;
    }

    // Dérive due au vent seul à d mètres (m, + = vers la gauche si le vent vient de droite)
    function windDrift(d) {
        var i = d / TABLE_STEP;
        var ts = tbl[1];
        if (i + 1 >= ts.size() || ts[i] == null || ts[i + 1] == null) { return null; }
        var f = (d - i * TABLE_STEP).toFloat() / TABLE_STEP;
        var t = ts[i] + (ts[i + 1] - ts[i]) * f;
        return windCross() * (t - d.toFloat() / prof()[1].toFloat());
    }

    // Vent traversier (m/s, + = venant de droite) et de face (+ = de face)
    function windCross() {
        return s["ws"].toFloat() / 3.6 * Math.sin(s["wc"] * Math.PI / 6.0);
    }

    function windHead() {
        return s["ws"].toFloat() / 3.6 * Math.cos(s["wc"] * Math.PI / 6.0);
    }

    // Recalcule si la pression du baromètre a bougé
    function refreshPressure() {
        if (s["pAuto"] && (pressure() - pUsed).abs() >= 1.0) { recompute(); }
    }

    // Solution à d mètres : [élévation, vent (unité de la lunette ; + = haut / droite),
    // clics élévation, clics vent, temps de vol] ou null hors portée
    function sol(d) {
        if (d > rng && rng < TABLE_MAX) {
            need = d;
            recompute();
        }
        var ys = tbl[0];
        var ts = tbl[1];
        var i = d / TABLE_STEP;
        var f = (d - i * TABLE_STEP).toFloat() / TABLE_STEP;
        if (d <= 0 || i >= ys.size() || ys[i] == null) { return null; }
        var y = ys[i];
        var t = ts[i];
        var ti = tI[i];
        if (f > 0) {
            if (i + 1 >= ys.size() || ys[i + 1] == null) { return null; }
            y = y + (ys[i + 1] - y) * f;
            t = t + (ts[i + 1] - t) * f;
            ti = ti + (tI[i + 1] - ti) * f;
        }
        var df = d.toFloat();
        var e = -y / df * 1000.0;
        // vent traversier (formule du retard : dérive = Vt × (t − d / V0)), + = vers la gauche si le vent vient de droite
        var w = windCross() * (t - df / prof()[1].toFloat()) / df * 1000.0;
        if (s["corOn"]) {
            // dérive vers la droite dans l'hémisphère nord, et vers le haut en tirant vers l'est (Eötvös) : on corrige à l'opposé
            var lat = Math.toRadians(s["lat"].toFloat());
            var az = Math.toRadians(s["az"].toFloat());
            w -= 2.0 * OMEGA * Math.sin(lat) * ti / df * 1000.0;
            e -= 2.0 * OMEGA * Math.cos(lat) * Math.sin(az) * ti / df * 1000.0;
        }
        if (s["moa"]) {
            e = e * 3.43775;
            w = w * 3.43775;
        }
        var c = s["click"].toFloat();
        return [e, w, Math.round(e / c).toNumber(), Math.round(w / c).toNumber(), t];
    }

    // ---------- textes ----------
    function unit() {
        return s["moa"] ? "MOA" : "mil";
    }

    function clockTxt(h) {
        if (h == 12) { return "12 h (de face)"; }
        if (h == 6) { return "6 h (de dos)"; }
        if (h == 3) { return "3 h (de droite)"; }
        if (h == 9) { return "9 h (de gauche)"; }
        return "" + h + " h (de " + (h < 6 ? "droite" : "gauche") + ")";
    }

    function fmt(key, v) {
        if (key.equals("prof")) { return prof()[0]; }
        if (key.equals("ws")) { return "" + v + " km/h"; }
        if (key.equals("wc")) { return clockTxt(v); }
        if (key.equals("temp")) { return "" + v + " °C"; }
        if (key.equals("pAuto")) {
            if (!v) { return "non (manuelle)"; }
            return pAutoOk ? "oui · " + pUsed.format("%.0f") + " hPa" : "oui (baromètre indisponible)";
        }
        if (key.equals("press")) { return "" + v + " hPa"; }
        if (key.equals("zero")) { return "" + v + " m"; }
        if (key.equals("sight")) { return v.format("%.1f") + " cm"; }
        if (key.equals("moa")) { return v ? "MOA" : "MRAD"; }
        if (key.equals("click")) { return v.format(v < 0.1 || s["moa"] ? "%.3f" : "%.2f") + (s["moa"] ? " MOA" : " MRAD"); }
        if (key.equals("step") || key.equals("dFrom") || key.equals("dTo") || key.equals("dStep")) { return "" + v + " m"; }
        if (key.equals("v0")) { return "" + v + " m/s"; }
        if (key.equals("bc")) { return v.format("%.3f") + (prof()[3] == 7 ? " (G7)" : " (G1)"); }
        if (key.equals("g")) { return v == 7 ? "G7" : "G1"; }
        if (key.equals("corOn")) { return v ? "oui" : "non"; }
        if (key.equals("hAll")) { return v ? "oui : " + s["hCom"].format("%.1f") + " cm" : "non, par munition"; }
        if (key.equals("gpsAuto")) { return v ? (gpsOk ? "oui (position reçue)" : "oui (recherche...)") : "non"; }
        if (key.equals("lat")) { return v.abs().format("%.2f") + (v < 0 ? "° S" : "° N") + (gpsOk ? " (GPS)" : ""); }
        if (key.equals("az")) { return "" + v + "° (" + azTxt(v) + ")"; }
        if (key.equals("azSens")) { var h = heading(); return h == null ? "boussole indisponible" : "cap actuel " + h + "°"; }
        return v.toString();
    }

    function azTxt(v) {
        var n = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
        return n[((v + 22) / 45) % 8];
    }

    function label(key) {
        if (key.equals("azSens")) { return fmt(key, null); }
        return fmt(key, get(key));
    }

    // [titre, min, max, pas, décimales] pour l'éditeur numérique
    function spec(key) {
        if (key.equals("ws")) { return ["Vent (km/h)", 0, 60, 1, 0]; }
        if (key.equals("wc")) { return ["Vent : d'où il vient", 1, 12, 1, 0]; }
        if (key.equals("temp")) { return ["Température", -25, 50, 1, 0]; }
        if (key.equals("press")) { return ["Pression", 700, 1100, 1, 0]; }
        if (key.equals("zero")) { return ["Distance de zéro", 10, 300, 5, 0]; }
        if (key.equals("sight")) { return ["Haut. lunette / canon", 1.0, 15.0, 0.1, 1]; }
        if (key.equals("dFrom")) { return ["Table : de", 10, TABLE_MAX, 25, 0]; }
        if (key.equals("dTo")) { return ["Table : à", 10, TABLE_MAX, 25, 0]; }
        if (key.equals("dStep")) { return ["Table : pas", 5, 250, 5, 0]; }
        if (key.equals("v0")) { return ["V0 (m/s)", 150, 1200, 1, 0]; }
        if (key.equals("lat")) { return ["Latitude (°)", -90.0, 90.0, 0.1, 1]; }
        if (key.equals("az")) { return ["Azimut de tir (°)", 0, 355, 5, 0]; }
        if (key.equals("bc")) { return ["CB " + (prof()[3] == 7 ? "G7" : "G1"), 0.03, 1.2, 0.001, 3]; }
        return null;
    }
}

function app() {
    return Application.getApp();
}
