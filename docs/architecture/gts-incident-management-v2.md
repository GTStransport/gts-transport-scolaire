# Gestion Des Incidents GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

GTS V2 doit remplacer le système actuel basé sur papier, mail, plateformes externes et transmissions manuelles par une gestion complète des incidents dans GTS.

Principe officiel :

```txt
Un incident est créé une seule fois et suivi jusqu'à sa clôture sans échange parallèle de mails ou de papiers.
```

Le système doit permettre :

- création rapide d'un incident par un acteur autorisé ;
- suivi clair du statut ;
- analyse centralisée par le SPW ;
- demandes d'informations complémentaires tracées ;
- décision SPW protégée ;
- notifications ciblées ;
- historique complet ;
- intégration au dossier élève ;
- réduction des pertes d'information.

## 2. Contexte Métier

Aujourd'hui :

- la convoyeuse rédige souvent un rapport papier ;
- le document est transmis au SPW ;
- certains éléments transitent par mail, téléphone ou plateforme externe ;
- le suivi est difficile ;
- le chauffeur n'a pas toujours le retour ;
- le parent n'est pas toujours informé clairement ;
- le transporteur ne sait pas toujours où en est le dossier.

Problèmes constatés :

- retard de transmission ;
- perte d'information ;
- double encodage ;
- suivi dispersé ;
- absence de preuve claire de réception ;
- statut du dossier difficile à connaître ;
- risque de décisions prises sur des informations incomplètes.

## 3. Création D'Incident

Un incident peut être créé par :

- convoyeuse ;
- chauffeur ;
- transporteur ;
- SPW.

### Convoyeuse

La convoyeuse peut déclarer un incident lié :

- à son circuit du jour ;
- à un élève qu'elle accompagne ;
- à une présence ou absence problématique ;
- à un transfert concerné ;
- à une situation de sécurité observée.

### Chauffeur

Le chauffeur peut déclarer un incident lié :

- à son circuit ;
- au véhicule ;
- à un élève transporté ;
- à la sécurité routière ou opérationnelle ;
- à une difficulté au point de chargement, de transfert ou de dépose.

### Transporteur

Le transporteur peut déclarer un incident lié :

- à l'organisation du transport ;
- à un chauffeur ;
- à un véhicule ;
- à un circuit ;
- à un retard ou problème opérationnel ;
- à une difficulté de prise en charge.

Le transporteur ne peut pas prendre de décision SPW sur l'élève.

### SPW

Le SPW peut créer un incident :

- à partir d'un signalement reçu ;
- lors d'un suivi administratif ;
- à partir d'une information officielle ;
- dans le cadre du dossier élève.

Le SPW reste seul responsable de l'analyse et des décisions officielles.

## 4. Types D'Incidents

Types officiels :

```txt
behavior
violence
rule_violation
transport_issue
safety
transfer
other
```

Libellés métier :

- comportement ;
- violence ;
- non-respect des règles ;
- problème transport ;
- sécurité ;
- transfert ;
- autre.

Règles :

- le type `other` doit exiger une description précise ;
- le type `safety` doit être traité comme prioritaire ;
- le type `violence` doit alerter le SPW immédiatement ;
- le type `transfer` est réservé aux incidents non PMR liés à un transfert réel.

## 5. Niveaux

Niveaux officiels :

```txt
low
medium
high
critical
```

Libellés métier :

- faible ;
- moyen ;
- élevé ;
- critique.

### Faible

Incident mineur, sans danger immédiat.

Exemples :

- oubli de consigne ;
- comportement isolé sans conséquence ;
- remarque opérationnelle simple.

### Moyen

Incident nécessitant une analyse SPW.

Exemples :

- non-respect répété des règles ;
- conflit verbal ;
- difficulté au point de prise en charge.

### Élevé

Incident sérieux nécessitant une réaction rapide.

Exemples :

- violence verbale importante ;
- mise en danger ;
- problème de transfert ayant impacté la prise en charge.

### Critique

Incident urgent nécessitant une attention immédiate.

Exemples :

- danger physique ;
- violence grave ;
- élève non localisé ;
- problème de sécurité majeur.

## 6. Informations Enregistrées

Champs minimaux recommandés :

