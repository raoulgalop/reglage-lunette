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

| Bouton | Écran principal | Table DOPE | Éditeur de valeur |
|---|---|---|---|
| Haut | distance + pas | remonter | + |
| Bas | distance − pas | descendre | − |
| Start | ouvrir la table DOPE | revenir | valider |
| Appui long sur Haut (Menu) | réglages | réglages | — |
| Retour | quitter | revenir | annuler |

À l'écran tactile : toucher le haut augmente la distance, le milieu ouvre la table, le bas ouvre les réglages.

- **Élévation** : nombre de clics et sens (⬆ HAUT / ⬇ BAS) à partir du zéro, plus la valeur en mil (ou MOA).
- **Vent** : clics vers la DROITE ou la GAUCHE pour le vent réglé, plus la valeur en mil pour tenir au réticule.
- **Direction du vent en heures** : 3 h = le vent vient de droite, 9 h = de gauche, 12 h = de face, 6 h = de dos.

## Réglages (menu)

Munition (13 profils : SK Standard Plus, Rifle Match, Long Range Match, High Velocity Match ; Lapua Center-X, Midas+, X-Act ;
Top Shot SV Target ; Geco Semi Auto ; RWS R50 ; CCI Standard Velocity ; Perso 1 et 2, avec V0 et CB modifiables),
hauteur lunette / canon (5 cm par défaut, réglable de 1 à 15 cm au millimètre), vent, température, pression (baromètre de la montre ou manuelle), distance de zéro (50 m par défaut), unité MRAD/MOA, valeur du clic (0,1 MRAD), pas de distance (5 m) et bornes de la table DOPE (100 à 300 m par 25 m).

## Calcul

Même modèle que Réglage Lunette : point matériel, table de traînée G1, air à 50 % d'humidité, zéro calculé avec les
conditions du jour. Le vent traversier utilise la formule du retard (dérive = vent × (temps de vol − distance / V0)).
Écart avec l'appli Android inférieur à 0,01 mrad de 100 à 300 m. Coriolis et angle de site ne sont pas pris en compte.

## Compiler

GitHub Actions compile l'appli à chaque modification (`.github/workflows/garmin.yml`) avec l'image
`ghcr.io/matco/connectiq-tester` qui contient le SDK Connect IQ, et range les `.prg` dans `garmin/bin/`.
En local : SDK Connect IQ + extension Monkey C de VS Code, puis
`monkeyc -d epix2 -f garmin/monkey.jungle -o ReglageLunette.prg -y cle_developpeur.der -l 0`.
