# Gestion De Flotte GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

GTS V2 doit permettre de suivre les véhicules utilisés pour le transport scolaire et leurs impacts opérationnels.

Principe officiel :

```txt
Tout changement véhicule est visible immédiatement aux personnes concernées.
```

Le module flotte doit permettre de gérer :

- véhicules actifs ;
- véhicules de réserve ;
- véhicules indisponibles ;
- affectation circuit ;
- remplacement véhicule ;
- historique ;
- maintenance ;
- alertes ;
- briefing du jour ;
- remplacements.

## 2. Rôle Du Module Flotte

Le module flotte appartient au périmètre transporteur.

Il sert à savoir :

- quel véhicule est prévu sur un circuit ;
- quel véhicule roule réellement aujourd'hui ;
- quel véhicule est indisponible ;
- quel véhicule remplace un autre ;
- quels élèves ou circuits sont impactés ;
- qui doit être informé.

Le SPW doit pouvoir superviser l'information utile, sans gérer la flotte interne du transporteur à sa place.

## 3. Véhicules Actifs

Un véhicule actif est un véhicule disponible pour être affecté à un circuit.

Champs recommandés :

```json
{
  "id": "vehicle-123",
  "transportManagerId": "tm-1",
  "label": "Car 12",
  "plateNumber": "1-ABC-123",
  "status": "active",
  "capacity": 48,
  "wheelchairCapacity": 0,
  "isAdapted": false,
  "assignedCircuitIds": ["circuit-4104"],
  "active": true,
  "updatedAt": "Timestamp"
}
```

Informations visibles :

- libellé ;
- immatriculation si nécessaire ;
- capacité ;
- véhicule adapté ou non ;
- circuits affectés ;
- statut.

## 4. Véhicules De Réserve

Un véhicule de réserve est disponible pour remplacement.

Statut recommandé :

```txt
reserve
```

Utilisations :

- panne ;
- entretien ;
- indisponibilité temporaire ;
- renfort exceptionnel ;
- remplacement dernière minute.

Règles :

- un véhicule de réserve n'est pas affecté en permanence à un circuit ;
- il peut être affecté temporairement ;
- l'affectation temporaire doit être datée ;
- les personnes concernées doivent être informées.

## 5. Véhicules Indisponibles

Un véhicule indisponible ne peut pas être utilisé.

Statuts recommandés :

```txt
maintenance
garage
out_of_service
unavailable
```

Causes possibles :

- maintenance planifiée ;
- panne ;
- contrôle technique ;
- accident ;
- problème administratif ;
- indisponibilité temporaire.

Effets attendus :

- alerte transporteur ;
- alerte circuits impactés ;
- proposition ou affichage du véhicule de remplacement ;
- briefing du jour mis à jour ;
- historique conservé.

## 6. Affectation Circuit

Un véhicule peut être affecté à :

- un circuit habituel ;
- un segment de trajet ;
- un remplacement temporaire ;
- un trajet porte-à-porte ;
- un circuit fermé ;
- un trajet sans transfert ;
- un trajet avec transfert non PMR.

Règles :

- l'affectation habituelle reste visible ;
- l'affectation réelle du jour peut être différente ;
- le remplacement ne supprime pas l'affectation titulaire ;
- les historiques doivent distinguer prévu et réel.

Exemple :

```json
{
  "circuitId": "circuit-4104",
  "plannedVehicleId": "vehicle-12",
  "actualVehicleId": "vehicle-reserve-3",
  "replacementReason": "garage",
  "date": "2026-06-19"
}
```

## 7. Remplacement Véhicule

Un remplacement véhicule intervient quand le véhicule prévu ne roule pas.

Informations minimales :

- véhicule prévu ;
- véhicule remplaçant ;
- circuit concerné ;
- date ou période ;
- raison ;
- transporteur ;
- chauffeur concerné ;
- convoyeuse concernée ;
- statut ;
- auteur de la modification.

Règles :

- le remplacement est temporaire ;
- il doit être visible dans le briefing du jour ;
- il doit notifier les personnes concernées si nécessaire ;
- il doit être journalisé ;
- il ne doit pas supprimer l'historique du véhicule prévu.

## 8. Historique

Le module flotte doit conserver un historique.

Événements à tracer :

- création véhicule ;
- activation ;
- désactivation ;
- changement statut ;
- affectation à circuit ;
- retrait d'un circuit ;
- remplacement ;
- entrée maintenance ;
- sortie maintenance ;
- modification capacité ;
- modification véhicule adapté ;
- consultation sensible si applicable.

Objectif :

- comprendre quel véhicule roulait réellement ;
- analyser les incidents ;
- justifier un remplacement ;
- préparer les statistiques transporteur et SPW.

## 9. Maintenance

La maintenance peut être :

- planifiée ;
- urgente ;
- corrective ;
- administrative.

Informations utiles :

- véhicule ;
- type de maintenance ;
- date début ;
- date fin prévue ;
- date fin réelle ;
- statut ;
- impact circuit ;
- véhicule de remplacement ;
- commentaire transporteur.

Statuts possibles :

```txt
planned
in_progress
completed
delayed
cancelled
```

La maintenance ne doit pas exposer d'informations internes inutiles aux chauffeurs, convoyeuses ou parents.

## 10. Alertes

Alertes possibles :