```json
{
  "id": "incident-123",
  "studentId": "child-123",
  "studentName": "Nom Prénom",
  "date": "2026-06-18",
  "time": "08:15",
  "circuitId": "circuit-4104",
  "circuitLabel": "4104",
  "transportType": "circuit_ferme",
  "direction": "morning",
  "driverId": "driver-1",
  "driverName": "Chauffeur Nom",
  "assistantId": "assistant-1",
  "assistantName": "Convoyeuse Nom",
  "transportManagerId": "tm-1",
  "schoolId": "school-1",
  "incidentType": "behavior",
  "severity": "medium",
  "description": "Description factuelle de l'incident.",
  "status": "submitted",
  "createdBy": "assistant-1",
  "createdByRole": "assistant",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

Principes :

- la description doit rester factuelle ;
- les données médicales ne doivent être ajoutées que si elles sont strictement nécessaires ;
- les informations sensibles doivent rester visibles uniquement aux rôles autorisés ;
- les décisions SPW doivent être séparées du signalement initial.

## 7. Pièces Jointes

Types prévus :

- texte ;
- document ;
- photo si autorisé.

Exemple :

```json
{
  "attachments": [
    {
      "id": "attachment-1",
      "type": "photo",
      "fileName": "incident.jpg",
      "storagePath": "incidents/incident-123/incident.jpg",
      "uploadedBy": "assistant-1",
      "uploadedAt": "Timestamp",
      "visibility": "spw_only"
    }
  ]
}
```

Règles :

- les pièces jointes ne sont pas obligatoires ;
- les photos doivent être autorisées explicitement avant usage ;
- aucun fichier sensible ne doit être envoyé en notification push ;
- les pièces jointes doivent être protégées par les mêmes droits que l'incident ;
- la suppression physique doit être encadrée par une politique SPW.

## 8. Workflow

Statuts officiels :

```txt
draft
submitted
spw_review
additional_information_requested
decision_taken
closed
```

### `draft`

Le déclarant prépare l'incident.

Visible uniquement par le déclarant et les rôles explicitement autorisés.

### `submitted`

L'incident est soumis officiellement.

Le SPW est notifié.

### `spw_review`

Le SPW analyse le dossier.

Le SPW peut :

- consulter l'historique ;
- demander un complément ;
- préparer une décision ;
- décider de communiquer ou non au parent.

### `additional_information_requested`

Le SPW demande un complément à un acteur concerné.

Complément possible auprès de :

- convoyeuse ;
- chauffeur ;
- transporteur ;
- autre agent SPW autorisé.

### `decision_taken`

Le SPW a pris une décision.

La décision peut être :

- interne SPW ;
- communiquée au transporteur ;
- communiquée au parent ;
- intégrée au dossier élève ;
- reliée à une consigne de prise en charge.

### `closed`

Le SPW clôture le dossier.

La clôture doit être :

- horodatée ;
- historisée ;
- liée au décideur SPW ;
- non modifiable sans réouverture tracée.

## 9. Historique Complet

Chaque événement doit être historisé :

- création ;
- soumission ;
- lecture SPW ;
- changement de statut ;
- demande de complément ;
- réponse au complément ;
- ajout de pièce jointe ;
- décision ;
- notification ;
- clôture ;
- consultation sensible.

Exemple :

```json
{
  "incidentId": "incident-123",
  "eventType": "status_changed",
  "fromStatus": "submitted",
  "toStatus": "spw_review",
  "actorId": "spw-1",
  "actorRole": "spw",
  "createdAt": "Timestamp"
}
```

L'historique ne doit pas être modifiable par les utilisateurs métier.

## 10. Notifications

Destinataires possibles :

- SPW ;
- transporteur ;
- chauffeur concerné ;
- convoyeuse concernée ;
- parent concerné.

Règles par événement :

- création : SPW notifié ;
- demande de complément : acteur concerné notifié ;
- changement de statut important : acteurs concernés notifiés ;
- décision prise : notification selon décision SPW ;
- clôture : notification selon visibilité autorisée.

Règles de sécurité :

- aucune donnée sensible dans le push ;
- pas de description complète dans une notification ;
- contenu complet uniquement après authentification ;
- parent notifié uniquement si le SPW décide une communication parentale ;
- transporteur notifié uniquement dans son périmètre.

Exemples de notifications :

```txt
Nouvel incident à consulter dans GTS.
Demande de complément sur un incident.
Décision SPW disponible.
Incident clôturé.
```

## 11. Confidentialité

Principe :

```txt
Chaque acteur voit uniquement ce qui le concerne.
```

### SPW

Accès complet aux incidents, décisions, historiques et pièces jointes selon habilitation interne.

### Transporteur

Accès limité :

- incidents liés à son périmètre transport ;
- circuits qu'il organise ;
- véhicules ou chauffeurs concernés ;
- demandes de complément qui lui sont adressées.

Il ne voit pas les décisions SPW sensibles non partagées.

### Chauffeur

Accès limité :

- incidents qu'il crée ;
- incidents liés à son circuit ou remplacement ;
- demandes de complément qui lui sont adressées ;
- statut utile au suivi.

### Convoyeuse

Accès limité :

- incidents qu'elle crée ;
- incidents liés à son circuit ou remplacement ;
- demandes de complément qui lui sont adressées ;
- statut utile au suivi.

### Parent

Accès non automatique au rapport complet.

Le parent peut recevoir :

- une information validée par le SPW ;
- une décision SPW communiquée officiellement ;
- un résumé adapté si le SPW l'autorise.

### Support

Aucun accès direct aux contenus sensibles par défaut.

L'accès support éventuel doit être :

- exceptionnel ;
- limité ;
- journalisé ;
- validé par une règle d'intervention.

## 12. Décisions SPW Protégées

Le SPW est seul décisionnaire des mesures.

Décisions possibles :

- aucune suite ;
- rappel de consigne ;
- information parent ;
- adaptation de prise en charge ;
- suivi dossier élève ;
- mesure administrative ;
- autre mesure SPW.

Exclusion :

- jamais décidée par chauffeur ;
- jamais décidée par convoyeuse ;
- jamais décidée par transporteur ;
- uniquement SPW.

Les décisions doivent être séparées du signalement initial pour éviter qu'un déclarant puisse modifier ou influencer la décision officielle.

## 13. Intégration Dossier Élève

Chaque incident lié à un élève doit pouvoir apparaître dans le dossier élève SPW.

Le dossier élève doit afficher :

- date ;
- type ;
- niveau ;
- circuit ;
- statut ;
- décision SPW si visible ;
- pièces jointes selon droits ;
- historique utile.

Règles :

- SPW voit l'historique complet ;
- transporteur voit uniquement ce qui concerne l'organisation du transport ;
- chauffeur et convoyeuse voient uniquement ce qui est nécessaire à leur mission ;
- parent voit uniquement les informations validées par le SPW.

## 14. Intégration Briefing Du Jour

Un incident ne doit pas transformer le briefing du jour en dossier sensible complet.

Le briefing peut afficher uniquement :

- consigne opérationnelle validée ;
- alerte importante ;
- demande d'attention ;
- changement de prise en charge ;
- information officielle liée.

Exemple :

```txt
Consigne SPW : appliquer la procédure validée pour l'élève concerné.
```

Le détail complet de l'incident reste dans le module incidents et le dossier élève SPW.

## 15. Traçabilité Complète

À journaliser :

- création ;
- soumission ;
- consultation ;
- modification ;
- demande de complément ;
- réponse ;
- décision ;
- notification ;
- lecture parent si applicable ;
- clôture ;
- réouverture éventuelle.

Les actions sensibles doivent inclure :

- acteur ;
- rôle ;
- date ;
- heure ;
- document concerné ;
- changement effectué ;
- source de l'accès.

Objectif :

- preuve de traitement ;
- audit RGPD ;
- réduction des contestations ;
- responsabilité claire.

## 16. Sécurité Et RGPD

Principes :

- minimisation des données ;
- accès par périmètre ;
- deny by default ;
- contenu sensible uniquement après authentification ;
- notifications push sans détail sensible ;
- décisions SPW protégées ;
- pièces jointes sécurisées ;
- journalisation des accès sensibles ;
- durée de conservation définie par le SPW ;
- export possible pour dossier officiel ;
- rectification par SPW uniquement.

Données sensibles à protéger :

- description détaillée ;
- comportement ;
- violence ;
- sécurité ;
- informations familiales ;
- informations médicales éventuelles ;
- pièces jointes ;
- décisions SPW.

Le support ne doit pas accéder aux incidents sensibles par défaut.

## 17. Gains Métier

Gains attendus :

- moins de papier ;
- moins de mails ;
- moins de pertes d'information ;
- suivi transparent ;
- meilleur retour aux chauffeurs et convoyeuses concernés ;
- meilleure visibilité pour le transporteur ;
- information parentale mieux maîtrisée ;
- historique centralisé ;
- traçabilité SPW ;
- intégration directe au dossier élève.

## 18. Roadmap

Phases recommandées :

1. Documentation officielle du modèle incident.
2. Définition des Firestore Rules.
3. Création des types et validations.
4. Création de l'écran de déclaration.
5. Création du suivi SPW.
6. Ajout des demandes de complément.
7. Ajout des notifications.
8. Intégration dossier élève.
9. Intégration briefing du jour.
10. Ajout des pièces jointes autorisées.

## 19. Recommandation Officielle

GTS V2 doit considérer l'incident comme un dossier suivi, pas comme un simple message.

La première version doit rester simple :

- création ;
- type ;
- niveau ;
- description ;
- statut ;
- suivi SPW ;
- historique ;
- notifications minimisées.

Les pièces jointes, exports avancés et analyses statistiques peuvent arriver après la stabilisation du workflow principal.
