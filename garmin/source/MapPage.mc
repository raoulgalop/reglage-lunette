import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.Position;
import Toybox.System;
import Toybox.WatchUi;

var MAP = null;

function loc(p) {
    return new Position.Location({:latitude => p[0], :longitude => p[1], :format => :degrees});
}

// Carte de la montre : poste de tir, cible et ligne de tir
class MapPage extends WatchUi.MapView {

    // cadrage, pour retrouver la position d'un point touché : centre [lat, lon], mètres par pixel, zoom
    var ctr = null;
    var mpp = 1.0;
    var zoom = 1.0;
    var placeShooter = false;  // l'appui long pose le poste de tir (sinon la cible)

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
        if (sh == null) {
            // pas encore de GPS : dernière latitude connue (la carte exige une zone)
            var la = a.s["lat"].toFloat();
            setMapVisibleArea(loc([la + 0.01, -0.01]), loc([la - 0.01, 0.01]));
            return;
        }
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
        // cadrage : zone centrée entre le tireur et la cible, aux proportions de la partie visible de l'écran,
        // pour pouvoir convertir un point touché en coordonnées
        var p2 = tg == null ? sh : tg;
        ctr = [(sh[0] + p2[0]) / 2.0, (sh[1] + p2[1]) / 2.0];
        var cl = Math.cos(Math.toRadians(ctr[0]));
        var dy = (p2[0] - sh[0]) * 111320.0;
        var dx = (p2[1] - sh[1]) * 111320.0 * cl;
        var ds = System.getDeviceSettings();
        var sw = ds.screenWidth.toFloat();
        var sh2 = ds.screenHeight * 0.62;
        // demi-hauteur (m) : les deux points avec 40 % de marge, 150 m au minimum
        var ry = dy.abs() * 0.7;
        if (dx.abs() * 0.7 * sh2 / sw > ry) { ry = dx.abs() * 0.7 * sh2 / sw; }
        if (ry < 150.0) { ry = 150.0; }
        ry *= zoom;
        // la carte n'affiche que des niveaux de zoom entiers (tuiles de 256 px) : on prend le niveau qui contient la zone
        // et on cadre exactement dessus, pour que l'échelle soit connue
        var k = 156543.03 * cl;
        var z = Math.floor(Math.ln(k * sh2 / (2.0 * ry)) / Math.ln(2.0)).toNumber();
        if (z < 1) { z = 1; }
        if (z > 19) { z = 19; }
        mpp = k / Math.pow(2.0, z);
        var hLa = mpp * sh2 / 2.0 * 0.97 / 111320.0;
        var hLo = mpp * sw / 2.0 * 0.97 / (111320.0 * cl);
        setMapVisibleArea(loc([ctr[0] + hLa, ctr[1] - hLo]), loc([ctr[0] - hLa, ctr[1] + hLo]));
    }

    // point touché → [lat, lon] (null si la carte n'est pas encore cadrée)
    function toLatLon(x, y) {
        if (ctr == null) { return null; }
        var ds = System.getDeviceSettings();
        var cx = ds.screenWidth / 2.0;
        var cy = ds.screenHeight * 0.49;
        var la = ctr[0] + (cy - y) * mpp / 111320.0;
        var lo = ctr[1] + (x - cx) * mpp / (111320.0 * Math.cos(Math.toRadians(ctr[0])));
        return [la, lo];
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
        dc.setColor(placeShooter ? Graphics.COLOR_RED : Graphics.COLOR_ORANGE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(w / 2, h * 0.85, Graphics.FONT_XTINY, "appui long : " + (placeShooter ? "TIREUR" : "CIBLE"), CJ);
        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(w / 2, h * 0.91, Graphics.FONT_XTINY, "toucher : changer", CJ);
        drawToast(dc);
    }
}

class MapDelegate extends WatchUi.BehaviorDelegate {

    function initialize() {
        BehaviorDelegate.initialize();
    }

    // HAUT / BAS : zoom (les positions GPS se marquent aussi depuis le menu)
    function onPreviousPage() {
        return zoomBy(0.5);
    }

    function onNextPage() {
        return zoomBy(2.0);
    }

    function zoomBy(f) {
        if (MAP == null) { return false; }
        MAP.zoom *= f;
        if (MAP.zoom > 16.0) { MAP.zoom = 16.0; }
        if (MAP.zoom < 0.25) { MAP.zoom = 0.25; }
        refreshMap();
        return true;
    }

    // appui long sur la carte : pose la cible (ou le poste de tir)
    function onHold(evt) {
        var c = evt.getCoordinates();
        if (MAP == null) { return false; }
        var h = System.getDeviceSettings().screenHeight;
        if (c[1] < h * 0.18 || c[1] > h * 0.80) { return false; }
        var p = MAP.toLatLon(c[0], c[1]);
        if (p == null) { toast("carte pas encore prête"); return true; }
        var msg = MAP.placeShooter ? app().markShooterAt(p) : app().markTargetAt(p);
        System.println("carte : " + msg);
        toast(msg);
        refreshMap();
        return true;
    }

    function refreshMap() {
        if (MAP != null) { MAP.refresh(); }
        WatchUi.requestUpdate();
    }

    // toucher l'écran ou Start : choisir ce que pose l'appui long (cible / poste de tir)
    function onSelect() {
        if (MAP == null) { return false; }
        MAP.placeShooter = !MAP.placeShooter;
        WatchUi.requestUpdate();
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
