import Toybox.Application;
import Toybox.Activity;
import Toybox.Lang;
import Toybox.Math;
import Toybox.Position;
import Toybox.Sensor;
import Toybox.WatchUi;

const TABLE_MAX = 600;  // portée maximale calculée (m)
const TABLE_STEP = 5;   // pas de la trajectoire stockée (m)
const N_PROFS = 20;     // munitions (voir tools/gen_settings.py)
const OMEGA = 7.292115e-5;  // rotation de la Terre (rad/s)

// Réglages communs, lus et écrits dans Application.Properties (modifiables aussi depuis Connect IQ sur le téléphone)
const KEYS = ["prof", "moa", "click", "dist", "step", "dFrom", "dTo", "dStep", "ws", "wc", "temp", "pAuto", "press", "corOn", "gpsAuto", "lat", "az"];
// Champs de chaque munition : p<n><suffixe>
const PSUF = ["n", "v", "b", "g", "z", "h"];

class BalApp extends Application.AppBase {

    var s;          // réglages (copie des Properties)
    var tbl;        // [ys, ts] tous les TABLE_STEP mètres
    var tI;         // intégrale du temps de vol sur la distance (m·s), pour Coriolis
    var gpsOk = false;   // latitude venue du GPS
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
        var i = pIdx(key);
        return i > 0 ? prof()[i] : s[key];
    }

    function set(key, val) {
        var i = pIdx(key);
        if (i > 0) { prof()[i] = val; }
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
        var p = [pr[1].toFloat(), pr[2].toFloat(), pr[5].toFloat() / 100.0, at[0], at[1]];
        Bal.useG7(pr[3] == 7);
        var a = Bal.zeroAngle(p, pr[4].toFloat());
        tbl = Bal.fly(p, a, TABLE_MAX.toFloat(), TABLE_STEP.toFloat());
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

    // Recalcule si la pression du baromètre a bougé
    function refreshPressure() {
        if (s["pAuto"] && (pressure() - pUsed).abs() >= 1.0) { recompute(); }
    }

    // Solution à d mètres : [élévation, vent (unité de la lunette ; + = haut / droite),
    // clics élévation, clics vent, temps de vol] ou null hors portée
    function sol(d) {
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
        var wc = s["ws"].toFloat() / 3.6 * Math.sin(s["wc"] * Math.PI / 6.0);
        var w = wc * (t - df / prof()[1].toFloat()) / df * 1000.0;
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
        if (key.equals("gpsAuto")) { return v ? (gpsOk ? "oui (position reçue)" : "oui (recherche…)") : "non"; }
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
        if (key.equals("dFrom")) { return ["Table : de", 10, TABLE_MAX, 5, 0]; }
        if (key.equals("dTo")) { return ["Table : à", 10, TABLE_MAX, 5, 0]; }
        if (key.equals("dStep")) { return ["Table : pas", 5, 100, 5, 0]; }
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
