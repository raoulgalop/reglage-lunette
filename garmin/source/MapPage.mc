import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Position;
import Toybox.System;
import Toybox.WatchUi;

var MAP = null;

function loc(p) {
    return new Position.Location({:latitude => p[0], :longitude => p[1], :format => :degrees});
}

// Carte de la montre : poste de tir, cible et ligne de tir
class MapPage extends WatchUi.MapView {

    function initialize() {
        MapView.initialize();
        MAP = self;
        setMapMode(WatchUi.MAP_MODE_PREVIEW);
        var ds = System.getDeviceSettings();
        setScreenVisibleArea(0, (ds.screenHeight * 0.18).toNumber(), ds.screenWidth, (ds.screenHeight * 0.80).toNumber());
        refresh();
    }

    function onShow() {
        Position.enableLocationEvents(Position.LOCATION_CONTINUOUS, method(:onPos));
    }

    function onHide() {
        Position.enableLocationEvents(Position.LOCATION_DISABLE, method(:onPos));
    }

    function onPos(info) {
        refresh();
        WatchUi.requestUpdate();
    }

    function refresh() {
        var a = app();
        var sh = a.shooter();
        var tg = a.target();
        clear();
        if (sh == null) { return; }
        var markers = [];
        var m = new WatchUi.MapMarker(loc(sh));
        m.setIcon(WatchUi.MAP_MARKER_ICON_PIN, 0, 0);
        m.setLabel("Tir");
        markers.add(m);
        if (tg != null) {
            var mt = new WatchUi.MapMarker(loc(tg));
            mt.setIcon(WatchUi.MAP_MARKER_ICON_PIN, 0, 0);
            mt.setLabel("Cible");
            markers.add(mt);
            var line = new WatchUi.MapPolyline();
            line.setColor(Graphics.COLOR_ORANGE);
            line.setWidth(4);
            line.addLocation(loc(sh));
            line.addLocation(loc(tg));
            setPolyline(line);
        }
        setMapMarker(markers);
        // cadrage : les deux points avec une marge
        var p2 = tg == null ? sh : tg;
        var la0 = sh[0] < p2[0] ? sh[0] : p2[0];
        var la1 = sh[0] < p2[0] ? p2[0] : sh[0];
        var lo0 = sh[1] < p2[1] ? sh[1] : p2[1];
        var lo1 = sh[1] < p2[1] ? p2[1] : sh[1];
        var mLa = (la1 - la0) * 0.4 + 0.0008;
        var mLo = (lo1 - lo0) * 0.4 + 0.0011;
        setMapVisibleArea(loc([la1 + mLa, lo0 - mLo]), loc([la0 - mLa, lo1 + mLo]));
    }

    function onUpdate(dc) {
        MapView.onUpdate(dc);
        var a = app();
        var s = a.s;
        var w = dc.getWidth();
        var h = dc.getHeight();
        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
        dc.fillRectangle(0, 0, w, h * 0.18);
        dc.fillRectangle(0, h * 0.80, w, h * 0.20);
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        if (a.shooter() == null) {
            dc.drawText(w / 2, h * 0.12, Graphics.FONT_XTINY, "en attente du GPS...", CJ);
        } else {
            var saved = s["tgLat"] != 0.0 || s["tgLon"] != 0.0;
            dc.drawText(w / 2, h * 0.12, Graphics.FONT_XTINY, "" + s["dist"] + " m · " + s["az"] + "° " + a.azTxt(s["az"]) + (saved ? " (GPS)" : ""), CJ);
        }
        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(w / 2, h * 0.85, Graphics.FONT_XTINY, "HAUT : ici = poste de tir", CJ);
        dc.drawText(w / 2, h * 0.91, Graphics.FONT_XTINY, "BAS : ici = cible", CJ);
        drawToast(dc);
    }
}

class MapDelegate extends WatchUi.BehaviorDelegate {

    function initialize() {
        BehaviorDelegate.initialize();
    }

    function onPreviousPage() {
        var msg = app().markShooter();
        toast(msg);
        refreshMap();
        return true;
    }

    function onNextPage() {
        var msg = app().markTarget();
        toast(msg);
        refreshMap();
        return true;
    }

    function refreshMap() {
        if (MAP != null) { MAP.refresh(); }
        WatchUi.requestUpdate();
    }

    function onSelect() {  // retour à l'écran principal
        HOST.page = 0;
        WatchUi.popView(WatchUi.SLIDE_LEFT);
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
