import Toybox.Graphics;
import Toybox.Lang;
import Toybox.System;
import Toybox.WatchUi;

const CJ = Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER;

// Petit triangle plein : dir = 0 haut, 1 bas, 2 gauche, 3 droite
function tri(dc, x, y, r, dir) {
    if (dir == 0) { dc.fillPolygon([[x, y - r], [x - r, y + r], [x + r, y + r]]); }
    else if (dir == 1) { dc.fillPolygon([[x, y + r], [x - r, y - r], [x + r, y - r]]); }
    else if (dir == 2) { dc.fillPolygon([[x - r, y], [x + r, y - r], [x + r, y + r]]); }
    else { dc.fillPolygon([[x + r, y], [x - r, y - r], [x - r, y + r]]); }
}

function fmtA(v) {
    return v.abs().format(v.abs() < 10 ? "%.2f" : "%.1f");
}

// Écran principal : distance → clics d'élévation et de vent
class MainView extends WatchUi.View {

    function initialize() {
        View.initialize();
    }

    function onShow() {
        app().refreshPressure();
    }

    function onUpdate(dc) {
        var a = app();
        var s = a.s;
        var w = dc.getWidth();
        var h = dc.getHeight();
        var cx = w / 2;
        var d = s["dist"];
        var r = a.sol(d);

        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
        dc.clear();

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
                tri(dc, lx - w * 0.08, h * 0.69, 9, ec > 0 ? 0 : 1);
                dc.drawText(lx + w * 0.03, h * 0.69, Graphics.FONT_SMALL, ec > 0 ? "HAUT" : "BAS", CJ);
            }
            // vent
            var wcl = r[3];
            dc.setColor(s["ws"] > 0 ? Graphics.COLOR_YELLOW : Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(rx, h * 0.56, Graphics.FONT_NUMBER_HOT, wcl.abs().toString(), CJ);
            if (wcl == 0) {
                dc.drawText(rx, h * 0.69, Graphics.FONT_SMALL, "OK", CJ);
            } else if (wcl > 0) {
                tri(dc, rx + w * 0.11, h * 0.69, 9, 3);
                dc.drawText(rx - w * 0.02, h * 0.69, Graphics.FONT_SMALL, "DROITE", CJ);
            } else {
                tri(dc, rx - w * 0.12, h * 0.69, 9, 2);
                dc.drawText(rx + w * 0.02, h * 0.69, Graphics.FONT_SMALL, "GAUCHE", CJ);
            }
            dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(lx, h * 0.78, Graphics.FONT_XTINY, fmtA(r[0]) + " " + a.unit(), CJ);
            dc.drawText(rx, h * 0.78, Graphics.FONT_XTINY, fmtA(r[1]) + " " + a.unit(), CJ);
        }

        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        var wTxt = s["ws"] > 0 ? "Vent " + s["ws"] + " km/h à " + s["wc"] + " h" : "Sans vent";
        dc.drawText(cx, h * 0.88, Graphics.FONT_XTINY, wTxt, CJ);
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

    function onPreviousPage() {  // bouton haut
        change(1);
        return true;
    }

    function onNextPage() {  // bouton bas
        change(-1);
        return true;
    }

    function onSelect() {  // bouton Start : table DOPE
        var v = new DopeView();
        WatchUi.pushView(v, new DopeDelegate(v), WatchUi.SLIDE_LEFT);
        return true;
    }

    function onTap(evt) {
        var y = evt.getCoordinates()[1];
        var h = System.getDeviceSettings().screenHeight;
        if (y < h * 0.36) { change(1); }
        else if (y > h * 0.82) { openMenu(); }
        else { onSelect(); }
        return true;
    }

    function onMenu() {  // appui long sur haut
        openMenu();
        return true;
    }

    function onBack() {
        app().save();
        return false;
    }
}
