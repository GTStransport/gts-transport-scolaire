# studentAssignments V2

Architecture validée le 17/06/2026

## 1. Objectif

`studentAssignments` devient la collection officielle des affectations transport élèves dans GTS V2.

Principe officiel :

```txt
Une affectation est la seule source officielle des circuits d'un élève.
```

La collection remplace progressivement les champs legacy stockés directement sur `children` pour déterminer :

- le circuit actif de l'élève ;
- le passage réel de prise en charge ;
- le trajet matin ;
- le trajet soir ;
- la période de validité ;
- les jours de transport ;
- le transporteur responsable ;
- les informations nécessaires aux règles Firestore.

`children` reste le référentiel officiel SPW de l'élève. `studentAssignments` appartient au périmètre transport et décrit uniquement l'organisation du transport.

## 2. Collection Firestore

Collection :

```txt
studentAssignments/{assignmentId}
```

ID recommandé :

```txt
assignment-{studentId}-{direction}-{startDate}-{circuitId}
```

Exemple :

```txt
assignment-child-123-morning-2026-09-01-4104
```

Raison : l'ID reste lisible, stable et compatible avec plusieurs affectations selon la direction, la période et le circuit.

## 3. Schéma Complet

```json
{
  "id": "assignment-child-123-morning-2026-09-01-4104",
  "schemaVersion": 2,

  "studentId": "child-123",
  "studentName": "Nom Prénom",
  "parentIds": ["parent-1", "parent-2"],

  "transportManagerId": "tm-1",
  "schoolId": "school-1",
  "schoolName": "École Exemple",

  "transportType": "circuit_ferme",
  "direction": "morning",
  "circuitId": "4104",
  "circuitLabel": "4104",

  "stopId": "stop-tec-001",
  "stopLabel": "TEC Rue de l'Église",
  "stopPassageId": "passage-4104-2026-morning-stop-tec-001",
  "tripSegmentIds": ["segment-4104-stop-school-morning"],

  "transferHubId": "",
  "transferHubName": "",

  "driverIds": ["driver-1"],
  "assistantIds": ["assistant-1"],
  "vehicleIds": ["vehicle-1"],

  "startDate": "2026-09-01",
  "endDate": null,
  "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],

  "schedule": {
    "pickupTime": "07:15",
    "dropoffTime": "08:05",
    "transferArrivalTime": null,
    "transferDepartureTime": null,
    "timezone": "Europe/Brussels"
  },

  "alternatingResidence": {
    "enabled": false,
    "weekParity": "",
    "activeParentKey": "",
    "source": "children.alternatingResidence"
  },

  "boarding": {
    "isBoardingStudent": false,
    "boardingMode": "",
    "destinationType": ""
  },

  "pmr": {
    "enabled": false,
    "wheelchair": false,
    "adaptedVehicleRequired": false
  },

  "status": "active",
  "source": "manual",
  "migrationStatus": "v2",

  "createdAt": "Timestamp",
  "createdBy": "user-1",
  "createdByRole": "transporteur",
  "updatedAt": "Timestamp",
  "updatedBy": "user-1",
  "updatedByRole": "transporteur"
}
```

## 4. Champs Obligatoires

- `id`
- `schemaVersion`
- `studentId`
- `transportManagerId`
- `schoolId`
- `transportType`
- `direction`
- `circuitId`
- `stopId`
- `startDate`
- `schedule`
- `status`
- `source`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

## 5. Champs Optionnels

- `studentName`
- `parentIds[]`
- `schoolName`
- `circuitLabel`
- `stopLabel`
- `stopPassageId`
- `tripSegmentIds[]`
- `transferHubId`
- `transferHubName`
- `driverIds[]`
- `assistantIds[]`
- `vehicleIds[]`
- `endDate`
- `daysOfWeek[]`
- `alternatingResidence`
- `boarding`
- `pmr`
- `migrationStatus`
- `createdByRole`
- `updatedByRole`

## 6. Valeurs Autorisées

### `schemaVersion`

```txt
2
```

### `transportType`

```txt
avec_transfert
circuit_ferme
porte_a_porte
```

### `direction`

```txt
morning
evening
```

### `status`

```txt
draft
active
suspended
ended
archived
```

### `source`

```txt
manual
migration
import
correction
```

### `daysOfWeek`

```txt
monday
tuesday
wednesday
thursday
friday
```

## 7. Source De Vérité

Source officielle V2 :

```txt
studentAssignments
```

Règles :

