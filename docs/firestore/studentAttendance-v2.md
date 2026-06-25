# studentAttendance V2

Architecture validée le 17/06/2026

## 1. Objectif

`studentAttendance` devient la collection officielle des présences élèves dans GTS V2.

Principe officiel :

```txt
Une présence est encodée une seule fois dans studentAttendance et réutilisée partout.
```

La collection remplace progressivement les feuilles papier de présence et sert de source de vérité pour :

- briefing du jour ;
- écran Présences ;
- dossier élève SPW ;
- reporting ;
- exports PDF mensuels ;
- statistiques.

## 2. Périmètre

`studentAttendance` enregistre uniquement :

- présent ;
- absent.

La convoyeuse ne doit pas encoder :

- monté ;
- descendu ;
- heure de montée ;
- heure de descente ;
- pris en charge.

## 3. Collection Firestore

Collection :

```txt
studentAttendance/{attendanceId}
```

ID recommandé avant activation officielle :

```txt
attendance-{studentId}-{date}-{direction}
```

Exemple :

```txt
attendance-child-123-2026-06-25-morning
```

Raison : ce format est compatible avec Présences V1 déjà préparé.

## 4. Schéma Complet

```json
{
  "id": "attendance-child-123-2026-06-25-morning",
  "schemaVersion": 2,

  "studentId": "child-123",
  "studentName": "Nom Prénom",
  "parentIds": ["parent-1"],

  "date": "2026-06-25",
  "schoolYear": "2025-2026",
  "direction": "morning",

  "attendanceStatus": "present",
  "status": "open",
  "source": "assistant",

  "transportManagerId": "tm-1",
  "circuitIds": ["4104"],
  "circuitLabel": "4104",
  "tripSegmentIds": [],
  "stopPassageIds": [],

  "driverIds": ["driver-1"],
  "assistantId": "assistant-1",
  "assistantIds": ["assistant-1"],
  "vehicleIds": ["vehicle-1"],

  "schoolId": "school-1",
  "schoolName": "École Exemple",

  "validatedAt": "Timestamp",
  "validatedBy": "assistant-1",
  "validatedByRole": "assistant",

  "createdAt": "Timestamp",
  "createdBy": "assistant-1",
  "createdByRole": "assistant",

  "updatedAt": "Timestamp",
  "updatedBy": "assistant-1",
  "updatedByRole": "assistant",

  "closedAt": null,
  "closedBy": "",
  "closedByRole": ""
}
```

## 5. Champs Obligatoires

- `id`
- `schemaVersion`
- `studentId`
- `date`
- `direction`
- `attendanceStatus`
- `status`
- `source`
- `transportManagerId`
- `circuitIds[]`
- `assistantIds[]`
- `validatedAt`
- `validatedBy`
- `validatedByRole`
- `createdAt`
- `updatedAt`

## 6. Champs Optionnels

- `studentName`
- `parentIds[]`
- `schoolYear`
- `circuitLabel`
- `tripSegmentIds[]`
- `stopPassageIds[]`
- `driverIds[]`
- `assistantId`
- `vehicleIds[]`
- `schoolId`
- `schoolName`
- `closedAt`
- `closedBy`
- `closedByRole`

## 7. Valeurs Autorisées

### `direction`

```txt
morning
evening
```

### `attendanceStatus`

```txt
present
absent
```

### `status`

```txt
open
closed
```

### `source`

```txt
assistant
replacement_assistant
spw_correction
migration
```

## 8. Source De Vérité

Source officielle :

```txt
studentAttendance
```

Règles :

- `studentAttendance` indique la présence réellement encodée dans le transport.
- `studentAbsences` reste la collection des absences déclarées à l'avance.
- Les deux collections ne doivent pas être fusionnées.
- Une absence déclarée peut aider le briefing, mais la présence du jour reste un enregistrement `studentAttendance`.

## 9. Workflow

### 1. Préparation

GTS construit la liste des élèves attendus avec :

- `visibleChildren()` ;
- `transportViewForChild()` ;
- date du jour ;
- direction matin/soir.

### 2. Encodage

La convoyeuse sélectionne :

- `Présent` ;
- `Absent`.

GTS enregistre :

- élève ;
- date ;
- direction ;
- circuit ;
- convoyeuse ;
- heure de validation ;
- statut.

### 3. Modification

Tant que `status = open`, la convoyeuse concernée peut modifier :

- `attendanceStatus` ;
- `validatedAt` ;
- `updatedAt`.

### 4. Clôture

Quand `status = closed`, la présence n'est plus modifiable par la convoyeuse.

La clôture est réservée au SPW ou à un processus validé.

### 5. Réutilisation

La présence est réutilisée par :

