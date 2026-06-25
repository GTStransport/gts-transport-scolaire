# Gestion Des Transferts Élèves GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

GTS V2 doit gérer les transferts élèves de manière préparée, visible et traçable.

Principe officiel :

```txt
Un transfert doit être préparé, visible et traçable pour éviter les erreurs de prise en charge.
```

Le module transfert doit permettre de savoir :

- quels élèves sont attendus au transfert ;
- de quel car ils arrivent ;
- vers quel car, école, internat ou destination ils repartent ;
- qui les prend en charge ;
- quelles consignes sont actives ;
- quelles alertes existent ;
- qui a consulté ou validé l'information.

## 2. Périmètre Métier

Un transfert concerne les élèves non PMR dont le trajet nécessite une rupture ou coordination entre plusieurs cars.

Le transfert peut être :

- habituel ;
- exceptionnel ;
- lié à un circuit ;
- lié à plusieurs circuits ;
- lié à une école ;
- lié à un internat ;
- impacté par la garde alternée ;
- impacté par une absence ;
- impacté par un remplacement chauffeur ou convoyeuse.

Règle validée :

```txt
Les élèves PMR ne passent jamais par un lieu de transfert.
```

Les élèves PMR relèvent du trajet direct domicile/école ou domicile/centre spécialisé.

## 3. Transferts Habituels

Un transfert habituel est prévu dans l'organisation normale du transport.

Il doit indiquer :

- lieu de transfert officiel ;
- date ou jours habituels ;
- circuits entrants ;
- circuits sortants ;
- écoles desservies ;
- élèves attendus ;
- chauffeurs entrants ;
- chauffeurs sortants ;
- convoyeuses entrantes ;
- convoyeuses sortantes ;
- véhicules entrants ;
- véhicules sortants ;
- horaires prévus ;
- consignes permanentes.

Sources V2 recommandées :

- `transportTransfers` pour le lieu officiel ;
- `stopPassages` pour le passage au transfert ;
- `tripSegments` pour les segments entrants et sortants ;
- `studentAssignments` pour les élèves concernés.

## 4. Transferts Exceptionnels

Un transfert exceptionnel est une modification temporaire.

Exemples :

- car remplacé ;
- chauffeur absent ;
- convoyeuse absente ;
- retard important ;
- changement temporaire de point de prise en charge validé ;
- consigne SPW exceptionnelle ;
- événement école ;
- problème de circulation.

Règles :

- le transfert exceptionnel doit être daté ;
- il doit être limité dans le temps ;
- il doit être validé par un rôle autorisé ;
- les personnes concernées doivent être notifiées ;
- l'information doit apparaître dans le briefing du jour ;
- l'historique doit conserver la modification.

## 5. Internats

Les internats peuvent impacter les transferts non PMR.

Cas possibles :

- élève interne toute la semaine ;
- retour chaque week-end ;
- retour un week-end sur deux ;
- retour vers parent actif selon garde alternée ;
- trajet école vers internat ;
- trajet internat vers domicile ou arrêt.

Le transfert doit savoir :

- si l'élève est attendu ce jour ;
- si le retour week-end est actif ;
- quelle destination est active ;
- quel parent est actif en cas de garde alternée ;
- si l'élève doit rejoindre un car sortant différent.

Le briefing du jour doit afficher uniquement l'information utile à la prise en charge.

## 6. Garde Alternée

La garde alternée peut modifier :

- l'arrêt de destination ;
- le parent de destination ;
- le circuit sortant ;
- la présence au transfert ;
- le jour de transport.

Règles :

- semaine ISO paire : parent configuré pour semaine paire ;
- semaine ISO impaire : parent configuré pour semaine impaire ;
- `alternatingResidence` reste la source officielle ;
- `activeResidenceForChild()` et `activePickupStopForChild()` doivent être utilisés pour l'affichage ;
- aucune logique parallèle de garde alternée ne doit être créée dans le transfert.

Le transfert doit afficher :

- semaine active ;
- parent actif si utile ;
- arrêt actif ;
- circuit ou car sortant attendu.