- le circuit actif d'un élève vient de `studentAssignments` ;
- `children.pickupCircuitId`, `children.schoolCircuitId` et champs legacy restent des fallbacks temporaires ;
- une affectation est liée à une période avec `startDate` et `endDate` ;
- matin et soir sont séparés via `direction` ;
- l'élève est affecté à un passage précis via `stopPassageId` dès que le passage V2 existe ;
- `stopId` reste utile pour la lisibilité, la migration et les cas simples ;
- les champs dénormalisés servent aux règles Firestore et à l'affichage rapide.

## 8. Workflow

### 1. Création

Le transporteur crée une affectation depuis l'écran Affectation rapide.

Il sélectionne :

- l'élève officiel SPW ;
- le type de transport ;
- le sens matin ou soir ;
- le circuit ;
- l'arrêt ou le domicile ;
- l'école ;
- le chauffeur ;
- la convoyeuse ;
- le véhicule ;
- la période de validité ;
- les jours de transport.

### 2. Validation

GTS vérifie :

- élève existant ;
- transporteur autorisé ;
- circuit actif ;
- arrêt ou domicile compatible avec le type de transport ;
- école renseignée ;
- date de début valide ;
- pas de chevauchement actif pour le même élève, même direction et même jour ;
- règles PMR ;
- règles internat ;
- règles transfert.

### 3. Lecture

Les écrans métier lisent :

1. `studentAssignments` actif et compatible avec la date ;
2. sinon fallback legacy `children.*` ;
3. sinon élève non affecté.

### 4. Modification

Une modification crée ou met à jour une affectation sans modifier les données administratives de l'élève.

Le transporteur ne modifie jamais :

- identité élève ;
- données médicales officielles ;
- garde alternée officielle ;
- parents officiels ;
- école officielle si elle est propriété SPW.

### 5. Fin D'affectation

Une affectation ne doit pas être supprimée pour corriger l'historique.

Fin recommandée :

- renseigner `endDate` ;
- passer `status` à `ended` ;
- créer une nouvelle affectation si nécessaire.

## 9. Firestore Rules

### Lecture

Lecture autorisée si au moins une condition est vraie :

- SPW ;
- admin système ;
- transporteur propriétaire via `transportManagerId` ;
- chauffeur référencé dans `driverIds[]` ;
- convoyeuse référencée dans `assistantIds[]` ;
- parent référencé dans `parentIds[]`.

Le support ne lit pas directement `studentAssignments` sauf procédure exceptionnelle journalisée et explicitement prévue plus tard.

### Écriture

Écriture cible V2 :

- SPW : lecture complète, écriture uniquement si correction administrative validée ;
- transporteur : création et modification dans son périmètre transport ;
- chauffeur : aucune écriture ;
- convoyeuse : aucune écriture ;
- parent : aucune écriture ;
- support : aucune écriture ;
- admin système : écriture exceptionnelle, journalisée.

### Suppression

Suppression physique interdite en usage normal.

Règle cible :

- `delete` interdit ;
- utiliser `status = "ended"` ou `status = "archived"` ;
- suppression exceptionnelle uniquement admin système avec procédure de purge RGPD validée.

### Pseudo-règles

```txt
match /studentAssignments/{assignmentId} {
  allow read: if canReadTransportV2(resource.data);

  allow create: if isTransportManager()
    && request.resource.data.transportManagerId == transportManagerId()
    && request.resource.data.schemaVersion == 2
    && validStudentAssignment(request.resource.data);

  allow update: if isTransportManager()
    && resource.data.transportManagerId == transportManagerId()
    && request.resource.data.transportManagerId == resource.data.transportManagerId
    && request.resource.data.studentId == resource.data.studentId
    && validStudentAssignment(request.resource.data);

  allow delete: if false;
}
```

Avant activation officielle des écritures V2, les règles peuvent rester en lecture contrôlée uniquement :

```txt
allow read: if canReadTransportV2(resource.data);
allow create, update, delete: if false;
```

## 10. Index Firestore

### Index simples

- `studentId`
- `transportManagerId`
- `schoolId`
- `circuitId`
- `stopId`
- `direction`
- `status`
- `startDate`
- `endDate`

### Index array

- `parentIds[]`
- `driverIds[]`
- `assistantIds[]`
- `vehicleIds[]`
- `daysOfWeek[]`
- `tripSegmentIds[]`

### Index composites recommandés

