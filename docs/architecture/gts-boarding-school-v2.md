# GTS Boarding School V2

Architecture validée le 17/06/2026

## 1. Définition Métier

Un internat est un lieu de vie ou d'hébergement lié au parcours scolaire d'un élève.

Dans GTS V2, l'internat n'est pas un type de transport principal. Il est représenté par :

- un régime d'internat dans `studentAssignments` ;
- une destination métier via `destinationType` ;
- des passages et segments uniquement lorsque l'élève est réellement transporté.

Le transport quotidien ne doit pas être créé artificiellement pour un élève interne qui ne voyage pas chaque jour.

## 2. Principes Officiels

- SPW reste propriétaire des données officielles de l'élève.
- Le transporteur organise uniquement les trajets.
- L'internat ne remplace pas `transportType`.
- L'internat ne doit pas être confondu avec un transfert.
- Le retour week-end doit respecter la garde alternée officielle si elle existe.
- Les élèves PMR ne passent jamais par transfert.
- Les centres spécialisés restent des destinations directes.

## 3. `boardingMode`

Champ recommandé dans `studentAssignments`.

Valeurs officielles :

```txt
none
weekly
continuous
weekend_return
alternate_weekend_return
```

### `none`

L'élève n'est pas concerné par l'internat.

### `weekly`

L'élève reste à l'internat pendant la semaine scolaire.

Exemple :

- lundi matin : domicile ou arrêt TEC -> internat ou école ;
- vendredi soir : internat ou école -> domicile ou arrêt TEC.

### `continuous`

L'élève reste à l'internat en continu.

Il peut ne pas avoir d'affectation transport régulière.

### `weekend_return`

L'élève rentre chaque week-end.

Exemple :

- vendredi soir : internat -> domicile parent ;
- lundi matin : domicile parent -> internat.

### `alternate_weekend_return`

L'élève rentre un week-end sur deux.

La périodicité doit utiliser :

- `weekPattern: "even"` ;
- `weekPattern: "odd"`.

La convention reste celle de GTS :

- semaine ISO paire = semaine paire ;
- semaine ISO impaire = semaine impaire.

## 4. `destinationType`

Champ recommandé dans `studentAssignments`, `stopPassages` et `tripSegments` lorsque la destination métier doit être explicite.

Valeurs utiles :

```txt
school
home_address
specialized_center
boarding_school
weekend_parent_home
custom_address
```

### Règles

- `boarding_school` représente l'internat.
- `weekend_parent_home` représente la destination week-end liée au parent ou responsable actif.
- `specialized_center` est toujours une destination directe.
- `custom_address` reste un fallback contrôlé.
- `destinationType` ne remplace pas les champs `from`, `to` ou `stop`.

## 5. Garde Alternée

La garde alternée reste portée officiellement par `children.alternatingResidence`.

GTS V2 ne doit pas recréer une seconde logique de garde alternée pour l'internat.

Pour un retour week-end en garde alternée :

- semaine paire : parent configuré comme actif pour semaine paire ;
- semaine impaire : parent configuré comme actif pour semaine impaire ;
- l'arrêt actif doit venir de la logique centralisée existante ;
- `activeParentKey` peut être dénormalisé dans `studentAssignments` pour faciliter les règles et l'affichage.

Exemple :

```json
{
  "boardingMode": "alternate_weekend_return",
  "weekPattern": "even",
  "destinationType": "weekend_parent_home",
  "activeParentKey": "mother"
}
```

## 6. Élève Mineur

Pour un élève mineur :

- la destination week-end doit être liée à un parent ou responsable autorisé ;
- les informations officielles restent dans `children` ;
- les notifications doivent cibler les responsables autorisés ;
- le transporteur ne doit pas modifier les données administratives ou familiales.

Champs recommandés :

```json
{
  "isAdultStudent": false,
  "responsibleParentId": "parent-123"
}
```

## 7. Élève Majeur

Pour un élève majeur :

- l'élève peut être son propre contact principal ;
- les notifications parentales doivent respecter le consentement et la base légale ;
- l'adresse week-end peut être différente des adresses parentales ;
- l'accès aux données sensibles doit rester limité.

