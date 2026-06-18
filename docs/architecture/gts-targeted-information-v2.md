# GTS Targeted Information V2

Architecture validée le 17/06/2026

## 1. Problème Métier

Aujourd'hui, une information terrain peut devoir être transmise à plusieurs personnes :

- SPW ;
- transporteur ;
- chauffeur ;
- convoyeuse ;
- parent ;
- école.

Sans système centralisé, l'information risque d'être diffusée par mails, appels, messages privés ou canaux parallèles.

Risques constatés :

- destinataires oubliés ;
- doublons de messages ;
- absence de traçabilité ;
- perte d'information terrain ;
- information reçue trop tard ;
- contenu sensible envoyé à une personne non concernée ;
- impossibilité de vérifier qui a lu l'information.

GTS V2 doit éviter que le SPW ou le transporteur doive reconstruire manuellement une liste de destinataires.

## 2. Objectif

Un utilisateur autorisé saisit une information une seule fois.

GTS détermine automatiquement les destinataires concernés selon :

- élève ;
- parent ;
- circuit ;
- trajet ;
- transfert ;
- école ;
- transporteur ;
- chauffeur ;
- convoyeuse ;
- SPW.

Objectifs fonctionnels :

- une seule saisie ;
- bons destinataires automatiquement ;
- accusé de lecture si nécessaire ;
- historique complet ;
- notifications push sans donnée sensible ;
- contenu complet accessible uniquement après authentification.

## 3. Collections Prévues

### `targetedInformation`

Collection principale.

Un document représente une information métier publiée ou préparée.

Exemple :

```json
{
  "id": "info-123",
  "title": "Retard circuit 4104",
  "body": "Le circuit 4104 aura environ 15 minutes de retard.",
  "category": "delay",
  "urgency": "important",
  "status": "published",
  "authorId": "user-1",
  "authorRole": "transport_manager",
  "transportManagerId": "tm-1",
  "targetType": "circuit",
  "targetIds": ["circuit-4104"],
  "studentIds": ["child-1", "child-2"],
  "parentIds": ["parent-1", "parent-2"],
  "driverIds": ["driver-1"],
  "assistantIds": ["assistant-1"],
  "transportManagerIds": ["tm-1"],
  "spwIds": ["spw-1"],
  "schoolIds": ["school-1"],
  "transferHubIds": [],
  "recipientUserIds": ["parent-1", "driver-1", "assistant-1"],
  "recipientRoles": ["parent", "driver", "assistant"],
  "sensitive": false,
  "containsMedicalData": false,
  "containsStudentIdentity": true,
  "pushEnabled": true,
  "requiresAcknowledgement": true,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp",
  "publishedAt": "Timestamp",
  "expiresAt": "Timestamp"
}
```

### `readReceipts`

Sous-collection :

```txt
targetedInformation/{informationId}/readReceipts/{userId}
```

Elle trace la lecture et l'accusé individuel.

Exemple :

```json
{
  "userId": "parent-1",
  "role": "parent",
  "readAt": "Timestamp",
  "acknowledgedAt": "Timestamp",
  "studentIds": ["child-1"],
  "device": "web"
}
```

### `deliveryLogs`

Sous-collection :

```txt
targetedInformation/{informationId}/deliveryLogs/{logId}
```

Elle trace les tentatives de notification.

Exemple :

```json
{
  "recipientUserId": "parent-1",
  "channel": "push",
  "status": "sent",
  "sentAt": "Timestamp",
  "errorCode": "",
  "sensitive": false
}
```

## 4. Types D'Informations

Types prévus :

- `delay` : retard ;
- `vehicle_change` : changement véhicule ;
- `driver_change` : changement chauffeur ;
- `assistant_change` : changement convoyeuse ;
- `route_change` : modification trajet ;
- `student_information` : information élève ;
- `circuit_information` : information circuit ;
- `transfer_information` : information transfert ;
- `school_information` : information école ;
- `incident` : incident ;
- `spw_instruction` : consigne SPW.

Niveaux d'urgence :

```txt
info
normal
important
urgent
critical
```

## 5. Ciblage Automatique

