import Toybox.Application;
import Toybox.Activity;
import Toybox.Lang;
import Toybox.Math;
import Toybox.WatchUi;

const TABLE_MAX = 400;  // portée maximale calculée (m)
const TABLE_STEP = 5;   // pas de la trajectoire stockée (m)

class BalApp extends Application.AppBase {

    var s;          // réglages (enregistrés dans Storage)
    var tbl;        // [ys, ts] tous les TABLE_STEP mètres
    var pUsed = 1013.0;  // pression utilisée pour le dernier calcul (hPa)
    var pAutoOk = false; // baromètre de la montre disponible

    function initialize() {
        AppBase.initialize();
    }

    function onStart(state) {
        load();
        recompute();
    }

    function onStop(state) {
        save();
    }

    function getInitialView() {
        return [new MainView(), new MainDelegate()];
    }

    // ---------- réglages ----------
    function defaults() {
        return {
            "prof" => 0, "dist" => 100, "step" => 5,
            "ws" => 0, "wc" => 3, "temp" => 15,
            "pAuto" => true, "press" => 1013,
            "zero" => 50, "sight" => 5.0, "moa" => false, "click" => 0.1,
            "dFrom" => 100, "dTo" => 300, "dStep" => 25,
            "profs" => [
                ["SK Standard Plus", 327, 0.167],
                ["SK Rifle Match", 327, 0.167],
                ["SK Long Range Match", 335, 0.155],
                ["SK High Velocity Match", 385, 0.192],
                ["Lapua Center-X", 327, 0.172],
                ["Lapua Midas+", 327, 0.172],
                ["Lapua X-Act", 327, 0.172],
                ["Top Shot SV Target", 326, 0.167],
                ["Geco Semi Auto", 350, 0.151],
                ["RWS R50", 330, 0.136],
                ["CCI Standard Velocity", 326, 0.120],
                ["Perso 1", 330, 0.150],
                ["Perso 2", 330, 0.150]
            ]
        };
    }

    function load() {
        s = defaults();
        var st = Application.Storage.getValue("s");
        if (st instanceof Dictionary) {
            var keys = s.keys();
            for (var i = 0; i < keys.size(); i++) {
                if (st.hasKey(keys[i]) && st[keys[i]] != null) { s[keys[i]] = st[keys[i]]; }
            }
        }
        if (s["prof"] >= s["profs"].size()) { s["prof"] = 0; }
    }

    function save() {
        Application.Storage.setValue("s", s);
    }

    function prof() {
        return s["profs"][s["prof"]];
    }

    function get(key) {
        if (key.equals("v0")) { return prof()[1]; }
        if (key.equals("bc")) { return prof()[2]; }
        return s[key];
    }

    function set(key, val) {
        if (key.equals("v0")) { prof()[1] = val; }
        else if (key.equals("bc")) { prof()[2] = val; }
        else { s[key] = val; }
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
        var p = [prof()[1].toFloat(), prof()[2].toFloat(), s["sight"].toFloat() / 100.0, at[0], at[1]];
        var a = Bal.zeroAngle(p, s["zero"].toFloat());
        tbl = Bal.fly(p, a, TABLE_MAX.toFloat(), TABLE_STEP.toFloat());
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
        if (f > 0) {
            if (i + 1 >= ys.size() || ys[i + 1] == null) { return null; }
            y = y + (ys[i + 1] - y) * f;
            t = t + (ts[i + 1] - t) * f;
        }
        var df = d.toFloat();
        var e = -y / df * 1000.0;
        // vent traversier (formule du retard : dérive = Vt × (t − d / V0)), + = vers la gauche si le vent vient de droite
        var wc = s["ws"].toFloat() / 3.6 * Math.sin(s["wc"] * Math.PI / 6.0);
        var w = wc * (t - df / prof()[1].toFloat()) / df * 1000.0;
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
        if (key.equals("bc")) { return v.format("%.3f"); }
        return v.toString();
    }

    function label(key) {
        return fmt(key, get(key));
    }

    // [titre, min, max, pas, décimales] pour l'éditeur numérique
    function spec(key) {
        if (key.equals("ws")) { return ["Vent (km/h)", 0, 60, 1, 0]; }
        if (key.equals("wc")) { return ["Vent : d'où il vient", 1, 12, 1, 0]; }
        if (key.equals("temp")) { return ["Température", -25, 50, 1, 0]; }
        if (key.equals("press")) { return ["Pression", 700, 1100, 1, 0]; }
        if (key.equals("zero")) { return ["Distance de zéro", 10, 300, 5, 0]; }
        if (key.equals("sight")) { return ["Hauteur lunette / canon", 1.0, 15.0, 0.1, 1]; }
        if (key.equals("dFrom")) { return ["Table : de", 10, TABLE_MAX, 5, 0]; }
        if (key.equals("dTo")) { return ["Table : à", 10, TABLE_MAX, 5, 0]; }
        if (key.equals("dStep")) { return ["Table : pas", 5, 100, 5, 0]; }
        if (key.equals("v0")) { return ["V0 (m/s)", 150, 1200, 1, 0]; }
        if (key.equals("bc")) { return ["CB G1", 0.05, 1.0, 0.001, 3]; }
        return null;
    }
}

function app() {
    return Application.getApp();
}
