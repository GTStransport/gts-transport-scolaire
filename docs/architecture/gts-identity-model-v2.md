# GTS Identity Model V2

Architecture validée le 17/06/2026

## 1. Objectif

Ce document definit le modele officiel d'identite GTS V2.

Il sert de reference pour :

- Firestore Rules V2 ;
- collections V2 ;
- migration legacy ;
- notifications ;
- lecture par role ;
- securite RGPD.

Il documente les identifiants suivants :

- `request.auth.uid` ;
- `request.auth.token.userId` ;
- `request.auth.token.profileId` ;
- `request.auth.token.transportManagerId`.

## 2. Convention Officielle GTS V2

Convention officielle GTS V2 :

```txt
request.auth.uid = identifiant principal du compte authentifie
request.auth.token.userId = identifiant metier du compte GTS
request.auth.token.profileId = identifiant du profil metier lie, si different
request.auth.token.transportManagerId = perimetre transporteur
```

Dans le systeme actuel, `request.auth.uid` est cree depuis l'identifiant metier du compte GTS via custom token.

La V2 doit conserver cette compatibilite, mais les regles doivent accepter les alias officiels :

```txt
request.auth.uid
request.auth.token.userId
request.auth.token.profileId
```

Pour le perimetre transporteur, la V2 doit utiliser :

```txt
request.auth.token.transportManagerId
```

et non uniquement :

```txt
request.auth.uid
```

## 3. Source D'Autorite

### Identite De Connexion

Source d'autorite :

```txt
Firebase Auth custom token
```

Le token est genere par `loginWithGtsCode`.

Le UID Firebase actuel est base sur :

```txt
found.user.id
```

### Identite Applicative

Sources :

- `users/{userId}` ;
- `parents/{parentId}` ;
- `drivers/{driverId}` ;
- `assistants/{assistantId}` ;
- `transportManagers/{transportManagerId}`.

### Identite Transport

Source d'autorite pour le perimetre transporteur :

```txt
transportManagerId
```

Tous les documents V2 appartenant au transporteur doivent porter :

```txt
transportManagerId
```

## 4. Champs Token

### `request.auth.uid`

Role :

- identifiant principal du compte connecte ;
- base historique des regles existantes ;
- generalement egal a `users.id` ou `parents.id`.

Usage attendu :

- verifier le compte courant ;
- compatibilite legacy ;
- audit utilisateur.

Risque :

- ne suffit pas pour les comptes lies a un profil metier different, notamment chauffeur ou convoyeuse.

### `request.auth.token.userId`

Role :

- identifiant metier explicite du compte GTS ;
- alias officiel de `request.auth.uid`.

Usage attendu :

- comparaison avec `users.id` ;
- comparaison avec `parents.id` ;
- fallback si `request.auth.uid` evolue plus tard.

### `request.auth.token.profileId`

Role :

- identifiant du profil metier lie ;
- utile pour chauffeur et convoyeuse.

Exemples :

```txt
users/{userId}
  profileId = drivers/{driverId}

users/{userId}
  profileId = assistants/{assistantId}
```

Usage attendu :

- verifier `driverIds` ;
- verifier `assistantIds` ;
- verifier profils operationnels.

### `request.auth.token.transportManagerId`

Role :

- identifiant du perimetre transporteur ;
- autorite pour les documents operationnels V2.

Usage attendu :

- lire/ecrire `tripSegments` ;
- lire/ecrire `stopPassages` ;
- lire/ecrire `studentAssignments` ;
- filtrer `vehicles`, `circuits`, chauffeurs, convoyeuses.

Regle :

Un transporteur secondaire ou un admin transporteur ne doit pas etre autorise via son propre `request.auth.uid` si le document appartient au perimetre :

```txt
transportManagerId
```

## 5. Parents

### Source D'Autorite

```txt
parents/{parentId}
```

### Identifiant Principal

```txt
request.auth.uid = parentId
```

### Identifiants Secondaires

```txt
request.auth.token.userId = parentId
request.auth.token.profileId = vide ou absent
request.auth.token.linkedChildrenIds = enfants lies
```

### Acces Firestore Attendus

Le parent peut lire :

- ses propres donnees parent ;
- ses enfants ;
- ses `studentAssignments` si `parentIds` contient son identifiant ;
- les informations transport strictement necessaires ;
- notifications qui lui sont destinees.

