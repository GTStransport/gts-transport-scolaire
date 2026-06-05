# Gestion Transport Scolaire

Application web Firebase pour le transport scolaire specialise.

## Configuration Firebase

1. Creer un projet Firebase.
2. Activer Firebase Authentication.
3. Activer Cloud Firestore.
4. Activer Cloud Storage si le module est necessaire plus tard.
5. Copier `.env.example` vers `.env.local`.
6. Remplir `.env.local` avec les valeurs Firebase du projet.
7. Conserver `firestore.rules` pour la production et `firestore.dev.rules` uniquement pour le test local.

La configuration Firebase est centralisee dans `src/lib/firebase.js`. Le fichier utilise uniquement les variables `import.meta.env.VITE_FIREBASE_*` et exporte :

- `auth` pour Firebase Authentication
- `db` pour Cloud Firestore
- `storage` pour Cloud Storage

`.env.local` contient les vraies valeurs locales et ne doit pas etre versionne. `.env.example` sert uniquement de modele sans cle reelle.

## Lancement local

Installer les dependances :

```bash
npm install
```

Lancer le serveur de developpement :

```bash
npm run dev
```

Ouvrir ensuite l'application sur l'URL affichee par Vite, generalement `http://localhost:5173`.

## Fonctionnement Firebase dans GTS

GTS garde son fonctionnement local existant avec `localStorage` comme fallback. Quand Firebase est disponible, l'application synchronise les donnees texte avec Cloud Firestore. Firebase Authentication et Cloud Storage sont initialises dans la configuration, mais aucune fonctionnalite visuelle n'a ete refaite pour cette integration.

Important : les regles strictes de production utilisent Firebase Authentication et des claims de role. La connexion interne actuelle de GTS ne suffit pas, seule, a autoriser Firestore en production. Avant une mise en ligne publique, il faudra relier les comptes GTS a Firebase Auth ou a un backend qui cree les claims securises.

Documentation des accès métier :

- [Rapport détaillé GTS Connect](docs/rapport-app-gts-connect.md)
- [Notice utilisateur](docs/notice-utilisateur.md)
- [Accès par rôles](docs/acces-par-roles.md)
- [Registre RGPD des traitements](docs/rgpd-registre-traitements.md)
- [Politique de conservation et suppression](docs/rgpd-conservation-suppression.md)
- [Procédures RGPD](docs/rgpd-procedures.md)
- [AIPD / DPIA](docs/rgpd-aipd.md)
- [Notification e-mail support](docs/support-email.md)

## Mise en production Firebase

Firebase Hosting publie uniquement le dossier `dist/`. Il ne publie plus la racine du projet.

Verifier le code :

```bash
npm run check
```

Generer la version de production :

```bash
npm run build
```

Tester le build localement :

```bash
npm run preview
```

Deployer uniquement l'hebergement :

```bash
npm run deploy:hosting
```

Deployer uniquement les regles Firestore :

```bash
npm run deploy:rules
```

Regles Firestore :

- `firestore.rules` : regles strictes pour production.
- `firestore.production.rules` : copie de reference des regles strictes.
- `firestore.dev.rules` : regles ouvertes de developpement local, a ne jamais deployer en production.

Ne pas deployer `firestore.dev.rules` sur un site public. Ces regles permettent a l'application locale de tester la synchronisation, mais elles ouvrent toutes les lectures/ecritures.

Le fichier `firebase.json` ajoute aussi des en-tetes de securite pour limiter l'integration en iframe, les permissions navigateur inutiles et les fuites de referer.

## Alertes SMS parents

L'application prépare uniquement les alertes SMS dans Firestore. Elle n'envoie pas directement de SMS depuis le navigateur.

Collection utilisée :

- `smsAlerts`

Types autorisés :

- `delay` pour un retard transport
- `cancellation` pour une annulation de trajet

Chaque document contient les enfants concernés, les parents/responsables destinataires, les numéros de téléphone, le contenu SMS filtré, le statut `pending`, l'auteur et la date de création.

Une Cloud Function pourra être ajoutée plus tard sur `onCreate smsAlerts` pour appeler un fournisseur externe comme Twilio, Vonage ou MessageBird. Les clés API SMS ne doivent jamais être stockées dans le frontend.

## Mode hors ligne

GTS conserve les données déjà chargées localement pour rester utilisable en cas de coupure réseau. Les fiches, listes, messages récents, réglages, thème et session restent accessibles via le cache local.

