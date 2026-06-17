# GTS Transport View

Architecture validee le 17/06/2026

## 1. Role De La Fonction

`transportViewForChild()` est la fonction de lecture normalisee du transport d'un eleve.

Son objectif est de fournir une vue unique, stable et exploitable par tous les ecrans GTS, quelle que soit la source des donnees :

- donnees V2 issues de `studentAssignments`, `stopPassages`, `tripSegments` et `transferHubs` ;
- donnees legacy issues des champs actuels de `children` ;
- situation mixte pendant la migration ;
- eleve non affecte.

La fonction ne decide pas de l'organisation du transport. Elle ne modifie pas les donnees. Elle lit des objets deja fournis en memoire, applique les regles de resolution, puis retourne une structure unique.

Elle doit devenir la reference commune pour :

- afficher le resume transport ;
- generer les PDF ;
- alimenter les vues chauffeur et convoyeuse ;
- afficher les informations parent ;
- detecter les incoherences de migration ;
- preparer les notifications.

## 2. Parametres

Signature cible :

```ts
function transportViewForChild(
  child: GtsChild,
  context?: TransportViewContext,
  source?: TransportViewSourceData
): TransportView
```

### `child`

Objet eleve issu du referentiel officiel SPW.

Il contient notamment :

- identite ;
- ecole ;
- parents ;
- garde alternee ;
- champs legacy de transport ;
- informations PMR utiles a l'exploitation ;
- donnees administratives officielles.

### `context`

Contexte d'affichage et de calcul.

Champs recommandes :

```ts
interface TransportViewContext {
  date?: Date | string;
  direction?: "morning" | "evening";
  viewerRole?: "spw" | "transporter" | "driver" | "assistant" | "parent" | "support" | "admin";
  viewerId?: string;
  transportManagerId?: string;
  includeRaw?: boolean;
  includeSensitiveFlags?: boolean;
}
```

Regles :

- `date` sert au calcul de la semaine ISO, du jour actif et de la garde alternee ;
- `direction` permet de demander explicitement le matin ou le soir ;
- `viewerRole` sert a produire une vue adaptee au consommateur ;
- `viewerId` sert uniquement a filtrer ou annoter la vue deja construite ;
- `transportManagerId` permet de privilegier les affectations du transporteur courant ;
- `includeRaw` autorise ou non le retour des donnees source dans `raw`.

### `source`

Donnees transport deja chargees par l'appelant.

La fonction ne fait aucune requete Firestore. Les donnees V2 doivent donc etre injectees par l'ecran, le service ou le generateur PDF.

```ts
interface TransportViewSourceData {
  assignments?: StudentAssignment[];
  stopPassages?: StopPassage[];
  tripSegments?: TripSegment[];
  transferHubs?: TransferHub[];
  circuits?: Circuit[];
  vehicles?: Vehicle[];
  drivers?: UserProfile[];
  assistants?: UserProfile[];
  schools?: School[];
}
```

## 3. Contexte De Resolution

Avant de resoudre le transport, la fonction calcule un contexte normalise :

```ts
interface ResolvedTransportViewContext {
  date: Date;
  isoWeekNumber: number;
  weekParity: "even" | "odd";
  dayKey: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  direction: "morning" | "evening";
  viewerRole?: string;
  viewerId?: string;
  transportManagerId?: string;
}
```

Regles metier :

- semaine ISO paire = semaine paire ;
- semaine ISO impaire = semaine impaire ;
- `alternatingResidence` reste la source officielle de la garde alternee ;
- `activeResidenceForChild(child, date)` determine le parent actif ;
- `activePickupStopForChild(child, date)` determine l'arret actif legacy ;
- `currentWeek` ne doit pas etre utilise.

## 4. Ordre De Resolution

### 4.1 V2

La resolution V2 est prioritaire si une affectation active existe.

Une affectation V2 est utilisable si :

- `studentId` correspond a l'eleve ;
- `active === true` ;
- `direction` correspond au contexte ;
- `validDays` contient le jour demande ;
- `weekPattern` vaut `all` ou correspond a la parite ISO ;
- `transportManagerId` correspond au transporteur attendu si ce filtre est fourni.

