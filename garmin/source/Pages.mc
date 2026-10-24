import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Math;
import Toybox.WatchUi;

// Point sur un cercle : angle en degrés, 0 = haut, sens horaire
function polar(cx, cy, r, deg) {
    var a = Math.toRadians(deg);
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}

// Flèche épaisse de p1 vers p2
function arrow(dc, p1, p2, head) {
    dc.drawLine(p1[0], p1[1], p2[0], p2[1]);
    var ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
    var l = [p2[0] - head * Math.cos(ang - 0.45), p2[1] - head * Math.sin(ang - 0.45)];
    var r = [p2[0] - head * Math.cos(ang + 0.45), p2[1] - head * Math.sin(ang + 0.45)];
    dc.fillPolygon([p2, l, r]);
}

// Cadran : anneau et graduations toutes les 30°, tournées de « rot » degrés
function dial(dc, cx, cy, r, rot) {
    dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
    dc.setPenWidth(2);
    dc.drawCircle(cx, cy, r);
    for (var i = 0; i < 12; i++) {
        var p1 = polar(cx, cy, r, i * 30 + rot);
        var p2 = polar(cx, cy, r - (i % 3 == 0 ? 12 : 6), i * 30 + rot);
        dc.drawLine(p1[0], p1[1], p2[0], p2[1]);
    }
    dc.setPenWidth(1);
}

function cm(m) {
    var v = (m * 100).abs();
    return v.format(v < 10 ? "%.1f" : "%.0f") + " cm";
}

// ---------- écran Vent : rose des heures, composantes et dérive ----------
function drawWind(dc, a) {
    var s = a.s;
    var w = dc.getWidth();
    var h = dc.getHeight();
    var cx = w / 2;
    var cy = h * 0.40;
    var r = w * 0.22;
    title(dc, "VENT");
    dial(dc, cx, cy, r, 0);
    // la cible est à 12 h
    dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, cy - r - 14, Graphics.FONT_XTINY, "cible", CJ);
    dc.fillCircle(cx, cy, 4);
    if (s["ws"] > 0) {
        var len = r * (0.45 + 0.55 * (s["ws"] > 40 ? 1.0 : s["ws"] / 40.0));
        var from = polar(cx, cy, r + 6, s["wc"] * 30);
        var to = polar(cx, cy, r + 6 - len, s["wc"] * 30);
        dc.setColor(Graphics.COLOR_YELLOW, Graphics.COLOR_TRANSPARENT);
        dc.setPenWidth(5);
        arrow(dc, from, to, 14);
        dc.setPenWidth(1);
    }
    dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, h * 0.70, Graphics.FONT_SMALL, s["ws"] > 0 ? "" + s["ws"] + " km/h · " + a.clockTxt(s["wc"]) : "Sans vent", CJ);
    var xw = a.windCross() * 3.6;
    var hw = a.windHead() * 3.6;
    dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, h * 0.77, Graphics.FONT_XTINY, "travers " + xw.abs().format("%.1f") + " · " + (hw >= 0 ? "face " : "dos ") + hw.abs().format("%.1f") + " km/h", CJ);
    var d = s["dist"];
    var dr = a.windDrift(d);
    var r2 = a.sol(d);
    if (dr != null && r2 != null && s["ws"] > 0) {
        dc.setColor(Graphics.COLOR_YELLOW, Graphics.COLOR_TRANSPARENT);
        dc.drawText(cx, h * 0.84, Graphics.FONT_XTINY, "à " + d + " m : " + cm(dr) + (dr > 0 ? " à gauche" : " à droite") + " · " + r2[3].abs() + " clics", CJ);
    }
    hint(dc, "HAUT / BAS : vitesse du vent");
}

