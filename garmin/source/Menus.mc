import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.System;
import Toybox.WatchUi;

const MENU_KEYS = ["prof", "v0", "bc", "g", "zero", "sight", "moa", "click", "ws", "wc", "corOn", "azSens", "az", "gpsAuto", "lat", "temp", "pAuto", "press", "step", "dFrom", "dTo", "dStep"];
const MENU_NAMES = ["Munition", "V0 munition", "CB munition", "Modèle G1 / G7", "Zéro munition", "Haut. lunette / canon", "Unité MRAD / MOA", "Valeur du clic", "Vent (vitesse)", "Vent (direction)", "Coriolis", "Viser la cible : prendre le cap", "Azimut de tir", "Latitude par GPS", "Latitude", "Température", "Pression auto", "Pression manuelle", "Pas de distance", "Table : de", "Table : à", "Table : pas"];

function openMenu() {
    var a = app();
    var m = new WatchUi.Menu2({:title => "Réglages"});
    for (var i = 0; i < MENU_KEYS.size(); i++) {
        m.addItem(new WatchUi.MenuItem(MENU_NAMES[i], a.label(MENU_KEYS[i]), MENU_KEYS[i], null));
    }
    WatchUi.pushView(m, new MenuDelegate(m), WatchUi.SLIDE_UP);
}

// Choix dans une liste fixe : la valeur suivante à chaque appui
function nextIn(list, v) {
    for (var i = 0; i < list.size(); i++) {
        if ((list[i] - v).abs() < 0.0001) { return list[(i + 1) % list.size()]; }
    }
    return list[0];
}

class MenuDelegate extends WatchUi.Menu2InputDelegate {

    var menu;

    function initialize(m) {
        Menu2InputDelegate.initialize();
        menu = m;
    }

    // Les libellés dépendent les uns des autres (munition → V0/CB, unité → clic…)
    function refresh() {
        var a = app();
        for (var i = 0; i < MENU_KEYS.size(); i++) {
            var it = menu.getItem(i);
            if (it != null) { it.setSubLabel(a.label(MENU_KEYS[i])); }
        }
        WatchUi.requestUpdate();
    }

    function onSelect(item) {
        var a = app();
        var s = a.s;
        var key = item.getId();
        if (key.equals("prof")) {
            var m = new WatchUi.Menu2({:title => "Munition"});
            for (var i = 0; i < s["profs"].size(); i++) {
                var p = s["profs"][i];
                m.addItem(new WatchUi.MenuItem(p[0], "" + p[1] + " m/s · " + (p[3] == 7 ? "G7 " : "G1 ") + p[2].format("%.3f") + " · zéro " + p[4] + " m", i, null));
            }
            WatchUi.pushView(m, new ProfDelegate(self), WatchUi.SLIDE_LEFT);
        } else if (key.equals("g")) {
            a.set("g", a.get("g") == 7 ? 1 : 7);
            refresh();
        } else if (key.equals("corOn") || key.equals("gpsAuto")) {
            a.set(key, !s[key]);
            if (key.equals("gpsAuto") && s["gpsAuto"]) { a.askGps(); }
            refresh();
        } else if (key.equals("azSens")) {
            var h = a.heading();
            if (h != null) { a.set("az", h); }
            refresh();
        } else if (key.equals("pAuto")) {
            a.set("pAuto", !s["pAuto"]);
            refresh();
        } else if (key.equals("moa")) {
            s["moa"] = !s["moa"];
            a.set("click", s["moa"] ? 0.25 : 0.1);
            refresh();
        } else if (key.equals("click")) {
            a.set("click", nextIn(s["moa"] ? [0.25, 0.125, 0.5, 1.0] : [0.1, 0.05, 0.2], s["click"]));
            refresh();
        } else if (key.equals("step")) {
            a.set("step", nextIn([5, 10, 25, 1], s["step"]));
            refresh();
        } else {
            var v = new NumberView(key);
            WatchUi.pushView(v, new NumberDelegate(v, self), WatchUi.SLIDE_LEFT);
        }
    }
}

class ProfDelegate extends WatchUi.Menu2InputDelegate {

    var parent;

    function initialize(p) {
        Menu2InputDelegate.initialize();
        parent = p;
    }

    function onSelect(item) {
        app().set("prof", item.getId());
        parent.refresh();
        WatchUi.popView(WatchUi.SLIDE_RIGHT);
    }
}

// Éditeur numérique : haut / bas pour changer, Start pour valider, Retour pour annuler
class NumberView extends WatchUi.View {

    var key;
    var sp;
    var val;

    function initialize(k) {
        View.initialize();
        key = k;
        sp = app().spec(k);
        val = app().get(k).toFloat();
    }

    function change(dir) {
        val += dir * sp[3];
        if (val < sp[1]) { val = sp[1].toFloat(); }
        if (val > sp[2]) { val = sp[2].toFloat(); }
        // arrondi au pas pour éviter les 0.16699999
        var q = Math.pow(10, sp[4]);
        val = Math.round(val * q) / q;
        WatchUi.requestUpdate();
    }

    function value() {
        if (sp[4] == 0) { return Math.round(val).toNumber(); }
        return val.toFloat();
    }

    function onUpdate(dc) {
        var w = dc.getWidth();
        var h = dc.getHeight();
        var cx = w / 2;
        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
        dc.clear();
        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, h * 0.18, Graphics.FONT_SMALL, sp[0], CJ);
        dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
        tri(dc, cx, h * 0.33, 14, 0);
        tri(dc, cx, h * 0.69, 14, 1);
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, h * 0.51, Graphics.FONT_NUMBER_MEDIUM, val.format("%." + sp[4] + "f"), CJ);
        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, h * 0.80, Graphics.FONT_XTINY, app().fmt(key, value()), CJ);
        dc.drawText(cx, h * 0.88, Graphics.FONT_XTINY, "START = valider", CJ);
    }
}

class NumberDelegate extends WatchUi.BehaviorDelegate {

    var v;
    var parent;

    function initialize(view, p) {
        BehaviorDelegate.initialize();
        v = view;
        parent = p;
    }

    function onPreviousPage() {
        v.change(1);
        return true;
    }

    function onNextPage() {
        v.change(-1);
        return true;
    }

    function onTap(evt) {
        var y = evt.getCoordinates()[1];
        var h = System.getDeviceSettings().screenHeight;
        if (y < h * 0.42) { v.change(1); }
        else if (y > h * 0.60) { v.change(-1); }
        else { onSelect(); }
        return true;
    }

    function onSelect() {
        app().set(v.key, v.value());
        parent.refresh();
        WatchUi.popView(WatchUi.SLIDE_RIGHT);
        return true;
    }
}
