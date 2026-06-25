# Tableaux De Bord Et Reporting GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

GTS V2 doit transformer les données quotidiennes du transport scolaire en indicateurs exploitables pour la prise de décision.

Principe officiel :

```txt
Transformer les données quotidiennes de GTS en indicateurs exploitables pour la prise de décision.
```

Les tableaux de bord doivent aider :

- le SPW à piloter le suivi global ;
- les transporteurs à suivre leur exploitation ;
- les chauffeurs et convoyeuses à consulter leurs informations personnelles ;
- les responsables à identifier les tendances, risques et points d'amélioration.

## 2. Principes De Reporting

Les indicateurs GTS doivent être :

- utiles métier ;
- compréhensibles ;
- filtrables ;
- exportables ;
- traçables ;
- conformes RGPD ;
- séparés par rôle ;
- limités au périmètre autorisé.

Le reporting ne doit pas devenir un outil de surveillance excessive.

Chaque rôle voit uniquement les indicateurs nécessaires à sa mission.

## 3. Tableau De Bord SPW

Le tableau de bord SPW est le tableau de bord le plus complet.

Objectifs :

- suivre l'activité globale ;
- détecter les problèmes récurrents ;
- suivre les incidents ;
- suivre les absences et présences ;
- mesurer les délais de traitement ;
- préparer les décisions et réunions.

Indicateurs principaux :

- nombre d'élèves transportés ;
- nombre d'élèves actifs ;
- nombre d'élèves non affectés ;
- présences ;
- absences ;
- taux de présence ;
- taux d'absence ;
- incidents ouverts ;
- incidents clôturés ;
- incidents par niveau ;
- incidents par type ;
- incidents par circuit ;
- incidents par école ;
- incidents par transporteur ;
- remplacements chauffeurs ;
- remplacements convoyeuses ;
- informations officielles publiées ;
- informations officielles urgentes ;
- accusés de lecture en attente ;
- temps moyen de traitement des incidents ;
- dossiers élèves sous suivi ;
- décisions SPW prises.

Filtres SPW recommandés :

- période ;
- école ;
- transporteur ;
- circuit ;
- type de transport ;
- niveau d'incident ;
- statut incident ;
- internat ;
- garde alternée ;
- PMR ;
- présence/absence.

## 4. Tableau De Bord Transporteur

Le tableau de bord transporteur concerne uniquement son périmètre d'exploitation.

Objectifs :

- suivre la flotte ;
- suivre les circuits ;
- identifier les remplacements ;
- suivre les communications officielles ;
- détecter les alertes d'organisation.

Indicateurs principaux :

- flotte active ;
- véhicules disponibles ;
- véhicules indisponibles ;
- véhicules adaptés disponibles ;
- véhicules au garage ;
- circuits actifs ;
- circuits sans chauffeur ;
- circuits sans véhicule ;
- circuits avec convoyeuse absente ;
- remplacements chauffeurs ;
- remplacements chauffeurs volants ;
- absences chauffeurs ;
- retards signalés ;
- communications reçues ;
- informations officielles non lues ;
- alertes opérationnelles ;
- élèves transportés dans son périmètre ;
- élèves non affectés dans son périmètre.

Le transporteur ne voit pas :

- décisions SPW internes ;
- données médicales détaillées ;
- incidents hors périmètre ;
- informations d'autres transporteurs ;
- dossier complet des élèves.

## 5. Tableau De Bord Chauffeur

Le tableau de bord chauffeur doit rester personnel et opérationnel.

Objectifs :

- visualiser ses circuits ;
- suivre ses remplacements ;
- retrouver les informations importantes ;
- consulter ses statistiques personnelles sans exposition excessive.

Indicateurs possibles :

- circuits attribués ;
- circuits du jour ;
- remplacements effectués ;
- jours prestés ;
- informations importantes non lues ;
- incidents déclarés par lui ;
- demandes de complément en attente ;
- véhicules utilisés ;
- notifications urgentes reçues.