// ---------- écran Boussole : cap, azimut de la cible, Coriolis ----------
function drawCompass(dc, a) {
    var s = a.s;
    var w = dc.getWidth();
    var h = dc.getHeight();
    var cx = w / 2;
    var cy = h * 0.45;
    var r = w * 0.27;
    title(dc, "BOUSSOLE");
    var hd = a.heading();
    var rot = hd == null ? 0 : -hd;
    dial(dc, cx, cy, r, rot);
    var card = ["N", "E", "S", "O"];
    for (var i = 0; i < 4; i++) {
        var p = polar(cx, cy, r - 26, i * 90 + rot);
        dc.setColor(i == 0 ? Graphics.COLOR_RED : Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(p[0], p[1], Graphics.FONT_SMALL, card[i], CJ);
    }
    // azimut de la cible
    var t = polar(cx, cy, r + 2, s["az"] + rot);
    var t2 = polar(cx, cy, r + 16, s["az"] + rot);
    dc.setColor(Graphics.COLOR_ORANGE, Graphics.COLOR_TRANSPARENT);
    dc.setPenWidth(4);
    arrow(dc, t2, t, 10);
    dc.setPenWidth(1);
    // repère du cap en haut
    dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
    tri(dc, cx, cy - r - 10, 7, 1);
    dc.drawText(cx, cy, Graphics.FONT_NUMBER_MILD, hd == null ? "--" : hd.toString() + "°", CJ);
    dc.setColor(Graphics.COLOR_ORANGE, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, h * 0.78, Graphics.FONT_XTINY, "cible " + s["az"] + "° (" + a.azTxt(s["az"]) + ")", CJ);
    dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
    var cor = "Coriolis désactivé";
    if (s["corOn"]) {
        cor = "Coriolis " + a.fmt("lat", s["lat"]);
    }
    dc.drawText(cx, h * 0.85, Graphics.FONT_XTINY, cor, CJ);
    hint(dc, "HAUT : cap = azimut · BAS : Coriolis");
}

// ---------- écran Météo ----------
function drawMeteo(dc, a) {
    var s = a.s;
    var w = dc.getWidth();
    var h = dc.getHeight();
    title(dc, "MÉTÉO");
    var rows = [];
    rows.add(["Température", "" + s["temp"] + " °C"]);
    var st = a.sensorTemp();
    if (st != null) { rows.add(["Capteur montre", st.format("%.0f") + " °C"]); }
    rows.add(["Pression", a.pUsed.format("%.0f") + " hPa" + (a.pAutoOk ? " baro" : "")]);
    var alt = a.altitude();
    if (alt != null) { rows.add(["Altitude", alt.format("%.0f") + " m"]); }
    // altitude-densité : 44 330,8 × (1 − (ρ/ρ0)^0,235)
    rows.add(["Alt. densité", (44330.8 * (1 - Math.pow(a.atm[0], 0.234969))).format("%.0f") + " m"]);
    rows.add(["Vitesse du son", a.atm[1].format("%.0f") + " m/s"]);
    var gw = a.garminWeather();
    if (gw != null) {
        if (gw[0] != null) { rows.add(["Garmin : temp.", gw[0].format("%.0f") + " °C"]); }
        if (gw[1] != null) { rows.add(["Garmin : vent", gw[1].format("%.0f") + " km/h" + (gw[2] != null ? " de " + gw[2].format("%.0f") + "°" : "")]); }
        if (gw[3] != null) { rows.add(["Humidité", gw[3].format("%.0f") + " %"]); }
    } else {
        rows.add(["Météo Garmin", "indisponible"]);
    }
    var y = h * 0.19;
    var rh = Graphics.getFontHeight(Graphics.FONT_XTINY) + 4;
    for (var i = 0; i < rows.size(); i++) {
        dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
        dc.drawText(w * 0.50 - 6, y, Graphics.FONT_XTINY, rows[i][0], Graphics.TEXT_JUSTIFY_RIGHT | Graphics.TEXT_JUSTIFY_VCENTER);
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawText(w * 0.50 + 6, y, Graphics.FONT_XTINY, rows[i][1], Graphics.TEXT_JUSTIFY_LEFT | Graphics.TEXT_JUSTIFY_VCENTER);
        y += rh;
    }
    hint(dc, "HAUT : appliquer · BAS : baro");
}

// ---------- écran Trajectoire : chute par rapport à la ligne de visée ----------
function drawTraj(dc, a) {
    var s = a.s;
    var w = dc.getWidth();
    var h = dc.getHeight();
    var ys = a.tbl[0];
    title(dc, "TRAJECTOIRE");
    var d = s["dist"];
    var dmax = s["dTo"] > d ? s["dTo"] : d;
    dmax = ((dmax + 49) / 50) * 50;
    var n = dmax / TABLE_STEP;
    // bornes verticales (cm)
    var ymin = 0.0;
    var ymax = 0.0;
    for (var j = 0; j <= n && j < ys.size(); j++) {
        if (ys[j] == null) { break; }
        var v = ys[j] * 100;
        if (v < ymin) { ymin = v; }
        if (v > ymax) { ymax = v; }
    }
    if (ymax - ymin < 1) { ymax = ymin + 1; }
    var x0 = w * 0.14;
    var x1 = w * 0.86;
    var y0 = h * 0.30;
    var y1 = h * 0.70;
    var px = (x1 - x0) / dmax.toFloat();
    var py = (y1 - y0) / (ymax - ymin);
    // ligne de visée et graduations
    dc.setColor(Graphics.COLOR_DK_GRAY, Graphics.COLOR_TRANSPARENT);
    var ylos = y0 + ymax * py;
    dc.drawLine(x0, ylos, x1, ylos);
    var stepX = dmax > 300 ? 100 : 50;
    for (var x = stepX; x <= dmax; x += stepX) {
        dc.drawLine(x0 + x * px, y0, x0 + x * px, y1);
        dc.drawText(x0 + x * px, y1 + 12, Graphics.FONT_XTINY, x.toString(), CJ);
    }
    // courbe
    dc.setColor(Graphics.COLOR_GREEN, Graphics.COLOR_TRANSPARENT);
    dc.setPenWidth(3);
    var prev = null;
    for (var k = 0; k <= n && k < ys.size(); k++) {
        if (ys[k] == null) { break; }
        var p = [x0 + k * TABLE_STEP * px, y0 + (ymax - ys[k] * 100) * py];
        if (prev != null) { dc.drawLine(prev[0], prev[1], p[0], p[1]); }
        prev = p;
    }
    dc.setPenWidth(1);
    // zéro et distance choisie
    var z = a.get("zero");
    dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
    dc.fillCircle(x0 + z * px, ylos, 4);
    var r = a.sol(d);
    var i = d / TABLE_STEP;
    if (i < ys.size() && ys[i] != null) {
        var yd = ys[i] * 100;
        var xd = x0 + d * px;
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);
        dc.drawLine(xd, y0 - 6, xd, y1);
        dc.fillCircle(xd, y0 + (ymax - yd) * py, 6);
        dc.drawText(w / 2, h * 0.20, Graphics.FONT_SMALL, "" + d + " m : " + (yd > 0 ? "+" : "-") + cm(yd / 100.0), CJ);
        if (r != null) {
            dc.setColor(Graphics.COLOR_LT_GRAY, Graphics.COLOR_TRANSPARENT);
            dc.drawText(w / 2, h * 0.82, Graphics.FONT_XTINY, fmtA(r[0]) + " " + a.unit() + " · " + r[2].abs() + " clics · " + r[4].format("%.2f") + " s", CJ);
        }
    }
    hint(dc, "HAUT / BAS : distance · zéro " + z + " m");
}
