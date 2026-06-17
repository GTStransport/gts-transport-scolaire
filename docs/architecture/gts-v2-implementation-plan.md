# GTS V2 Implementation Plan

Architecture validée le 17/06/2026

## 1. Objectif Du Document

Ce document rassemble le plan officiel de developpement GTS V2.

Il consolide :

- architecture cible ;
- modele metier ;
- collections Firestore ;
- strategie de migration ;
- securite et roles ;
- roadmap technique ;
- ordre de developpement recommande.

Ce document ne decrit pas une refonte immediate. Il definit une evolution progressive, compatible avec l'application actuelle et avec les champs legacy existants.

## 2. Principes Directeurs

La V2 doit respecter les principes suivants :

- ne pas casser l'existant ;
- conserver les champs legacy au debut ;
- garder le fallback legacy obligatoire ;
- introduire les objets V2 par petits lots ;
- ne jamais migrer la production sans validation ;
- ne jamais supprimer les anciens champs avant validation terrain ;
- separer clairement SPW et transporteur ;
- proteger les donnees sensibles des eleves ;
- eviter la sur-ingenierie.

## 3. Separation SPW / Transporteur

### SPW

Le SPW est proprietaire du referentiel officiel eleve.

Le SPW gere :

- creation des eleves ;
- modification des eleves ;
- donnees administratives ;
- donnees medicales ;
- handicap et PMR ;
- ecoles ;
- garde alternee ;
- parents et responsables ;
- informations officielles de l'eleve.

### Transporteur

Le transporteur est proprietaire de l'organisation du transport.

Le transporteur gere :

- circuits ;
- trajets ;
- segments ;
- passages ;
- affectations transport ;
- chauffeurs ;
- convoyeuses ;
- vehicules ;
- transferts operationnels ;
- remplacements.

Le transporteur ne cree pas, ne supprime pas et ne modifie pas les donnees officielles de l'eleve.

## 4. Architecture Metier V2

La V2 repose sur quatre objets principaux :

- `transferHubs` : points de transfert ;
- `tripSegments` : portions reelles de trajet ;
- `stopPassages` : passages reels a un point donne ;
- `studentAssignments` : affectations d'un eleve a des passages.

Modele de lecture :

```txt
children
  -> studentAssignments
    -> stopPassages
      -> tripSegments
        -> transferHubs
```

Regle metier centrale :

Un eleve ne doit pas etre affecte simplement a un arret TEC. Il doit etre affecte a un passage precis.

Exemple :

```txt
Arret TEC X
  - Circuit 4104 a 07h15 vers Transfert A
  - Circuit 4220 a 07h22 vers Transfert B
  - Circuit 4301 a 07h25 vers Transfert A
```

Ces trois lignes sont trois `stopPassages` differents.

## 5. Collections Firestore Cibles

### `transferHubs`

Referentiel partage des transferts.

Exemple :