## 7. Élèves Attendus

Un élève attendu est un élève qui doit passer par le transfert selon son affectation du jour.

Informations minimales :

- élève ;
- école ;
- circuit entrant ;
- circuit sortant ;
- heure prévue d'arrivée ;
- heure prévue de départ ;
- chauffeur entrant ;
- chauffeur sortant ;
- convoyeuse entrante ;
- convoyeuse sortante ;
- consigne active ;
- statut attendu.

Statuts possibles :

```txt
expected
absent_declared
not_expected_today
exceptional_change
unknown
```

L'élève attendu ne doit pas être calculé depuis un texte libre `children.transferLocation`.

Il doit être déduit des affectations V2 ou du legacy validé pendant la transition.

## 8. Élèves Reçus

Un élève reçu est un élève constaté au transfert.

Objectif :

- vérifier qu'un élève attendu est bien arrivé ;
- identifier un élève présent mais non attendu ;
- éviter qu'un élève reparte dans le mauvais car.

Statuts possibles :

```txt
received
missing
unexpected
handed_over
issue_reported
```

Première version recommandée :

- lecture seule des élèves attendus ;
- signalement simple d'anomalie ;
- pas de validation complexe minute par minute.

## 9. Informations Officielles Liées

Le transfert doit afficher les informations officielles pertinentes.

Exemples :

- changement de procédure ;
- retard ;
- changement chauffeur ;
- changement convoyeuse ;
- changement véhicule ;
- consigne SPW ;
- fermeture école ;
- événement affectant le transfert.

Règles :

- seules les personnes concernées voient l'information ;
- aucune donnée sensible dans le push ;
- le contenu complet est visible uniquement après authentification ;
- les accusés de lecture peuvent être demandés pour les informations urgentes.

## 10. Consignes De Prise En Charge

Les consignes peuvent concerner :

- un élève ;
- un circuit ;
- un transfert ;
- une école ;
- un jour précis.

Exemples :

- ne pas prendre l'élève aujourd'hui ;
- l'élève reste à l'école ;
- parent récupère l'enfant ;
- retour internat actif ;
- changement de car validé ;
- consigne exceptionnelle SPW.

Le transfert doit afficher les consignes au bon moment, sans exposer le dossier complet de l'élève.

## 11. Remplacements

Les remplacements peuvent concerner :

- chauffeur titulaire absent ;
- chauffeur volant affecté ;
- convoyeuse titulaire absente ;
- convoyeuse remplaçante affectée ;
- véhicule indisponible ;
- véhicule de remplacement.

Règles :

- le remplacement ne supprime pas l'affectation titulaire ;
- il crée un accès temporaire ;
- il est limité au circuit, au transfert et à la période concernée ;
- le chauffeur et la convoyeuse qui travaillent ensemble peuvent voir les contacts utiles temporairement ;
- l'accès est révoqué automatiquement après la période ;
- l'attribution et les consultations sont journalisées.

## 12. Visibilité Chauffeur

Le chauffeur voit uniquement :

- ses circuits entrants ou sortants ;
- les élèves concernés par son car ;
- le lieu de transfert ;
- l'horaire utile ;
- la convoyeuse concernée ;
- les consignes nécessaires ;
- les alertes liées à son circuit ;
- les informations officielles qui le concernent.

Il ne voit pas :

- les élèves d'autres cars hors transfert nécessaire ;
- les décisions SPW internes ;
- les données médicales détaillées ;
- les informations d'autres transporteurs.

## 13. Visibilité Convoyeuse

La convoyeuse voit uniquement :

- son circuit ;
- ses élèves ;
- les élèves attendus au transfert qui la concernent ;
- le car entrant ou sortant utile ;
- le chauffeur avec qui elle travaille ;
- les consignes nécessaires ;
- les absences utiles ;
- les informations officielles concernées.

En remplacement, elle obtient un accès temporaire limité au circuit ou transfert concerné.

## 14. Visibilité SPW

Le SPW voit :

