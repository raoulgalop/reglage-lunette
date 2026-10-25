# Réglage Lunette pour Garmin Epix 2

Appli Connect IQ (Monkey C) qui reprend le solveur G1 de Réglage Lunette : on choisit la distance,
la montre donne les clics d'élévation et de vent.

## Installer sur la montre (sans boutique)

1. Prendre le fichier qui correspond à la montre dans `garmin/bin/` :
   - Epix 2 (Gen 2) : `ReglageLunette-epix2.prg`
   - Epix Pro : `ReglageLunette-epix2pro47mm.prg` (ou 42mm / 51mm selon la taille)
2. Brancher la montre à l'ordinateur avec son câble USB.
   Sur Windows, elle apparaît comme un appareil « Epix ». Sur Mac, il faut l'appli gratuite OpenMTP.
3. Copier le fichier `.prg` dans le dossier `GARMIN/APPS` de la montre.
4. Débrancher la montre. L'appli « Réglage Lunette » apparaît dans la liste des applis (bouton Start depuis le cadran, puis Applis).

## Utilisation

Le bouton **Start** fait défiler les écrans (les points en bas indiquent l'écran affiché), **Retour** revient en arrière :

| # | Écran | Haut / Bas |
|---|---|---|
| 1 | **Principal** : clics d'élévation et de vent pour la distance | distance + / − pas |
| 2 | **Vent** : rose en heures, flèche du vent, part traversière et de face, dérive à la distance | vitesse du vent |
| 3 | **Boussole** : cap de la montre, azimut de tir (repère orange), Coriolis | Haut : cap = azimut · Bas : Coriolis oui/non |
| 4 | **Météo** : température, capteur, pression, altitude, altitude densité, vitesse du son, météo Garmin du téléphone | Haut : appliquer la météo Garmin (température, vent) · Bas : baromètre auto/manuel |
| 5 | **Trajectoire** : courbe de la balle par rapport à la ligne de visée, zéro et distance choisie | distance |
| 6 | **Table DOPE** | défiler |
| 7 | **Carte** : carte de la montre avec le poste de tir, la cible et la ligne de tir | Haut : ici = poste de tir · Bas : ici = cible |

Appui long sur Haut (Menu) : réglages, depuis n'importe quel écran.

- **Élévation** : nombre de clics et sens (⬆ HAUT / ⬇ BAS) à partir du zéro, plus la valeur en mil (ou MOA).
- **Vent** : clics vers la DROITE ou la GAUCHE pour le vent réglé, plus la valeur en mil pour tenir au réticule.
- **Direction du vent en heures** : 3 h = le vent vient de droite, 9 h = de gauche, 12 h = de face, 6 h = de dos.

**Placer la cible** : sur l'écran carte, **toucher** la carte pose la cible, un **appui long** pose le poste de tir.
Glisser vers le haut élargit la carte (voir plus loin), vers le bas zoome. La distance et l'azimut sont recalculés aussitôt.
Les boutons marquent la position GPS actuelle : HAUT = poste de tir, BAS = cible (ou menus « Je suis au poste de tir » /
« Je suis à la cible »). Depuis le téléphone (Connect IQ → Réglage Lunette → Paramètres), on peut aussi saisir la latitude
et la longitude du poste de tir et de la cible (copiées depuis une carte, par exemple Google Maps). 0 = non utilisé.

**Catalogue** : menu « Catalogue munitions » → calibre → munition. Le nom, la V0 et le CB G1 remplacent ceux de la munition
en cours (le zéro et la hauteur lunette restent). 238 munitions de carabine dans 57 calibres, reprises de l'appli Android
(`node tools/gen_ammo.js resources/jsonData/ammo.json chemin/catalog.js`). « (estimé) » = CB estimé, pas donné par le fabricant.

## Réglages (menu)

Chaque **munition** est un profil complet, modifiable sur la montre : V0, CB, modèle de traînée **G1 ou G7**,
**distance de zéro** et **hauteur entre le centre de la lunette et le centre du canon** (au millimètre, 5 cm par défaut).
20 profils : SK Standard Plus, Rifle Match, Long Range Match, High Velocity Match ; Lapua Center-X, Midas+, X-Act ;
Top Shot SV Target ; Geco Semi Auto ; RWS R50 ; CCI Standard Velocity ; Perso 1 à 9 (tous en G1, zéro 50 m).
Passer un profil en G7 ne convertit pas le CB : saisir le CB G7 du fabricant.
**Même hauteur partout** (menu ou téléphone) : une seule hauteur lunette / canon pour toutes les munitions, reprise de la munition en cours au moment où on l'active. Quand l'option est coupée, chaque munition retrouve sa propre hauteur.

Réglages communs : unité **MRAD ou MOA** et valeur du clic (0,1 / 0,05 / 0,2 MRAD ou 1/4, 1/8, 1/2, 1 MOA),
vent (vitesse et direction en heures), température, pression (baromètre de la montre ou manuelle),
pas de distance de l'écran principal (1, 5, 10, 25, 50 ou 100 m, distances de 10 à 2000 m) et table DOPE (de, à, pas).

**Coriolis** (à activer) : la latitude vient du GPS de la montre (ou se saisit à la main) ; l'azimut de tir se prend à la
boussole en visant la cible (menu « Cap boussole = azimut », montre pointée vers la cible) ou se saisit en degrés. Correction horizontale
(dérive vers la droite dans l'hémisphère nord) et verticale (effet Eötvös : plus haut en tirant vers l'est).
Pour une .22 LR à 300 m, l'effet reste d'environ 1,5 cm (0,05 mil), soit moins d'un clic.

**Réglages depuis le téléphone** : quand l'appli est installée par la boutique Connect IQ (même en Beta), tous les
réglages et les 20 munitions (nom compris) se modifient dans l'appli Connect IQ du téléphone → Réglage Lunette → Paramètres.
Les fichiers `resources/properties.xml` et `resources/settings/settings.xml` sont générés par `python3 tools/gen_settings.py`.

## Calcul

Même modèle que Réglage Lunette : point matériel, table de traînée G1 (ou G7), air à 50 % d'humidité, zéro calculé avec les
conditions du jour. Le vent traversier utilise la formule du retard (dérive = vent × (temps de vol − distance / V0)).
Écart avec l'appli Android inférieur à 0,01 mrad de 100 à 300 m. Coriolis : z = 2Ω·sin(lat)·∫t dx (même résultat que le solveur 3D de l'appli Android). L'angle de site n'est pas pris en compte.