```json
{
  "id": "transfer-a",
  "name": "Transfert A",
  "label": "Transfert A",
  "address": "Rue du Depot 12",
  "postalCode": "5000",
  "city": "Namur",
  "schoolIds": ["school-horizon", "school-sainte-claire"],
  "transportManagerIds": ["tm-1"],
  "active": true,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `tripSegments`

Portion reelle de trajet.

Exemple :

```json
{
  "id": "seg-4104-tec-transfer",
  "transportManagerId": "tm-1",
  "direction": "morning",
  "transportType": "avec_transfert",
  "circuitId": "circuit-4104",
  "segmentOrder": 1,
  "from": {
    "type": "tec_stop",
    "id": "stop-tec-x",
    "label": "Arret TEC X"
  },
  "to": {
    "type": "transfer_hub",
    "id": "transfer-a",
    "label": "Transfert A"
  },
  "plannedDepartureTime": "07:15",
  "plannedArrivalTime": "07:35",
  "vehicleId": "vehicle-12",
  "driverId": "driver-jean",
  "assistantId": "assistant-marie",
  "transferHubId": "transfer-a",
  "validDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "weekPattern": "all",
  "active": true
}
```

### `stopPassages`

Passage reel a un point precis.

Exemple :

```json
{
  "id": "pass-4104-tec-x-0715",
  "transportManagerId": "tm-1",
  "tripSegmentId": "seg-4104-tec-transfer",
  "circuitId": "circuit-4104",
  "direction": "morning",
  "transportType": "avec_transfert",
  "passageType": "pickup",
  "stop": {
    "type": "tec_stop",
    "id": "stop-tec-x",
    "label": "Arret TEC X"
  },
  "tecStopId": "stop-tec-x",
  "plannedTime": "07:15",
  "passageOrder": 1,
  "vehicleId": "vehicle-12",
  "driverId": "driver-jean",
  "assistantId": "assistant-marie",
  "validDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "weekPattern": "all",
  "active": true
}
```

### `studentAssignments`

Affectation transport d'un eleve SPW a des passages.

Exemple :

```json
{
  "id": "asg-child-123-morning-even",
  "studentId": "child-123",
  "transportManagerId": "tm-1",
  "direction": "morning",
  "transportType": "circuit_ferme",
  "weekPattern": "even",
  "validDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "pickupPassageId": "pass-even-pick",
  "dropoffPassageId": "pass-even-school",
  "passageIds": ["pass-even-pick", "pass-even-school"],
  "tripSegmentIds": ["seg-even"],
  "circuitIds": ["circuit-even"],
  "driverIds": ["driver-even"],
  "assistantIds": ["assistant-1"],
  "vehicleIds": ["vehicle-even"],
  "parentIds": ["parent-mother", "parent-father"],
  "schoolId": "school-horizon",
  "activeParentKey": "mother",
  "alternatingResidenceMode": "uses_child_alternating_residence",
  "active": true
}
```

## 6. Types De Transport

La V2 supporte trois types de transport :

- `avec_transfert` ;
- `circuit_ferme` ;
- `porte_a_porte`.

### `avec_transfert`

Trajet compose de plusieurs segments.

Exemple matin :

```txt
Arret TEC -> Transfert -> Ecole
```

### `circuit_ferme`

Trajet direct sans transfert.

Exemple matin :

```txt
Arret TEC -> Ecole
```

### `porte_a_porte`

Trajet domicile <-> ecole, notamment pour PMR.

Exemple matin :

```txt
Domicile parent actif -> Ecole
```

## 7. Garde Alternee

La garde alternee reste portee officiellement par `children.alternatingResidence`.

Convention :

- semaine ISO paire = semaine paire ;
- semaine ISO impaire = semaine impaire.

La V2 ne doit pas recreer une seconde logique de garde alternee.

Dans `studentAssignments`, la garde alternee se traduit uniquement par :

- `weekPattern: "even"` ;
- `weekPattern: "odd"` ;
- passages differents selon la semaine ;
- eventuellement `activeParentKey` comme information denormalisee.

La source officielle reste :

```txt
children.alternatingResidence
```

## 8. PMR

Les donnees PMR officielles restent dans `children`, gere par le SPW.

La V2 traduit l'impact transport dans :

- `tripSegments.transportType = "porte_a_porte"` ;
- `tripSegments.pmrCompatibleRequired = true` ;
- `tripSegments.wheelchairCompatibleRequired = true` ;
- `stopPassages.stop.type = "home_address"` ;
- `studentAssignments.pmrRequired = true` ;
- `studentAssignments.wheelchairRequired = true`.

Les vehicules adaptes restent geres dans `vehicles`.

## 9. Lecture Normalisee

La lecture transport doit passer par `transportViewForChild()`.

Ordre de resolution :

```txt
1. V2 complete
2. V2 partielle + legacy = mixed
3. Legacy children.*
4. Unassigned
```

Regles :

- aucune ecriture ;
- aucune requete Firestore directe ;
- fonction pure ;
- donnees V2 fournies en memoire ;
- fallback legacy obligatoire.

La fonction doit produire une vue normalisee contenant :

- `student` ;
- `summary` ;
- `route` ;
- `transport` ;
- `alternatingResidence` ;
- `alerts` ;
- `notifications` ;
- `pdf` ;
- `raw`.

## 10. Compatibilite Legacy

Champs legacy conserves :

- `children.pickupStop` ;
- `children.motherPickupStop` ;
- `children.fatherPickupStop` ;
- `children.circuitNumber` ;
- `children.pickupCircuitId` ;
- `children.schoolCircuitId` ;
- `children.transferSchoolCircuitId` ;
- `children.driverId` ;
- `children.driverIds` ;
- `children.assistantId` ;
- `children.vehicleId`.

Regle :

Aucun champ legacy ne doit etre supprime au debut de la V2.

La migration doit etre progressive :

```txt
V2 si disponible
sinon legacy
sinon non affecte
```

## 11. Index Firestore Recommandes

### `tripSegments`

```txt
transportManagerId ASC, active ASC, direction ASC
transportManagerId ASC, active ASC, circuitId ASC
transportManagerId ASC, active ASC, driverId ASC
transportManagerId ASC, active ASC, assistantId ASC
transportManagerId ASC, active ASC, vehicleId ASC
transportManagerId ASC, active ASC, transferHubId ASC
transportManagerId ASC, active ASC, direction ASC, weekPattern ASC
```

### `stopPassages`

```txt
transportManagerId ASC, active ASC, direction ASC
transportManagerId ASC, active ASC, tripSegmentId ASC, passageOrder ASC
transportManagerId ASC, active ASC, circuitId ASC, plannedTime ASC
transportManagerId ASC, active ASC, tecStopId ASC, plannedTime ASC
transportManagerId ASC, active ASC, transferHubId ASC, plannedTime ASC
transportManagerId ASC, active ASC, schoolId ASC, plannedTime ASC
transportManagerId ASC, active ASC, driverId ASC, direction ASC
transportManagerId ASC, active ASC, assistantId ASC, direction ASC
```

### `studentAssignments`

```txt
studentId ASC, active ASC, direction ASC
studentId ASC, active ASC, direction ASC, weekPattern ASC
transportManagerId ASC, active ASC, direction ASC
transportManagerId ASC, active ASC, schoolId ASC
transportManagerId ASC, active ASC, direction ASC, weekPattern ASC
transportManagerId ASC, active ASC, circuitIds ARRAY_CONTAINS
transportManagerId ASC, active ASC, driverIds ARRAY_CONTAINS
transportManagerId ASC, active ASC, assistantIds ARRAY_CONTAINS
transportManagerId ASC, active ASC, vehicleIds ARRAY_CONTAINS
transportManagerId ASC, active ASC, parentIds ARRAY_CONTAINS
```

### `transferHubs`

```txt
active ASC, city ASC
active ASC, transportManagerIds ARRAY_CONTAINS
active ASC, schoolIds ARRAY_CONTAINS
```

## 12. Securite Firestore V2

### Principes

Les Firestore Rules V2 doivent garantir :

- SPW modifie `children` ;
- transporteur modifie uniquement l'organisation du transport ;
- parent lit uniquement ses enfants ;
- chauffeur lit uniquement ses passages, segments et affectations ;
- convoyeuse lit uniquement ses passages, segments et affectations ;
- support et admin restent encadres.

### Donnees Denormalisees Utiles

Pour permettre des regles efficaces, `studentAssignments` doit denormaliser :

- `transportManagerId` ;
- `studentId` ;
- `parentIds` ;
- `driverIds` ;
- `assistantIds` ;
- `vehicleIds` ;
- `circuitIds` ;
- `schoolId` ;
- `transferHubIds`.

### Risque A Eviter

Firestore Rules ne doivent pas necessiter trop de lectures croisees.

Les documents doivent donc porter les IDs necessaires au controle d'acces.

## 13. Strategie De Migration

### Phase 0 : Documentation Et Helpers

Objectif :

- documenter le modele ;
- ajouter helpers purs ;
- verifier en memoire ;
- ne rien ecrire en production.

Etat attendu :

- helpers `tripSegments` ;
- helpers `stopPassages` ;
- helpers `studentAssignments` ;
- `transportViewForChild()` en lecture pure.

### Phase 1 : Dry-Run Legacy

Objectif :

- lire `children.*` ;
- produire des objets V2 en memoire ;
- generer un rapport ;
- ne rien ecrire.

Categories :

- migrable ;
- incomplet ;
- incoherent ;
- a valider par transporteur.

### Phase 2 : Staging

Objectif :

- creer les collections en staging ;
- ecrire des documents V2 non production ;
- marquer `migrationStatus = "needs_review"` ;
- comparer V2 et legacy.

### Phase 3 : Validation Metier

Validation par :

- SPW ;
- transporteur ;
- chauffeur ;
- convoyeuse ;
- parent test.

### Phase 4 : Lecture Mixte Production

Objectif :

- lire V2 si disponible ;
- fallback legacy ;
- alerter si donnees mixtes ;
- ne pas supprimer legacy.

### Phase 5 : Activation Progressive

Activation par lot :

- transporteur ;
- ecole ;
- circuit ;
- type de transport.

### Phase 6 : Retrait Legacy

Uniquement apres validation terrain complete.

Le retrait legacy n'est pas une priorite initiale.

## 14. Roadmap Technique

### Lot 1 : Helpers Et Types V2

Objectif :

- ajouter helpers purs ;
- valider les structures en memoire.

Livrables :

- `TripSegment` ;
- `StopPassage` ;
- `StudentAssignment` ;
- validations ;
- normalisations ;
- summaries.

### Lot 2 : `transportViewForChild()`

Objectif :

- centraliser la lecture transport ;
- preparer V2 sans casser legacy.

Contraintes :

- fonction pure ;
- aucune requete Firestore ;
- aucun ecran remplace au debut.

### Lot 3 : Firestore Rules V2 Sur Papier

Objectif :

- definir les droits ;
- lister les tests ;
- ne pas deployer.

### Lot 4 : Dry-Run Migration

Objectif :

- produire un rapport ;
- ne rien ecrire.

### Lot 5 : Ecran Affectation Rapide En Lecture

Objectif :

- afficher les donnees ;
- verifier les cas metier ;
- ne pas ecrire au debut.

### Lot 6 : Ecriture V2 Controlee

Objectif :

- ecrire V2 uniquement apres validation ;
- conserver fallback legacy.

### Lot 7 : Deploiement Progressif

Objectif :

- activer par perimetre limite ;
- conserver rollback ;
- surveiller couts et erreurs.

## 15. Cout Firestore Estime

Lecture V2 naive pour une fiche eleve :

```txt
1 child
1 a 4 studentAssignments
2 a 8 stopPassages
1 a 4 tripSegments
0 a 2 transferHubs
= environ 5 a 19 lectures
```

Optimisations :

- charger les tableaux V2 par lot ;
- eviter une requete par ligne eleve ;
- denormaliser les IDs utiles ;
- utiliser `transportViewForChild()` sur donnees deja chargees ;
- paginer les listes chauffeur, convoyeuse et transporteur.

Risque principal :

```txt
N+1 Firestore reads
```

Ce risque doit etre evite avant toute activation production.

## 16. Risques

### Risques Metier

- confondre arret TEC et passage ;
- dupliquer la garde alternee ;
- affecter un eleve a deux trajets actifs ;
- oublier le soir ;
- mal gerer le transfert ;
- oublier les PMR ;
- creer une configuration trop lourde.

### Risques Techniques

- index manquants ;
- couts Firestore eleves ;
- regles Firestore trop permissives ;
- regles Firestore trop complexes ;
- divergence UI/PDF/notifications ;
- migration irreversible.

### Risques RGPD

- chauffeur voyant des eleves hors trajet ;
- parent voyant des donnees d'autres enfants ;
- transporteur modifiant des donnees SPW ;
- exposition excessive des donnees medicales ;
- absence de trace sur actions sensibles futures.

## 17. Tests Requis

Tests unitaires :

- validation `tripSegments` ;
- validation `stopPassages` ;
- validation `studentAssignments` ;
- semaine ISO paire/impaire ;
- residence active ;
- fallback legacy ;
- source `v2`, `mixed`, `legacy`, `unassigned`.

Tests metier :

- eleve simple ;
- transfert simple ;
- changement de car ;
- meme car apres transfert ;
- garde alternee semaine paire ;
- garde alternee semaine impaire ;
- PMR porte-a-porte ;
- circuit ferme ;
- trajet matin different du soir ;
- eleve non affecte.

Tests securite :

- parent ;
- chauffeur ;
- convoyeuse ;
- transporteur ;
- SPW ;
- support ;
- admin.

Tests migration :

- dry-run sans ecriture ;
- rapport d'incoherences ;
- comparaison legacy/V2 ;
- rollback.

## 18. Ordre De Developpement Recommande

Ordre officiel :

1. finaliser helpers purs V2 ;
2. consolider `transportViewForChild()` ;
3. documenter Firestore Rules V2 ;
4. creer tests en memoire ;
5. preparer dry-run migration ;
6. concevoir requetes de lecture par role ;
7. preparer Firestore Rules V2 en tests ;
8. creer collections en staging ;
9. ecrire donnees V2 en staging ;
10. valider avec SPW et transporteur ;
11. creer ecran Affectation Rapide en lecture ;
12. ajouter ecriture V2 controlee ;
13. activer par petit perimetre ;
14. surveiller couts, erreurs et acces ;
15. envisager retrait legacy seulement apres validation.

## 19. Prochain Lot Recommande

Prochain lot conseille :

```txt
Preparatifs Firestore Rules V2 sans deploiement.
```

Objectif :

- definir les droits exacts ;
- identifier les champs denormalises manquants ;
- preparer les tests de securite ;
- ne modifier aucune regle production.

Prompt conseille :

```txt
Preparer les Firestore Rules V2 pour GTS sans modifier les regles existantes.

Objectif :
definir sur papier les droits pour transferHubs, tripSegments, stopPassages et studentAssignments.

Contraintes :
- ne modifier aucun fichier
- ne deployer aucune regle
- separer SPW et transporteur
- verifier parent, chauffeur, convoyeuse, transporteur, SPW, support, admin
- lister les champs necessaires aux regles
- proposer les tests de securite a creer ensuite

Rapport uniquement.
```

## 20. Statut

Ce document devient le plan officiel de developpement GTS V2.

Il doit etre mis a jour uniquement lorsque les choix metier ou techniques V2 changent.
