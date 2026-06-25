# GTS SPW Student Case File V2

Architecture validée le 17/06/2026

## 1. Objectif

Le dossier élève SPW V2 centralise l'historique complet d'un élève.

Il permet au SPW de suivre :

- la fiche élève officielle ;
- la garde alternée ;
- les besoins PMR ou centre spécialisé ;
- l'internat ;
- les affectations transport ;
- les incidents ;
- les présences ;
- les absences ;
- les informations officielles liées ;
- les décisions SPW ;
- l'historique des changements ;
- les documents ou PDF futurs.

Principe officiel :

```txt
Le SPW est propriétaire du dossier élève.
```

## 2. Rôle Du Dossier Élève

Le dossier élève n'est pas une simple fiche administrative.

Il doit devenir la vue de référence SPW pour comprendre l'historique complet d'un élève dans le transport scolaire.

Il regroupe :

- données officielles ;
- événements transport ;
- décisions ;
- suivis ;
- traces ;
- documents futurs.

Le dossier élève doit aider le SPW à répondre à :

- quelle est la situation officielle de l'élève ?
- quels trajets sont actifs ?
- quels incidents ont été signalés ?
- quelles absences ou présences ont été enregistrées ?
- quelles décisions ont été prises ?
- quelles informations ont été communiquées ?
- quels changements ont eu lieu ?

## 3. Données Visibles Par Le SPW

Le SPW dispose d'un accès complet au dossier élève.

Données visibles :

- identité officielle ;
- école ;
- responsables légaux ;
- garde alternée ;
- adresses officielles ;
- arrêts actifs ;
- PMR ;
- centre spécialisé ;
- internat ;
- affectations transport ;
- circuits ;
- chauffeurs concernés ;
- convoyeuses concernées ;
- véhicules si nécessaire ;
- transferts si non PMR ;
- absences ;
- présences ;
- incidents ;
- décisions SPW ;
- informations officielles liées ;
- historique ;
- exports PDF futurs.

Le SPW peut analyser, corriger, valider et décider selon son cadre métier.

## 4. Données Visibles Par Le Transporteur

Le transporteur n'est pas propriétaire du dossier élève.

Il peut voir uniquement les informations nécessaires à l'organisation du transport.

Données visibles recommandées :

- identité minimale de l'élève ;
- école ;
- arrêt actif ou domicile si nécessaire ;
- PMR uniquement sous forme de besoin transport utile ;
- centre spécialisé si destination transport ;
- internat si impact transport ;
- affectations transport ;
- circuits ;
- horaires ;
- absences utiles au transport ;
- consignes transport validées par le SPW ;
- incidents liés à son périmètre selon décision SPW.

Le transporteur ne doit pas voir :

- décisions SPW internes non partagées ;
- historique administratif complet ;
- données médicales détaillées ;
- documents sensibles non nécessaires ;
- informations hors périmètre transport.

## 5. Données Visibles Par Chauffeur Et Convoyeuse

Le chauffeur et la convoyeuse voient uniquement ce qui est utile au trajet.

Données visibles :

- élèves de leurs circuits ;
- arrêt actif ou domicile si nécessaire ;
- école ou destination ;
- consignes utiles ;
- absence du jour ;
- présence à encoder pour la convoyeuse ;
- PMR uniquement si nécessaire à la prise en charge ;
- information internat ou retour week-end si impact trajet ;
- garde alternée active si impact arrêt ou destination ;
- consigne liée à un incident si validée par le SPW.

Ils ne voient pas :

- dossier complet ;
- historique SPW complet ;
- décisions internes ;
- données médicales détaillées ;
- incidents hors trajet ;
- informations d'autres élèves.

## 6. Données Visibles Par Le Parent

Le parent voit uniquement les informations validées par le SPW et liées à son enfant.

Données possibles :

- fiche enfant limitée ;
- trajet actif ;
- arrêt actif ;
- horaires utiles ;
- absences déclarées ;
- informations officielles destinées au parent ;
- décisions ou messages que le SPW choisit de communiquer.

Le parent ne voit pas :

- autres élèves ;
- liste complète des destinataires ;
- rapports d'incident internes par défaut ;
- décisions SPW internes non communiquées ;
- notes transporteur internes.

## 7. Statuts De Suivi

Statuts possibles du dossier :

```txt
active
under_review
watchlist
temporary_measure
transport_suspended
closed
archived
```

### `active`

Dossier actif sans suivi particulier.

### `under_review`

Le SPW analyse une situation.

### `watchlist`

Suivi renforcé, sans mesure formelle.

### `temporary_measure`

Mesure temporaire décidée par le SPW.

### `transport_suspended`

Transport suspendu ou exclu temporairement selon décision SPW.

### `closed`

Le dossier de suivi est clôturé, mais l'élève peut rester actif.

### `archived`

Dossier archivé selon règles de conservation.

## 8. Timeline Chronologique

Le dossier élève doit proposer une timeline.

Éléments possibles :

