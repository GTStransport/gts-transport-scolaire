# Architecture Maître GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

Ce document résume l'architecture GTS V2 et sert de vue maître pour organiser les développements.

Il consolide :

- les modules documentés ;
- les dépendances entre modules ;
- les priorités de développement ;
- l'ordre recommandé de mise en oeuvre.

Principe officiel :

```txt
GTS V2 doit avancer par lots progressifs, sans casser l'existant et sans supprimer le legacy au début.
```

## 2. Niveaux De Priorité

### P1 : Indispensable

Modules nécessaires pour sécuriser le socle métier, les accès, la lecture transport et les opérations quotidiennes.

### P2 : Important

Modules à forte valeur métier, nécessaires pour réduire le papier, les erreurs et les échanges parallèles.

### P3 : Amélioration

Modules de pilotage, confort, reporting ou structuration avancée.

### P4 : Futur

Modules ou fonctionnalités à prévoir après stabilisation des fondations V2.

## 3. Modules Documentés

| Module | Document | Priorité | Rôle |
| --- | --- | --- | --- |
| Architecture GTS V1 | `gts-architecture-v1.md` | Référence | Base métier validée |
| Roadmap V2 | `gts-roadmap-v2.md` | Référence | Première planification V2 |
| Plan d'implémentation V2 | `gts-v2-implementation-plan.md` | P1 | Plan technique global |
| Modèle identité V2 | `gts-identity-model-v2.md` | P1 | Source d'autorité utilisateurs et scopes |
| Transport view | `gts-transport-view.md` | P1 | Vue transport normalisée V2/legacy |
| Lieux de transfert | `gts-transfer-locations-v2.md` | P1 | Référentiel officiel des lieux |
| Gestion des transferts | `gts-transfer-management-v2.md` | P2 | Préparation, visibilité et traçabilité transferts |
| Internats | `gts-boarding-school-v2.md` | P2 | Internat, retours week-end, garde alternée |
| Consignes prise en charge | `gts-pickup-instructions-v2.md` | P1 | Éviter les erreurs de prise/dépose |
| Briefing du jour | `gts-daily-briefing-v2.md` | P1 | Écran quotidien chauffeur/convoyeuse |
| Présences numériques | `gts-digital-attendance-v2.md` | P1 | Remplacer les feuilles papier |
| Présences élèves simplifiées | `gts-student-attendance-v2.md` | P1 | Modèle présence/absence |
| Informations officielles | `gts-official-information-v2.md` | P2 | Source officielle d'information |
| Centre d'informations officielles | `gts-official-information-center-v2.md` | P2 | Publication, lecture, archivage |
| Diffusion ciblée | `gts-targeted-information-v2.md` | P2 | Destinataires automatiques |
| Incidents | `gts-incident-management-v2.md` | P2 | Suivi complet incidents |
| Dossier élève SPW | `gts-student-case-file-v2.md` | P2 | Vue centrale SPW |
| Dossier élève SPW historique | `gts-spw-student-case-file-v2.md` | Référence | Version précédente détaillée |
| Écoles | `gts-school-management-v2.md` | P2 | Congés, fermetures, impacts transport |
| Flotte | `gts-fleet-management-v2.md` | P2 | Véhicules, réserve, maintenance |
| Chauffeurs | `gts-driver-management-v2.md` | P2 | Titulaires, volants, remplacements |
| Convoyeuses | `gts-assistant-management-v2.md` | P1 | Référentiel SPW, remplacements, présences |
| Portail parent | `gts-parent-portal-v2.md` | P3 | Accès parent limité |
| Tableaux de bord | `gts-reporting-dashboard-v2.md` | P3 | Indicateurs et exports |
| Scénarios métier | `gts-scenarios-metier.md` | Référence | Cas réels validés |

## 4. Socle Technique P1

### Identité Et Sécurité

Documents :

- `gts-identity-model-v2.md` ;
- `gts-v2-implementation-plan.md`.