```txt
transportManagerId ASC, status ASC, direction ASC
studentId ASC, status ASC, direction ASC, startDate DESC
circuitId ASC, status ASC, direction ASC
schoolId ASC, status ASC, direction ASC
stopId ASC, status ASC, direction ASC
transportManagerId ASC, startDate ASC, status ASC
```

### Index futurs pour reporting

```txt
transportManagerId ASC, schoolId ASC, status ASC
transportManagerId ASC, transportType ASC, status ASC
transportManagerId ASC, direction ASC, daysOfWeek ARRAY_CONTAINS
```

## 11. Migration Legacy Vers V2

### Sources legacy

Les affectations V2 peuvent être préparées depuis :

- `children.pickupCircuitId`
- `children.schoolCircuitId`
- `children.transferSchoolCircuitId`
- `children.pickupStop`
- `children.motherPickupStop`
- `children.fatherPickupStop`
- `children.schoolId`
- `children.transportManagerId`
- circuits existants ;
- véhicules existants ;
- chauffeurs existants ;
- convoyeuses existantes ;
- données de garde alternée existantes.

### Stratégie

1. Générer un dry-run sans écriture.
2. Classer les élèves :
   - migrables ;
   - incomplets ;
   - incohérents ;
   - non affectés.
3. Créer les affectations V2 uniquement pour les élèves migrables.
4. Conserver tous les champs legacy.
5. Activer `transportViewForChild()` avec priorité V2 puis fallback legacy.
6. Vérifier les PDF, briefing, présences et affectation rapide.
7. Désactiver progressivement les champs legacy uniquement après validation métier.

### Compatibilité Présences

`studentAttendance` doit référencer le même périmètre transport que `studentAssignments` :

- même `studentId` ;
- même `direction` ;
- même `circuitIds[]` ;
- même `transportManagerId` ;
- même `assistantIds[]`.

## 12. Exemples JSON

### 12.1 Circuit Fermé Matin

```json
{
  "id": "assignment-child-123-morning-2026-09-01-4104",
  "schemaVersion": 2,
  "studentId": "child-123",
  "studentName": "Élève Exemple",
  "parentIds": ["parent-1"],
  "transportManagerId": "tm-1",
  "schoolId": "school-1",
  "transportType": "circuit_ferme",
  "direction": "morning",
  "circuitId": "4104",
  "stopId": "stop-tec-001",
  "stopPassageId": "passage-4104-stop-tec-001-morning",
  "driverIds": ["driver-1"],
  "assistantIds": ["assistant-1"],
  "vehicleIds": ["vehicle-1"],
  "startDate": "2026-09-01",
  "endDate": null,
  "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "schedule": {
    "pickupTime": "07:15",
    "dropoffTime": "08:05",
    "timezone": "Europe/Brussels"
  },
  "status": "active",
  "source": "manual"
}
```

### 12.2 Avec Transfert Soir

```json
{
  "id": "assignment-child-456-evening-2026-09-01-4220",
  "schemaVersion": 2,
  "studentId": "child-456",
  "studentName": "Élève Avec Transfert",
  "parentIds": ["parent-2"],
  "transportManagerId": "tm-1",
  "schoolId": "school-2",
  "transportType": "avec_transfert",
  "direction": "evening",
  "circuitId": "4220",
  "stopId": "stop-tec-018",
  "stopPassageId": "passage-4220-transfer-ougree-evening",
  "tripSegmentIds": [
    "segment-school-transfer-evening-4220",
    "segment-transfer-stop-evening-4301"
  ],
  "transferHubId": "transfer-ougree",
  "transferHubName": "Ougrée",
  "driverIds": ["driver-2", "driver-3"],
  "assistantIds": ["assistant-2"],
  "vehicleIds": ["vehicle-2", "vehicle-3"],
  "startDate": "2026-09-01",
  "endDate": null,
  "daysOfWeek": ["monday", "tuesday", "thursday", "friday"],
  "schedule": {
    "pickupTime": "15:35",
    "transferArrivalTime": "16:05",
    "transferDepartureTime": "16:15",
    "dropoffTime": "16:45",
    "timezone": "Europe/Brussels"
  },
  "status": "active",
  "source": "manual"
}
```

### 12.3 Porte-à-porte