La vue V2 reconstruit le trajet a partir de :

- `studentAssignments` pour l'affectation de l'eleve ;
- `stopPassages` pour les passages precis ;
- `tripSegments` pour les segments operationnels ;
- `transferHubs` pour les transferts ;
- `vehicles`, `drivers`, `assistants`, `circuits`, `schools` pour les libelles.

### 4.2 Legacy

La resolution legacy est utilisee si aucune affectation V2 active n'existe.

Elle exploite les champs actuels de `children`, notamment :

- `pickupStop` ;
- `motherPickupStop` ;
- `fatherPickupStop` ;
- `alternatingResidence` ;
- `circuitNumber` ;
- `pickupCircuitId` ;
- `schoolCircuitId` ;
- `transferSchoolCircuitId` ;
- `driverId` ;
- `driverIds` ;
- `assistantId` ;
- `vehicleId` ;
- `schoolName` ou champ equivalent ;
- champs de transfert existants.

La vue legacy doit toujours indiquer que la source est ancienne afin de faciliter la migration.

### 4.3 Mixte

La resolution mixte est utilisee pendant la migration si :

- une affectation V2 existe mais est incomplete ;
- une direction est disponible en V2 mais l'autre reste en legacy ;
- les passages V2 sont absents ou incomplets ;
- les donnees V2 ne couvrent pas encore la garde alternee ou certains jours ;
- des donnees legacy restent necessaires pour afficher le resume.

La vue mixte doit retourner le meilleur affichage possible, mais elle doit aussi produire des alertes de coherence.

### 4.4 Non Affecte

La resolution non affectee est utilisee si aucun transport exploitable n'est trouve.

Elle retourne :

- l'identite de l'eleve ;
- son ecole si disponible ;
- sa garde alternee si disponible ;
- une route vide ;
- des moyens de transport vides ;
- une alerte critique `missing_assignment`.

## 5. Structure Complete Retournee

```ts
interface TransportView {
  source: "v2" | "legacy" | "mixed" | "none";
  status: "complete" | "partial" | "unassigned" | "inconsistent";
  context: ResolvedTransportViewContext;
  student: TransportViewStudent;
  summary: TransportViewSummary;
  route: TransportViewRoute;
  transport: TransportViewTransport;
  alternatingResidence: TransportViewAlternatingResidence;
  alerts: TransportViewAlert[];
  notifications: TransportViewNotifications;
  pdf: TransportViewPdf;
  raw?: TransportViewRaw;
}
```

### 5.1 `student`

```ts
interface TransportViewStudent {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  schoolId?: string;
  schoolName?: string;
  parentIds: string[];
  transportManagerId?: string;
  hasPmrNeeds?: boolean;
  requiresAdaptedVehicle?: boolean;
}
```

Role :

- identifier l'eleve ;
- exposer les champs utiles aux listes ;
- exposer les indicateurs PMR sans dupliquer le dossier medical complet.

### 5.2 `summary`

```ts
interface TransportViewSummary {
  title: string;
  directionLabel: "Matin" | "Soir";
  transportType: "avec_transfert" | "circuit_ferme" | "porte_a_porte" | "unknown";
  activeParentLabel?: string;
  activePickupStopLabel?: string;
  pickupTime?: string;
  dropoffTime?: string;
  circuitLabels: string[];
  transferLabel?: string;
  schoolLabel?: string;
  driverLabels: string[];
  assistantLabels: string[];
  vehicleLabels: string[];
  isAlternatingResidenceActive: boolean;
  isPorteAPorte: boolean;
  isPmr: boolean;
}
```

Role :

- alimenter le bloc "Resume transport" ;
- afficher l'essentiel sans parcourir tout le dossier eleve ;
- fournir une version compacte pour parent, SPW, transporteur, chauffeur et convoyeuse.

### 5.3 `route`

```ts
interface TransportViewRoute {
  direction: "morning" | "evening";
  transportType: "avec_transfert" | "circuit_ferme" | "porte_a_porte" | "unknown";
  assignments: TransportViewAssignment[];
  segments: TransportViewSegment[];
  passages: TransportViewPassage[];
  transferHubs: TransportViewTransferHub[];
  hasTransfer: boolean;
  hasVehicleChange: boolean;
  hasDriverChange: boolean;
  hasAssistantChange: boolean;
  hasSameVehicleAfterTransfer?: boolean;
}
```

