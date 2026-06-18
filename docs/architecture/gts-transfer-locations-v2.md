# GTS Transfer Locations V2

Architecture validee le 18/06/2026

Ce document fige la conception officielle des lieux de transfert GTS V2.

Il devient la reference pour :

- le referentiel `transportTransfers` ;
- les ecrans de gestion des lieux de transfert ;
- les scripts de preparation V2 ;
- l'ecran Affectation rapide ;
- les futures regles Firestore V2.

## 1. Role Du Referentiel

`transportTransfers` est le referentiel officiel des lieux de transfert reels.

Un document `transportTransfers` represente un lieu physique valide, par exemple :

- Ougree - Parking TEC ;
- Jemeppe - Centre ;
- Seraing - Centre.

Un lieu de transfert n'est pas :

- un passage horaire ;
- un segment de trajet ;
- une affectation eleve ;
- une valeur libre issue de `children.transferLocation`.

Regle officielle :

`children.transferLocation` ne doit jamais creer automatiquement un lieu officiel.

Les valeurs legacy peuvent seulement produire :

- une suggestion ;
- une alerte ;
- un candidat a verifier ;
- une aide au nettoyage.

La source officielle d'un lieu de transfert GTS V2 est `transportTransfers`.

## 2. Separation Metier

### Lieu De Transfert

Referentiel stable d'un lieu physique.

Exemple :

```json
{
  "id": "transfer-ougree-parking-tec",
  "label": "Ougree - Parking TEC"
}
```

### Passage Au Transfert

Evenement horaire precis a ce lieu.

Exemple :

```json
{
  "id": "passage-4104-ougree-arrival",
  "type": "transfer_arrival",
  "transferHubId": "transfer-ougree-parking-tec",
  "plannedTime": "07:42"
}
```

### Segment Entrant

Portion de trajet avant le transfert.

Exemple :

```text
Arret TEC -> Ougree - Parking TEC
```

### Segment Sortant

Portion de trajet apres le transfert.

Exemple :

```text
Ougree - Parking TEC -> Ecole Sainte-Marie Seraing
```

### Eleve Transfere

Eleve relie a plusieurs passages via `studentAssignments`.

Un eleve peut :

- changer de car au transfert ;
- rester dans le meme car ;
- etre PMR ;
- etre non PMR ;
- avoir un transfert matin, soir ou les deux.

## 3. Schema Final `transportTransfers`

```ts
interface TransportTransferV2 {
  id: string;

  name: string;
  label: string;
  locationLabel: string;

  address?: string;
  postalCode?: string;
  city: string;
  country?: string;

  latitude?: number | null;
  longitude?: number | null;

  normalizedKey: string;
  aliases?: string[];

  transportManagerIds: string[];
  schoolIds?: string[];
  circuitIds?: string[];

  active: boolean;
  source: "manual" | "legacy_review" | "import";
  migrationStatus: "draft" | "validated" | "needs_review" | "duplicate" | "archived";

  pmrAccessible?: boolean | null;
  safeWaitingArea?: boolean | null;
  accessInstructions?: string;
  notes?: string;

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
```

## 4. Champs Obligatoires

Un lieu de transfert V2 doit contenir :

- `id` ;
- `name` ;
- `label` ;
- `locationLabel` ;
- `city` ;
- `normalizedKey` ;
- `transportManagerIds[]` ;
- `active` ;
- `source` ;
- `migrationStatus` ;
- `createdAt` ;
- `createdBy` ;
- `updatedAt` ;
- `updatedBy`.

Exemple minimal :

```json
{
  "id": "transfer-ougree-parking-tec",
  "name": "Ougree",
  "label": "Ougree - Parking TEC",
  "locationLabel": "Parking TEC Ougree",
  "city": "Ougree",
  "normalizedKey": "ougree|parking-tec-ougree",
  "transportManagerIds": ["transport-manager-1779793495316"],
  "active": true,
  "source": "manual",
  "migrationStatus": "validated",
  "createdAt": "2026-06-18T00:00:00.000Z",
  "createdBy": "transport-manager-1779793495316",
  "updatedAt": "2026-06-18T00:00:00.000Z",
  "updatedBy": "transport-manager-1779793495316"
}
```

