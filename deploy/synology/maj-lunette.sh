#!/bin/sh
# Met à jour Réglage Lunette sur le NAS Synology depuis GitHub.
# À lancer par une tâche planifiée DSM (utilisateur root). Procédure : deploy/synology/LISEZMOI.md
# Le NAS va chercher la dernière version lui-même : rien à ouvrir sur la box à part le HTTPS du site.
set -eu

DEST="${DEST:-/volume1/web/lunette}"   # dossier du site dans Web Station
HTPASSWD="${HTPASSWD:-}"               # facultatif : chemin d'un fichier .htpasswd pour protéger le site
BRANCHE="${BRANCHE:-main}"
URL="https://codeload.github.com/raoulgalop/reglage-lunette/tar.gz/refs/heads/$BRANCHE"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

curl -fsSL "$URL" -o "$TMP/site.tar.gz"
mkdir "$TMP/src" "$TMP/site"
tar -xzf "$TMP/site.tar.gz" -C "$TMP/src" --strip-components=1
cd "$TMP/src"

cp index.html ligne.js catalog.js sw.js manifest.webmanifest icon-*.png ReglageLunette.apk "$TMP/site/"
cp -r leaflet maplibre reticles "$TMP/site/"
cp deploy/o2switch/.htaccess "$TMP/site/.htaccess"
if [ -n "$HTPASSWD" ]; then
  printf '\n# --- Accès protégé par mot de passe ---\nAuthType Basic\nAuthName "Reglage Lunette"\nAuthUserFile %s\nRequire valid-user\n' "$HTPASSWD" >> "$TMP/site/.htaccess"
fi

mkdir -p "$DEST"
# --checksum : seuls les fichiers réellement modifiés sont réécrits
rsync -a --checksum --delete "$TMP/site/" "$DEST/"
chmod -R a+rX "$DEST"
echo "Réglage Lunette à jour dans $DEST ($(date '+%d/%m/%Y %H:%M'))"
