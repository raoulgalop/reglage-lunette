# Installer Réglage Lunette chez o2switch

Le site reste publié sur GitHub Pages tant que rien n'est configuré ici. Une fois les étapes ci-dessous faites, chaque mise à jour poussée sur `main` part aussi automatiquement chez o2switch.

Ce dossier contient :

- `.htaccess` : HTTPS obligatoire, bons types de fichiers (manifeste, WebP, APK), cache adapté au service worker, compression, en-têtes de sécurité, fichiers internes interdits.
- `../../.github/workflows/deploy-o2switch.yml` : l'envoi automatique par FTPS.

Rien n'est à modifier dans l'appli : tous ses chemins sont relatifs, elle marche à la racine d'un domaine comme dans un sous-dossier.

## 1. Créer l'adresse du site (cPanel o2switch)

**Dans un sous-dossier d'un site existant** (par exemple `https://imaginfabrik.com/reglage-lunette/`) : pas de sous-domaine à créer. Il suffit de créer le dossier `reglage-lunette` dans le dossier racine du domaine (souvent `public_html`) avec le **Gestionnaire de fichiers**, puis de passer à l'étape 2 en choisissant ce dossier. Le `.htaccess` de l'appli ne s'applique qu'à ce dossier et ne touche pas au reste du site.

**Sur un sous-domaine dédié** :


1. cPanel → **Domaines** → créer un sous-domaine, par exemple `lunette.mondomaine.fr`. Noter le dossier racine proposé (par exemple `/home/IDENTIFIANT/lunette.mondomaine.fr`).
2. cPanel → **Let's Encrypt SSL** (ou **SSL/TLS Status**) : vérifier que le sous-domaine a un certificat, sinon le demander. Sans HTTPS, ni le GPS, ni le mode hors ligne, ni l'installation sur l'écran d'accueil ne fonctionnent.

## 2. Créer un compte FTP réservé au site

cPanel → **Comptes FTP** → nouveau compte, par exemple `deploy@mondomaine.fr`, avec comme **répertoire** le dossier racine du sous-domaine. Ce compte ne voit alors que le site, rien d'autre de l'hébergement.

Le serveur FTP est le nom indiqué dans cPanel → **Comptes FTP** → « Configurer le client FTP » (souvent `ftp.mondomaine.fr` ou le nom du serveur o2switch). L'envoi se fait en FTPS (FTP chiffré, port 21).

## 3. Donner les accès à GitHub

Sur GitHub, dépôt `reglage-lunette` → **Settings** → **Secrets and variables** → **Actions**.

Onglet **Secrets** (invisibles une fois enregistrés) :

| Nom | Valeur |
| --- | --- |
| `O2SWITCH_FTP_SERVER` | le serveur FTP, par exemple `ftp.mondomaine.fr` |
| `O2SWITCH_FTP_USER` | le compte FTP, par exemple `deploy@mondomaine.fr` |
| `O2SWITCH_FTP_PASSWORD` | son mot de passe |

Onglet **Variables** (facultatives) :

| Nom | Quand l'utiliser |
| --- | --- |
| `O2SWITCH_DIR` | seulement si le compte FTP ne pointe pas directement sur le dossier du site. Chemin vu par le compte FTP, terminé par `/`, par exemple `lunette.mondomaine.fr/`. |
| `O2SWITCH_HTPASSWD` | pour protéger le site par mot de passe (voir étape 5). |

## 4. Premier envoi

GitHub → onglet **Actions** → **Déploiement o2switch** → **Run workflow**. Au bout d'une minute environ le site est en ligne sur `https://lunette.mondomaine.fr`. Ensuite, chaque push sur `main` le met à jour (seuls les fichiers modifiés sont renvoyés).

## 5. Protéger le site par mot de passe (facultatif)

C'est la vraie protection que GitHub Pages ne permet pas : sans identifiant, le serveur ne renvoie rien.

1. cPanel → **Confidentialité des répertoires** → choisir le dossier du site → cocher la protection, puis créer un utilisateur et son mot de passe.
2. cPanel crée le fichier des mots de passe hors du site, dans `/home/IDENTIFIANT/.htpasswds/<dossier du site>/passwd`. Le **Gestionnaire de fichiers** permet de vérifier le chemin exact (afficher les fichiers cachés).
3. Mettre ce chemin complet dans la variable GitHub `O2SWITCH_HTPASSWD`, puis relancer **Run workflow**. À chaque envoi, le `.htaccess` reçoit alors les lignes de protection (sans cette variable, l'envoi suivant effacerait celles écrites par cPanel).

Le manifeste et les icônes restent publics pour que l'installation sur l'écran d'accueil fonctionne. Le code d'accès demandé par l'appli peut être gardé en plus ou retiré plus tard.

À savoir sur iPhone : une web app installée sur l'écran d'accueil redemande parfois l'identifiant. Une fois l'appli ouverte, elle reste utilisable hors ligne grâce à sa copie locale.

## 6. Passer de GitHub Pages à o2switch

- **Les données ne suivent pas toutes seules** : setups, journal et catalogue perso sont rangés dans le navigateur, par adresse. Avant de changer, dans l'ancien site : **Journal** → **Sauvegarde et transfert entre téléphones** → **Exporter / envoyer**. Puis dans le nouveau : **Importer une sauvegarde**.
- Sur iPhone, supprimer l'ancienne icône et réinstaller depuis la nouvelle adresse (Safari → Partager → « Sur l'écran d'accueil »).
- L'appli Android n'est pas concernée : tout est dans l'APK. Le bandeau de téléchargement de l'APK fonctionne aussi sur o2switch.
- Une fois o2switch validé, on peut désactiver GitHub Pages (Settings → Pages) et rendre le dépôt privé : l'envoi automatique continue de marcher, et le code n'est plus visible de tous.

## En cas de souci

- **L'action échoue à la connexion** : vérifier serveur, compte et mot de passe. Si o2switch refuse le FTPS, cPanel indique les réglages exacts dans « Configurer le client FTP ».
- **Page « Forbidden »** : le compte FTP a probablement envoyé les fichiers dans un sous-dossier. Ajuster `O2SWITCH_DIR`.
- **Ancienne version affichée** : l'appli prend la nouvelle version au chargement suivant ; fermer et rouvrir suffit.
