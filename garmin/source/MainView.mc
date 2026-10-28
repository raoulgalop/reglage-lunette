import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.System;
import Toybox.Timer;
import Toybox.WatchUi;

const CJ = Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER;

// Petit triangle plein : dir = 0 haut, 1 bas, 2 gauche, 3 droite
function tri(dc, x, y, r, dir) {
    if (dir == 0) { dc.fillPolygon([[x, y - r], [x - r, y + r], [x + r, y + r]]); }
    else if (dir == 1) { dc.fillPolygon([[x, y + r], [x - r, y - r], [x + r, y - r]]); }
    else if (dir == 2) { dc.fillPolygon([[x - r, y], [x + r, y - r], [x + r, y + r]]); }
    else { dc.fillPolygon([[x + r, y], [x - r, y - r], [x - r, y + r]]); }
}

// Texte centré en x précédé d'une flèche (dir comme tri)
function arrowTxt(dc, x, y, txt, dir) {
    var f = Graphics.FONT_SMALL;
    var r = 8;
    var tw = dc.getTextWidthInPixels(txt, f);
    var x0 = x - (tw + 2 * r + 6) / 2;
    tri(dc, x0 + r, y, r, dir);
    dc.drawText(x0 + 2 * r + 6, y, f, txt, Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
}

function fmtA(v) {
    return v.abs().format(v.abs() < 10 ? "%.2f" : "%.1f");
}

// Écrans : 0 principal, 1 vent, 2 boussole, 3 météo, 4 trajectoire, 5 table DOPE, 6 carte
const PAGES = 7;
const PAGE_NAMES = ["", "VENT", "BOUSSOLE", "MÉTÉO", "TRAJECTOIRE", "", "CARTE"];
var HOST = null;

// Message bref affiché au milieu de l'écran (retour d'une action), pendant 2 s
var TOAST = null;
var TOAST_T = 0;

function toast(txt) {
    TOAST = txt;
    TOAST_T = System.getTimer();
    WatchUi.requestUpdate();
}

function drawToast(dc) {
    if (TOAST == null) { return; }
    if (System.getTimer() - TOAST_T > 2000) { TOAST = null; return; }
    var w = dc.getWidth();
    var tw = dc.getTextWidthInPixels(TOAST, Graphics.FONT_SMALL) + 24;
    if (tw > w * 0.9) { tw = w * 0.9; }
    var th = Graphics.getFontHeight(Graphics.FONT_SMALL) + 10;
    dc.setColor(0x333333, 0x333333);
    dc.fillRoundedRectangle((w - tw) / 2, dc.getHeight() / 2 - th / 2, tw, th, 10);
    dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
    dc.drawText(w / 2, dc.getHeight() / 2, Graphics.FONT_SMALL, TOAST, CJ);
}

// Points de position dans le carrousel d'écrans, sur le bord droit
function pageDots(dc, page) {
    var w = dc.getWidth();
    var h = dc.getHeight();
    var n = WatchUi has :MapView ? PAGES : PAGES - 1;
    for (var i = 0; i < n; i++) {
        var ang = Math.toRadians(-15 + 30.0 * i / (n - 1));
        var x = w / 2 + (w / 2 - 9) * Math.cos(ang);
        var y = h / 2 + (h / 2 - 9) * Math.sin(ang);
        dc.setColor(i == page ? Graphics.COLOR_WHITE : Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.fillCircle(x, y, i == page ? 5 : 3);
    }
}

function hint(dc, txt) {
    dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
    dc.drawText(dc.getWidth() / 2, dc.getHeight() * 0.915, Graphics.FONT_XTINY, txt, CJ);
}

function title(dc, txt) {
    dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
    dc.drawText(dc.getWidth() / 2, dc.getHeight() * 0.09, Graphics.FONT_XTINY, txt, CJ);
}

// Hôte des écrans 0 à 4 (la table et la carte sont des vues à part)
class MainView extends WatchUi.View {

    var page = 0;
    var timer = null;

    function initialize() {
        View.initialize();
        HOST = self;
    }

    function onShow() {
        app().refreshPressure();
        timer = new Timer.Timer();
        timer.start(method(:tick), 1000, true);
    }

    function onHide() {
        if (timer != null) { timer.stop(); }
        timer = null;
    }

    // Boussole et météo bougent : rafraîchir chaque seconde
    function tick() {
        if (page == 2 || page == 3 || TOAST != null) { WatchUi.requestUpdate(); }
    }

    function onUpdate(dc) {
        var a = app();
        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
        dc.clear();
        if (page == 1) { drawWind(dc, a); }
        else if (page == 2) { drawCompass(dc, a); }
        else if (page == 3) { drawMeteo(dc, a); }
        else if (page == 4) { drawTraj(dc, a); }
        else { drawMain(dc, a); }
        pageDots(dc, page);
        drawToast(dc);
    }

    // Écran suivant (bouton Start)
    function next() {
        goTo(page + 1);
    }

    function goTo(p) {
        if (p == 6 && !(WatchUi has :MapView)) { p = 0; }
        if (p >= PAGES) { p = 0; }
        page = p;
        if (p == 5) {
            var v = new DopeView();
            WatchUi.pushView(v, new DopeDelegate(v), WatchUi.SLIDE_LEFT);
        } else if (p == 6) {
            WatchUi.pushView(new MapPage(), new MapDelegate(), WatchUi.SLIDE_LEFT);
        }
        WatchUi.requestUpdate();
    }

    function drawMain(dc, a) {
        var s = a.s;
        var w = dc.getWidth();
        var h = dc.getHeight();
        var cx = w / 2;
        var d = s["dist"];
        var r = a.sol(d);

        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, h * 0.11, Graphics.FONT_XTINY, a.prof()[0], CJ);

        // distance
        var dTxt = d.toString();
        var fw = dc.getTextWidthInPixels(dTxt, Graphics.FONT_NUMBER_MEDIUM);
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, h * 0.25, Graphics.FONT_NUMBER_MEDIUM, dTxt, CJ);
        dc.drawText(cx + fw / 2 + 6, h * 0.28, Graphics.FONT_SMALL, "m", Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
        dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
        tri(dc, cx - fw / 2 - 22, h * 0.21, 8, 0);
        tri(dc, cx - fw / 2 - 22, h * 0.29, 8, 1);

        dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawLine(w * 0.12, h * 0.37, w * 0.88, h * 0.37);
        dc.drawLine(cx, h * 0.40, cx, h * 0.76);

        var lx = cx - w * 0.21;
        var rx = cx + w * 0.21;
        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(lx, h * 0.43, Graphics.FONT_XTINY, "ÉLÉVATION", CJ);
        dc.drawText(rx, h * 0.43, Graphics.FONT_XTINY, "VENT", CJ);

        if (r == null) {
            dc.setColor(Graphics.COLOR_RED, Graphics.COLOR_TRANSPARENT);
            dc.drawText(cx, h * 0.58, Graphics.FONT_SMALL, "hors portée", CJ);
        } else {
            // élévation
            var ec = r[2];
            dc.setColor(Graphics.COLOR_GREEN, Graphics.COLOR_TRANSPARENT);
            dc.drawText(lx, h * 0.56, Graphics.FONT_NUMBER_HOT, ec.abs().toString(), CJ);
            if (ec == 0) {
                dc.drawText(lx, h * 0.69, Graphics.FONT_SMALL, "OK", CJ);
            } else {
                arrowTxt(dc, lx, h * 0.69, ec > 0 ? "HAUT" : "BAS", ec > 0 ? 0 : 1);
            }
            // vent
            var wcl = r[3];
            dc.setColor(s["ws"] > 0 || s["corOn"] ? Graphics.COLOR_YELLOW : Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(rx, h * 0.56, Graphics.FONT_NUMBER_HOT, wcl.abs().toString(), CJ);
            if (wcl == 0) {
                dc.drawText(rx, h * 0.69, Graphics.FONT_SMALL, "OK", CJ);
            } else {
                arrowTxt(dc, rx, h * 0.69, wcl > 0 ? "DROITE" : "GAUCHE", wcl > 0 ? 3 : 2);
            }
            dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(lx, h * 0.78, Graphics.FONT_XTINY, fmtA(r[0]) + " " + a.unit(), CJ);
            dc.drawText(rx, h * 0.78, Graphics.FONT_XTINY, fmtA(r[1]) + " " + a.unit(), CJ);
        }

        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        var wTxt = s["ws"] > 0 ? "Vent " + s["ws"] + " km/h à " + s["wc"] + " h" : "Sans vent";
        if (s["corOn"]) { wTxt = wTxt + " · Coriolis"; }
        dc.drawText(cx, h * 0.87, Graphics.FONT_XTINY, wTxt, CJ);
    }
}

class MainDelegate extends WatchUi.BehaviorDelegate {

    function initialize() {
        BehaviorDelegate.initialize();
    }

    function change(dir) {
        var s = app().s;
        var d = s["dist"] + dir * s["step"];
        // se recaler sur un multiple du pas
        d = (d / s["step"]) * s["step"];
        if (d < 10) { d = 10; }
        if (d > TABLE_MAX) { d = TABLE_MAX; }
        s["dist"] = d;
        WatchUi.requestUpdate();
    }

    // Haut / Bas : action propre à chaque écran
    function upDown(dir) {
        var a = app();
        var s = a.s;
        var p = HOST.page;
        if (p == 1) {
            var v = s["ws"] + dir;
            a.set("ws", v < 0 ? 0 : (v > 60 ? 60 : v));
        } else if (p == 2) {
            if (dir > 0) {
                var hd = a.heading();
                if (hd == null) { toast("boussole indisponible"); }
                else { a.set("az", hd); toast("azimut " + hd + "°"); }
            } else {
                a.set("corOn", !s["corOn"]);
                toast(s["corOn"] ? "Coriolis activé" : "Coriolis désactivé");
            }
        } else if (p == 3) {
            if (dir > 0) { toast(a.applyWeather()); }
            else { a.set("pAuto", !s["pAuto"]); toast(s["pAuto"] ? "pression du baromètre" : "pression manuelle"); }
        } else {
            change(dir);
            return;
        }
        WatchUi.requestUpdate();
    }

    function onPreviousPage() {  // bouton haut
        upDown(1);
        return true;
    }

    function onNextPage() {  // bouton bas
        upDown(-1);
        return true;
    }

    function onSelect() {  // bouton Start : écran suivant
        HOST.next();
        return true;
    }

    function onTap(evt) {
        var y = evt.getCoordinates()[1];
        var h = System.getDeviceSettings().screenHeight;
        if (y < h * 0.36) { upDown(1); }
        else if (y > h * 0.82) { openMenu(); }
        else { onSelect(); }
        return true;
    }

    function onMenu() {  // appui long sur haut
        openMenu();
        return true;
    }

    function onBack() {
        if (HOST.page > 0) {
            HOST.page -= 1;
            WatchUi.requestUpdate();
            return true;
        }
        app().save();
        return false;
    }
}