Le créateur choisit une cible métier.

GTS résout ensuite les destinataires depuis les données connues.

### Élève

Cible :

```txt
studentIds[]
```

Destinataires possibles :

- parents liés ;
- chauffeur affecté ;
- convoyeuse affectée ;
- transporteur concerné ;
- SPW.

### Parent

Le parent est destinataire uniquement si l'information concerne son enfant.

GTS ne doit jamais exposer un autre élève dans le contenu parent.

### Circuit

Cible :

```txt
circuitIds[]
```

Destinataires possibles :

- chauffeur(s) du circuit ;
- convoyeuse(s) référencées ;
- parents des élèves affectés ;
- transporteur ;
- SPW selon urgence.

### Chauffeur

Cible :

```txt
driverIds[]
```

Destinataires possibles :

- chauffeur concerné ;
- convoyeuse liée ;
- transporteur ;
- SPW si nécessaire.

### Convoyeuse

Cible :

```txt
assistantIds[]
```

Destinataires possibles :

- convoyeuse concernée ;
- chauffeur lié ;
- transporteur ;
- SPW.

Rappel : le référentiel convoyeuses est SPW-owned. Le transporteur peut référencer une convoyeuse, mais ne modifie pas sa fiche.

### Transporteur

Cible :

```txt
transportManagerIds[]
```

Destinataires possibles :

- gestionnaires du transporteur ;
- chauffeurs et convoyeuses concernés si cible opérationnelle ;
- SPW si supervision.

### SPW

Cible :

```txt
spwIds[]
```

Le SPW dispose d'une supervision globale ou par périmètre défini.

### École

Cible :

```txt
schoolIds[]
```

Destinataires possibles :

- transporteurs desservant l'école ;
- parents des élèves concernés ;
- chauffeurs et convoyeuses concernés ;
- SPW.

### Transfert

Cible :

```txt
transferHubIds[]
```

Destinataires possibles :

- transporteurs concernés ;
- chauffeurs entrants/sortants ;
- convoyeuses entrantes/sortantes ;
- parents des élèves impactés uniquement ;
- SPW.

## 6. Règles Métier

### Parent

Le parent :

- voit uniquement les informations concernant son enfant ;
- ne voit jamais les autres élèves ;
- ne voit pas la liste complète des destinataires ;
- peut lire et accuser réception.

### Chauffeur

Le chauffeur :

- voit les informations liées à ses circuits ;
- voit les informations liées à ses élèves transportés ;
- voit les informations liées à ses transferts ;
- ne voit pas les autres circuits.

### Convoyeuse

La convoyeuse :

- voit les informations liées à ses circuits ;
- voit les informations liées à ses élèves accompagnés ;
- voit les informations liées à ses transferts ;
- peut voir les autres convoyeuses uniquement si elles sont nécessaires au même circuit ou transfert.

### Transporteur

Le transporteur :

- voit les informations de son périmètre ;
- peut publier des informations transport ;
- ne peut pas publier ou modifier une donnée officielle SPW ;
- ne peut pas modifier les fiches convoyeuses.

### SPW

Le SPW :

- dispose d'une supervision globale ;
- peut publier une consigne SPW ;
- peut publier une information élève, école ou transfert ;
- conserve la responsabilité des données officielles élève et convoyeuse.

### Support

Le support :

- n'a aucun accès direct aux contenus sensibles ;
- peut éventuellement consulter des métadonnées techniques non sensibles ;
- ne voit pas le corps d'une information sensible.

## 7. Sécurité Et RGPD

Principes :

- minimisation des destinataires ;
- minimisation du contenu ;
- traçabilité complète ;
- durée de conservation définie ;
- accès par rôle strict ;
- pas de détail sensible dans les notifications push ;
- contenu complet uniquement après authentification.

Contenus sensibles à éviter dans le texte libre :

- diagnostic médical ;
- handicap détaillé ;
- traitement ;
- comportement sensible non validé ;
- identité d'un autre élève ;
- coordonnées personnelles inutiles ;
- adresse complète si non nécessaire ;
- détails d'incident grave non validés.