Quand Firestore ou Internet est indisponible, les écritures sont placées dans une file locale :

- `offlineQueue`

Types de file utilisés :

- `message`
- `update_child`
- `update_medical`
- `support_request`
- `parent_request`
- `issue_report`
- `update_data`

La file est conservée en `localStorage` et recopiée dans IndexedDB quand le navigateur le permet. Au retour réseau, l'application tente automatiquement la synchronisation avec Firestore et affiche l'état dans le header.

Le service worker `sw.js` met en cache les fichiers essentiels de l'application et les bases locales publiques utilisées pour l'autocomplétion.

Collections utilisées dans Firestore :

- `users`
- `parents`
- `children` (alias applicatif: `students`)
- `circuits`
- `schools`
- `vehicles`
- `studentIssues` (alias applicatif: `incidents`)
- `loginLogs` (alias applicatif: `connectionLogs`)
- `accessRequests`
- `messages` (gestion locale : `data.messages` en mémoire)
- `extraSchoolTransport` (alias applicatif: `extraTransports`)
- `vehicleRepairs` (alias applicatif: `vehicleReports`)
- `pdfExports`
- `notifications`
- `smsAlerts` *(alertes SMS retard/annulation en attente de Cloud Function)*
- `settings` (métadonnées interface/config via docs `settings/*`)
- `serviceStatus`
- `replacementRules`
- `leaveRequests`
- `poolTransport`
- `anomalies`
- `securityLogs`
- `roleAnnouncements`
- `teamMessages`
- `directMessages`
- `parentChangeRequests`
- `supportRequests`
- `accessLogs` *(réservée si utilisée plus tard)*

## Rues wallonnes locales

Pour la V1, utiliser uniquement `Wallonia_postal_street.csv` et ne pas importer Bruxelles/Flandre.

Placer le fichier ici :

```bash
data/Wallonia_postal_street.csv
```

Convertir le CSV en JSON optimise :

```bash
npm run convert:wallonia-addresses
```

Le JSON genere contient : `street`, `postalCode`, `city`, `country`, `searchName`. Les doublons sont supprimes et les donnees triees par commune/rue/code postal.

Copier le JSON optimise dans le dossier public :

```bash
mkdir -p public/data
cp data/wallonia-addresses.json public/data/wallonia-addresses.json
```

L'application charge ensuite ce fichier cote navigateur avec :

```js
fetch('/data/wallonia-addresses.json')
```

Important : les rues wallonnes ne sont pas importees dans Firestore. Cela evite les lectures Firestore et les couts Firebase inutiles pour l'autocompletion des adresses.

## Arrêts TEC locaux

Le fichier GTFS `stops.txt` est place dans `data/stops.txt`.

Convertir `stops.txt` en JSON local optimise :

```bash
npm run convert:tec-stops
```

Copier le JSON optimise dans le dossier public :

```bash
mkdir -p public/data
cp data/tec-stops.json public/data/tec-stops.json
```

L'application charge ensuite ce fichier cote navigateur avec :

```js
fetch('/data/tec-stops.json')
```

Important : les arrêts TEC ne sont pas importes dans Firestore. Cela evite les lectures Firestore et les couts Firebase inutiles pour l'autocompletion des arrêts.

## Sauvegarde Firestore

Une sauvegarde native Firestore est planifiée sur le projet Firebase de production :

- base : `(default)`
- récurrence : hebdomadaire, le lundi
- conservation : 84 jours
- schedule : `projects/gestion-transport-scolaire/databases/(default)/backupSchedules/12ec08da-8577-4dbd-ade3-15562d6dd0b0`

Vérifier la planification :

```bash
firebase firestore:backups:schedules:list --database '(default)'
```

Exporter localement certaines collections métier importantes en JSON reste possible avec :

```bash
npm run backup
```

Cette commande crée un dossier daté dans `backups/YYYY-MM-DD/` avec un fichier JSON par collection :

- `students`
- `users`
- `circuits`
- `incidents`
- `drivers`
- `parents`

Chaque fichier conserve l'identifiant du document, son chemin Firestore et les données normalisées. La sauvegarde locale ne supprime et ne modifie jamais les données Firestore. Si elle est bloquée par les règles Firestore, utiliser la sauvegarde native Firebase ci-dessus comme référence production.