Le parent ne peut pas :

- creer un eleve ;
- modifier une affectation transport ;
- lire les passages d'autres enfants ;
- lire les donnees medicales non autorisees ;
- lire les collections transporteur globales.

### Champs V2 Necessaires

Dans `studentAssignments` :

```json
{
  "parentIds": ["parent-1"]
}
```

### Risques

- `parentIds` incomplet ;
- parent lie a l'enfant via `linkedChildrenIds` mais absent de `parentIds` ;
- acces bloque si les regles ne testent pas `token.userId`.

### Compatibilite Legacy

Compatibilite avec :

- `children.parentIds` ;
- `children.parentId` ;
- `parents.linkedChildrenIds`.

## 6. Chauffeurs

### Source D'Autorite

Compte :

```txt
users/{userId}
```

Profil metier :

```txt
drivers/{driverId}
```

### Identifiant Principal

```txt
request.auth.uid = users.id
```

### Identifiants Secondaires

```txt
request.auth.token.userId = users.id
request.auth.token.profileId = drivers.id
request.auth.token.transportManagerId = perimetre transporteur
```

### Acces Firestore Attendus

Le chauffeur peut lire :

- son profil utilisateur ;
- son profil chauffeur ;
- les `studentAssignments` dont `driverIds` contient son identifiant ;
- les `tripSegments` dont `driverIds` contient son identifiant ;
- les `stopPassages` dont `driverIds` contient son identifiant ;
- les informations eleves strictement utiles a la prise en charge.

Le chauffeur ne peut pas :

- modifier les affectations ;
- modifier les eleves ;
- lire les eleves hors trajet ;
- lire tout le transporteur ;
- lire les donnees sensibles non autorisees.

### Champs V2 Necessaires

```json
{
  "driverIds": ["driver-1"],
  "transportManagerId": "tm-1"
}
```

Recommandation :

`driverIds` doit accepter les alias :

```txt
request.auth.uid
request.auth.token.userId
request.auth.token.profileId
```

### Risques

- `users.id` different de `drivers.id` ;
- rules basees uniquement sur `request.auth.uid == driverId` ;
- remplacement chauffeur non ajoute dans `driverIds` ;
- chauffeur voyant tous les documents du transporteur via `transportManagerId`.

### Compatibilite Legacy

Compatibilite avec :

- `children.driverId` ;
- `children.driverIds` ;
- `drivers.id` ;
- `users.profileId` ;
- `users.assignedCircuits`.

## 7. Convoyeuses

### Source D'Autorite

Compte :

```txt
users/{userId}
```

Profil metier :

```txt
assistants/{assistantId}
```

### Identifiant Principal

```txt
request.auth.uid = users.id
```

### Identifiants Secondaires

```txt
request.auth.token.userId = users.id
request.auth.token.profileId = assistants.id
request.auth.token.transportManagerId = perimetre transporteur
```

### Acces Firestore Attendus

La convoyeuse peut lire :

- son profil utilisateur ;
- son profil convoyeuse ;
- les `studentAssignments` dont `assistantIds` contient son identifiant ;
- les `tripSegments` dont `assistantIds` contient son identifiant ;
- les `stopPassages` dont `assistantIds` contient son identifiant ;
- les informations eleves autorisees pour l'accompagnement.

La convoyeuse ne peut pas :

- modifier les affectations ;
- modifier les eleves ;
- lire les eleves hors accompagnement ;
- lire toutes les donnees transporteur.

### Champs V2 Necessaires

```json
{
  "assistantIds": ["assistant-1"],
  "transportManagerId": "tm-1"
}
```

### Risques

- coexistence legacy `assistantId` et `convoyeurId` ;
- `users.id` different de `assistants.id` ;
- remplacement non ajoute dans `assistantIds` ;
- acces trop large par `transportManagerId`.

### Compatibilite Legacy

Compatibilite avec :

- `children.assistantId` ;
- `transferAssistantId` ;
- `convoyeurId` ;
- `assistants.id` ;
- `users.profileId`.

## 8. Transporteurs

### Source D'Autorite

Compte :

```txt
users/{userId}
```

Organisation :

```txt
transportManagers/{transportManagerId}
```

### Identifiant Principal

```txt
request.auth.uid = users.id
```

### Identifiants Secondaires