- dossier élève SPW ;
- exports ;
- reporting ;
- briefing ;
- contrôles mensuels.

## 10. Règles De Lecture

Lecture autorisée :

- SPW : toutes les présences ;
- admin système : toutes les présences ;
- transporteur : présences de son `transportManagerId` ;
- chauffeur : présences où `driverIds[]` contient son `profileId` ;
- convoyeuse : présences où `assistantIds[]` contient son `profileId` ;
- parent : lecture future uniquement si `parentIds[]` contient son `profileId` et si le portail parent le prévoit.

Lecture interdite :

- support par défaut ;
- parent non concerné ;
- chauffeur hors circuit ;
- convoyeuse hors circuit ;
- transporteur hors périmètre.

## 11. Règles D'Écriture

Écriture autorisée :

- convoyeuse concernée ;
- convoyeuse remplaçante concernée ;
- SPW pour correction et clôture.

Écriture interdite :

- chauffeur ;
- parent ;
- transporteur dans la V2 initiale ;
- support ;
- utilisateur hors périmètre.

Suppression :

```txt
delete = false
```

Correction :

- pas de suppression physique ;
- correction par mise à jour ;
- historique futur recommandé via logs.

## 12. Pseudo-Rules Firestore

```js
match /studentAttendance/{attendanceId} {
  allow read: if isSpw()
    || isSystemAdmin()
    || hasTransportManagerScope(resource.data)
    || uidIn(profileId(), resource.data.driverIds)
    || uidIn(profileId(), resource.data.assistantIds)
    || uidIn(profileId(), resource.data.parentIds);

  allow create: if canCreateStudentAttendance(request.resource.data);

  allow update: if canUpdateStudentAttendance(resource.data, request.resource.data);

  allow delete: if false;
}
```

Helpers attendus :

```js
function canCreateStudentAttendance(data) {
  return isAssistant()
    && uidIn(profileId(), data.assistantIds)
    && data.status == "open"
    && data.attendanceStatus in ["present", "absent"]
    && data.direction in ["morning", "evening"];
}

function canUpdateStudentAttendance(oldData, newData) {
  return oldData.status == "open"
    && (
      (
        isAssistant()
        && uidIn(profileId(), oldData.assistantIds)
        && uidIn(profileId(), newData.assistantIds)
        && immutableAttendanceIdentity(oldData, newData)
      )
      || isSpw()
      || isSystemAdmin()
    );
}
```

Champs immuables pour convoyeuse :

- `studentId`
- `date`
- `direction`
- `transportManagerId`
- `circuitIds`
- `assistantIds`

## 13. Index Nécessaires

Index simples :

- `studentId`
- `date`
- `direction`
- `transportManagerId`
- `status`
- `schoolId`
- `attendanceStatus`

Index array :

- `circuitIds[]`
- `driverIds[]`
- `assistantIds[]`
- `parentIds[]`

Index composites recommandés :

```txt
transportManagerId ASC, date ASC, direction ASC
transportManagerId ASC, date ASC, status ASC
studentId ASC, date ASC, direction ASC
schoolId ASC, date ASC, direction ASC
attendanceStatus ASC, date ASC
```

Index avec array contains :

```txt
assistantIds ARRAY_CONTAINS, date ASC, direction ASC
driverIds ARRAY_CONTAINS, date ASC, direction ASC
circuitIds ARRAY_CONTAINS, date ASC, direction ASC
parentIds ARRAY_CONTAINS, date ASC, direction ASC
```

Index reporting :

```txt
transportManagerId ASC, schoolYear ASC, attendanceStatus ASC
schoolId ASC, schoolYear ASC, attendanceStatus ASC
```

## 14. Compatibilité Présences V1

Présences V1 est compatible avec V2 si les champs suivants sont conservés :

- `id`
- `date`
- `direction`
- `studentId`
- `studentName`
- `transportManagerId`
- `circuitIds`
- `driverIds`
- `assistantId`
- `assistantIds`
- `attendanceStatus`
- `validatedAt`
- `validatedBy`
- `validatedByRole`
- `updatedAt`
- `updatedBy`
- `status`

Champs à ajouter avant activation officielle :

- `schemaVersion`
- `schoolYear`
- `parentIds`
- `vehicleIds`
- `schoolId`
- `schoolName`
- `createdAt`
- `createdBy`
- `createdByRole`
- `source`

## 15. Migration V1 Vers V2

Étapes :