Dépendances :

- Firestore Rules V2 ;
- scopes parent ;
- scopes transporteur ;
- accès chauffeur ;
- accès convoyeuse ;
- séparation SPW / transporteur.

Objectif :

- garantir que chaque rôle voit uniquement son périmètre ;
- empêcher l'accès global non justifié ;
- préparer les futures collections V2.

### Transport View

Document :

- `gts-transport-view.md`.

Dépendances :

- `children` legacy ;
- `studentAssignments` ;
- `stopPassages` ;
- `tripSegments` ;
- garde alternée active ;
- fallback legacy.

Objectif :

- fournir une lecture unique du transport ;
- éviter de dupliquer la logique dans chaque écran ;
- préparer l'affichage V2 sans casser l'existant.

### Consignes De Prise En Charge

Document :

- `gts-pickup-instructions-v2.md`.

Dépendances :

- dossier élève ;
- briefing du jour ;
- informations officielles ;
- absences ;
- internat ;
- garde alternée.

Objectif :

- éviter de prendre ou déposer un élève au mauvais endroit ou au mauvais moment.

### Briefing Du Jour

Document :

- `gts-daily-briefing-v2.md`.

Dépendances :

- transport view ;
- circuits ;
- véhicules ;
- chauffeur réel ;
- convoyeuse réelle ;
- absences ;
- consignes ;
- informations officielles ;
- remplacements.

Objectif :

- devenir l'écran principal du chauffeur et de la convoyeuse avant le départ.

### Présences Numériques

Documents :

- `gts-digital-attendance-v2.md` ;
- `gts-student-attendance-v2.md`.

Dépendances :

- briefing du jour ;
- convoyeuse ;
- remplacements ;
- élèves attendus ;
- absences déclarées.

Objectif :

- remplacer la feuille papier par un encodage simple : présent ou absent.

### Convoyeuses SPW-Owned

Document :

- `gts-assistant-management-v2.md`.

Dépendances :

- identité V2 ;
- Firestore Rules ;
- briefing ;
- présences ;
- remplacements.

Objectif :

- respecter la règle métier : SPW propriétaire des convoyeuses, transporteur lecture limitée et affectation par référence.

## 5. Modules Métier P2

### Informations Officielles Et Diffusion Ciblée

Documents :

- `gts-official-information-v2.md` ;
- `gts-official-information-center-v2.md` ;
- `gts-targeted-information-v2.md`.

Dépendances :

- identité ;
- scopes par rôle ;
- briefing du jour ;
- notifications ;
- accusés de lecture ;
- écoles ;
- circuits ;
- transferts.

Objectif :

- faire de GTS la source officielle d'information.

### Incidents

Document :

- `gts-incident-management-v2.md`.

Dépendances :

- dossier élève ;
- briefing ;
- notifications ;
- SPW décisionnaire ;
- confidentialité ;
- historique.

Objectif :

- remplacer papier/mail/plateforme par un dossier incident suivi jusqu'à clôture.

### Dossier Élève SPW

Documents :

- `gts-student-case-file-v2.md` ;
- `gts-spw-student-case-file-v2.md`.

Dépendances :

- children ;
- transport view ;
- présences ;
- absences ;
- incidents ;
- décisions SPW ;
- consignes ;
- informations officielles ;
- historique.

Objectif :

- devenir la vue centrale SPW de suivi transport.

### Gestion Des Écoles

Document :

- `gts-school-management-v2.md`.

Dépendances :

- children ;
- circuits ;
- présences ;
- briefing ;
- informations officielles ;
- transferts ;
- internats.

Objectif :

- faire impacter automatiquement congés, fermetures et horaires spéciaux sur les modules concernés.

### Gestion Des Transferts

Documents :

- `gts-transfer-locations-v2.md` ;
- `gts-transfer-management-v2.md`.

Dépendances :

