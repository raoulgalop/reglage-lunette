import Toybox.Lang;
import Toybox.Math;

// Solveur balistique G1 (point matériel 2D), repris de Réglage Lunette.
// Repère lié à la ligne de visée : x vers la cible, y vers le haut (m).
// p = [v0 (m/s), CB G1, hauteur de lunette (m), rapport de densité de l'air, vitesse du son (m/s)]
module Bal {

    const M = [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.7, 0.725, 0.75, 0.775, 0.8, 0.825, 0.85, 0.875, 0.9, 0.925, 0.95, 0.975, 1.0, 1.025, 1.05, 1.075, 1.1, 1.125, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2.0, 2.05, 2.1, 2.15, 2.2, 2.25, 2.3, 2.35, 2.4, 2.45, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.2, 4.4, 4.6, 4.8, 5.0];
    const C = [0.2629, 0.2558, 0.2487, 0.2413, 0.2344, 0.2278, 0.2214, 0.2155, 0.2104, 0.2061, 0.2032, 0.202, 0.2034, 0.2165, 0.223, 0.2313, 0.2417, 0.2546, 0.2706, 0.2901, 0.3136, 0.3415, 0.3734, 0.4084, 0.4448, 0.4805, 0.5136, 0.5427, 0.5677, 0.5883, 0.6053, 0.6191, 0.6393, 0.6518, 0.6589, 0.6621, 0.6625, 0.6607, 0.6573, 0.6528, 0.6474, 0.6413, 0.6347, 0.628, 0.621, 0.6141, 0.6072, 0.6003, 0.5934, 0.5867, 0.5804, 0.5743, 0.5685, 0.563, 0.5577, 0.5527, 0.5481, 0.5438, 0.5397, 0.5325, 0.5264, 0.5211, 0.5168, 0.5133, 0.5105, 0.5084, 0.5067, 0.5054, 0.504, 0.503, 0.5022, 0.5016, 0.501, 0.5006, 0.4998, 0.4995, 0.4992, 0.499, 0.4988];

    var hint = 1;

    // Coefficient de traînée G1 en fonction du Mach (interpolation linéaire)
    function cd(m) {
        var n = M.size();
        if (m <= 0.0) { return C[0]; }
        if (m >= 5.0) { return C[n - 1]; }
        var i = hint;
        if (i < 1) { i = 1; }
        if (i > n - 1) { i = n - 1; }
        while (i > 1 && M[i - 1] > m) { i -= 1; }
        while (i < n - 1 && M[i] < m) { i += 1; }
        hint = i;
        return C[i - 1] + (C[i] - C[i - 1]) * (m - M[i - 1]) / (M[i] - M[i - 1]);
    }

    // T en °C, P en hPa (pression station), humidité 50 % → [rapport de densité, vitesse du son]
    function atmo(t, p) {
        var tk = t + 273.15;
        var pv = 0.5 * 6.1078 * Math.pow(10.0, 7.5 * t / (t + 237.3));
        var rho = ((p - pv) * 100.0) / (287.058 * tk) + (pv * 100.0) / (461.495 * tk);
        return [rho / 1.225, 331.3 * Math.sqrt(1.0 + t / 273.15)];
    }

    // Trajectoire (Runge-Kutta 2) avec un angle canon / visée alpha (rad).
    // Renvoie [ys, ts] : hauteur (m) et temps de vol (s) tous les « step » mètres jusqu'à maxX
    // (null au-delà de la portée calculée).
    function fly(p, alpha, maxX, step) {
        var k0 = 2.08551e-4 * 3.28084 / p[1] * p[3];
        var snd = p[4];
        var g = 9.80665;
        var dt = 0.004;
        var h = dt / 2.0;
        var n = (maxX / step + 0.001).toNumber() + 1;
        var ys = new [n];
        var ts = new [n];
        var x = 0.0;
        var y = -p[2];
        var vx = p[0] * Math.cos(alpha);
        var vy = p[0] * Math.sin(alpha);
        var t = 0.0;
        var nx = 1;
        var v, k, mx, my, mv, mk, nX, nY, f;
        ys[0] = y;
        ts[0] = 0.0;
        hint = 1;
        while (nx < n && t < 5.0) {
            v = Math.sqrt(vx * vx + vy * vy);
            k = k0 * cd(v / snd) * v;
            mx = vx - k * vx * h;
            my = vy - (k * vy + g) * h;
            mv = Math.sqrt(mx * mx + my * my);
            mk = k0 * cd(mv / snd) * mv;
            nX = x + mx * dt;
            nY = y + my * dt;
            vx = vx - mk * mx * dt;
            vy = vy - (mk * my + g) * dt;
            while (nx < n && nx * step <= nX) {
                f = (nx * step - x) / (nX - x);
                ys[nx] = y + (nY - y) * f;
                ts[nx] = t + dt * f;
                nx += 1;
            }
            x = nX;
            y = nY;
            t += dt;
            if (vx < 20.0) { break; }
        }
        return [ys, ts];
    }

    // Angle canon / ligne de visée pour un zéro à z mètres
    function zeroAngle(p, z) {
        var a = 0.0;
        for (var i = 0; i < 8; i++) {
            var y = fly(p, a, z, z)[0][1];
            if (y == null) { break; }
            a -= y / z;
            if (y.abs() < 0.00001) { break; }
        }
        return a;
    }
}