## 5. Champs Optionnels

Champs utiles mais non bloquants :

- `address` ;
- `postalCode` ;
- `country` ;
- `latitude` ;
- `longitude` ;
- `aliases[]` ;
- `schoolIds[]` ;
- `circuitIds[]` ;
- `pmrAccessible` ;
- `safeWaitingArea` ;
- `accessInstructions` ;
- `notes`.

`schoolIds` et `circuitIds` sont denormalises pour affichage et recherche.

La verite operationnelle reste dans :

- `tripSegments` ;
- `stopPassages` ;
- `studentAssignments`.

## 6. Validations

### Validations Bloquantes

La creation ou la sauvegarde doit etre refusee si :

- `name` est vide ;
- `label` est vide ;
- `locationLabel` est vide ;
- `city` est vide ;
- `transportManagerIds` est vide ;
- `active` n'est pas booleen ;
- `source` n'est pas valide ;
- `migrationStatus` n'est pas valide ;
- `normalizedKey` est vide ;
- `latitude` est hors limites ;
- `longitude` est hors limites ;
- un doublon fort actif existe deja.

### Validations Non Bloquantes

Elles doivent produire des alertes :

- adresse absente ;
- PMR non verifie ;
- aucun circuit lie ;
- aucune ecole liee ;
- aucun alias ;
- lieu encore en brouillon ;
- valeur legacy proche non associee.

## 7. Detection Des Doublons

GTS doit calculer :

```text
normalizedKey = normalize(city + "|" + locationLabel)
```

La normalisation doit :

- passer en minuscules ;
- supprimer les accents ;
- supprimer les espaces multiples ;
- neutraliser la ponctuation ;
- standardiser les variantes courantes.

### Doublon Fort

Creation bloquee si :

- meme `normalizedKey` ;
- meme ville et meme `locationLabel` ;
- meme coordonnees GPS ou proximite tres forte.

### Doublon Probable

Creation possible avec confirmation si :

- meme ville et nom proche ;
- alias identique ;
- libelle tres proche ;
- valeur legacy ressemblante.

### Valeur Legacy

Une valeur issue de `children.transferLocation`, `children.transferName`, `children.transferCircuit` ou `circuits.transferName` doit etre traitee comme candidate uniquement.

Elle ne doit jamais creer directement un document officiel.

## 8. PMR

Le PMR est un besoin specifique, pas un type de transfert.

Un lieu de transfert peut etre :

- accessible PMR ;
- non accessible PMR ;
- a verifier.

Champs recommandes :

```json
{
  "pmrAccessible": true,
  "safeWaitingArea": true,
  "accessInstructions": "Zone car devant l'abri, acces sans marche."
}
```

Alerte obligatoire :

```text
pmr_accessibility_unknown
```

si un eleve PMR est affecte a un transfert dont `pmrAccessible` est vide ou inconnu.

## 9. Workflow Transporteur

### Creation

1. Ouvrir `Lieux de transfert`.
2. Cliquer `Nouveau lieu`.
3. Saisir :
   - nom court ;
   - libelle visible ;
   - lieu precis ;
   - ville ;
   - adresse si connue ;
   - accessibilite PMR si connue.
4. GTS calcule `normalizedKey`.
5. GTS affiche les doublons potentiels.
6. Le transporteur confirme ou utilise un lieu existant.
7. Le lieu est cree en `source = "manual"`.

### Modification

1. Ouvrir le lieu.
2. Modifier les informations de referentiel.
3. Revalider les doublons.
4. Sauvegarder.

L'identifiant `id` ne doit pas changer.

### Desactivation

1. Ouvrir le lieu.
2. Cliquer `Desactiver`.
3. GTS affiche les usages actifs.
4. Le transporteur confirme.
5. Le lieu reste visible dans l'historique mais n'est plus selectionnable pour de nouvelles affectations.

## 10. Workflow SPW

Le SPW peut :

- consulter les lieux officiels ;
- verifier la coherence des affectations ;
- signaler un lieu incorrect ;
- signaler un transfert legacy non lie.