- véhicule indisponible affecté à un circuit ;
- circuit sans véhicule ;
- véhicule de remplacement manquant ;
- véhicule non adapté pour élève PMR ;
- capacité insuffisante ;
- véhicule au garage utilisé dans un briefing ;
- conflit d'affectation ;
- maintenance non clôturée ;
- changement véhicule non lu ;
- véhicule désactivé encore utilisé.

Niveaux recommandés :

```txt
info
warning
critical
```

## 11. Briefing Du Jour

Le briefing du jour doit afficher :

- véhicule prévu ;
- véhicule réel si remplacement ;
- immatriculation ou libellé utile ;
- véhicule adapté si nécessaire ;
- raison du remplacement si utile ;
- circuit concerné ;
- équipage du jour ;
- alertes véhicule.

Le chauffeur et la convoyeuse doivent voir immédiatement le véhicule réel du jour.

## 12. Remplacements

Les remplacements peuvent combiner :

- véhicule remplacé ;
- chauffeur volant ;
- convoyeuse remplaçante ;
- changement de circuit exceptionnel.

Règles :

- chaque remplacement doit être séparé par type ;
- véhicule remplacé ne signifie pas chauffeur remplacé ;
- chauffeur remplacé ne signifie pas véhicule remplacé ;
- convoyeuse remplacée ne signifie pas véhicule remplacé ;
- les contacts temporaires ne sont partagés qu'entre personnes concernées.

## 13. Visibilité SPW

Le SPW voit :

- véhicules liés aux circuits transport ;
- véhicule prévu et réel du jour ;
- statut opérationnel utile ;
- véhicule adapté si impact PMR ;
- remplacements ;
- alertes ;
- historique utile au suivi transport.

Le SPW ne doit pas nécessairement gérer :

- détails internes de maintenance non utiles ;
- documents techniques internes du transporteur ;
- coûts internes.

## 14. Visibilité Transporteur

Le transporteur gère sa flotte.

Peut :

- créer un véhicule ;
- modifier un véhicule ;
- désactiver un véhicule ;
- affecter un véhicule à un circuit ;
- déclarer un véhicule indisponible ;
- affecter un véhicule de remplacement ;
- gérer maintenance ;
- consulter historique et alertes.

Le transporteur est responsable de la cohérence de sa flotte.

## 15. Visibilité Chauffeur

Le chauffeur voit :

- véhicule prévu pour son circuit ;
- véhicule réel du jour ;
- immatriculation ou libellé utile ;
- changement véhicule ;
- alerte critique liée à son circuit ;
- informations nécessaires au départ.

Il ne voit pas :

- flotte complète ;
- détails internes d'autres véhicules ;
- maintenance hors périmètre ;
- informations des autres transporteurs.

## 16. Visibilité Convoyeuse

La convoyeuse voit :

- véhicule du circuit ;
- changement véhicule ;
- véhicule adapté si nécessaire à la prise en charge ;
- alertes utiles ;
- équipage du jour.

Elle ne voit pas :

- flotte complète ;
- maintenance interne ;
- véhicules hors circuit ;
- données transporteur non utiles.

## 17. Sécurité Et RGPD

La flotte contient peu de données personnelles, mais elle est liée à des personnes et des élèves.

Principes :

- transporteur propriétaire de sa flotte ;
- SPW supervision utile ;
- chauffeur limité à ses véhicules de service ;
- convoyeuse limitée à ses circuits ;
- parents sans accès direct à la flotte ;
- support sans accès par défaut ;
- historique des remplacements ;
- journalisation des changements sensibles.

Données à protéger :

- association véhicule-circuit-élèves ;
- historique de service chauffeur ;
- remplacements ;
- alertes liées à PMR ;
- informations opérationnelles sensibles.

## 18. Collections Concernées

Collections possibles :

- `vehicles` ;
- `circuits` ;
- `tripSegments` ;
- `studentAssignments` ;
- `replacementAssignments` future ;
- `maintenanceEvents` future ;
- `dailyBriefings` future ;
- `auditLogs` future.

La première version doit réutiliser `vehicles` et les données existantes avant de créer des collections supplémentaires.

## 19. Gains Métier

Gains attendus :

- moins d'appels de dernière minute ;
- chauffeur informé du véhicule réel ;
- convoyeuse informée du changement ;
- SPW mieux informé en cas d'incident ;
- transporteur mieux organisé ;
- meilleure gestion des véhicules de réserve ;
- moins d'erreurs sur les véhicules adaptés ;
- historique clair des remplacements ;
- briefing du jour plus fiable.

## 20. Roadmap

Phases recommandées :

1. Documenter le modèle flotte.
2. Consolider les statuts véhicules.
3. Afficher véhicule prévu et réel dans le briefing.
4. Ajouter remplacements véhicule lecture seule.
5. Ajouter alertes véhicule.
6. Ajouter historique des changements.
7. Ajouter maintenance simplifiée.
8. Ajouter exports et statistiques flotte.

## 21. Recommandation Officielle

La gestion de flotte GTS V2 doit d'abord sécuriser l'information opérationnelle :

- véhicule prévu ;
- véhicule réel ;
- disponibilité ;
- remplacement ;
- alerte.

Les fonctionnalités avancées de maintenance doivent venir après stabilisation du briefing du jour et des remplacements.
