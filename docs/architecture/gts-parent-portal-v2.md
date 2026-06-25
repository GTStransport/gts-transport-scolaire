# Portail Parent GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

GTS V2 doit proposer un portail parent simple, clair et sécurisé.

Principe officiel :

```txt
Le parent accède uniquement aux informations de son enfant et aux actions qui lui sont autorisées.
```

Le portail parent doit permettre au parent de consulter les informations utiles au transport scolaire de son enfant, sans exposer les données d'autres élèves, chauffeurs, convoyeuses ou familles.

## 2. Tableau De Bord Parent

Le tableau de bord parent est la première vue après connexion.

Il doit afficher :

- enfant ou enfants liés au parent ;
- trajet actif ;
- arrêt actif ;
- heure utile si disponible ;
- école ;
- garde alternée active si concernée ;
- internat ou retour week-end si concerné ;
- absences déclarées ;
- informations officielles non lues ;
- notifications importantes ;
- consignes concernant l'enfant ;
- demandes administratives en attente.

Le tableau de bord doit rester lisible et éviter les informations internes au transport.

## 3. Absences

Le parent peut consulter les absences liées à son enfant.

Selon les règles validées, il peut éventuellement déclarer :

- absence d'un jour ;
- absence sur une période ;
- absence matin ;
- absence soir ;
- absence liée à maladie ou raison familiale sans détail sensible obligatoire.

Informations visibles :

- date ;
- statut ;
- source ;
- période ;
- confirmation SPW si nécessaire ;
- impact transport.

Règles :

- ne pas demander de détail médical inutile ;
- distinguer absence déclarée et absence constatée ;
- afficher clairement si l'enfant est attendu ou non ;
- historiser les corrections.

## 4. Informations Officielles

Le parent voit uniquement les informations officielles qui le concernent.

Exemples :

- congé pédagogique ;
- fermeture école ;
- changement procédure ;
- information SPW ;
- information transporteur validée ;
- retard impactant son enfant ;
- consigne exceptionnelle ;
- information liée à l'internat ou garde alternée.

Règles :

- aucune liste d'autres destinataires visible ;
- accusé de lecture possible ;
- notification sans donnée sensible ;
- contenu complet uniquement après authentification.

## 5. Consignes Concernant Son Enfant

Le parent peut voir les consignes validées qui concernent son enfant.

Exemples :

- ne pas prendre aujourd'hui ;
- parent récupère l'enfant ;
- reste à la garderie ;
- retour internat ;
- garde alternée active ;
- consigne exceptionnelle validée SPW.

Règles :

- seules les consignes autorisées au parent sont visibles ;
- les consignes opérationnelles internes restent cachées ;
- les consignes sensibles doivent être minimisées ;
- les changements doivent être horodatés.

## 6. Suivi Incidents Autorisés

Le parent ne voit pas automatiquement les rapports d'incident complets.

Il peut voir uniquement :

- information validée par le SPW ;
- décision SPW communiquée officiellement ;
- demande de réponse ou complément adressée au parent ;
- statut simplifié si le SPW l'autorise.

Le parent ne voit pas :

- décisions internes SPW non communiquées ;
- déclarations brutes non validées ;
- informations concernant d'autres élèves ;
- notes internes transporteur ;
- historique complet non autorisé.

Règle :

```txt
Le SPW décide ce qui est communiqué au parent concernant un incident.
```

## 7. Demandes Administratives

Le portail parent peut permettre certaines demandes administratives.

Exemples :

- correction coordonnées ;
- signalement changement d'adresse ;
- demande liée à garde alternée ;
- demande liée à arrêt actif ;
- demande liée à internat ;
- demande de document ;
- message administratif au SPW.

Règles :

- la demande ne modifie pas directement la fiche officielle ;
- le SPW valide avant changement ;
- l'historique de la demande est conservé ;
- le parent voit l'état de traitement.

Statuts possibles :

```txt
submitted
under_review
additional_information_requested
approved
rejected
closed
```

## 8. Notifications

Notifications parent possibles :

- information officielle publiée ;
- absence confirmée ;
- changement impactant son enfant ;
- demande administrative traitée ;
- décision SPW communiquée ;
- rappel de lecture urgente.

Règles :

- aucune donnée sensible dans le push ;
- pas de nom d'autres élèves ;
- pas de détail d'incident dans le push ;
- contenu complet uniquement après authentification ;
- accusé de lecture possible pour urgence.

## 9. Garde Alternée

Le portail parent doit afficher la garde alternée si elle est active.

Informations visibles selon rôle parental :

