# Dossier Élève SPW GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

Le Dossier Élève SPW centralise toutes les informations utiles au suivi transport d'un élève.

Principe officiel :

```txt
Le dossier élève devient la vue centrale SPW pour le suivi transport.
```

Il ne remplace pas les collections métier sources. Il agrège les informations validées pour donner au SPW une vision complète, chronologique et exploitable.

## 2. Rôle Du Dossier Élève

Le dossier élève permet au SPW de répondre rapidement à :

- quelle est l'identité officielle de l'élève ?
- quel transport est actif ?
- quels circuits et arrêts sont utilisés ?
- quelle garde alternée s'applique ?
- l'élève est-il en internat ?
- quelles présences et absences sont connues ?
- quels incidents ont été déclarés ?
- quelles décisions SPW ont été prises ?
- quelles consignes sont actives ?
- quelles informations officielles concernent l'élève ?
- qui a consulté ou modifié les données ?

Le dossier élève est une vue de suivi, pas un espace de messagerie libre.

## 3. Identité Élève

Données principales :

- identifiant élève ;
- nom ;
- prénom ;
- date de naissance si nécessaire au suivi ;
- école ;
- classe ou implantation si disponible ;
- statut actif/inactif ;
- responsables légaux ;
- coordonnées utiles validées ;
- informations administratives officielles.

Source principale :

- `children`.

Règle :

```txt
Le SPW reste propriétaire de la fiche officielle de l'élève.
```

Le transporteur ne crée pas, ne supprime pas et ne modifie pas les données administratives de l'élève.

## 4. Circuits

Le dossier doit afficher les circuits liés à l'élève :

- circuit matin ;
- circuit soir ;
- circuit fermé ;
- circuit avec transfert ;
- porte-à-porte ;
- circuit lié à une semaine paire ou impaire ;
- circuit historique si utile au suivi.

Sources possibles :

- legacy `children.*` ;
- `studentAssignments` ;
- `tripSegments` ;
- `stopPassages`.

Informations affichées :

- numéro ou libellé circuit ;
- direction matin/soir ;
- type de transport ;
- transporteur ;
- chauffeur ;
- convoyeuse ;
- véhicule ;
- statut actif ou historique.

## 5. Arrêts

Le dossier doit afficher :

- arrêt actif ;
- arrêt de montée ;
- arrêt de descente ;
- domicile si porte-à-porte ;
- centre spécialisé si applicable ;
- arrêt semaine paire ;
- arrêt semaine impaire ;
- ancien arrêt si changement historisé.

Règles :

- un arrêt TEC ne doit jamais être considéré comme lié à un seul circuit ;
- l'élève doit être lié à un passage précis quand la V2 est disponible ;
- `pickupStop` reste un fallback legacy ;
- `activePickupStopForChild()` reste la logique d'affichage active pour la garde alternée.

## 6. Garde Alternée

Le dossier doit afficher la situation officielle :

- garde alternée activée ou non ;
- parent semaine paire ;
- parent semaine impaire ;
- adresse parent A ;
- adresse parent B ;
- arrêt mère ;
- arrêt père ;
- parent actif selon la semaine ISO ;
- arrêt actif calculé ;
- impact éventuel sur le circuit.

Sources :

- `children.alternatingResidence` ;
- `motherPickupStop` ;
- `fatherPickupStop` ;
- `evenWeekParent` ;
- `oddWeekParent`.

Règle :

```txt
La garde alternée existante ne doit pas être dupliquée dans une deuxième logique.
```

Les futures affectations V2 doivent référencer ou respecter cette logique.

## 7. Internat

Le dossier doit afficher :

- élève interne ou non ;
- mode internat ;
- destination active ;
- retour chaque week-end ;
- retour un week-end sur deux ;
- retour chez le parent actif selon semaine paire/impaire ;
- distinction mineur/majeur si nécessaire ;
- impact sur matin/soir.

Valeurs recommandées :

```txt
full_week
continuous
weekly_return
alternate_weekend_return
```

Le dossier doit distinguer :

- internat semaine ;
- retour week-end ;
- garde alternée week-end ;
- transport scolaire classique.

