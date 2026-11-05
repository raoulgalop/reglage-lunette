# Installer Réglage Lunette sur le NAS Synology (DSM 7)

Le NAS va chercher lui-même la dernière version sur GitHub, toutes les heures, avec le script `maj-lunette.sh`. Il n'y a donc rien à ouvrir pour les mises à jour. Le site utilise le même `.htaccess` qu'o2switch (`deploy/o2switch/.htaccess`) : HTTPS forcé, cache, sécurité et mot de passe en option.

Écrit pour le DS1621xs+ sous DSM 7.2. Les intitulés peuvent varier un peu selon la version de DSM.

## 1. Installer le serveur web

**Centre de paquets** → installer **Web Station** et **Apache HTTP Server 2.4**.

## 2. Adresse et certificat HTTPS

Sans HTTPS, le GPS, le mode hors ligne et l'installation sur l'écran d'accueil ne fonctionnent pas.

1. **Panneau de configuration** → **Accès externe** → **DDNS** → **Ajouter** → fournisseur **Synology**, nom d'hôte par exemple `regis-lunette.synology.me`. Cocher **Obtenir un certificat de Let's Encrypt et le définir par défaut**.
2. Sur la box internet, rediriger les ports **TCP 443** (le site) et **TCP 80** (renouvellement du certificat) vers l'adresse locale du NAS. **Ne pas** rediriger 5000/5001 : l'administration du NAS reste invisible depuis Internet.

## 3. Première installation des fichiers et mise à jour automatique

**Panneau de configuration** → **Planificateur de tâches** → **Créer** → **Tâche planifiée** → **Script défini par l'utilisateur** :

- Onglet **Général** : nom `Mise à jour Réglage Lunette`, utilisateur **root**.
- Onglet **Programmer** : tous les jours, **toutes les heures**.
- Onglet **Paramètres de la tâche** : coller tout le contenu de `maj-lunette.sh`. Pour recevoir un e-mail en cas d'échec, cocher l'option de notification.

Valider, sélectionner la tâche, puis cliquer sur **Exécuter**. Le dossier `/volume1/web/lunette` est créé et rempli.

## 4. Déclarer le site dans Web Station

1. **Web Station** → **Service web** → **Créer** → **Site web statique** → serveur principal **Apache HTTP Server 2.4**, dossier racine `web/lunette`.
2. **Web Station** → **Portail de services web** → **Créer** → choisir ce service, type **Basé sur le nom**, nom d'hôte `regis-lunette.synology.me`, port **HTTPS 443**, cocher **HSTS** si l'option est proposée.
3. **Panneau de configuration** → **Sécurité** → **Certificat** → **Paramètres** : attribuer le certificat Let's Encrypt à ce portail.

Le site répond alors sur `https://regis-lunette.synology.me`.

## 5. Mot de passe (facultatif)

Le fichier des mots de passe doit se trouver **hors** de `/volume1/web`, sinon il pourrait être servi. Le plus simple est de créer une seconde tâche planifiée, en root, à exécuter **une seule fois** puis à supprimer (remplacer `regis` et `MotDePasse`) :

```sh
mkdir -p /volume1/lunette-acces
printf 'regis:%s\n' "$(openssl passwd -apr1 'MotDePasse')" > /volume1/lunette-acces/passwd
chmod 755 /volume1/lunette-acces && chmod 644 /volume1/lunette-acces/passwd
```

Ensuite, dans la tâche de mise à jour, remplacer la ligne `HTPASSWD="${HTPASSWD:-}"` par `HTPASSWD="/volume1/lunette-acces/passwd"`, puis l'exécuter une fois.

## Bon à savoir

- **Chaque adresse a ses propres données.** GitHub Pages, o2switch et le NAS sont trois adresses différentes : setups, journal et catalogue perso ne passent pas de l'une à l'autre. Pour les transférer, utiliser **Journal** → **Sauvegarde et transfert entre téléphones** → **Exporter**, puis **Importer** sur l'autre adresse. Le mieux est de choisir une adresse principale par téléphone.
- **Si le dépôt GitHub devient privé**, le NAS ne pourra plus le télécharger sans jeton d'accès. Il faudra alors adapter le script.
- **Erreur 500** après l'installation : Apache refuse une ligne du `.htaccess`. Le journal se trouve dans **Web Station** → **Service web** → service → **Journaux**.
