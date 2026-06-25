# Gestion Des Convoyeuses GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

GTS V2 doit permettre de gérer les convoyeuses titulaires, les convoyeuses remplaçantes et leurs accès opérationnels.

Principe officiel :

```txt
La convoyeuse doit toujours disposer des informations nécessaires à son circuit, même en remplacement.
```

Le module convoyeuses doit permettre de savoir :

- quelle convoyeuse est titulaire d'un circuit ;
- quelle convoyeuse accompagne réellement le circuit aujourd'hui ;
- quelle convoyeuse remplaçante est affectée ;
- quel chauffeur travaille avec elle ;
- quels élèves sont attendus ;
- quelles présences doivent être encodées ;
- quelles consignes et informations officielles sont actives.

## 2. Convoyeuses SPW

Règle métier officielle :

```txt
Le SPW est propriétaire du référentiel convoyeuses.
```

Conséquences :

- le SPW crée les convoyeuses ;
- le SPW modifie les données personnelles ;
- le SPW désactive les convoyeuses ;
- la suppression physique est interdite par défaut ;
- le transporteur ne crée pas de convoyeuse ;
- le transporteur ne modifie pas les données personnelles d'une convoyeuse ;
- le transporteur affecte une convoyeuse uniquement par référence.

Le transporteur peut lire les convoyeuses nécessaires à ses circuits, passages ou transferts, selon son périmètre.

## 3. Convoyeuses Titulaires

Une convoyeuse titulaire est normalement affectée à un circuit.

Informations recommandées :

```json
{
  "id": "assistant-123",
  "firstName": "Prénom",
  "lastName": "Nom",
  "role": "assistant",
  "assistantType": "regular",
  "assignedCircuitIds": ["circuit-4104"],
  "active": true,
  "availabilityStatus": "available",
  "owner": "spw"
}
```

Règles :

- la convoyeuse titulaire reste liée à son circuit habituel ;
- un remplacement temporaire ne supprime pas l'affectation titulaire ;
- le briefing distingue convoyeuse prévue et convoyeuse réelle du jour ;
- les données personnelles restent sous responsabilité SPW.

## 4. Convoyeuses Remplaçantes

Une convoyeuse remplaçante intervient lorsqu'une titulaire est absente ou indisponible.

Rôle :

- remplacer une convoyeuse titulaire ;
- recevoir les informations du circuit concerné ;
- encoder les présences du jour ;
- consulter les consignes utiles ;
- consulter les informations officielles nécessaires ;
- accéder temporairement aux contacts utiles.

Règles :

- accès limité au circuit concerné ;
- accès limité à la date ou période du remplacement ;
- révocation automatique après la fin du remplacement ;
- journalisation de l'attribution ;
- journalisation des consultations sensibles ;
- aucun accès aux autres circuits.

## 5. Affectation Circuit

Une affectation convoyeuse peut être :

- titulaire ;
- temporaire ;
- matin uniquement ;
- soir uniquement ;
- liée à un remplacement ;
- liée à un transfert ;
- liée à un circuit fermé ;
- liée à un trajet avec internat ;
- liée à un trajet porte-à-porte non PMR si accompagnement prévu.

Informations utiles :

- circuit ;
- direction matin/soir ;
- convoyeuse titulaire ;
- convoyeuse réelle ;
- période ;
- chauffeur ;
- véhicule ;
- élèves attendus ;
- statut ;
- raison du changement.

Exemple :

```json
{
  "circuitId": "circuit-4104",
  "direction": "morning",
  "plannedAssistantId": "assistant-titulaire-1",
  "actualAssistantId": "assistant-remplacante-3",
  "replacementReason": "absence",
  "date": "2026-06-19"
}
```

## 6. Remplacements

Un remplacement convoyeuse intervient quand la convoyeuse titulaire est absente ou indisponible.

Cas métier :

- convoyeuse titulaire absente ;
- convoyeuse remplaçante affectée ;
- remplacement planifié ;
- remplacement de dernière minute ;
- remplacement matin uniquement ;
- remplacement soir uniquement ;
- remplacement combiné avec chauffeur volant ;
- remplacement combiné avec véhicule de réserve.

Règles :

- la convoyeuse titulaire n'est pas supprimée du circuit ;
- la remplaçante est ajoutée comme convoyeuse réelle sur la période ;
- le chauffeur du circuit est informé ;
- la remplaçante reçoit le briefing du jour ;
- les contacts utiles chauffeur/convoyeuse sont partagés temporairement ;
- l'accès prend fin automatiquement après la période.

## 7. Disponibilités

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

- d'identifier les convoyeuses disponibles ;
- de préparer les remplacements ;
- d'éviter une double affectation ;
- de détecter les circuits sans convoyeuse ;
- d'alimenter les alertes du briefing.

Les motifs personnels détaillés ne doivent pas être exposés aux transporteurs, chauffeurs ou autres convoyeuses.

## 8. Briefing Du Jour

Le briefing du jour de la convoyeuse doit afficher :

- circuit du jour ;
- direction matin/soir ;
- chauffeur du jour ;
- véhicule du jour ;
- élèves attendus ;
- absences signalées ;
- nouveaux élèves ;
- garde alternée active si impact trajet ;
- internat et retour week-end si impact trajet ;
- transferts du jour si concernés ;
- consignes de prise en charge ;
- informations officielles importantes ;
- présences à encoder ;
- contacts temporaires autorisés ;
- alertes.

En remplacement, la convoyeuse remplaçante voit uniquement le briefing du circuit concerné et uniquement pendant la période autorisée.

## 9. Présences Numériques

La convoyeuse est l'acteur principal de l'encodage des présences numériques.

Principe :

