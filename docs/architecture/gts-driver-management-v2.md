# Gestion Des Chauffeurs GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

GTS V2 doit permettre de gérer les chauffeurs titulaires, les chauffeurs volants et les remplacements de manière claire et traçable.

Principe officiel :

```txt
Un chauffeur connaît toujours son circuit, son équipage et ses remplacements.
```

Le module chauffeurs doit permettre de savoir :

- quel chauffeur est titulaire d'un circuit ;
- quel chauffeur roule réellement aujourd'hui ;
- quel chauffeur volant remplace un titulaire ;
- quelle convoyeuse travaille avec lui ;
- quel véhicule est utilisé ;
- quelles consignes sont actives ;
- quels contacts utiles sont temporairement visibles.

## 2. Rôle Du Module Chauffeurs

Le module chauffeurs appartient au périmètre transporteur pour l'organisation opérationnelle.

Il sert à gérer :

- chauffeurs titulaires ;
- chauffeurs volants ;
- affectations circuits ;
- disponibilités ;
- remplacements ;
- briefing du jour ;
- contacts utiles temporaires ;
- historique de service.

Le SPW peut superviser les informations nécessaires au transport, mais ne gère pas l'organisation interne des chauffeurs du transporteur.

## 3. Chauffeurs Titulaires

Un chauffeur titulaire est normalement affecté à un circuit ou à un car.

Informations recommandées :

```json
{
  "id": "driver-123",
  "transportManagerId": "tm-1",
  "firstName": "Prénom",
  "lastName": "Nom",
  "role": "driver",
  "driverType": "regular",
  "assignedCircuitIds": ["circuit-4104"],
  "assignedVehicleId": "vehicle-12",
  "active": true,
  "availabilityStatus": "available"
}
```

Règles :

- le chauffeur titulaire reste lié à son circuit habituel ;
- un remplacement temporaire ne supprime pas l'affectation titulaire ;
- l'historique doit distinguer titulaire prévu et chauffeur réel du jour.

## 4. Chauffeurs Volants

Un chauffeur volant n'est pas affecté à un car fixe.

Rôle :

- remplacer un chauffeur titulaire absent ;
- prendre un circuit exceptionnel ;
- intervenir en urgence ;
- couvrir une période limitée.

Statut recommandé :

```txt
floating
```

Règles :

- le chauffeur volant reçoit un accès temporaire au circuit concerné ;
- il voit uniquement les informations nécessaires à son remplacement ;
- l'accès est limité à la date ou période du remplacement ;
- l'accès est révoqué automatiquement après la période ;
- l'attribution et les consultations sont journalisées.

## 5. Affectation Circuit

Une affectation chauffeur peut être :

- habituelle ;
- temporaire ;
- matin uniquement ;
- soir uniquement ;
- liée à un remplacement ;
- liée à un véhicule ;
- liée à un segment de trajet.

Informations utiles :

- circuit ;
- direction matin/soir ;
- chauffeur titulaire ;
- chauffeur réel ;
- période ;
- véhicule ;
- convoyeuse ;
- statut ;
- raison du changement.

Exemple :

```json
{
  "circuitId": "circuit-4104",
  "direction": "morning",
  "plannedDriverId": "driver-titulaire-1",
  "actualDriverId": "driver-volant-3",
  "replacementReason": "absence",
  "date": "2026-06-19"
}
```

## 6. Remplacements

Un remplacement chauffeur intervient quand le chauffeur titulaire est absent ou indisponible.

Cas métier :

- chauffeur titulaire absent ;
- chauffeur volant affecté ;
- chauffeur différent matin et soir ;
- remplacement planifié ;
- remplacement de dernière minute ;
- remplacement combiné avec véhicule ;
- remplacement combiné avec convoyeuse.

Règles :

- le chauffeur titulaire n'est pas supprimé du circuit ;
- le chauffeur volant est ajouté comme chauffeur réel sur la période ;
- le chauffeur volant reçoit le briefing du jour ;
- la convoyeuse concernée voit le chauffeur réel ;
- le chauffeur voit la convoyeuse réelle ;
- les contacts utiles sont partagés uniquement pendant la période.

## 7. Disponibilité

Statuts possibles :

```txt
available
unavailable
absent
on_leave
assigned
standby
inactive
```

La disponibilité doit permettre :

- d'identifier les chauffeurs mobilisables ;
- d'éviter une double affectation ;
- de préparer les remplacements ;
- d'afficher les alertes d'exploitation.

La disponibilité ne doit pas exposer de détails personnels inutiles.

## 8. Contacts Utiles

Les contacts utiles peuvent être partagés temporairement entre :

- chauffeur du circuit ;
- convoyeuse du circuit ;
- remplaçants affectés ;
- transporteur ;
- SPW si nécessaire.

Données visibles temporairement :