Champs recommandés :

```json
{
  "isAdultStudent": true,
  "responsibleParentId": "",
  "destinationType": "home_address"
}
```

## 8. Internat + PMR

Règle officielle :

- PMR ne passe jamais par transfert ;
- PMR vers internat est un trajet direct ;
- PMR vers centre spécialisé est un trajet direct ;
- PMR peut être `porte_a_porte` ;
- PMR peut aussi être transporté vers une destination `boarding_school` si le trajet est direct.

Exemple :

```json
{
  "transportType": "porte_a_porte",
  "destinationType": "boarding_school",
  "boardingMode": "weekly",
  "pmrRequired": true,
  "wheelchairRequired": true,
  "transferHubIds": []
}
```

Interdit :

```json
{
  "transportType": "avec_transfert",
  "destinationType": "boarding_school",
  "pmrRequired": true,
  "transferHubIds": ["transfer-ougree"]
}
```

## 9. Internat + Transfert Non PMR

Un élève non PMR peut utiliser un transfert pour rejoindre ou quitter l'internat si le terrain le justifie.

Exemple matin :

```txt
Arrêt TEC -> Transfert -> Internat
```

Exemple soir :

```txt
Internat -> Transfert -> Arrêt TEC parent
```

Conditions :

- l'élève n'est pas PMR ;
- le transfert existe dans le référentiel officiel ;
- les passages entrants et sortants sont explicites ;
- le changement ou maintien de car est visible via les segments.

## 10. Validations

Validations recommandées :

- `boardingMode` doit être une valeur officielle.
- `destinationType = "boarding_school"` doit avoir un point `boarding_school` ou `custom_address` documenté.
- `destinationType = "weekend_parent_home"` doit avoir un parent ou responsable de destination.
- `alternate_weekend_return` doit utiliser `weekPattern = "even"` ou `"odd"`.
- `continuous` ne doit pas créer d'affectation quotidienne fictive.
- PMR + transfert est invalide.
- PMR + `transferHubId` ou `transferHubIds` est invalide.
- PMR + `stop.type = "transfer_hub"` est invalide.
- `specialized_center` + transfert est invalide.
- élève mineur sans responsable week-end doit générer une alerte.

Alertes recommandées :

```txt
boarding_assignment_missing
boarding_weekend_return_missing
boarding_parent_destination_missing
boarding_alternating_residence_incomplete
boarding_continuous_without_transport
adult_student_consent_required
minor_responsible_missing
pmr_transfer_invalid
specialized_center_transfer_invalid
```

## 11. Impact `studentAssignments`

`studentAssignments` porte le régime et la périodicité du transport.

Champs minimum recommandés :

```json
{
  "studentId": "child-123",
  "transportManagerId": "tm-1",
  "direction": "evening",
  "transportType": "circuit_ferme",
  "destinationType": "weekend_parent_home",
  "boardingMode": "alternate_weekend_return",
  "weekPattern": "even",
  "validDays": ["friday"],
  "pickupPassageId": "pass-boarding-friday",
  "dropoffPassageId": "pass-parent-home-friday",
  "passageIds": ["pass-boarding-friday", "pass-parent-home-friday"],
  "tripSegmentIds": ["seg-boarding-parent-friday"],
  "circuitIds": ["circuit-4104"],
  "activeParentKey": "mother",
  "responsibleParentId": "parent-mother",
  "active": true
}
```

Champs optionnels :

```json
{
  "boardingSchoolId": "boarding-school-1",
  "boardingSchoolLabel": "Internat Sainte-Marie",
  "isAdultStudent": false,
  "notes": "Retour un week-end sur deux."
}
```

## 12. Impact `stopPassages`

`stopPassages` représente les points réels de montée, descente ou passage.

Types utiles pour internat :

```txt
boarding_school
home_address
tec_stop
school
custom_address
```

Exemple :