```ts
interface TransportViewAssignment {
  id?: string;
  source: "v2" | "legacy";
  direction: "morning" | "evening";
  transportType: "avec_transfert" | "circuit_ferme" | "porte_a_porte" | "unknown";
  weekPattern: "all" | "even" | "odd";
  validDays: string[];
  pickupPassageId?: string;
  dropoffPassageId?: string;
  passageIds: string[];
  segmentIds: string[];
  circuitIds: string[];
  driverIds: string[];
  assistantIds: string[];
  vehicleIds: string[];
  transferHubIds: string[];
}
```

```ts
interface TransportViewSegment {
  id?: string;
  order: number;
  circuitId?: string;
  circuitLabel?: string;
  fromType: "tec_stop" | "transfer_hub" | "school" | "home_address" | "custom_address" | "unknown";
  fromLabel?: string;
  toType: "tec_stop" | "transfer_hub" | "school" | "home_address" | "custom_address" | "unknown";
  toLabel?: string;
  departureTime?: string;
  arrivalTime?: string;
  driverId?: string;
  driverLabel?: string;
  assistantId?: string;
  assistantLabel?: string;
  vehicleId?: string;
  vehicleLabel?: string;
}
```

```ts
interface TransportViewPassage {
  id?: string;
  order: number;
  type: "pickup" | "dropoff" | "transfer_arrival" | "transfer_departure" | "school_arrival" | "school_departure" | "unknown";
  stopType: "tec_stop" | "transfer_hub" | "school" | "home_address" | "custom_address" | "unknown";
  stopId?: string;
  stopLabel?: string;
  time?: string;
  circuitId?: string;
  circuitLabel?: string;
  segmentId?: string;
  vehicleId?: string;
  vehicleLabel?: string;
  driverId?: string;
  driverLabel?: string;
  assistantId?: string;
  assistantLabel?: string;
  isActivePickup?: boolean;
  isActiveDropoff?: boolean;
}
```

```ts
interface TransportViewTransferHub {
  id: string;
  name: string;
  arrivalPassageIds: string[];
  departurePassageIds: string[];
  schoolIds: string[];
  circuitIds: string[];
}
```

Role :

- representer le trajet complet ;
- couvrir le changement de car ;
- couvrir le meme car apres transfert ;
- separer matin et soir ;
- separer les passages des segments.

### 5.4 `transport`

```ts
interface TransportViewTransport {
  transportManagerId?: string;
  circuitIds: string[];
  circuitLabels: string[];
  driverIds: string[];
  driverLabels: string[];
  assistantIds: string[];
  assistantLabels: string[];
  vehicleIds: string[];
  vehicleLabels: string[];
  replacementDriverIds: string[];
  replacementAssistantIds: string[];
  replacementVehicleIds: string[];
}
```

Role :

- regrouper les moyens humains et materiels ;
- alimenter les vues chauffeur et convoyeuse ;
- preparer les controles de droits ;
- preparer les notifications operationnelles.

### 5.5 `alternatingResidence`

```ts
interface TransportViewAlternatingResidence {
  enabled: boolean;
  weekParity: "even" | "odd";
  activeParentKey?: "mother" | "father";
  activeParentLabel?: string;
  activePickupStop?: string;
  motherPickupStop?: string;
  fatherPickupStop?: string;
  evenWeekParent?: "mother" | "father";
  oddWeekParent?: "mother" | "father";
  source: "alternatingResidence" | "legacy_fields" | "none";
}
```

Role :

- exposer la garde alternee sans recreer une deuxieme logique ;
- utiliser `alternatingResidence` comme source officielle ;
- conserver `motherPickupStop`, `fatherPickupStop` et `pickupStop` en fallback ;
- permettre les affectations differentes selon semaine paire ou impaire.

### 5.6 `alerts`

```ts
interface TransportViewAlert {
  code: string;
  level: "critical" | "warning" | "info";
  message: string;
  target?: "student" | "assignment" | "passage" | "segment" | "vehicle" | "driver" | "assistant" | "transfer" | "legacy";
  source?: "v2" | "legacy" | "mixed";
}
```