## 8. Présences

Le dossier doit afficher les présences issues de la future feuille numérique.

Principe :

```txt
Présent ou absent uniquement.
```

Informations utiles :

- date ;
- direction matin/soir ;
- circuit ;
- présence ;
- convoyeuse ayant validé ;
- heure de validation ;
- correction éventuelle ;
- source de correction.

Le dossier ne doit pas transformer la présence en suivi excessif de montée/descente.

## 9. Absences

Le dossier doit distinguer :

- absence déclarée à l'avance ;
- absence constatée par la convoyeuse ;
- absence longue ;
- absence corrigée ;
- absence liée à congé pédagogique ;
- absence liée à internat ou retour week-end.

Sources possibles :

- parent ;
- SPW ;
- transporteur selon procédure validée ;
- présence numérique ;
- consigne officielle.

Les absences doivent être visibles dans le briefing du jour quand elles impactent le trajet.

## 10. Incidents

Le dossier doit afficher les incidents liés à l'élève.

Informations visibles au SPW :

- date ;
- type ;
- niveau ;
- circuit ;
- déclarant ;
- statut ;
- décision SPW ;
- demandes de complément ;
- clôture ;
- lien vers le dossier incident.

Règle :

```txt
Un incident ne crée pas automatiquement une sanction.
```

Le SPW analyse, décide et clôture.

## 11. Décisions SPW

Les décisions SPW sont protégées et historisées.

Exemples :

- aucune suite ;
- rappel de consigne ;
- demande de complément ;
- consigne de prise en charge ;
- mesure temporaire ;
- suspension temporaire ;
- exclusion éventuelle ;
- clôture de suivi.

Règle officielle :

```txt
L'exclusion éventuelle reste uniquement une décision SPW.
```

Ne peuvent jamais décider d'une exclusion :

- chauffeur ;
- convoyeuse ;
- transporteur ;
- parent ;
- support.

## 12. Historique Transport

Le dossier doit conserver une timeline transport.

Événements possibles :

- création fiche élève ;
- changement d'école ;
- changement d'arrêt ;
- changement de garde alternée ;
- changement de circuit ;
- changement de chauffeur ;
- changement de convoyeuse ;
- changement de véhicule ;
- création d'affectation V2 ;
- désactivation d'affectation ;
- passage legacy vers V2 ;
- transfert ajouté ou retiré ;
- internat activé ou modifié.

Objectif :

- comprendre ce qui a changé ;
- identifier quand ;
- identifier par qui ;
- éviter les conflits d'information.

## 13. Consignes De Prise En Charge

Le dossier doit afficher les consignes officielles liées à l'élève.

Exemples :

- ne pas prendre aujourd'hui ;
- reste à la garderie ;
- parent récupère l'enfant ;
- retour internat ;
- garde alternée active ;
- consigne exceptionnelle validée SPW ;
- consigne liée à un incident ;
- consigne liée à une absence.

Règles :

- seules les consignes validées doivent être visibles opérationnellement ;
- les chauffeurs et convoyeuses voient uniquement ce qui est nécessaire au trajet ;
- les consignes sensibles doivent être minimisées.

## 14. Informations Officielles Liées

Le dossier doit afficher les informations officielles qui concernent l'élève.

Exemples :

- information école ;
- information circuit ;
- information transfert ;
- fermeture école ;
- congé pédagogique ;
- changement procédure ;
- information SPW ;
- information transporteur validée.

Le dossier doit conserver :

- titre ;
- type ;
- priorité ;
- date de publication ;
- émetteur ;
- destinataires concernés ;
- accusés de lecture si applicable.

## 15. Journal Des Actions

Le dossier doit journaliser les actions importantes.

Actions à tracer :

- consultation sensible ;
- modification officielle ;
- changement d'affectation ;
- ajout de consigne ;
- déclaration incident ;
- décision SPW ;
- export PDF ;
- archivage ;
- correction de présence ;
- consultation par support autorisé.

Chaque entrée doit contenir :

- acteur ;
- rôle ;
- action ;
- date ;
- heure ;
- source ;
- objet concerné.