Le SPW ne gere pas l'organisation operationnelle des trajets.

Le transporteur reste responsable de :

- circuits ;
- passages ;
- segments ;
- chauffeurs ;
- convoyeuses ;
- vehicules ;
- affectations transport.

## 11. Ecran `Lieux De Transfert`

### Maquette Textuelle

```text
Lieux de transfert
Referentiel officiel des hubs de transfert utilises par les circuits.

[Rechercher un lieu, ville, alias...] [Actifs] [+ Nouveau lieu]

Alertes
- 3 valeurs legacy non liees
- 1 doublon potentiel

Tableau
Nom      Ville     Lieu precis     Entrants Sortants Ecoles PMR        Statut  Alertes
Ougree   Ougree    Parking TEC     2        1        2      A verifier Actif   0
Jemeppe  Jemeppe   Centre          1        1        1      Oui        Actif   1
Seraing  Seraing   Centre          0        0        0      Inconnu    Brouillon 0

Detail
Ougree - Parking TEC
Statut : Actif
Source : Manuel
Validation : Valide
Circuits entrants : 4104, 4301
Circuits sortants : 4220
Ecoles liees : Sainte-Marie Seraing, La Buissonniere
Alias : Ougree, Transfert Ougree

[Modifier] [Desactiver] [Voir dans Affectation rapide]
```

### Colonnes

- `Nom` ;
- `Ville` ;
- `Lieu precis` ;
- `Circuits entrants` ;
- `Circuits sortants` ;
- `Ecoles` ;
- `PMR` ;
- `Statut` ;
- `Validation` ;
- `Alertes` ;
- `Derniere modification` ;
- `Actions`.

### Formulaire

```text
Nouveau lieu de transfert

Identite
[Nom court *]
[Libelle visible *]
[Lieu precis *]

Localisation
[Adresse]
[Code postal]
[Ville *]
[Pays]
[Latitude]
[Longitude]

Organisation
[Transporteur(s) *]
[Statut]
[Accessibilite PMR]
[Zone d'attente securisee]

Alias
[Alias]

Instructions
[Consignes d'acces]
[Notes internes]

Alertes doublons
[Utiliser l'existant] [Creer quand meme avec justification]

[Annuler] [Creer le lieu]
```

## 12. Alertes

Alertes a produire :

- `duplicate_transfer_location` ;
- `legacy_transfer_unlinked` ;
- `missing_location_details` ;
- `pmr_accessibility_unknown` ;
- `inactive_transfer_used` ;
- `no_active_passages` ;
- `incoming_without_outgoing` ;
- `outgoing_without_incoming` ;
- `school_missing_after_transfer`.

## 13. Compatibilite V2

Dans V2, `transportTransfers/{id}` est reference par les champs techniques `transferHubId` ou `transferHubIds`.

### `tripSegments`

```json
{
  "id": "segment-4104-stop-to-ougree",
  "transportType": "avec_transfert",
  "direction": "morning",
  "transferHubId": "transfer-ougree-parking-tec",
  "to": {
    "type": "transfer_hub",
    "id": "transfer-ougree-parking-tec",
    "label": "Ougree - Parking TEC"
  }
}
```

### `stopPassages`

```json
{
  "id": "passage-4104-ougree-arrival",
  "type": "transfer_arrival",
  "transferHubId": "transfer-ougree-parking-tec",
  "stop": {
    "type": "transfer_hub",
    "id": "transfer-ougree-parking-tec",
    "label": "Ougree - Parking TEC"
  },
  "plannedTime": "07:42"
}
```

### `studentAssignments`

```json
{
  "id": "assignment-child-001-morning",
  "studentId": "child-001",
  "transportType": "avec_transfert",
  "transferHubIds": ["transfer-ougree-parking-tec"],
  "passageIds": [
    "passage-4104-ougree-arrival",
    "passage-4301-ougree-departure"
  ],
  "tripSegmentIds": [
    "segment-4104-stop-to-ougree",
    "segment-4301-ougree-to-school"
  ]
}
```

## 14. Compatibilite Legacy

Mapping autorise depuis `transportTransfers` legacy :