```json
{
  "id": "assignment-child-789-morning-2026-09-01-pap-01",
  "schemaVersion": 2,
  "studentId": "child-789",
  "studentName": "Élève Porte-à-porte",
  "parentIds": ["parent-3"],
  "transportManagerId": "tm-2",
  "schoolId": "school-3",
  "transportType": "porte_a_porte",
  "direction": "morning",
  "circuitId": "PAP-01",
  "stopId": "home-child-789",
  "stopLabel": "Domicile",
  "driverIds": ["driver-4"],
  "assistantIds": ["assistant-4"],
  "vehicleIds": ["vehicle-adapted-1"],
  "startDate": "2026-09-01",
  "endDate": null,
  "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "schedule": {
    "pickupTime": "07:40",
    "dropoffTime": "08:20",
    "timezone": "Europe/Brussels"
  },
  "pmr": {
    "enabled": true,
    "wheelchair": true,
    "adaptedVehicleRequired": true
  },
  "status": "active",
  "source": "manual"
}
```

### 12.4 Garde Alternée Semaine Paire

```json
{
  "id": "assignment-child-321-evening-2026-09-01-4104-even",
  "schemaVersion": 2,
  "studentId": "child-321",
  "studentName": "Élève Garde Alternée",
  "parentIds": ["mother-1", "father-1"],
  "transportManagerId": "tm-1",
  "schoolId": "school-1",
  "transportType": "circuit_ferme",
  "direction": "evening",
  "circuitId": "4104",
  "stopId": "mother-stop-001",
  "stopLabel": "Arrêt maman",
  "driverIds": ["driver-1"],
  "assistantIds": ["assistant-1"],
  "vehicleIds": ["vehicle-1"],
  "startDate": "2026-09-01",
  "endDate": null,
  "daysOfWeek": ["friday"],
  "schedule": {
    "dropoffTime": "16:20",
    "timezone": "Europe/Brussels"
  },
  "alternatingResidence": {
    "enabled": true,
    "weekParity": "even",
    "activeParentKey": "mother",
    "source": "children.alternatingResidence"
  },
  "status": "active",
  "source": "manual"
}
```

## 13. Règles Métier

- une affectation active doit toujours avoir un `studentId` ;
- une affectation active doit toujours avoir un `transportManagerId` ;
- une affectation active doit toujours avoir un `direction` ;
- une affectation active doit toujours avoir un `startDate` ;
- un élève ne doit pas avoir deux affectations actives incompatibles pour la même date, le même jour et la même direction ;
- `direction = morning` et `direction = evening` doivent rester séparés ;
- `transportType = avec_transfert` nécessite un `transferHubId` lorsque le référentiel des transferts est officiel ;
- `transportType = porte_a_porte` ne nécessite pas d'arrêt TEC ;
- PMR avec transfert est invalide ;
- PMR avec `transferHubId` est invalide ;
- centre spécialisé avec transfert est invalide ;
- les internats peuvent utiliser `boarding.destinationType` sans créer une collection séparée ;
- une correction d'affectation ne modifie pas la fiche élève SPW ;
- la suppression physique est interdite hors purge officielle.

## 14. Roadmap

### Phase 1 - Lecture contrôlée

- documenter la collection ;
- garder les écritures interdites ;
- lire uniquement via `transportViewForChild()` ;
- conserver fallback legacy.

### Phase 2 - Dry-run Migration

- générer les affectations depuis les données legacy ;
- détecter les élèves incomplets ;
- détecter les doublons ;
- valider les champs de sécurité.

### Phase 3 - Création Pilote

- créer quelques affectations test en environnement contrôlé ;
- vérifier Affectation rapide ;
- vérifier Briefing du jour ;
- vérifier Présences ;
- vérifier PDF ;
- vérifier règles Firestore.

### Phase 4 - Activation Écriture Transporteur

- autoriser `create` et `update` dans le périmètre transporteur ;
- garder `delete` interdit ;
- journaliser les changements importants ;
- conserver les champs legacy.

### Phase 5 - Migration Générale

- migrer les élèves validés ;
- conserver fallback legacy ;
- comparer V2 et legacy ;
- corriger les incohérences métier.

### Phase 6 - Décommission Legacy

- désactiver progressivement les lectures directes de circuits depuis `children.*` ;
- conserver l'historique ;
- supprimer uniquement après validation SPW et sauvegarde.

## 15. Checklist Avant Activation

- règles Firestore testées avec émulateur ;
- index créés ;
- dry-run migration validé ;
- rollback documenté ;
- sauvegarde Firestore réalisée ;
- `transportViewForChild()` validé ;
- Affectation rapide validée ;
- Présences validées ;
- Briefing du jour validé ;
- PDF validés ;
- accès parent, chauffeur, convoyeuse, transporteur et SPW testés.