Alertes recommandees :

- `missing_assignment` : aucun trajet affecte ;
- `legacy_source` : affichage issu des anciens champs ;
- `mixed_source` : donnees V2 completees par legacy ;
- `missing_pickup_passage` : passage de montee absent ;
- `missing_dropoff_passage` : passage de descente absent ;
- `missing_driver` : chauffeur absent ;
- `missing_assistant` : convoyeuse absente ;
- `missing_vehicle` : vehicule absent ;
- `pmr_vehicle_missing` : besoin PMR sans vehicule adapte ;
- `transfer_incomplete` : transfert sans arrivee ou depart ;
- `alternating_residence_incomplete` : garde alternee active mais arret ou parent manquant.

### 5.7 `notifications`

```ts
interface TransportViewNotifications {
  parentRecipientIds: string[];
  driverRecipientIds: string[];
  assistantRecipientIds: string[];
  transporterRecipientIds: string[];
  spwRecipientIds: string[];
  routeLabel: string;
  pickupLabel?: string;
  dropoffLabel?: string;
  delayContext?: {
    passageId?: string;
    segmentId?: string;
    circuitId?: string;
  };
}
```

Role :

- fournir les destinataires ;
- fournir les libelles operationnels ;
- eviter que chaque ecran reconstruise sa propre logique de notification.

La fonction ne doit pas envoyer de notification.

### 5.8 `pdf`

```ts
interface TransportViewPdf {
  title: string;
  subtitle?: string;
  sections: TransportViewPdfSection[];
  warnings: string[];
}

interface TransportViewPdfSection {
  title: string;
  rows: Array<{
    label: string;
    value: string;
  }>;
}
```

Role :

- fournir les donnees deja formatees pour les PDF ;
- eviter que le PDF utilise directement `child.pickupStop` ;
- garantir que la garde alternee et l'arret actif sont coherents avec les ecrans.

### 5.9 `raw`

```ts
interface TransportViewRaw {
  child?: GtsChild;
  assignments?: StudentAssignment[];
  stopPassages?: StopPassage[];
  tripSegments?: TripSegment[];
  transferHubs?: TransferHub[];
  legacyFields?: Record<string, unknown>;
}
```

Role :

- faciliter le debug ;
- ne pas etre expose par defaut ;
- ne jamais etre utilise comme source d'affichage directe par l'UI.

## 6. Consommateurs

### Fiche Eleve

Utilise :

- `student` ;
- `summary` ;
- `route` ;
- `alternatingResidence` ;
- `alerts`.

Objectif :

- afficher une vue complete mais lisible du transport ;
- signaler les incoherences sans modifier les donnees.

### Resume Transport

Utilise principalement `summary`.

Objectif :

- afficher immediatement l'arret actif ;
- afficher le circuit ;
- afficher le transfert ;
- afficher l'ecole ;
- afficher chauffeur, convoyeuse et vehicule ;
- afficher la semaine active en cas de garde alternee.

### Chauffeur

Utilise :

- `route.passages` ;
- `route.segments` ;
- `transport.driverIds` ;
- `student` ;
- `alerts`.

Objectif :

- voir uniquement les eleves et passages concernes ;
- identifier les montees, depots, transferts et changements de car.

### Convoyeuse

Utilise :

- `route.passages` ;
- `route.segments` ;
- `transport.assistantIds` ;
- `student` ;
- `alerts`.

Objectif :

- suivre les eleves accompagnes ;
- verifier les transferts ;
- identifier les besoins PMR et informations autorisees.

### Parent

Utilise :

- `summary` ;
- `route.passages` filtres ;
- `alternatingResidence` ;
- `notifications`.

Objectif :

- afficher l'arret actif ;
- afficher les horaires utiles ;
- afficher les changements pertinents sans exposer les donnees des autres eleves.

### SPW

Utilise :

- vue complete ;
- `alerts` ;
- indicateurs legacy, V2 et mixte.

Objectif :

- superviser la coherence globale ;
- controler les affectations ;
- distinguer donnees officielles eleve et organisation transporteur.

