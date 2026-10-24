#!/usr/bin/env python3
"""Génère properties.xml, settings.xml et les libellés des réglages Connect IQ (téléphone).
Lancer depuis garmin/ : python3 tools/gen_settings.py"""
from xml.sax.saxutils import escape

N_PROFS = 20
PROFS = [  # nom, V0, CB, table (1 = G1, 7 = G7), zéro (m), hauteur lunette / canon (cm)
    ("SK Standard Plus", 327, 0.167), ("SK Rifle Match", 327, 0.167), ("SK Long Range Match", 335, 0.155),
    ("SK High Velocity Match", 385, 0.192), ("Lapua Center-X", 327, 0.172), ("Lapua Midas+", 327, 0.172),
    ("Lapua X-Act", 327, 0.172), ("Top Shot SV Target", 326, 0.167), ("Geco Semi Auto", 350, 0.151),
    ("RWS R50", 330, 0.136), ("CCI Standard Velocity", 326, 0.120),
]
while len(PROFS) < N_PROFS:
    PROFS.append(("Perso %d" % (len(PROFS) - 10), 330, 0.150))

# (clé, type, défaut, titre, config) ; config : ("num", min, max) | ("bool",) | ("list", [(valeur, texte)]) | ("text",) | None (pas affiché)
GLOBAL = [
    ("prof", "number", 1, "Munition active (n°)", ("num", 1, N_PROFS)),
    ("moa", "boolean", False, "Unité MOA (sinon MRAD)", ("bool",)),
    ("click", "float", 0.1, "Valeur du clic (0,1 = 0,1 MRAD ; 0,25 = 1/4 MOA)", ("num", 0.01, 1)),
    ("dist", "number", 100, "Distance affichée (m)", ("num", 10, 2000)),
    ("step", "number", 5, "Pas de distance (m)", ("list", [(1, "1 m"), (5, "5 m"), (10, "10 m"), (25, "25 m"), (50, "50 m"), (100, "100 m")])),
    ("dFrom", "number", 100, "Table : de (m)", ("num", 10, 2000)),
    ("dTo", "number", 300, "Table : à (m)", ("num", 10, 2000)),
    ("dStep", "number", 25, "Table : pas (m)", ("num", 5, 250)),
    ("ws", "number", 0, "Vent (km/h)", ("num", 0, 60)),
    ("wc", "number", 3, "Vent : d'où il vient (heure 1 à 12, 3 = droite)", ("num", 1, 12)),
    ("temp", "number", 15, "Température (°C)", ("num", -25, 50)),
    ("pAuto", "boolean", True, "Pression du baromètre de la montre", ("bool",)),
    ("press", "number", 1013, "Pression manuelle (hPa)", ("num", 700, 1100)),
    ("corOn", "boolean", False, "Coriolis", ("bool",)),
    ("gpsAuto", "boolean", True, "Latitude par le GPS", ("bool",)),
    ("lat", "float", 45.0, "Latitude (°, négative au sud)", ("num", -90, 90)),
    ("az", "number", 0, "Azimut de tir (° depuis le nord)", ("num", 0, 359)),
    # positions mémorisées sur la montre (0 = aucune), pas affichées sur le téléphone
    ("shLat", "float", 0.0, "", None), ("shLon", "float", 0.0, "", None),
    ("tgLat", "float", 0.0, "", None), ("tgLon", "float", 0.0, "", None),
]
FIELDS = [  # suffixe, type, titre
    ("n", "string", "nom"), ("v", "number", "V0 (m/s)"), ("b", "float", "CB"),
    ("g", "number", "modèle de traînée"), ("z", "number", "zéro (m)"), ("h", "float", "hauteur lunette / canon (cm)"),
]

props, sets, strs = [], [], []
sid = [0]

def string(text):
    sid[0] += 1
    k = "S%d" % sid[0]
    strs.append('    <string id="%s">%s</string>' % (k, escape(text)))
    return "@Strings." + k

def val(v):
    if isinstance(v, bool):
        return "true" if v else "false"
    return str(v)

def add(key, typ, default, title, cfg):
    props.append('    <property id="%s" type="%s">%s</property>' % (key, typ, escape(val(default))))
    if cfg is None:
        return
    t = string(title)
    if cfg[0] == "num":
        c = '<settingConfig type="numeric" min="%s" max="%s"/>' % (cfg[1], cfg[2])
    elif cfg[0] == "bool":
        c = '<settingConfig type="boolean"/>'
    elif cfg[0] == "text":
        c = '<settingConfig type="alphaNumeric" maxLength="24"/>'
    else:
        c = '<settingConfig type="list">' + "".join('<listEntry value="%s">%s</listEntry>' % (val(v), string(x)) for v, x in cfg[1]) + "</settingConfig>"
    sets.append('    <setting propertyKey="@Properties.%s" title="%s">%s</setting>' % (key, t, c))

for g in GLOBAL:
    add(*g)
for i, (name, v0, bc) in enumerate(PROFS, 1):
    d = {"n": name, "v": v0, "b": bc, "g": 1, "z": 50, "h": 5.0}
    for suf, typ, title in FIELDS:
        cfg = {"n": ("text",), "v": ("num", 150, 1200), "b": ("num", 0.03, 1.2),
               "g": ("list", [(1, "G1"), (7, "G7")]), "z": ("num", 10, 300), "h": ("num", 1, 15)}[suf]
        add("p%d%s" % (i, suf), typ, d[suf], "Munition %d : %s" % (i, title), cfg)

open("resources/properties.xml", "w").write("<properties>\n" + "\n".join(props) + "\n</properties>\n")
open("resources/settings/settings.xml", "w").write("<settings>\n" + "\n".join(sets) + "\n</settings>\n")
open("resources/strings/settings_strings.xml", "w").write("<strings>\n" + "\n".join(strs) + "\n</strings>\n")
print(len(props), "propriétés,", len(sets), "réglages")