- création de la fiche ;
- modification officielle ;
- changement de garde alternée ;
- changement d'affectation transport ;
- absence déclarée ;
- présence enregistrée ;
- incident déclaré ;
- complément demandé ;
- décision SPW ;
- information officielle publiée ;
- export PDF ;
- archivage.

Exemple :

```json
{
  "type": "incident_status_changed",
  "label": "Incident passé en analyse",
  "source": "incident",
  "sourceId": "incident-123",
  "actorId": "spw-1",
  "actorRole": "spw",
  "at": "Timestamp"
}
```

## 9. Lien Avec Incidents

Les incidents déclarés dans GTS doivent apparaître dans le dossier élève SPW.

Le dossier affiche :

- type d'incident ;
- date ;
- circuit ;
- déclarant ;
- statut ;
- décision SPW éventuelle ;
- lien vers le dossier incident.

Règle :

```txt
L'incident ne crée pas automatiquement une sanction.
```

Le SPW analyse et décide.

## 10. Lien Avec Présences

Les présences simplifiées doivent alimenter le dossier élève.

Informations utiles :

- dates présentes ;
- dates absentes ;
- circuits concernés ;
- convoyeuse ayant validé ;
- corrections éventuelles ;
- tendances mensuelles.

Le dossier ne doit pas transformer la présence en surveillance excessive.

## 11. Lien Avec Absences

Les absences doivent apparaître dans le dossier.

Sources possibles :

- parent ;
- SPW ;
- transporteur selon procédure ;
- convoyeuse via présence `absent`.

Le dossier doit distinguer :

- absence déclarée à l'avance ;
- absence constatée le jour même ;
- absence longue ;
- absence corrigée.

## 12. Lien Avec Décisions SPW

Les décisions SPW sont centrales.

Exemples :

- suivi simple ;
- demande de complément ;
- consigne de prise en charge ;
- mesure temporaire ;
- suspension temporaire ;
- exclusion éventuelle ;
- clôture.

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

## 13. Sécurité Et RGPD

Le dossier élève contient des données sensibles.

Principes :

- accès complet SPW ;
- accès transporteur limité au transport ;
- accès chauffeur/convoyeuse limité aux consignes utiles ;
- accès parent limité aux informations validées ;
- support sans accès sensible par défaut ;
- minimisation ;
- traçabilité ;
- conservation maîtrisée.

Données sensibles :

- santé ;
- handicap ;
- incidents ;
- mesures SPW ;
- informations familiales ;
- garde alternée ;
- adresses ;
- responsables légaux.

Toute consultation sensible doit pouvoir être journalisée.

## 14. Durée De Conservation

La durée de conservation doit être définie par le SPW.

Recommandations :

- données transport courantes : année scolaire ;
- présences : durée administrative définie ;
- incidents : durée selon cadre légal ;
- décisions SPW : durée officielle SPW ;
- logs techniques : durée courte ;
- documents PDF : durée selon nature.

L'archivage doit être préféré à la suppression immédiate.

## 15. Export PDF Éventuel

Le SPW doit pouvoir générer des exports PDF.

Types possibles :

- fiche synthèse élève ;
- historique incident ;
- présences mensuelles ;
- décisions SPW ;
- dossier complet pour traitement administratif.

Règles :

- export limité aux rôles autorisés ;
- journalisation de l'export ;
- pas d'export parent sans validation SPW ;
- pas d'export support sensible.

## 16. Collections Sources

Le dossier élève peut agréger :

- `children` ;
- `studentAssignments` ;
- `stopPassages` ;
- `tripSegments` ;
- `transportTransfers` ;
- `studentAttendance` future ;
- `studentIncidents` ou équivalent futur ;
- `targetedInformation` ;
- `officialInformation` future ;
- décisions SPW futures ;
- logs d'historique.

Le dossier élève doit rester une vue consolidée.

Il ne doit pas dupliquer inutilement toutes les données sources.

## 17. Roadmap Future

### Phase 1 : Documentation

Formaliser le dossier élève SPW.

### Phase 2 : Vue Lecture Seule

Afficher une première synthèse depuis les données existantes.

### Phase 3 : Timeline

Construire la timeline avec événements clés.

### Phase 4 : Incidents

Relier les incidents numériques au dossier.

### Phase 5 : Présences Et Absences

Ajouter les présences, absences et statistiques.

### Phase 6 : Décisions SPW

Ajouter les décisions SPW et mesures éventuelles.

### Phase 7 : Exports PDF

Préparer les exports autorisés.

### Phase 8 : Archivage

Définir conservation, archivage et purge.

## 18. Recommandation Officielle

Le dossier élève SPW V2 doit devenir la vue de référence de l'historique élève.

Il doit être :

- complet pour le SPW ;
- limité pour les autres rôles ;
- structuré ;
- traçable ;
- conforme RGPD ;
- connecté aux incidents, présences, absences et décisions.

Le dossier élève SPW ne doit pas devenir un espace libre accessible à tous.

Il est la source officielle de suivi SPW.