```txt
request.auth.token.userId = users.id
request.auth.token.transportManagerId = transportManagerId
```

### Acces Firestore Attendus

Le transporteur peut :

- lire ses `tripSegments` ;
- creer/modifier ses `tripSegments` ;
- lire ses `stopPassages` ;
- creer/modifier ses `stopPassages` ;
- lire ses `studentAssignments` ;
- creer/modifier ses `studentAssignments` ;
- lire les eleves necessaires a l'organisation transport.

Le transporteur ne peut pas :

- creer un eleve ;
- supprimer un eleve ;
- modifier les donnees officielles SPW ;
- lire les documents d'un autre `transportManagerId`.

### Champs V2 Necessaires

```json
{
  "transportManagerId": "tm-1"
}
```

### Risques

- utilisateur secondaire avec `request.auth.uid != transportManagerId` ;
- regles basees sur UID au lieu de `token.transportManagerId` ;
- documents V2 sans `transportManagerId`.

### Compatibilite Legacy

Compatibilite avec :

- `users.transportManagerId` ;
- `transportManagers.id` ;
- `children.transportManagerId` ;
- `circuits.transportManagerId` ;
- `vehicles.transportManagerId`.

## 9. SPW

### Source D'Autorite

```txt
users/{userId}
```

### Identifiant Principal

```txt
request.auth.uid = users.id
```

### Identifiants Secondaires

```txt
request.auth.token.userId = users.id
request.auth.token.role = spw
request.auth.token.visualTheme = spw si admin SPW
```

### Acces Firestore Attendus

Le SPW peut :

- creer les eleves ;
- modifier les eleves ;
- gerer les donnees administratives ;
- gerer les donnees medicales ;
- gerer les ecoles ;
- lire les affectations V2 pour controle.

Le SPW ne devrait pas modifier directement :

- `tripSegments` ;
- `stopPassages` ;
- `studentAssignments` ;

sauf decision metier explicite.

### Risques

- SPW represente comme `role=spw` ou `role=admin + visualTheme=spw` ;
- regles qui ne testent qu'un seul cas ;
- confusion SPW / transporteur.

### Compatibilite Legacy

Compatibilite avec :

- `role = spw` ;
- `role = admin` + `visualTheme = spw`.

## 10. Admin Transporteur

### Source D'Autorite

```txt
users/{userId}
```

### Identifiant Principal

```txt
request.auth.uid = users.id
```

### Identifiants Secondaires

```txt
request.auth.token.userId = users.id
request.auth.token.transportManagerId = transportManagerId
```

### Acces Firestore Attendus

L'admin transporteur agit comme transporteur dans son perimetre.

Il peut :

- gerer l'organisation transport ;
- gerer chauffeurs et vehicules ;
- gerer affectations V2 ;
- lire les eleves necessaires.

Il ne peut pas :

- agir comme admin systeme ;
- modifier les donnees officielles SPW ;
- acceder a un autre transporteur.

### Risques

- `role=admin` ambigu ;
- confusion avec admin systeme ;
- absence de `adminType` explicite.

### Compatibilite Legacy

Compatibilite avec :

```txt
role = admin
non systeme
non SPW
```

## 11. Admin SPW

### Source D'Autorite

```txt
users/{userId}
```

### Identifiant Principal

```txt
request.auth.uid = users.id
```

### Identifiants Secondaires

```txt
request.auth.token.userId = users.id
request.auth.token.visualTheme = spw
request.auth.token.adminType = spw
```

### Acces Firestore Attendus

L'admin SPW agit comme SPW.

Il peut :

- gerer les eleves ;
- gerer les donnees officielles ;
- lire les affectations transport pour controle.

Il ne doit pas :

- etre traite comme transporteur ;
- modifier les trajets sans regle metier explicite.

### Risques

- `role=admin` interprete comme transporteur ;
- `visualTheme=spw` absent ;
- divergence entre app et rules.

### Compatibilite Legacy

Compatibilite avec :

```txt
role = admin
visualTheme = spw
```

## 12. Admin Systeme

### Source D'Autorite

```txt
users/admin
```

ou compte avec :

```txt
role = system_admin
adminType = system
identifierNumber = 6183
```

### Identifiant Principal

```txt
request.auth.uid = admin
```

### Identifiants Secondaires

```txt
request.auth.token.userId = admin
request.auth.token.adminType = system
```

