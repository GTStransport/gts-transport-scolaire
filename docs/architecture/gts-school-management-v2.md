# Gestion Des Écoles GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

GTS V2 doit gérer les écoles comme un référentiel métier central ayant un impact direct sur le transport.

Principe officiel :

```txt
Une modification d'école doit automatiquement impacter les modules concernés.
```

Le module écoles doit permettre de gérer :

- les écoles desservies ;
- les horaires ;
- les congés pédagogiques ;
- les fermetures exceptionnelles ;
- les horaires spéciaux ;
- les internats ;
- les informations officielles liées ;
- les impacts sur circuits, présences et transferts.

## 2. Rôle Du Référentiel Écoles

Le référentiel écoles sert à identifier les établissements réellement desservis par GTS.

Il doit être utilisé par :

- les fiches élèves ;
- les affectations transport ;
- les circuits ;
- les transferts ;
- les présences ;
- les absences ;
- les informations officielles ;
- le briefing du jour ;
- les tableaux de bord.

Il ne doit pas être remplacé par des textes libres répétés dans plusieurs collections.

## 3. Écoles Desservies

Chaque école desservie doit disposer d'une fiche officielle.

Champs recommandés :

```json
{
  "id": "school-123",
  "name": "École Exemple",
  "shortName": "École Exemple",
  "address": "Rue de l'École 1",
  "postalCode": "4100",
  "city": "Seraing",
  "phone": "04...",
  "email": "contact@ecole.example",
  "active": true,
  "hasBoardingSchool": false,
  "transportManagerIds": ["tm-1"],
  "circuitIds": ["circuit-4104"],
  "transferIds": ["transfer-ougree"],
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

Champs minimum :

- nom ;
- ville ;
- statut actif ;
- identifiant stable ;
- source ;
- date de mise à jour.

## 4. Congés Pédagogiques

Un congé pédagogique doit être enregistré comme événement école.

Effets attendus :

- élèves non attendus ce jour ;
- présence non requise ;
- briefing du jour mis à jour ;
- transporteur informé ;
- chauffeur et convoyeuse informés ;
- parent informé si nécessaire ;
- impact visible dans le dossier élève ;
- absence non comptabilisée comme absence transport ordinaire.

Exemple :

```json
{
  "schoolId": "school-123",
  "type": "pedagogical_day",
  "date": "2026-10-12",
  "label": "Congé pédagogique",
  "transportImpact": "no_transport_expected",
  "publishedBy": "spw-1",
  "publishedAt": "Timestamp"
}
```

## 5. Fermetures Exceptionnelles

Une fermeture exceptionnelle peut être décidée pour :

- météo ;
- grève ;
- problème bâtiment ;
- urgence sécurité ;
- décision administrative.

Effets attendus :

- transport suspendu ou adapté ;
- notification des personnes concernées ;
- information officielle publiée ;
- briefing mis à jour ;
- circuits impactés signalés ;
- présences désactivées ou adaptées ;
- historique conservé.

Les fermetures urgentes doivent pouvoir déclencher des notifications prioritaires.

## 6. Horaires Spéciaux

Les horaires spéciaux peuvent concerner :

- sortie anticipée ;
- entrée retardée ;
- examen ;
- activité exceptionnelle ;
- journée raccourcie ;
- retour internat modifié.

Effets possibles :

- modification des heures de passage ;
- modification du circuit ;
- transfert avancé ou retardé ;
- consigne de prise en charge ;
- information officielle liée ;
- alerte chauffeur et convoyeuse.

La première version peut rester en lecture informative, sans recalcul automatique complet des circuits.

## 7. Internats

Une école peut être liée à un internat ou à une organisation d'internat.

Cas à couvrir :

- internat toute la semaine ;
- internat continu ;
- retour chaque week-end ;
- retour un week-end sur deux ;
- retour week-end selon garde alternée ;
- élève mineur ;
- élève majeur.

Impacts :

- destination active ;
- jours de transport ;
- présence attendue ou non ;
- circuit de retour ;
- consigne du jour ;
- information parent.

Le module écoles ne doit pas recréer toute la logique internat. Il doit référencer les données utiles aux modules transport.

## 8. Informations Officielles Liées

Une école peut être la cible d'une information officielle.

Exemples :

- congé pédagogique ;
- fermeture ;
- changement d'horaire ;
- consigne exceptionnelle ;
- changement de procédure ;
- information aux parents ;
- impact transport.

Les informations officielles liées à l'école doivent être visibles par :

- SPW ;
- transporteurs concernés ;
- chauffeurs concernés ;
- convoyeuses concernées ;
- parents des élèves concernés.

Règle :

```txt
Une information école publiée dans GTS fait foi pour les personnes concernées.
```

## 9. Impact Sur Circuits

Une modification école peut impacter :

- circuits matin ;
- circuits soir ;
- circuits fermés ;
- circuits avec transfert ;
- porte-à-porte ;
- véhicules ;
- chauffeurs ;
- convoyeuses ;
- horaires.

Exemples :

- école fermée : circuit non nécessaire ;
- sortie avancée : horaire soir modifié ;
- internat : retour week-end activé ;
- changement d'implantation : destination modifiée.

Les impacts doivent être affichés avant toute modification opérationnelle.

## 10. Impact Sur Présences

Les événements école doivent impacter les présences.

Cas :

- congé pédagogique : élève non attendu ;
- fermeture : présence non requise ;
- sortie spéciale : présence attendue à un autre horaire ;
- internat : présence selon jour de retour ;
- activité école : consigne spécifique.

Règles :

- ne pas créer d'absence injustifiée lors d'un congé pédagogique ;
- conserver l'historique de l'événement école ;
- afficher l'information dans la feuille de présence numérique ;
- permettre au SPW de vérifier les cas particuliers.

## 11. Impact Sur Transferts

Une école peut être liée à un ou plusieurs transferts.

Impacts possibles :

- car sortant supprimé ;
- car sortant ajouté ;
- horaire du transfert modifié ;
- élèves attendus modifiés ;
- transfert non nécessaire ;
- école desservie après transfert fermée.

Le transfert doit afficher :

- école impactée ;
- élèves concernés ;
- circuits entrants ;
- circuits sortants ;
- consignes liées ;
- alertes.

## 12. Visibilité SPW

Le SPW voit et gère :

- toutes les écoles ;
- fiches écoles ;
- événements écoles ;
- congés pédagogiques ;
- fermetures ;
- horaires spéciaux ;
- liens internat ;
- informations officielles ;
- impacts transport ;
- historique ;
- alertes.

Le SPW reste le garant de l'information officielle liée aux écoles.

## 13. Visibilité Transporteur

Le transporteur voit les écoles de son périmètre.

Il peut voir :

- écoles desservies par ses circuits ;
- congés pédagogiques impactant ses trajets ;
- fermetures ;
- horaires spéciaux ;
- transferts liés ;
- informations officielles ;
- consignes opérationnelles ;
- alertes.

Il ne peut pas modifier les données officielles école sauf droit explicitement prévu.

## 14. Visibilité Chauffeur

Le chauffeur voit uniquement :

- écoles liées à ses circuits ;
- horaires utiles ;
- fermetures ou congés impactant son service ;
- consignes du jour ;
- informations officielles importantes ;
- alertes.

Il ne voit pas :

- données administratives inutiles ;
- informations d'autres circuits ;
- dossiers élèves complets.

## 15. Visibilité Convoyeuse

La convoyeuse voit uniquement :

- écoles liées à ses circuits ;
- élèves attendus ;
- congés ou fermetures impactant la présence ;
- consignes du jour ;
- informations officielles importantes ;
- alertes.

En remplacement, l'accès est limité à l'école et au circuit concernés par la période de remplacement.

## 16. Visibilité Parent

Le parent voit uniquement les informations école liées à son enfant.

Informations possibles :

- congé pédagogique ;
- fermeture ;
- horaire spécial ;
- consigne de prise en charge ;
- information officielle validée ;
- impact sur le transport.

Le parent ne voit pas :

- informations d'autres élèves ;
- circuits complets non nécessaires ;
- données internes SPW ou transporteur.

## 17. Alertes

Alertes possibles :

- école inactive mais encore utilisée ;
- école sans adresse ;
- école sans circuit actif ;
- congé pédagogique non communiqué ;
- fermeture urgente non lue ;
- horaire spécial sans impact transport vérifié ;
- élèves attendus alors que l'école est fermée ;
- présence ouverte alors que l'école est en congé ;
- transfert actif vers une école fermée ;
- internat actif sans règle de retour.

Les alertes doivent être classées :

```txt
info
warning
critical
```

## 18. Sécurité Et RGPD

Principes :

- référentiel école visible selon rôle ;
- événements école limités aux personnes concernées ;
- parent limité aux informations de son enfant ;
- chauffeur et convoyeuse limités à leurs circuits ;
- transporteur limité à son périmètre ;
- support sans accès sensible par défaut ;
- exports journalisés ;
- notifications sans données sensibles inutiles.

Données sensibles indirectes :

- association élève-école ;
- internat ;
- garde alternée liée à retour école ;
- absence liée à événement école ;
- consigne individuelle.

Les informations école générales peuvent être largement diffusées aux personnes concernées, mais les listes nominatives doivent rester protégées.

## 19. Collections Concernées

Collections possibles :

- `schools` future ou référentiel école existant ;
- `children` ;
- `studentAssignments` ;
- `tripSegments` ;
- `stopPassages` ;
- `transportTransfers` ;
- `officialInformation` future ;
- `pickupInstructions` future ;
- `studentAttendance` future ;
- `auditLogs` future.

Les événements école peuvent être stockés dans une collection dédiée future, par exemple :

```txt
schoolEvents
```

La création d'une collection dédiée doit être validée avant développement.

## 20. Gains Métier

Gains attendus :

- moins d'oublis lors des congés pédagogiques ;
- meilleure information des chauffeurs et convoyeuses ;
- moins d'appels aux transporteurs ;
- meilleure cohérence entre école, circuit et présence ;
- moins d'erreurs au transfert ;
- meilleure gestion des fermetures urgentes ;
- meilleure traçabilité SPW ;
- meilleure information parentale ;
- moins de feuilles ou messages parallèles.

## 21. Roadmap

Phases recommandées :

1. Documenter le modèle école.
2. Identifier le référentiel école actuel.
3. Créer une vue lecture seule des écoles desservies.
4. Ajouter les événements école en lecture seule.
5. Relier congés et fermetures au briefing du jour.
6. Relier événements école aux présences.
7. Relier événements école aux transferts.
8. Ajouter notifications et accusés de lecture.
9. Ajouter exports et historique.

## 22. Recommandation Officielle

La gestion des écoles doit devenir un point d'entrée officiel pour les événements impactant le transport.

La première version doit rester simple :

- écoles desservies ;
- congés pédagogiques ;
- fermetures ;
- horaires spéciaux ;
- impact visible sur circuits, présences et transferts.

Les recalculs automatiques complexes doivent venir après stabilisation des référentiels transport V2.
