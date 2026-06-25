# GTS Architecture V1

Architecture validée le 17/06/2026

## 1. Vision Generale Du Systeme

GTS Connect est une plateforme de gestion du transport scolaire specialise. Son architecture cible distingue clairement le referentiel officiel des eleves et l'organisation operationnelle du transport.

La fiche eleve est une donnee officielle SPW. Le transporteur n'est pas proprietaire des eleves : il organise uniquement les trajets, les circuits, les passages, les vehicules, les chauffeurs et les transferts.

Regle officielle convoyeuses : les convoyeuses appartiennent au referentiel SPW. Le transporteur peut les lire de maniere limitee et les affecter par reference dans l'organisation du transport, mais il ne peut jamais creer, modifier, supprimer ou administrer une fiche convoyeuse.

Le modele V1 conserve les donnees existantes en compatibilite, mais formalise l'architecture cible autour de trajets segmentes :

- un eleve appartient au referentiel SPW ;
- un trajet est compose de segments ;
- un segment contient des passages ;
- un eleve est affecte a des passages precis ;
- un arret TEC peut etre utilise par plusieurs circuits ;
- un transfert peut regrouper plusieurs cars ;
- la garde alternee peut produire des affectations differentes selon semaine paire ou impaire.

## 2. Separation SPW / Transporteur

### SPW = Gestion Des Eleves

Le SPW est proprietaire du referentiel eleve.

Le SPW gere :

- creation des eleves ;
- modification des eleves ;
- donnees administratives ;
- donnees medicales ;
- handicap et PMR ;
- garde alternee ;
- ecoles ;
- convoyeuses ;
- parents et responsables ;
- informations officielles de l'eleve.

### Transporteur = Gestion Du Transport

Le transporteur est proprietaire de l'organisation du transport.

Le transporteur gere :

- circuits ;
- segments ;
- passages ;
- affectations de trajet ;
- chauffeurs ;
- vehicules ;
- transferts operationnels ;
- retards ;
- remplacements.

Le transporteur ne cree pas, ne supprime pas et ne modifie pas les donnees officielles de l'eleve.
Le transporteur ne cree pas, ne supprime pas et ne modifie pas les donnees personnelles ou administratives d'une convoyeuse.

## 3. Roles

### SPW

Le SPW cree et maintient le referentiel officiel des eleves. Il supervise les affectations transport et controle la coherence des donnees.

### Transporteur

Le transporteur configure les trajets, affecte les eleves existants aux passages, gere les moyens humains et materiels, et assure l'exploitation quotidienne.

### Chauffeur

Le chauffeur voit uniquement les passages, segments et eleves qui le concernent. Il consulte les informations utiles a la prise en charge.

### Convoyeuse

La convoyeuse voit les eleves qu'elle accompagne, les transferts, les changements de car, les absences et les informations sensibles autorisees.
Elle peut lire sa propre fiche et, si necessaire a l'exploitation terrain, les convoyeuses associees au meme circuit ou au meme transfert.

### Parent

Le parent voit uniquement son enfant, son trajet actif, l'arret actif, les retards, les absences et les messages associes.

## 4. Modele Metier Valide

### `children`

Referentiel officiel SPW.

Contient :

- identite ;
- ecole officielle ;
- parents ;
- donnees medicales ;
- handicap ;
- autonomie ;
- garde alternee ;
- informations sensibles ;
- statut officiel.

### `alternatingResidence`

Sous-objet de `children`, gere par le SPW.

Contient :

- activation ;
- parent semaine paire ;
- parent semaine impaire ;
- adresse semaine paire ;
- adresse semaine impaire ;
- arret semaine paire ;
- arret semaine impaire ;
- remarques.

Convention :

- semaine ISO paire = semaine paire ;
- semaine ISO impaire = semaine impaire.

### `studentAssignments`

Propriete transporteur. Affecte un eleve SPW a des passages.

Contient :

- `studentId` ;
- `direction` : `morning` ou `evening` ;
- `transportType` ;
- `weekPattern` : `all`, `even`, `odd` ;
- `validDays` ;
- `passageIds` ;
- `pickupPassageId` ;
- `dropoffPassageId` ;
- `circuitIds` ;
- `driverIds` ;
- `assistantIds` ;
- `vehicleIds` ;
- `transferHubIds` ;
- `parentIds`.

### `stopPassages`

Propriete transporteur. Represente un passage precis.

Exemple : le circuit 4104 passe a l'arret TEC X a 07h15.

### `tripSegments`

Propriete transporteur. Represente une portion de trajet :

- arret TEC vers transfert ;
- transfert vers ecole ;
- ecole vers transfert ;
- transfert vers arret TEC ;
- domicile vers ecole ;
- ecole vers domicile.

### `transferHubs`

Referentiel partage. Represente un lieu de transfert utilise par plusieurs circuits.

### `vehicles`

Propriete transporteur. Peut indiquer la compatibilite PMR.

### `circuits`

Propriete transporteur. Represente une ligne operationnelle.

### `assistants`

Referentiel SPW.

Les convoyeuses sont creees, modifiees, desactivees et gouvernees par le SPW.

Le transporteur peut uniquement :

- lire les convoyeuses necessaires a ses circuits, passages ou transferts ;
- referencer une convoyeuse dans `assistantId` ou `assistantIds` sur les objets transport.

Le transporteur ne peut jamais :

- creer une convoyeuse ;
- modifier une fiche convoyeuse ;
- modifier les donnees personnelles d'une convoyeuse ;
- supprimer ou desactiver une convoyeuse.

## 5. Types De Transport

### `avec_transfert`

Transport compose de plusieurs segments avec un ou plusieurs transferts.