- transportTransfers ;
- stopPassages ;
- tripSegments ;
- studentAssignments ;
- circuits ;
- écoles ;
- consignes ;
- remplacements.

Objectif :

- rendre les transferts préparés, visibles et traçables.

### Flotte, Chauffeurs Et Remplacements

Documents :

- `gts-fleet-management-v2.md` ;
- `gts-driver-management-v2.md` ;
- `gts-assistant-management-v2.md`.

Dépendances :

- briefing ;
- circuits ;
- remplacement ;
- informations officielles ;
- contacts temporaires ;
- sécurité.

Objectif :

- garantir que véhicule réel, chauffeur réel et convoyeuse réelle sont connus par les personnes concernées.

### Internats

Document :

- `gts-boarding-school-v2.md`.

Dépendances :

- children ;
- garde alternée ;
- studentAssignments ;
- briefing ;
- dossier élève ;
- portail parent.

Objectif :

- gérer les retours semaine/week-end et destinations selon parent actif.

## 6. Modules P3

### Portail Parent

Document :

- `gts-parent-portal-v2.md`.

Dépendances :

- identité parent ;
- scopes parent ;
- transport view ;
- absences ;
- informations officielles ;
- consignes autorisées ;
- décisions SPW communiquées ;
- garde alternée ;
- internat.

Objectif :

- donner au parent une vue limitée à son enfant.

### Reporting Et Tableaux De Bord

Document :

- `gts-reporting-dashboard-v2.md`.

Dépendances :

- données stables ;
- présences ;
- incidents ;
- informations officielles ;
- remplacements ;
- circuits ;
- écoles ;
- exports.

Objectif :

- transformer les données quotidiennes en indicateurs exploitables.

## 7. Modules P4

Les modules P4 doivent être traités après stabilisation des P1, P2 et P3.

Exemples :

- statistiques avancées ;
- maintenance flotte avancée ;
- exports analytiques complexes ;
- automatisations de planification ;
- suggestions d'affectation ;
- optimisation de circuits ;
- tableaux comparatifs pluriannuels avancés ;
- intégrations externes ;
- pièces jointes avancées pour incidents ;
- moteur de notifications multicanal avancé.

## 8. Dépendances Principales

### Chaîne Transport

```txt
children
  -> studentAssignments
  -> stopPassages
  -> tripSegments
  -> transportViewForChild()
  -> briefing du jour
  -> présences / consignes / incidents
```

### Chaîne Identité Et Accès

```txt
request.auth.uid
  -> users / profiles
  -> scopes
  -> Firestore Rules
  -> visibilité par rôle
```

### Chaîne Information Officielle

```txt
information créée
  -> ciblage automatique
  -> destinataires
  -> notifications
  -> accusés de lecture
  -> briefing / portail / dossier élève
```

### Chaîne Incident

```txt
incident créé
  -> notification SPW
  -> analyse SPW
  -> complément éventuel
  -> décision SPW
  -> dossier élève
  -> clôture
```

### Chaîne Présence

```txt
briefing du jour
  -> élèves attendus
  -> convoyeuse
  -> présent / absent
  -> dossier élève
  -> reporting
```

### Chaîne Remplacement

```txt
titulaire prévu
  -> remplaçant réel
  -> accès temporaire
  -> briefing du jour
  -> contacts utiles
  -> révocation
  -> audit
```

## 9. Priorités De Développement

### P1 : Indispensable

1. Stabiliser identité et scopes V2.
2. Finaliser Firestore Rules lecture contrôlée.
3. Stabiliser `transportViewForChild()`.
4. Stabiliser référentiels transport minimum.
5. Mettre en place briefing du jour lecture seule.
6. Mettre en place consignes de prise en charge lecture seule.
7. Mettre en place présences numériques simples.
8. Stabiliser gestion convoyeuses SPW-owned et remplacements.

### P2 : Important