Le journal doit être non modifiable par les utilisateurs métier.

## 16. Visibilité Par Rôle

### SPW

Accès complet au dossier élève.

Peut :

- lire ;
- corriger les données officielles ;
- analyser ;
- décider ;
- clôturer ;
- exporter selon procédure ;
- archiver.

### Transporteur

Accès limité au transport.

Peut voir :

- identité minimale ;
- école ;
- arrêt ou domicile utile ;
- affectations ;
- circuits ;
- horaires ;
- consignes transport validées ;
- absences utiles ;
- incidents liés à son périmètre selon décision SPW.

Ne peut pas voir :

- décisions SPW internes non partagées ;
- données médicales détaillées ;
- historique administratif complet ;
- informations hors périmètre.

### Chauffeur

Accès limité :

- élèves de son circuit ;
- briefing du jour ;
- arrêt ou destination utile ;
- absence utile ;
- consigne de prise en charge ;
- incident qu'il a déclaré ou complément demandé.

### Convoyeuse

Accès limité :

- élèves de son circuit ;
- feuille de présence ;
- briefing du jour ;
- consignes utiles ;
- incidents qu'elle a déclarés ;
- demandes de complément ;
- remplacements concernés.

### Parent

Accès limité à son enfant.

Peut voir :

- trajet utile ;
- arrêt actif ;
- informations officielles destinées au parent ;
- absences qu'il déclare ou qui lui sont communiquées ;
- décisions SPW communiquées officiellement.

Ne voit pas :

- autres élèves ;
- décisions internes ;
- rapports complets non validés ;
- notes transporteur ;
- données d'autres familles.

### Support

Aucun accès sensible par défaut.

Tout accès exceptionnel doit être :

- limité ;
- justifié ;
- temporaire ;
- journalisé.

## 17. Sécurité Et RGPD

Le dossier élève contient des données sensibles.

Principes :

- minimisation ;
- accès par rôle ;
- deny by default ;
- SPW propriétaire ;
- transporteur limité à l'organisation transport ;
- parent limité à son enfant ;
- support sans accès sensible par défaut ;
- journalisation des consultations sensibles ;
- export contrôlé ;
- conservation maîtrisée ;
- archivage documenté.

Données sensibles :

- santé ;
- handicap ;
- PMR ;
- adresses ;
- garde alternée ;
- internat ;
- incidents ;
- décisions SPW ;
- informations familiales ;
- contacts d'urgence ;
- consignes particulières.

Les notifications ne doivent jamais contenir de détail sensible.

## 18. Archivage

Le dossier doit prévoir un archivage officiel.

Cas d'archivage :

- élève sorti du dispositif ;
- fin d'année scolaire ;
- changement d'école hors périmètre ;
- clôture administrative ;
- durée légale atteinte.

Règles :

- archivage préféré à suppression immédiate ;
- conservation selon politique SPW ;
- accès réduit après archivage ;
- export possible avant archivage si autorisé ;
- journalisation de l'archivage ;
- suppression physique uniquement selon procédure validée.

## 19. Collections Sources

Le dossier élève peut agréger :

- `children` ;
- `studentAssignments` ;
- `stopPassages` ;
- `tripSegments` ;
- `transportTransfers` ;
- `studentAttendance` future ;
- `studentIncidents` future ;
- `officialInformation` future ;
- `pickupInstructions` future ;
- `decisionLogs` future ;
- `auditLogs` future.

Le dossier ne doit pas recopier inutilement toutes les données.

Il doit rester une vue consolidée construite à partir des sources officielles.

## 20. Recommandation Officielle

Le Dossier Élève SPW GTS V2 doit devenir la vue centrale de suivi transport.

Il doit être :

- complet pour le SPW ;
- limité pour les autres rôles ;
- chronologique ;
- traçable ;
- compatible avec les modules incidents, présences, absences, consignes et informations officielles ;
- conforme RGPD ;
- orienté décision SPW.

La priorité de développement doit être une première vue lecture seule SPW avant toute fonctionnalité d'édition avancée.