- prénom ;
- nom ;
- rôle ;
- téléphone professionnel si disponible ;
- circuit concerné ;
- horaire de service.

Règles :

- pas de partage global du répertoire ;
- accès limité au circuit concerné ;
- accès limité à la période ;
- révocation automatique ;
- journalisation des accès aux contacts.

## 9. Briefing Du Jour

Le briefing du jour chauffeur doit afficher :

- circuit du jour ;
- direction matin/soir ;
- véhicule du jour ;
- convoyeuse titulaire ou remplaçante ;
- élèves attendus ;
- absences signalées ;
- consignes de prise en charge ;
- informations officielles importantes ;
- transferts du jour si concernés ;
- garde alternée active si impact trajet ;
- internat si impact trajet ;
- alertes.

En cas de remplacement, le chauffeur volant voit le briefing du circuit concerné uniquement pour la période autorisée.

## 10. Visibilité SPW

Le SPW voit :

- chauffeur prévu ;
- chauffeur réel du jour ;
- remplacements ;
- circuits concernés ;
- incidents liés ;
- informations nécessaires au suivi transport ;
- historique utile.

Le SPW ne gère pas nécessairement :

- planning interne complet du transporteur ;
- détails RH internes ;
- motifs personnels détaillés d'absence.

## 11. Visibilité Transporteur

Le transporteur gère ses chauffeurs.

Peut :

- créer un chauffeur ;
- modifier les données opérationnelles ;
- désactiver un chauffeur ;
- affecter un chauffeur titulaire ;
- affecter un chauffeur volant ;
- gérer disponibilité ;
- gérer remplacement ;
- consulter historique et alertes.

Le transporteur doit maintenir les données à jour pour garantir la fiabilité du briefing.

## 12. Visibilité Chauffeur

Le chauffeur voit :

- ses circuits ;
- son véhicule ;
- sa convoyeuse ;
- ses remplacements ;
- ses informations officielles ;
- son briefing du jour ;
- les contacts utiles autorisés ;
- les consignes nécessaires.

Il ne voit pas :

- planning complet des autres chauffeurs ;
- données personnelles d'autres chauffeurs ;
- informations d'autres circuits ;
- dossiers élèves complets ;
- décisions SPW internes.

## 13. Sécurité Et RGPD

Principes :

- accès minimum par rôle ;
- transporteur propriétaire opérationnel des chauffeurs ;
- chauffeur limité à son périmètre ;
- SPW supervision utile ;
- parent sans accès direct aux chauffeurs hors information nécessaire ;
- support sans accès par défaut ;
- contacts partagés temporairement ;
- remplacements journalisés ;
- consultations sensibles journalisées.

Données à protéger :

- téléphone professionnel ;
- disponibilité ;
- historique de service ;
- remplacements ;
- association chauffeur-circuit-élèves ;
- incidents liés au chauffeur.

Les notifications ne doivent pas exposer de données personnelles inutiles.

## 14. Alertes

Alertes possibles :

- circuit sans chauffeur ;
- chauffeur indisponible affecté ;
- chauffeur doublonné sur deux circuits incompatibles ;
- chauffeur volant sans briefing ;
- convoyeuse non informée du changement chauffeur ;
- véhicule affecté sans chauffeur ;
- remplacement non confirmé ;
- contact temporaire expiré ;
- chauffeur inactif encore affecté.

Niveaux recommandés :

```txt
info
warning
critical
```

## 15. Collections Concernées

Collections possibles :

- `drivers` ;
- `circuits` ;
- `vehicles` ;
- `studentAssignments` ;
- `tripSegments` ;
- `replacementAssignments` future ;
- `dailyBriefings` future ;
- `officialInformation` future ;
- `auditLogs` future.

La première version doit réutiliser les données existantes avant d'ajouter de nouvelles collections.

## 16. Gains Métier

Gains attendus :

- chauffeur mieux informé ;
- remplacements plus clairs ;
- moins d'appels de dernière minute ;
- convoyeuse informée du chauffeur réel ;
- SPW informé des changements utiles ;
- transporteur plus organisé ;
- moins d'erreurs de circuit ;
- meilleur briefing du jour ;
- traçabilité des remplacements.

## 17. Roadmap

Phases recommandées :

1. Documenter le modèle chauffeur.
2. Stabiliser les statuts titulaire/volant.
3. Afficher chauffeur prévu et réel dans le briefing.
4. Ajouter remplacements lecture seule.
5. Ajouter contacts temporaires.
6. Ajouter alertes.
7. Ajouter historique.
8. Ajouter exports et indicateurs.

## 18. Recommandation Officielle

La gestion chauffeur GTS V2 doit d'abord sécuriser l'information du jour :

- circuit ;
- véhicule ;
- équipage ;
- remplacement ;
- consignes ;
- contacts utiles temporaires.

Les fonctionnalités avancées de planning peuvent venir après stabilisation des remplacements et du briefing du jour.