```json
{
  "id": "pass-boarding-friday",
  "transportManagerId": "tm-1",
  "tripSegmentId": "seg-boarding-parent-friday",
  "circuitId": "circuit-4104",
  "direction": "evening",
  "transportType": "circuit_ferme",
  "destinationType": "weekend_parent_home",
  "passageType": "pickup",
  "stop": {
    "type": "boarding_school",
    "id": "boarding-school-1",
    "label": "Internat Sainte-Marie"
  },
  "plannedTime": "16:15",
  "passageOrder": 1,
  "validDays": ["friday"],
  "weekPattern": "even",
  "active": true
}
```

## 13. Impact `tripSegments`

`tripSegments` décrit les portions physiques du trajet.

Exemple sans transfert :

```json
{
  "id": "seg-boarding-parent-friday",
  "transportManagerId": "tm-1",
  "direction": "evening",
  "transportType": "circuit_ferme",
  "destinationType": "weekend_parent_home",
  "circuitId": "circuit-4104",
  "segmentOrder": 1,
  "from": {
    "type": "boarding_school",
    "id": "boarding-school-1",
    "label": "Internat Sainte-Marie"
  },
  "to": {
    "type": "tec_stop",
    "id": "tec-parent-even",
    "label": "Arrêt TEC parent actif"
  },
  "plannedDepartureTime": "16:15",
  "plannedArrivalTime": "17:05",
  "vehicleId": "vehicle-12",
  "driverId": "driver-1",
  "assistantId": "assistant-1",
  "validDays": ["friday"],
  "weekPattern": "even",
  "active": true
}
```

Exemple avec transfert non PMR :

```json
{
  "transportType": "avec_transfert",
  "destinationType": "boarding_school",
  "from": {
    "type": "tec_stop",
    "id": "tec-start",
    "label": "Arrêt TEC"
  },
  "to": {
    "type": "transfer_hub",
    "id": "transfer-a",
    "label": "Transfert A"
  },
  "transferHubId": "transfer-a",
  "pmrRequired": false
}
```

## 14. Impact `transportViewForChild()`

`transportViewForChild()` doit pouvoir exposer :

```json
{
  "summary": {
    "transportType": "circuit_ferme",
    "destinationType": "weekend_parent_home",
    "boardingMode": "alternate_weekend_return",
    "isBoardingStudent": true,
    "activeParentKey": "mother",
    "activeParentLabel": "Maman"
  },
  "alerts": [
    {
      "code": "boarding_weekend_return_missing",
      "level": "warning"
    }
  ]
}
```

La fonction doit distinguer :

- élève interne sans transport aujourd'hui ;
- prochain trajet week-end ;
- trajet vers internat ;
- retour vers parent actif ;
- trajet direct PMR ;
- trajet avec transfert non PMR.

## 15. Impact Affectation Rapide

L'écran Affectation rapide doit prévoir un filtre :

```txt
Internat
```

Sous-filtres recommandés :

- toute la semaine ;
- en continu ;
- retour chaque week-end ;
- retour un week-end sur deux ;
- garde alternée week-end ;
- élève mineur ;
- élève majeur ;
- alertes internat.

Carte élève recommandée :

```txt
Nom élève
Régime : Internat semaine
Retour : vendredi
Semaine : paire
Parent actif : maman
Destination : domicile maman
Arrêt : Arrêt TEC parent actif
Circuit : 4104
Chauffeur : ...
Convoyeuse : ...
Véhicule : ...
Alertes : ...
```

L'écran doit éviter de classer comme non affecté un élève interne qui n'a volontairement pas de transport quotidien.

## 16. Recommandation Officielle V2

La gestion des internats doit être introduite progressivement.

Ordre recommandé :

1. documenter le modèle métier ;
2. ajouter les champs et validations pures ;
3. adapter `transportViewForChild()` ;
4. afficher les internats en lecture seule dans Affectation rapide ;
5. préparer l'écriture uniquement après validation terrain.

Ne pas créer de collection dédiée aux internats au démarrage V2.

Les internats peuvent d'abord être représentés par :

- `destinationType` ;
- `boardingMode` ;
- les points `boarding_school` dans `stopPassages` et `tripSegments` ;
- les informations officielles élève gérées par SPW.