- semaine active ;
- parent actif si autorisé ;
- arrêt actif ;
- jour concerné ;
- impact transport ;
- informations officielles liées.

Règles :

- `alternatingResidence` reste la source officielle ;
- semaine paire/impaire suit la semaine ISO ;
- le parent ne peut pas modifier directement la garde alternée officielle ;
- toute demande de changement passe par le SPW.

## 10. Internat

Le portail parent doit afficher les informations internat utiles.

Cas :

- internat toute la semaine ;
- internat continu ;
- retour chaque week-end ;
- retour un week-end sur deux ;
- retour vers parent actif en garde alternée.

Informations visibles :

- statut internat ;
- retour prévu ;
- destination active ;
- impact transport ;
- consignes validées.

Le parent ne voit pas les informations internes d'organisation qui ne concernent pas son enfant.

## 11. Historique

Le parent doit pouvoir consulter un historique limité.

Éléments possibles :

- absences déclarées ;
- informations officielles reçues ;
- accusés de lecture ;
- demandes administratives ;
- consignes communiquées ;
- décisions SPW communiquées ;
- changements de trajet validés.

Le parent ne voit pas :

- historique complet du dossier élève SPW ;
- logs internes ;
- consultations par agents ;
- notes internes ;
- informations d'autres acteurs non destinées au parent.

## 12. Visibilité Parent

Le parent voit uniquement les données liées à son enfant.

Peut voir :

- identité limitée de l'enfant ;
- école ;
- trajet actif ;
- arrêt actif ;
- informations officielles destinées ;
- absences ;
- consignes autorisées ;
- demandes administratives ;
- décisions SPW communiquées.

Ne peut jamais voir :

- autres élèves ;
- autres parents ;
- liste complète du circuit ;
- coordonnées chauffeur ou convoyeuse sauf règle exceptionnelle validée ;
- décisions SPW internes ;
- incidents bruts non validés ;
- notes transporteur ;
- données sensibles non nécessaires.

## 13. Sécurité Et RGPD

Principes :

- accès strictement limité à l'enfant lié ;
- parent identifié par `request.auth.uid` et scopes parent ;
- minimisation des données ;
- aucune donnée sensible dans les notifications ;
- journalisation des actions parent ;
- demandes administratives validées avant modification ;
- droit de rectification via SPW ;
- conservation maîtrisée ;
- suppression ou archivage selon politique SPW.

Données sensibles :

- adresses ;
- garde alternée ;
- internat ;
- absences ;
- incidents ;
- décisions SPW ;
- contacts ;
- informations familiales.

Le portail parent doit éviter toute exposition indirecte d'autres élèves, notamment via circuits, transferts, incidents ou informations officielles.

## 14. Alertes Parent

Alertes possibles :

- information urgente non lue ;
- absence non confirmée ;
- demande administrative en attente ;
- changement de transport validé ;
- consigne active aujourd'hui ;
- retour internat actif ;
- garde alternée active cette semaine ;
- notification nécessitant accusé de lecture.

Les alertes doivent rester simples et actionnables.

## 15. Collections Concernées

Collections possibles :

- `parents` ;
- `children` ;
- `studentAssignments` ;
- `tripSegments` ;
- `stopPassages` ;
- `officialInformation` future ;
- `readReceipts` future ;
- `pickupInstructions` future ;
- `studentAttendance` future ;
- `studentIncidents` future ;
- `administrativeRequests` future ;
- `auditLogs` future.

Le portail parent doit consommer des vues filtrées, pas exposer les collections complètes.

## 16. Gains Métier

Gains attendus :

- parent mieux informé ;
- moins d'appels au SPW ;
- moins de messages parallèles ;
- meilleure traçabilité ;
- informations officielles centralisées ;
- absences plus fiables ;
- demandes administratives suivies ;
- meilleure gestion garde alternée et internat ;
- moins de confusion sur le transport du jour.

## 17. Roadmap

Phases recommandées :

1. Documenter le portail parent.
2. Stabiliser les scopes parent.
3. Afficher tableau de bord lecture seule.
4. Afficher informations officielles.
5. Ajouter absences.
6. Ajouter demandes administratives.
7. Ajouter consignes autorisées.
8. Ajouter suivi incident limité SPW.
9. Ajouter historique et accusés de lecture.

## 18. Recommandation Officielle

Le portail parent GTS V2 doit rester volontairement limité.

La priorité est :

- informations de son enfant ;
- trajet actif ;
- absences ;
- consignes autorisées ;
- informations officielles ;
- demandes administratives.

Tout contenu sensible doit être validé par le SPW avant d'être visible par le parent.