## Compiler

GitHub Actions compile l'appli à chaque modification (`.github/workflows/garmin.yml`) avec l'image
`ghcr.io/matco/connectiq-tester` qui contient le SDK Connect IQ, et range les `.prg` dans `garmin/bin/`.
En local : SDK Connect IQ + extension Monkey C de VS Code, puis
`monkeyc -d epix2 -f garmin/monkey.jungle -o ReglageLunette.prg -y cle_developpeur.der -l 0`.

## Publier sur la boutique Connect IQ

La boutique exige un paquet `.iq` signé avec une **clé de développeur permanente** (la même pour toutes les mises à jour).

1. Créer la clé sur le Mac (Terminal), une seule fois, et la garder précieusement :
   ```
   cd ~/Documents
   openssl genrsa -out garmin_cle.pem 4096
   openssl pkcs8 -topk8 -inform PEM -outform DER -in garmin_cle.pem -out garmin_cle.der -nocrypt
   base64 -i garmin_cle.der | pbcopy
   ```
2. Sur GitHub : dépôt → Settings → Secrets and variables → Actions → New repository secret,
   nom `GARMIN_DEV_KEY`, valeur = coller (Cmd+V).
3. Relancer le workflow « Appli Garmin (Connect IQ) » : il produit `garmin/bin/ReglageLunette.iq`.
4. Sur https://apps.developer.garmin.com (compte Garmin) : Upload an App → fichier `.iq`, nom, description,
   icône et captures (`garmin/bin/shots/`). Choisir **Beta** pour une appli visible uniquement par soi
   (installation immédiate depuis Connect IQ sur le téléphone), ou publique (vérification Garmin de quelques jours).