```txt
Présent ou absent uniquement.
```

La convoyeuse ne doit pas encoder :

- monté ;
- descendu ;
- heure de montée ;
- heure de descente ;
- pris en charge.

Informations enregistrées :

- date ;
- élève ;
- circuit ;
- direction ;
- présent ou absent ;
- convoyeuse ;
- heure de validation ;
- source ;
- correction éventuelle.

En cas de remplacement, la remplaçante encode les présences du circuit concerné.

## 10. Incidents

La convoyeuse peut déclarer un incident lié :

- à son circuit ;
- à un élève accompagné ;
- à une situation de sécurité ;
- à un transfert ;
- à une consigne non respectée ;
- à une difficulté de prise en charge.

Règles :

- la déclaration est factuelle ;
- le SPW reste décisionnaire ;
- la convoyeuse peut suivre le statut utile ;
- elle peut répondre à une demande de complément ;
- elle ne décide jamais d'une mesure SPW ;
- elle ne voit pas les incidents hors périmètre.

## 11. Visibilité SPW

Le SPW voit et gère :

- référentiel convoyeuses ;
- données personnelles ;
- activation/désactivation ;
- affectations utiles ;
- remplacements ;
- disponibilités nécessaires ;
- présences encodées ;
- incidents déclarés ;
- historiques ;
- alertes.

Le SPW peut créer, modifier et désactiver les convoyeuses.

## 12. Visibilité Transporteur

Le transporteur voit uniquement les convoyeuses nécessaires à son exploitation.

Peut voir :

- convoyeuse affectée à ses circuits ;
- convoyeuse remplaçante sur ses circuits ;
- prénom/nom ;
- rôle ;
- contact professionnel si autorisé ;
- période de remplacement ;
- disponibilité opérationnelle utile ;
- alertes circuit.

Ne peut pas :

- créer une convoyeuse ;
- supprimer une convoyeuse ;
- modifier ses données personnelles ;
- voir le référentiel complet hors périmètre ;
- accéder aux données SPW sensibles.

## 13. Visibilité Convoyeuse

La convoyeuse voit :

- sa fiche minimale ;
- ses circuits ;
- ses remplacements ;
- son briefing du jour ;
- ses élèves du jour ;
- ses présences à encoder ;
- ses incidents déclarés ;
- les consignes utiles ;
- les informations officielles qui la concernent ;
- le chauffeur avec qui elle travaille ;
- les contacts temporaires autorisés.

Elle ne voit pas :

- toutes les convoyeuses ;
- les circuits hors périmètre ;
- les décisions SPW internes ;
- les dossiers élèves complets ;
- les données personnelles inutiles.

Une convoyeuse peut lire une autre convoyeuse uniquement si cela est nécessaire au même circuit, transfert ou remplacement.

## 14. Sécurité Et RGPD

Principes :

- SPW propriétaire du référentiel convoyeuses ;
- transporteur en lecture limitée et affectation par référence ;
- convoyeuse limitée à son périmètre ;
- chauffeur voit uniquement la convoyeuse liée à son circuit ;
- parent sans accès direct au référentiel convoyeuses ;
- support sans accès par défaut ;
- suppression physique interdite ;
- désactivation uniquement SPW ;
- accès temporaire pour remplacement ;
- journalisation des accès sensibles.

Données à protéger :

- téléphone professionnel ;
- disponibilité ;
- historique de service ;
- remplacements ;
- association convoyeuse-circuit-élèves ;
- incidents ;
- présences encodées.

Les notifications ne doivent pas exposer de données sensibles.

## 15. Alertes

Alertes possibles :

- circuit sans convoyeuse ;
- convoyeuse indisponible affectée ;
- convoyeuse remplaçante non informée ;
- chauffeur non informé du remplacement ;
- feuille de présence non encodée ;
- briefing non consulté ;
- consigne urgente non lue ;
- contact temporaire expiré ;
- double affectation incompatible ;
- convoyeuse inactive encore affectée.

Niveaux recommandés :

```txt
info
warning
critical
```

## 16. Collections Concernées

Collections possibles :

- `assistants` ;
- `circuits` ;
- `studentAssignments` ;
- `tripSegments` ;
- `stopPassages` ;
- `studentAttendance` future ;
- `studentIncidents` future ;
- `replacementAssignments` future ;
- `dailyBriefings` future ;
- `officialInformation` future ;
- `auditLogs` future.

La première version doit réutiliser les données existantes avant de créer de nouvelles collections.

## 17. Gains Métier

Gains attendus :

- remplaçante mieux informée ;
- moins de feuilles papier perdues ;
- présences encodées plus rapidement ;
- chauffeur informé de la convoyeuse réelle ;
- SPW mieux informé ;
- transporteur mieux coordonné ;
- moins d'erreurs de prise en charge ;
- meilleure traçabilité des remplacements ;
- meilleure continuité de service.

## 18. Roadmap

Phases recommandées :

1. Documenter le modèle convoyeuse.
2. Stabiliser la règle SPW-owned.
3. Afficher convoyeuse prévue et réelle dans le briefing.
4. Ajouter remplacements lecture seule.
5. Ajouter présences numériques.
6. Ajouter accès temporaire remplaçante.
7. Ajouter alertes.
8. Ajouter incidents et demandes de complément.
9. Ajouter historique et reporting.

## 19. Recommandation Officielle

La gestion convoyeuse GTS V2 doit d'abord sécuriser l'information opérationnelle :

- circuit ;
- chauffeur ;
- élèves attendus ;
- présences ;
- consignes ;
- remplacement ;
- contacts utiles temporaires.

Les fonctions avancées de planning peuvent venir après stabilisation des remplacements, présences numériques et briefing du jour.