Durées de conservation recommandées :

- retard simple : 90 jours ;
- modification de trajet : année scolaire ;
- incident : durée légale définie par SPW ;
- logs de notification : 30 à 90 jours.

La suppression physique doit être évitée. Préférer :

```txt
status = archived
archivedAt
archivedBy
```

## 8. Firestore Rules Attendues

Champs nécessaires pour sécuriser :

```txt
recipientUserIds[]
recipientRoles[]
studentIds[]
parentIds[]
driverIds[]
assistantIds[]
transportManagerIds[]
spwIds[]
schoolIds[]
circuitIds[]
transferHubIds[]
sensitive
authorId
authorRole
transportManagerId
```

Lecture attendue :

- parent si `parentIds` contient son identifiant ou si `studentIds` contient un enfant lié ;
- chauffeur si `driverIds` contient son identifiant ;
- convoyeuse si `assistantIds` contient son identifiant ;
- transporteur si `transportManagerIds` contient son périmètre ;
- SPW selon supervision ;
- support exclu des contenus sensibles ;
- admin système encadré.

Écriture attendue :

- SPW sur informations SPW ;
- transporteur sur informations transport de son périmètre ;
- chauffeur/convoyeuse uniquement pour signalements cadrés ;
- parent sans publication globale ;
- support sans écriture métier.

Après publication :

- éviter la modification du contenu ;
- autoriser uniquement archivage/statut selon rôle ;
- journaliser toute action.

## 9. UI Prévue

### Écran Diffusion Ciblée

Fonctions :

- choisir un type d'information ;
- choisir une cible métier ;
- saisir titre et contenu ;
- choisir niveau d'urgence ;
- demander ou non un accusé de lecture ;
- afficher l'aperçu automatique des destinataires ;
- afficher l'aperçu de notification push ;
- alerter en cas de contenu sensible.

### Aperçu Destinataires

Exemple :

```txt
Parents concernés : 24
Chauffeurs concernés : 2
Convoyeuses concernées : 2
Transporteurs concernés : 1
SPW : 1
```

Le parent ne voit jamais cet aperçu global.

### Suivi

Tableau de suivi :

- publié ;
- lu ;
- non lu ;
- accusé ;
- urgent ;
- expiré ;
- archivé ;
- erreur notification.

## 10. Roadmap

### Phase 1 : Documentation

Formaliser le modèle métier, les collections, les rôles et les règles RGPD.

### Phase 2 : Helpers Destinataires

Créer des helpers purs en mémoire :

- résoudre destinataires depuis élève ;
- résoudre destinataires depuis circuit ;
- résoudre destinataires depuis transfert ;
- résoudre destinataires depuis école ;
- filtrer selon rôle et sensibilité.

### Phase 3 : Firestore Rules

Ajouter les règles :

- lecture par destinataire ;
- écriture par rôle ;
- accusés de lecture individuels ;
- logs de diffusion protégés ;
- support exclu des contenus sensibles.

### Phase 4 : Écran Lecture / Création

Créer l'écran de diffusion ciblée pour SPW et transporteur.

Le premier lot doit rester limité :

- information circuit ;
- retard ;
- information école ;
- information élève non sensible.

### Phase 5 : Notifications Push

Envoyer uniquement des notifications sans contenu sensible.

Exemples :

```txt
Nouvelle information GTS
Retard sur un trajet concernant votre enfant
Information importante sur un circuit
```

### Phase 6 : Accusés De Lecture

Ajouter :

- bouton d'accusé ;
- suivi lu/non lu ;
- relance éventuelle ;
- export de traçabilité.

## 11. Recommandation Officielle

GTS V2 doit créer une seule information métier, avec destinataires dénormalisés.

Ne pas créer un message séparé par destinataire au départ.

Modèle officiel :

```txt
targetedInformation = contenu + ciblage métier
readReceipts = accusés individuels
deliveryLogs = traces notifications
```

Le système doit privilégier :

- sécurité maximale ;
- destinataires calculés ;
- contenu minimal ;
- traçabilité ;
- push sans donnée sensible ;
- lecture complète uniquement après authentification.
