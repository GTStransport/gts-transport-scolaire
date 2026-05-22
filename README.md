# Gestion Transport Scolaire

Application web Firebase pour le transport scolaire specialise.

## Configuration Firebase

1. Creer un projet Firebase.
2. Activer Firebase Authentication.
3. Activer Cloud Firestore.
4. Activer Cloud Storage si le module est necessaire plus tard.
5. Copier `.env.example` vers `.env.local`.
6. Remplir `.env.local` avec les valeurs Firebase du projet.
7. Adapter `firestore.rules` avant la mise en production.

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

Important : sans regles Firestore strictes et strategie d'authentification adaptee, l'application doit rester prudente avant une mise en production.

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

Exporter les collections métier importantes en JSON :

```bash
npm run backup
```

La commande crée un dossier daté dans `backups/YYYY-MM-DD/` avec un fichier JSON par collection :

- `students`
- `users`
- `circuits`
- `incidents`
- `drivers`
- `parents`

Chaque fichier conserve l'identifiant du document, son chemin Firestore et les données normalisées. La sauvegarde ne supprime et ne modifie jamais les données Firestore.