1. Sauvegarde Firestore.
2. Export ou dry-run de `studentAttendance`.
3. Lecture des `children`.
4. Pour chaque présence V1 :
   - vérifier `studentId` ;
   - vérifier `date` ;
   - vérifier `direction` ;
   - compléter `schemaVersion: 2` ;
   - compléter `schoolYear` ;
   - compléter `parentIds[]` depuis l'élève ;
   - compléter `vehicleIds[]` via `transportViewForChild()` ;
   - compléter `schoolId` et `schoolName` ;
   - compléter `createdAt`, `createdBy`, `createdByRole` ;
   - compléter `source`.
5. Détecter doublons par `studentId + date + direction`.
6. Produire rapport :
   - documents migrables ;
   - documents incomplets ;
   - conflits ;
   - doublons.
7. Écriture uniquement après validation.
8. Activation Firestore Rules V2.
9. Tests convoyeuse, chauffeur, SPW.

## 16. Exemple JSON Présent

```json
{
  "id": "attendance-child-123-2026-06-25-morning",
  "schemaVersion": 2,
  "studentId": "child-123",
  "studentName": "Lucas Moreau",
  "parentIds": ["parent-1"],
  "date": "2026-06-25",
  "schoolYear": "2025-2026",
  "direction": "morning",
  "attendanceStatus": "present",
  "status": "open",
  "source": "assistant",
  "transportManagerId": "tm-keolis",
  "circuitIds": ["4104"],
  "circuitLabel": "4104",
  "tripSegmentIds": [],
  "stopPassageIds": [],
  "driverIds": ["driver-1779488107105"],
  "assistantId": "assistant-1779505427557",
  "assistantIds": ["assistant-1779505427557"],
  "vehicleIds": ["vehicle-1"],
  "schoolId": "school-1",
  "schoolName": "Institut Sainte-Marie",
  "validatedAt": "2026-06-25T06:45:00.000Z",
  "validatedBy": "assistant-1779505427557",
  "validatedByRole": "assistant",
  "createdAt": "2026-06-25T06:45:00.000Z",
  "createdBy": "assistant-1779505427557",
  "createdByRole": "assistant",
  "updatedAt": "2026-06-25T06:45:00.000Z",
  "updatedBy": "assistant-1779505427557",
  "updatedByRole": "assistant",
  "closedAt": null,
  "closedBy": "",
  "closedByRole": ""
}
```

## 17. Exemple JSON Absent

```json
{
  "id": "attendance-child-456-2026-06-25-evening",
  "schemaVersion": 2,
  "studentId": "child-456",
  "studentName": "Emma Dubois",
  "parentIds": ["parent-2"],
  "date": "2026-06-25",
  "schoolYear": "2025-2026",
  "direction": "evening",
  "attendanceStatus": "absent",
  "status": "open",
  "source": "replacement_assistant",
  "transportManagerId": "tm-keolis",
  "circuitIds": ["4220"],
  "circuitLabel": "4220",
  "tripSegmentIds": ["segment-4220-school-stop"],
  "stopPassageIds": ["passage-school-1545", "passage-stop-1610"],
  "driverIds": ["driver-2"],
  "assistantId": "assistant-remplacement-1",
  "assistantIds": ["assistant-remplacement-1"],
  "vehicleIds": ["vehicle-9"],
  "schoolId": "school-2",
  "schoolName": "École Exemple",
  "validatedAt": "2026-06-25T14:55:00.000Z",
  "validatedBy": "assistant-remplacement-1",
  "validatedByRole": "assistant",
  "createdAt": "2026-06-25T14:55:00.000Z",
  "createdBy": "assistant-remplacement-1",
  "createdByRole": "assistant",
  "updatedAt": "2026-06-25T14:55:00.000Z",
  "updatedBy": "assistant-remplacement-1",
  "updatedByRole": "assistant",
  "closedAt": null,
  "closedBy": "",
  "closedByRole": ""
}
```

## 18. Règles Métier

- Une présence concerne un seul élève, une date et une direction.
- Une présence ne contient pas de données médicales.
- Une absence déclarée n'est pas une présence encodée.
- La convoyeuse encode uniquement pour son périmètre.
- Le chauffeur lit uniquement.
- Le transporteur lit uniquement dans la première V2.
- Le SPW peut corriger et clôturer.
- La suppression physique est interdite.

## 19. Activation Officielle

Avant activation :

1. Schéma V2 validé.
2. Firestore Rules écrites.
3. Tests Rules créés.
4. Migration dry-run validée.
5. Présences V1 ajustée au schéma V2 complet.
6. Sauvegarde Firestore.
7. Activation progressive.

## 20. Recommandation

`studentAttendance` doit devenir la seule source durable des présences.

Il ne faut pas créer de collection parallèle comme :

- `attendanceRecords` ;
- `dailyAttendance` ;
- `presenceRecords`.

Tout futur module doit lire `studentAttendance`.