### `circuit_ferme`

Circuit sans transfert operationnel. Le car suit une boucle ou une sequence d'arrets jusqu'a l'ecole ou depuis l'ecole.

### `porte_a_porte`

Transport individualise depuis ou vers une adresse, notamment pour les eleves PMR.

## 6. Gestion PMR

Les donnees PMR officielles restent dans `children`, sous responsabilite SPW.

Regle officielle :

- PMR ne passe jamais par un transfert ;
- PMR est organise en direct ecole <-> domicile ou ecole <-> centre specialise ;
- `porte_a_porte` reste un type de trajet possible pour les eleves PMR et non PMR ;
- un trajet vers un centre specialise ne doit pas etre modelise comme un transfert.

L'organisation PMR est geree par le transporteur :

- vehicule adapte ;
- passage domicile ;
- aide a la montee ;
- aide a la descente ;
- affectation a un trajet porte-a-porte.

Champs cibles utiles :

- `vehicles.pmrCompatible` ;
- `vehicles.wheelchairCapacity` ;
- `vehicles.rampAvailable` ;
- `vehicles.liftAvailable` ;
- `studentAssignments.requiresAdaptedVehicle` ;
- `stopPassages.stopType: "home_address"`.

## 7. Gestion Garde Alternee

La garde alternee est officielle et geree par le SPW dans `children.alternatingResidence`.

Le transporteur l'utilise pour creer des affectations :

- `weekPattern: "even"` pour semaine paire ;
- `weekPattern: "odd"` pour semaine impaire ;
- `sourceResidenceKey: "mother"` ou `"father"`.

Si les deux parents utilisent le meme circuit, un seul trajet peut suffire. Si le parent actif implique un autre arret ou un autre circuit, deux affectations sont necessaires.

## 8. Gestion Transferts

Un transfert est un lieu ou un eleve peut :

- descendre ;
- monter ;
- rester dans le meme car ;
- changer de car ;
- changer de chauffeur ;
- changer de convoyeuse ;
- changer de vehicule.

Le transfert doit etre represente par `transferHubs`, `tripSegments`, `stopPassages` et `studentAssignments`.

## 9. Gestion Circuits Fermes

Un circuit ferme est une sequence de passages sans transfert.

Le matin :

- arret TEC A ;
- arret TEC B ;
- ecole.

Le soir :

- ecole ;
- arret TEC B ;
- arret TEC A.

Chaque eleve est affecte a son passage exact.

## 10. Gestion Porte-A-Porte

Le porte-a-porte utilise des passages de type :

- `home_address` ;
- `custom_address` ;
- `school`.

Il couvre les cas PMR, les vehicules adaptes et les prises en charge individualisees.

## 11. Collections Firestore Cibles

### Propriete SPW

- `children`
- `schools`
- `assistants`

### Propriete Transporteur

- `studentAssignments`
- `stopPassages`
- `tripSegments`
- `circuits`
- `vehicles`
- `drivers`

### Referentiel Partage

- `transferHubs`
- `tecStops`

## 12. Relations Entre Collections

- `children` est reference par `studentAssignments.studentId`.
- `studentAssignments` reference plusieurs `stopPassages`.
- `stopPassages` reference un `tripSegment`.
- `tripSegments` reference un `circuit`.
- `tripSegments` et `stopPassages` peuvent referencer un `transferHub`.
- `circuits` reference chauffeurs, convoyeuses, vehicules et ecoles desservies.

Les IDs utiles doivent etre denormalises dans `studentAssignments` pour securiser les acces :

- `parentIds` ;
- `driverIds` ;
- `assistantIds` ;
- `circuitIds` ;
- `vehicleIds` ;
- `schoolIds` ;
- `transportManagerId`.

## 13. Impact Firestore Rules

Regles cibles :

- `children` modifiable uniquement par SPW ;
- `assistants` modifiable uniquement par SPW ;
- `studentAssignments` modifiable par transporteur ;
- `stopPassages` et `tripSegments` modifiables par transporteur ;
- parents en lecture uniquement sur leurs enfants et trajets ;
- chauffeurs en lecture uniquement sur leurs passages ;
- convoyeuses en lecture uniquement sur leurs passages ;
- transporteurs en lecture limitee sur les convoyeuses necessaires a leurs circuits, passages et transferts ;
- chauffeurs en lecture limitee sur les convoyeuses necessaires a leurs circuits ou transferts ;
- convoyeuses en lecture sur leur fiche et les collegues necessaires au meme circuit ou transfert ;
- parents sans acces direct au referentiel `assistants` ;
- support sans acces direct au referentiel `assistants` ;
- suppression physique des convoyeuses interdite ;
- desactivation des convoyeuses reservee au SPW ;
- SPW en supervision globale selon perimetre.

Les donnees medicales, PMR, garde alternee, donnees administratives eleve et donnees personnelles convoyeuse ne doivent pas etre modifiables par le transporteur.

## 14. Impact UI

### SPW

- gestion officielle eleves ;
- garde alternee ;
- ecoles ;
- donnees medicales ;
- supervision affectations.

### Transporteur

- ecran d'affectation rapide ;
- circuits ;
- segments ;
- passages ;
- vehicules ;
- chauffeurs ;
- convoyeuses ;
- transferts.

### Chauffeur / Convoyeuse

- vue des passages du jour ;
- eleves par passage ;
- transferts ;
- absences ;
- alertes utiles.

### Parent

- trajet actif ;
- arret actif ;
- heure ;
- transfert ;
- retard ;
- absence.

## 15. Reference Officielle

Cette architecture V1 est la reference officielle du projet GTS a partir du 17/06/2026.