### Acces Firestore Attendus

L'admin systeme peut :

- administrer la plateforme ;
- gerer les comptes ;
- superviser les logs ;
- intervenir techniquement.

Il ne doit pas etre utilise pour l'exploitation metier courante.

### Risques

- compte trop puissant ;
- absence de journalisation fine ;
- confusion avec admin transporteur.

### Compatibilite Legacy

Compatibilite avec :

```txt
id = admin
identifierNumber = 6183
role = admin
```

## 13. Fonctions De Regles Recommandees

### Identite Courante

```txt
isCurrentUserId(id):
  request.auth.uid == id
  OR request.auth.token.userId == id
  OR request.auth.token.profileId == id
```

### Appartenance A Une Liste

```txt
uidIn(values):
  request.auth.uid in values
  OR request.auth.token.userId in values
  OR request.auth.token.profileId in values
```

### Perimetre Transporteur

```txt
isSameTransportManager(resource):
  resource.transportManagerId == request.auth.token.transportManagerId
```

## 14. Champs V2 Obligatoires Pour Securite

### `studentAssignments`

```json
{
  "studentId": "child-123",
  "transportManagerId": "tm-1",
  "parentIds": ["parent-1"],
  "driverIds": ["driver-1"],
  "assistantIds": ["assistant-1"],
  "vehicleIds": ["vehicle-1"],
  "circuitIds": ["circuit-4104"],
  "schoolId": "school-horizon",
  "transferHubIds": ["transfer-a"]
}
```

### `tripSegments`

```json
{
  "transportManagerId": "tm-1",
  "driverIds": ["driver-1"],
  "assistantIds": ["assistant-1"],
  "vehicleIds": ["vehicle-1"],
  "circuitId": "circuit-4104",
  "transferHubId": "transfer-a"
}
```

### `stopPassages`

```json
{
  "transportManagerId": "tm-1",
  "driverIds": ["driver-1"],
  "assistantIds": ["assistant-1"],
  "vehicleIds": ["vehicle-1"],
  "circuitId": "circuit-4104",
  "tripSegmentId": "segment-1",
  "transferHubId": "transfer-a",
  "schoolId": "school-horizon",
  "tecStopId": "stop-tec-x"
}
```

## 15. Compatibilite Legacy

La V2 doit rester compatible avec :

- `request.auth.uid == documentId` ;
- `firebaseUid` ;
- `profileId` ;
- `transportManagerId` ;
- `children.parentIds` ;
- `children.driverId` ;
- `children.driverIds` ;
- `children.assistantId` ;
- `convoyeurId` ;
- `assignedCircuits`.

Les nouvelles regles doivent eviter les controles bases uniquement sur :

```txt
request.auth.uid == driverId
request.auth.uid == assistantId
```

Elles doivent preferer :

```txt
uidIn(driverIds)
uidIn(assistantIds)
```

## 16. Risques Principaux

Risques identites :

- divergence entre `firestore.rules` et `firestore.production.rules` ;
- absence de `profileId` en production ;
- compte `users` dissocie du profil `drivers` ou `assistants` ;
- `role=admin` ambigu ;
- `transportManagerId` absent ;
- documents V2 sans tableaux d'IDs denormalises.

Risques securite :

- chauffeur voyant trop large via `transportManagerId` ;
- parent voyant les passages d'autres enfants ;
- transporteur modifiant des donnees SPW ;
- support non limite ;
- admin systeme utilise pour exploitation courante.

Risques migration :

- anciens documents avec IDs metier seulement ;
- absence de `firebaseUid` ;
- absence de `profileId` ;
- coexistence `assistantId` et `convoyeurId`.

## 17. Recommandation

Avant d'activer les Firestore Rules V2 :

1. aligner `firestore.production.rules` avec la convention `uidIn` incluant `profileId` ;
2. garantir `transportManagerId` sur les comptes et documents transport ;
3. ajouter `driverIds` et `assistantIds` denormalises dans les objets V2 ;
4. conserver `driverId` et `assistantId` pour compatibilite legacy ;
5. ne jamais donner l'acces chauffeur/convoyeuse par simple `transportManagerId` ;
6. tester chaque role avec un compte reel ou fixture dediee.

## 18. Statut

Ce document devient la reference officielle du modele d'identite GTS V2.