1. Informations officielles.
2. Diffusion ciblée.
3. Incidents.
4. Dossier élève SPW.
5. Écoles et événements école.
6. Transferts opérationnels.
7. Flotte et remplacements véhicule.
8. Chauffeurs titulaires et volants.
9. Internats.

### P3 : Amélioration

1. Portail parent enrichi.
2. Reporting SPW.
3. Reporting transporteur.
4. Exports PDF.
5. Exports Excel.
6. Historique mensuel et annuel.

### P4 : Futur

1. Optimisation automatique.
2. Analyses avancées.
3. Maintenance flotte avancée.
4. Intégrations externes.
5. Automatisation complète des plannings.
6. Notifications multicanales avancées.

## 10. Roadmap Recommandée

### Phase 1 : Sécurité Et Lecture

Objectif :

- sécuriser les accès ;
- stabiliser la lecture V2/legacy ;
- éviter toute fuite de données.

Livrables :

- Firestore Rules V2 ;
- scopes parents ;
- scopes chauffeurs/convoyeuses ;
- `transportViewForChild()` ;
- tests de sécurité.

### Phase 2 : Briefing Et Présences

Objectif :

- donner au terrain une information fiable du jour ;
- remplacer progressivement le papier.

Livrables :

- briefing du jour lecture seule ;
- élèves attendus ;
- chauffeur/convoyeuse/véhicule réels ;
- présences présent/absent ;
- remplacements simples.

### Phase 3 : Consignes Et Informations Officielles

Objectif :

- faire de GTS la source officielle d'information.

Livrables :

- consignes de prise en charge ;
- informations officielles ;
- diffusion ciblée ;
- accusés de lecture ;
- notifications sécurisées.

### Phase 4 : Incidents Et Dossier Élève

Objectif :

- centraliser le suivi SPW.

Livrables :

- déclaration incident ;
- workflow SPW ;
- dossier élève SPW ;
- historique ;
- décisions SPW ;
- intégration briefing.

### Phase 5 : Référentiels Métier

Objectif :

- renforcer les référentiels utilisés par le transport.

Livrables :

- écoles ;
- transferts ;
- flotte ;
- chauffeurs ;
- convoyeuses ;
- internats.

### Phase 6 : Portail Parent Et Reporting

Objectif :

- ouvrir progressivement les vues externes et les indicateurs.

Livrables :

- portail parent limité ;
- reporting SPW ;
- reporting transporteur ;
- exports PDF/Excel ;
- comparaisons mensuelles et annuelles.

## 11. Ordre De Développement Recommandé

1. Firestore Rules V2 et scopes d'identité.
2. `transportViewForChild()` stable et testé.
3. Données V2 minimales : `studentAssignments`, `stopPassages`, `tripSegments`.
4. Briefing du jour lecture seule.
5. Présences numériques simples.
6. Remplacements convoyeuses et chauffeurs en lecture contrôlée.
7. Consignes de prise en charge.
8. Informations officielles et diffusion ciblée.
9. Incidents.
10. Dossier élève SPW.
11. Écoles et événements école.
12. Transferts opérationnels.
13. Flotte et véhicules de remplacement.
14. Portail parent.
15. Reporting et exports.

## 12. Règles De Gouvernance

Règles obligatoires :

- aucune suppression legacy au début ;
- fallback legacy obligatoire ;
- migration progressive ;
- dry-run avant écriture ;
- sauvegarde Firestore avant migration ;
- tests règles avant déploiement ;
- documentation avant fonctionnalité sensible ;
- séparation SPW / transporteur respectée ;
- deny by default sur les données sensibles ;
- support sans accès sensible par défaut.

## 13. Recommandation Finale

GTS V2 doit avancer par couches :

1. sécurité ;
2. lecture métier fiable ;
3. information terrain ;
4. suivi SPW ;
5. portail et reporting.

La priorité absolue est de fiabiliser ce que chaque rôle voit, avant d'ajouter des écritures ou des automatisations avancées.
