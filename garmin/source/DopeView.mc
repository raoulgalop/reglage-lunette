import Toybox.Graphics;
import Toybox.Lang;
import Toybox.WatchUi;

// Table DOPE : distance, clics d'élévation, élévation, vent (avec le vent réglé)
class DopeView extends WatchUi.View {

    var top = 0;  // première ligne affichée

    function initialize() {
        View.initialize();
    }

    function dists() {
        var s = app().s;
        var l = [];
        var st = s["dStep"] < 5 ? 5 : s["dStep"];
        for (var d = s["dFrom"]; d <= s["dTo"] && l.size() < 80; d += st) { l.add(d); }
        return l;
    }

    function scroll(dir) {
        top += dir;
        var n = dists().size();
        if (top > n - 1) { top = n - 1; }
        if (top < 0) { top = 0; }
        WatchUi.requestUpdate();
    }

    function onUpdate(dc) {
        var a = app();
        var s = a.s;
        var w = dc.getWidth();
        var h = dc.getHeight();
        var cx = w / 2;
        var l = dists();
        var font = Graphics.FONT_TINY;
        var rh = Graphics.getFontHeight(font) + 2;
        var cols = [w * 0.22, w * 0.42, w * 0.61, w * 0.80];

        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
        dc.clear();
        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, h * 0.09, Graphics.FONT_XTINY, a.prof()[0], CJ);
        dc.drawText(cols[0], h * 0.17, Graphics.FONT_XTINY, "m", CJ);
        dc.drawText(cols[1], h * 0.17, Graphics.FONT_XTINY, "clics", CJ);
        dc.drawText(cols[2], h * 0.17, Graphics.FONT_XTINY, a.unit(), CJ);
        dc.drawText(cols[3], h * 0.17, Graphics.FONT_XTINY, "vent", CJ);
        dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawLine(w * 0.12, h * 0.21, w * 0.88, h * 0.21);

        var y = h * 0.21 + rh / 2 + 4;
        var i = top;
        while (i < l.size() && y < h * 0.76) {
            var d = l[i];
            var r = a.sol(d);
            dc.setColor(d == s["dist"] ? Graphics.COLOR_WHITE : Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(cols[0], y, font, d.toString(), CJ);
            if (r == null) {
                dc.drawText(cols[2], y, font, "hors portée", CJ);
            } else {
                dc.setColor(Graphics.COLOR_GREEN, Graphics.COLOR_TRANSPARENT);
                dc.drawText(cols[1], y, font, r[2].toString(), CJ);
                dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
                dc.drawText(cols[2], y, font, r[0].format("%.1f"), CJ);
                dc.setColor(Graphics.COLOR_YELLOW, Graphics.COLOR_TRANSPARENT);
                var wc = r[3];
                dc.drawText(cols[3], y, font, wc == 0 ? "0" : (wc > 0 ? "D" : "G") + wc.abs(), CJ);
            }
            y += rh;
            i += 1;
        }

        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        var info = (s["ws"] > 0 ? "" + s["ws"] + " km/h " + s["wc"] + " h · " : "") + s["temp"] + "°C · " + a.pUsed.format("%.0f") + " hPa";
        dc.drawText(cx, h * 0.82, Graphics.FONT_XTINY, info, CJ);
        pageDots(dc, 5);
        dc.drawText(cx, h * 0.88, Graphics.FONT_XTINY, "zéro " + a.get("zero") + " m · " + a.fmt("bc", a.get("bc")), CJ);
    }
}

class DopeDelegate extends WatchUi.BehaviorDelegate {

    var v;

    function initialize(view) {
        BehaviorDelegate.initialize();
        v = view;
    }

    function onPreviousPage() {
        v.scroll(-1);
        return true;
    }

    function onNextPage() {
        v.scroll(1);
        return true;
    }

    function onSelect() {  // écran suivant : la carte, sinon retour au principal
        if (WatchUi has :MapView) {
            HOST.page = 6;
            WatchUi.switchToView(new MapPage(), new MapDelegate(), WatchUi.SLIDE_LEFT);
        } else {
            HOST.page = 0;
            WatchUi.popView(WatchUi.SLIDE_LEFT);
        }
        return true;
    }

    function onBack() {
        HOST.page = 4;
        WatchUi.popView(WatchUi.SLIDE_RIGHT);
        return true;
    }

    function onMenu() {
        openMenu();
        return true;
    }
}