Le chauffeur ne voit pas :

- statistiques d'autres chauffeurs ;
- incidents hors périmètre ;
- décisions SPW internes ;
- données personnelles non nécessaires.

## 6. Tableau De Bord Convoyeuse

Le tableau de bord convoyeuse doit être centré sur la présence, les remplacements et les informations utiles.

Objectifs :

- suivre les présences encodées ;
- voir les remplacements ;
- consulter les informations importantes ;
- suivre les incidents déclarés.

Indicateurs possibles :

- présences encodées ;
- absences encodées ;
- circuits accompagnés ;
- remplacements effectués ;
- incidents déclarés ;
- demandes de complément en attente ;
- informations importantes non lues ;
- consignes du jour ;
- feuilles de présence incomplètes ;
- validations en attente.

La convoyeuse ne voit pas :

- statistiques d'autres convoyeuses hors remplacement ou circuit commun ;
- incidents hors périmètre ;
- décisions SPW internes ;
- données sensibles non utiles au trajet.

## 7. Tableaux De Bord Responsables

Les responsables SPW ou administratifs peuvent avoir une vue consolidée selon habilitation.

Indicateurs possibles :

- évolution mensuelle des incidents ;
- évolution annuelle des absences ;
- écoles avec le plus de signalements ;
- circuits les plus concernés ;
- temps moyen de clôture ;
- taux de lecture des informations officielles ;
- charges par transporteur ;
- volumes de remplacements ;
- tendances internat et garde alternée ;
- indicateurs de conformité.

La vue responsable doit rester anonymisable quand une analyse nominative n'est pas nécessaire.

## 8. Exports

Exports prévus :

- PDF ;
- Excel ;
- statistiques mensuelles ;
- statistiques annuelles.

### PDF

Utilisations :

- rapport mensuel SPW ;
- synthèse transporteur ;
- suivi école ;
- synthèse incident ;
- dossier élève si autorisé.

Règles :

- export journalisé ;
- contenu limité au rôle ;
- pas de données sensibles inutiles ;
- accès uniquement après authentification.

### Excel

Utilisations :

- analyse mensuelle ;
- préparation réunion ;
- consolidation annuelle ;
- contrôle administratif.

Règles :

- colonnes limitées au périmètre ;
- anonymisation possible ;
- export sensible réservé SPW ;
- journalisation obligatoire.

## 9. Indicateurs Qualité

Indicateurs principaux :

- taux de présence ;
- taux d'absence ;
- taux d'incidents ;
- taux d'incidents par niveau ;
- temps de résolution ;
- temps moyen de traitement des incidents ;
- nombre d'informations publiées ;
- informations lues ;
- informations non lues ;
- taux d'accusés de lecture ;
- taux de remplacements ;
- circuits incomplets ;
- élèves non affectés ;
- feuilles de présence non validées.

Exemples de calcul :

```txt
taux_presence = présences / élèves_attendus
taux_absence = absences / élèves_attendus
taux_incident = incidents / élèves_transportés
taux_lecture = accusés_lecture / destinataires
```

Les indicateurs doivent toujours préciser :

- période ;
- périmètre ;
- source ;
- date de calcul.

## 10. Historique

Le reporting doit permettre :

- comparaison mensuelle ;
- comparaison annuelle ;
- suivi par année scolaire ;
- évolution par circuit ;
- évolution par école ;
- évolution par transporteur ;
- évolution des incidents ;
- évolution des absences ;
- évolution des lectures d'informations officielles.

Exemples :

- incidents de juin 2026 vs mai 2026 ;
- absences année scolaire courante vs année précédente ;
- temps moyen de clôture par trimestre ;
- taux de lecture des informations urgentes par mois.

L'historique doit être conservé selon la politique SPW.

## 11. Sources De Données

Sources possibles :