### PDF

Utilise uniquement `pdf`, avec recours eventuel a `summary`.

Objectif :

- produire un document coherent avec les ecrans ;
- eviter les divergences sur l'arret actif ;
- indiquer clairement les alertes utiles.

### Notifications

Utilise uniquement `notifications`.

Objectif :

- connaitre les destinataires ;
- connaitre le contexte du retard, de l'absence ou du changement ;
- ne pas reconstruire le trajet dans le module de notification.

## 7. Regles Techniques

### Aucune Ecriture

`transportViewForChild()` ne doit jamais :

- creer un document ;
- modifier un document ;
- supprimer un document ;
- corriger automatiquement une incoherence ;
- mettre a jour une affectation ;
- historiser une consultation.

### Aucune Requete Firestore

La fonction ne doit jamais appeler Firestore directement.

Les donnees doivent etre chargees avant l'appel, puis transmises via `source`.

Cette regle permet :

- un comportement previsible ;
- des tests unitaires simples ;
- une utilisation dans les PDF ;
- une utilisation dans les ecrans ;
- une utilisation hors ligne ou avec donnees mises en cache.

### Fonction Pure

A entree identique, la fonction doit retourner une sortie identique.

Elle ne doit pas dependre de variables globales modifiables, sauf si elles sont passees explicitement dans `context` ou `source`.

Regles :

- pas d'effet de bord ;
- pas de mutation de `child` ;
- pas de mutation de `source` ;
- pas de lecture implicite d'etat applicatif ;
- pas d'utilisation de `currentWeek` ;
- calcul de semaine via `isoWeekNumber(date)`.

## 8. Pseudo-Code De Reference

```ts
function transportViewForChild(child, context = {}, source = {}) {
  const resolvedContext = resolveTransportContext(context);
  const activeResidence = activeResidenceForChild(child, resolvedContext.date);
  const activePickupStop = activePickupStopForChild(child, resolvedContext.date);

  const activeAssignments = findActiveAssignments(
    child,
    resolvedContext,
    source.assignments || []
  );

  if (activeAssignments.length > 0) {
    const v2View = transportViewFromAssignments(
      child,
      resolvedContext,
      activeResidence,
      activePickupStop,
      activeAssignments,
      source
    );

    if (v2View.status === "complete") {
      return validateTransportView(v2View);
    }

    const legacyView = transportViewFromLegacy(
      child,
      resolvedContext,
      activeResidence,
      activePickupStop,
      source
    );

    return validateTransportView(
      mergeV2AndLegacyViews(v2View, legacyView)
    );
  }

  const legacyView = transportViewFromLegacy(
    child,
    resolvedContext,
    activeResidence,
    activePickupStop,
    source
  );

  if (legacyView.status !== "unassigned") {
    return validateTransportView(legacyView);
  }

  return validateTransportView(
    emptyTransportView(
      child,
      resolvedContext,
      activeResidence,
      activePickupStop
    )
  );
}
```

## 9. Dependances Attendues

Dependances existantes ou a reutiliser :

- `isoWeekNumber(date)` ;
- `activeResidenceForChild(child, date)` ;
- `activePickupStopForChild(child, date)` ;
- helper de nom complet eleve ;
- helper de nom utilisateur ;
- helper de detection transfert legacy ;
- helper de recuperation chauffeur legacy ;
- helper de recuperation convoyeuse legacy.

Helpers a prevoir autour de la fonction :

- `resolveTransportContext(context)` ;
- `findActiveAssignments(child, context, assignments)` ;
- `transportViewFromAssignments(...)` ;
- `transportViewFromLegacy(...)` ;
- `mergeV2AndLegacyViews(v2View, legacyView)` ;
- `validateTransportView(view)` ;
- `emptyTransportView(...)`.

## 10. Regle De Reference

`transportViewForChild()` est une fonction de lecture et de normalisation.

Elle ne remplace pas :

- les Firestore Rules ;
- les requetes de securite ;
- les validations d'ecriture ;
- les migrations ;
- les ecrans d'affectation.

Elle fournit une representation unique du transport d'un eleve afin que les consommateurs affichent tous la meme realite operationnelle.