- tous les lieux de transfert ;
- les élèves attendus ;
- les élèves reçus ;
- les circuits entrants ;
- les circuits sortants ;
- les écoles liées ;
- les consignes ;
- les incidents ;
- les remplacements ;
- l'historique ;
- les alertes.

Le SPW peut superviser, corriger, valider et décider selon son cadre métier.

## 15. Visibilité Transporteur

Le transporteur voit son périmètre :

- lieux de transfert utilisés par ses circuits ;
- circuits entrants et sortants de son organisation ;
- véhicules ;
- chauffeurs ;
- élèves affectés à ses trajets ;
- convoyeuses nécessaires à l'exploitation, en lecture limitée ;
- consignes opérationnelles ;
- remplacements ;
- alertes.

Le transporteur ne voit pas :

- décisions SPW internes ;
- données médicales détaillées ;
- informations hors périmètre ;
- dossier complet élève.

## 16. Alertes

Alertes possibles :

- élève attendu non reçu ;
- élève reçu non attendu ;
- circuit entrant en retard ;
- circuit sortant sans chauffeur ;
- circuit sortant sans convoyeuse ;
- véhicule manquant ;
- changement de car non clair ;
- consigne non lue ;
- information urgente non accusée ;
- garde alternée incohérente ;
- internat actif non pris en compte ;
- transfert configuré pour un élève PMR ;
- doublon de lieu de transfert ;
- hub de transfert inactif.

Les alertes doivent être classées :

```txt
info
warning
critical
```

## 17. Sécurité Et RGPD

Principes :

- accès minimum par rôle ;
- transfert visible uniquement aux personnes concernées ;
- parent ne voit jamais les autres élèves ;
- chauffeur limité à son circuit ou transfert ;
- convoyeuse limitée à son circuit ou transfert ;
- transporteur limité à son périmètre ;
- SPW supervision globale ;
- support sans accès sensible par défaut ;
- journalisation des consultations sensibles ;
- pas de données sensibles dans les notifications push.

Données sensibles à protéger :

- identité élève ;
- garde alternée ;
- internat ;
- absences ;
- incidents ;
- consignes individuelles ;
- contacts parentaux ;
- informations de santé ou PMR.

## 18. Collections Concernées

Collections principales :

- `transportTransfers` : référentiel officiel des lieux de transfert ;
- `stopPassages` : passage réel au lieu de transfert ;
- `tripSegments` : segment entrant ou sortant ;
- `studentAssignments` : élève affecté aux passages ;
- `officialInformation` future : informations officielles liées ;
- `pickupInstructions` future : consignes de prise en charge ;
- `replacementAssignments` future : remplacements ;
- `studentIncidents` future : incidents liés au transfert.

Règle :

```txt
transportTransfers décrit le lieu, pas le passage du jour.
```

## 19. Gains Métier

Gains attendus :

- moins d'erreurs de prise en charge ;
- meilleure visibilité au transfert ;
- moins d'appels de dernière minute ;
- meilleure coordination entrant/sortant ;
- meilleure gestion des remplacements ;
- meilleure prise en compte garde alternée et internat ;
- meilleure traçabilité ;
- moins de conflits d'information ;
- meilleure supervision SPW ;
- exploitation plus claire pour les transporteurs.

## 20. Roadmap

Phases recommandées :

1. Finaliser le référentiel `transportTransfers`.
2. Créer la lecture V2 des transferts depuis `studentAssignments`, `stopPassages` et `tripSegments`.
3. Ajouter une vue transfert lecture seule.
4. Afficher élèves attendus et cars entrants/sortants.
5. Ajouter alertes transfert.
6. Intégrer briefing du jour.
7. Intégrer informations officielles.
8. Intégrer remplacements.
9. Ajouter signalement d'anomalie.
10. Ajouter historique et exports.

## 21. Recommandation Officielle

La première version doit rester centrée sur la préparation et la visibilité :

- lieux officiels ;
- élèves attendus ;
- cars entrants ;
- cars sortants ;
- consignes ;
- remplacements ;
- alertes.

Les validations opérationnelles avancées peuvent arriver après stabilisation des données V2.
