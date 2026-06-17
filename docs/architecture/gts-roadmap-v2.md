# GTS Roadmap V2

Architecture validée le 17/06/2026

Ce document decrit la trajectoire de migration vers l'architecture cible GTS basee sur les trajets segmentes. Il ne remplace pas l'application actuelle : il definit l'ordre recommande des evolutions futures.

## 1. Objectif V2

La V2 doit permettre de gerer correctement :

- trajets matin ;
- trajets soir ;
- transferts ;
- circuits fermes ;
- porte-a-porte ;
- PMR ;
- garde alternee ;
- semaines paire/impaire ;
- plusieurs cars au meme arret ;
- plusieurs cars au meme transfert ;
- changements de chauffeur, convoyeuse ou vehicule.

## 2. Principe De Migration

La migration doit etre progressive et non destructive.

Regles :

- conserver `children` comme referentiel officiel SPW ;
- conserver les champs actuels en fallback ;
- ajouter les nouvelles collections sans casser l'existant ;
- lire le nouveau modele si disponible ;
- revenir a l'ancien modele si aucune affectation V2 n'existe ;
- ne pas supprimer les anciens champs avant validation terrain.

## 3. Phase 1 : Stabilisation V1

Objectif : verrouiller les regles metier validees.

Travaux :

- documenter l'architecture officielle ;
- confirmer SPW proprietaire des eleves ;
- confirmer transporteur proprietaire du transport ;
- conserver `alternatingResidence` comme source officielle de garde alternee ;
- centraliser la residence active ;
- conserver les affichages actuels compatibles.

Livrable :

- documentation officielle V1 ;
- scenarios metier ;
- roadmap V2.

## 4. Phase 2 : Collections Cibles En Lecture

Objectif : introduire les collections V2 sans effet operationnel obligatoire.

Collections :

- `studentAssignments` ;
- `stopPassages` ;
- `tripSegments` ;
- `transferHubs`.

Contraintes :

- aucune suppression de donnees existantes ;
- pas de bascule obligatoire ;
- documents lisibles par les roles autorises ;
- fallback ancien modele conserve.

## 5. Phase 3 : Firestore Rules V2

Objectif : securiser le modele cible.

Regles :

- `children` modifiable par SPW ;
- `studentAssignments` modifiable par transporteur ;
- `stopPassages` modifiable par transporteur ;
- `tripSegments` modifiable par transporteur ;
- parents en lecture sur leurs enfants et trajets ;
- chauffeurs en lecture sur leurs passages ;
- convoyeuses en lecture sur leurs passages.

Point important : denormaliser les IDs dans `studentAssignments` pour eviter des regles Firestore trop complexes.

## 6. Phase 4 : Generation Des Donnees V2

Objectif : creer une premiere version des affectations depuis les donnees actuelles.

Mapping initial :

- `children.pickupCircuitId` vers assignment matin ;
- `children.schoolCircuitId` vers assignment vers ecole ou retour selon contexte ;
- `children.transferSchoolCircuitId` vers segment apres transfert ;
- `children.driverIds` vers `studentAssignments.driverIds` ;
- `children.assistantId` vers `studentAssignments.assistantIds` ;
- `children.vehicleId` vers `studentAssignments.vehicleIds` ;
- `alternatingResidence` vers assignments `even` et `odd` si necessaire.

Livrable :

- script ou outil admin de generation ;
- rapport de coherence ;
- aucune suppression des champs legacy.

## 7. Phase 5 : Lecture Active Des Assignments

Objectif : les vues lisent le modele V2 quand il existe.

Vues concernees :

- parent ;
- chauffeur ;
- convoyeuse ;
- transporteur ;
- SPW ;
- PDF ;
- notifications.

Strategie :

- chercher assignment actif du jour ;
- tenir compte de `direction` ;
- tenir compte de `weekPattern` ;
- tenir compte de `validDays` ;
- fallback ancien modele si absent.

## 8. Phase 6 : Ecran Transporteur D'Affectation Rapide

Objectif : permettre au transporteur de configurer un circuit complet depuis un seul ecran.

Fonctions :

- choix type de transport ;
- direction matin/soir ;
- circuits ;
- segments ;
- passages ;
- transferts ;
- vehicules ;
- chauffeurs ;
- convoyeuses ;
- eleves affectes ;
- jours de transport ;
- semaine paire/impaire.

Cas couverts :

- `avec_transfert` ;
- `circuit_ferme` ;
- `porte_a_porte`.

## 9. Phase 7 : Gestion PMR

Objectif : rendre operationnelle la prise en charge PMR.

Travaux :

- filtrer vehicules compatibles PMR ;
- afficher besoins PMR aux equipages autorises ;
- gerer passages domicile ;
- gerer `requiresAdaptedVehicle` ;
- alerter si aucun vehicule adapte n'est affecte.

Rappel : les donnees PMR officielles restent gerees par le SPW dans `children`.

## 10. Phase 8 : Transferts Avances

Objectif : gerer les transferts comme de vrais hubs operationnels.

Travaux :

- circuits entrants ;
- circuits sortants ;
- eleves qui descendent ;
- eleves qui montent ;
- eleves qui restent dans le meme car ;
- retards par segment ou passage ;
- plusieurs ecoles apres transfert.

## 11. Phase 9 : Supervision SPW

Objectif : donner au SPW une vision de controle.

Vues :

- eleves sans affectation ;
- garde alternee sans assignment pair/impair ;
- eleves PMR sans vehicule adapte ;
- transferts incomplets ;
- circuits sans chauffeur ;
- circuits sans convoyeuse ;
- ecoles non desservies.

## 12. Phase 10 : Depreciation Progressive Du Legacy

Objectif : reduire la dependance aux anciens champs.

Champs legacy concernes :

- `circuitNumber` ;
- `pickupCircuitId` ;
- `schoolCircuitId` ;
- `transferSchoolCircuitId` ;
- `driverId` ;
- `driverIds` ;
- `assistantId` ;
- `vehicleId`.

Strategie :

- ne pas supprimer au debut ;
- masquer progressivement dans l'UI transporteur ;
- conserver lecture fallback ;
- supprimer seulement apres validation terrain et sauvegardes.

## 13. Risques

- migration incomplete ;
- doublons entre ancien modele et nouveau modele ;
- regles Firestore trop larges ;
- transporteur modifiant indirectement des donnees SPW ;
- confusion entre arret TEC et passage ;
- confusion entre circuit et segment ;
- donnees PMR trop exposees.

## 14. Priorites

Priorite 1 :

- documentation officielle ;
- separation SPW / transporteur ;
- collections cible en lecture.

Priorite 2 :

- generation non destructive des assignments ;
- lecture active avec fallback.

Priorite 3 :

- ecran transporteur d'affectation rapide.

Priorite 4 :

- PMR et porte-a-porte.

Priorite 5 :

- supervision SPW et controles de coherence.

## 15. Definition De Reussite

La V2 est reussie si :

- le SPW garde la maitrise des eleves ;
- le transporteur configure les trajets sans modifier l'eleve ;
- un arret TEC peut avoir plusieurs passages ;
- un eleve est affecte a un passage precis ;
- la garde alternee peut changer l'arret et le circuit ;
- les chauffeurs et convoyeuses ne voient que leurs passages ;
- le parent voit le trajet actif correct ;
- les cas PMR sont couverts ;
- les transferts sont representes comme des hubs reels.