```text
transferId       -> id si fiable
transferName     -> name
transferLocation -> locationLabel
location         -> locationLabel
city             -> city
active           -> active
```

Valeurs legacy interdites comme source directe :

- `children.transferLocation` ;
- `children.transferName` ;
- `children.transferCircuit` ;
- `circuits.transferName` seul.

Ces valeurs doivent produire :

- `legacyTransferCandidate` ;
- `legacy_transfer_unlinked` ;
- `needs_review`.

## 15. Exemples

### Ougree

```json
{
  "id": "transfer-ougree-parking-tec",
  "name": "Ougree",
  "label": "Ougree - Parking TEC",
  "locationLabel": "Parking TEC Ougree",
  "address": "",
  "postalCode": "4102",
  "city": "Ougree",
  "country": "Belgique",
  "latitude": null,
  "longitude": null,
  "normalizedKey": "ougree|parking-tec-ougree",
  "aliases": ["Ougree", "Transfert Ougree"],
  "transportManagerIds": ["transport-manager-1779793495316"],
  "schoolIds": [],
  "circuitIds": [],
  "active": true,
  "source": "manual",
  "migrationStatus": "validated",
  "pmrAccessible": null,
  "safeWaitingArea": null,
  "accessInstructions": "",
  "notes": "",
  "createdAt": "2026-06-18T00:00:00.000Z",
  "createdBy": "transport-manager-1779793495316",
  "updatedAt": "2026-06-18T00:00:00.000Z",
  "updatedBy": "transport-manager-1779793495316"
}
```

### Jemeppe

```json
{
  "id": "transfer-jemeppe-centre",
  "name": "Jemeppe",
  "label": "Jemeppe - Centre",
  "locationLabel": "Point de transfert Jemeppe centre",
  "address": "",
  "postalCode": "4101",
  "city": "Jemeppe-sur-Meuse",
  "country": "Belgique",
  "latitude": null,
  "longitude": null,
  "normalizedKey": "jemeppe-sur-meuse|point-de-transfert-jemeppe-centre",
  "aliases": ["Jemeppe", "Jemeppe centre"],
  "transportManagerIds": ["transport-manager-1779793495316"],
  "schoolIds": [],
  "circuitIds": [],
  "active": true,
  "source": "manual",
  "migrationStatus": "validated",
  "pmrAccessible": null,
  "safeWaitingArea": null,
  "accessInstructions": "",
  "notes": "",
  "createdAt": "2026-06-18T00:00:00.000Z",
  "createdBy": "transport-manager-1779793495316",
  "updatedAt": "2026-06-18T00:00:00.000Z",
  "updatedBy": "transport-manager-1779793495316"
}
```

### Seraing

```json
{
  "id": "transfer-seraing-centre",
  "name": "Seraing",
  "label": "Seraing - Centre",
  "locationLabel": "Point de transfert Seraing centre",
  "address": "",
  "postalCode": "4100",
  "city": "Seraing",
  "country": "Belgique",
  "latitude": null,
  "longitude": null,
  "normalizedKey": "seraing|point-de-transfert-seraing-centre",
  "aliases": ["Seraing", "Transfert Seraing"],
  "transportManagerIds": ["transport-manager-1779793495316"],
  "schoolIds": [],
  "circuitIds": [],
  "active": true,
  "source": "manual",
  "migrationStatus": "validated",
  "pmrAccessible": null,
  "safeWaitingArea": null,
  "accessInstructions": "",
  "notes": "",
  "createdAt": "2026-06-18T00:00:00.000Z",
  "createdBy": "transport-manager-1779793495316",
  "updatedAt": "2026-06-18T00:00:00.000Z",
  "updatedBy": "transport-manager-1779793495316"
}
```

## 16. Decision Officielle

Pour GTS V2 :

- collection officielle : `transportTransfers` ;
- libelle UI : `Lieux de transfert` ;
- identifiant technique dans V2 : `transferHubId` ;
- creation officielle : manuelle ou import valide ;
- legacy : lecture et alerte uniquement ;
- aucune creation automatique depuis `children.transferLocation`.