- `children` ;
- `studentAssignments` ;
- `tripSegments` ;
- `stopPassages` ;
- `transportTransfers` ;
- `studentAttendance` future ;
- `studentIncidents` future ;
- `officialInformation` future ;
- `readReceipts` future ;
- `replacementAssignments` future ;
- `vehicles` ;
- `drivers` ;
- `assistants` ;
- `circuits` ;
- `auditLogs` future.

Le tableau de bord doit privilégier les données validées et horodatées.

## 12. Sécurité Et RGPD

Principes :

- accès par rôle ;
- périmètre strict ;
- minimisation ;
- anonymisation quand possible ;
- agrégation privilégiée ;
- export contrôlé ;
- journalisation des exports ;
- pas de données sensibles dans les notifications ;
- support sans accès sensible par défaut ;
- conservation limitée ;
- droit de rectification via SPW.

Données sensibles à protéger :

- identité élève ;
- santé ;
- PMR ;
- garde alternée ;
- internat ;
- incidents ;
- décisions SPW ;
- absences ;
- adresses ;
- contacts parentaux.

Règle :

```txt
Un indicateur agrégé doit être préféré à une liste nominative quand le détail nominatif n'est pas nécessaire.
```

## 13. Visibilité Par Rôle

### SPW

Vue complète selon habilitation interne.

Peut consulter :

- statistiques globales ;
- détails élèves ;
- incidents ;
- décisions ;
- exports sensibles autorisés.

### Transporteur

Vue limitée à son périmètre.

Peut consulter :

- flotte ;
- circuits ;
- chauffeurs de son périmètre ;
- véhicules ;
- informations officielles reçues ;
- alertes opérationnelles.

### Chauffeur

Vue personnelle.

Peut consulter :

- ses circuits ;
- ses remplacements ;
- ses informations importantes ;
- ses incidents déclarés.

### Convoyeuse

Vue personnelle.

Peut consulter :

- ses présences encodées ;
- ses circuits ;
- ses remplacements ;
- ses incidents déclarés ;
- ses informations importantes.

### Parent

Pas de tableau de bord statistique global.

Peut voir uniquement les informations liées à son enfant, si un indicateur parent est prévu plus tard.

### Support

Aucun accès sensible par défaut.

Tout accès exceptionnel doit être temporaire, limité et journalisé.

## 14. Alertes Et Seuils

Alertes possibles :

- hausse inhabituelle des absences ;
- incident critique ouvert ;
- incident non traité depuis un délai défini ;
- information urgente non lue ;
- circuit sans chauffeur ;
- circuit sans véhicule ;
- remplacement non confirmé ;
- feuille de présence non validée ;
- élève non affecté ;
- véhicule adapté indisponible.

Les seuils doivent être configurables par le SPW.

## 15. Gains Métier

Gains attendus :

- vision consolidée du transport ;
- décisions SPW mieux documentées ;
- moins de tableurs manuels ;
- moins de demandes répétées aux transporteurs ;
- meilleur suivi des incidents ;
- meilleur suivi des absences ;
- meilleure visibilité sur les remplacements ;
- meilleure traçabilité des informations officielles ;
- préparation plus simple des réunions ;
- pilotage annuel plus fiable.

## 16. Roadmap

Phases recommandées :

1. Documentation officielle des indicateurs.
2. Définition des sources fiables.
3. Création des agrégats en lecture seule.
4. Tableau de bord SPW minimal.
5. Tableau de bord transporteur minimal.
6. Tableaux personnels chauffeur et convoyeuse.
7. Exports PDF.
8. Exports Excel.
9. Comparaisons mensuelles et annuelles.
10. Alertes de qualité.

## 17. Recommandation Officielle

Le reporting GTS V2 doit commencer par des indicateurs simples, fiables et traçables.

La priorité doit être :

- SPW ;
- transporteur ;
- présences/absences ;
- incidents ;
- informations officielles ;
- remplacements.

Les statistiques avancées doivent venir après stabilisation des données sources.
