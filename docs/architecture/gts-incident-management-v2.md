# GTS Incident Management V2

Architecture validée le 17/06/2026

## 1. Objectif

GTS V2 doit remplacer les rapports papier d'incident par un système numérique avec suivi complet du dossier.

Principe officiel :

```txt
La convoyeuse ou le chauffeur déclare un incident dans GTS.
Le SPW reste seul décisionnaire des mesures prises.
```

Le système doit permettre :

- déclaration rapide ;
- suivi du statut ;
- historique centralisé ;
- traçabilité complète ;
- réduction du papier et des mails ;
- meilleure visibilité pour le SPW.

## 2. Contexte Métier

Aujourd'hui, les incidents peuvent être rédigés :

- sur papier ;
- dans une plateforme externe ;
- par mail ;
- par message transmis à plusieurs personnes.

Problèmes constatés :

- retard d'envoi ;
- perte d'information ;
- suivi difficile ;
- absence de visibilité sur l'état du dossier ;
- double encodage ;
- historique dispersé ;
- difficulté à savoir si le SPW a reçu et traité le rapport.

## 3. Types D'Incidents

Types officiels prévus :

```txt
behavior
violence
aggression
damage
instruction_refusal
transfer_issue
other
```

Libellés métier :

- comportement ;
- violence ;
- agression ;
- dégradation ;
- refus de consigne ;
- problème de transfert ;
- autre.

Le type `other` doit rester disponible, mais doit être limité par un champ de description obligatoire.

## 4. Informations Enregistrées

Champs minimaux :

```json
{
  "id": "incident-123",
  "studentId": "child-123",
  "studentName": "Nom Prénom",
  "date": "2026-06-18",
  "time": "08:15",
  "circuitId": "circuit-4104",
  "circuitLabel": "4104",
  "driverId": "driver-1",
  "driverName": "Chauffeur Nom",
  "assistantId": "assistant-1",
  "assistantName": "Convoyeuse Nom",
  "transportManagerId": "tm-1",
  "schoolId": "school-1",
  "incidentType": "behavior",
  "description": "Description factuelle de l'incident.",
  "status": "sent",
  "createdBy": "assistant-1",
  "createdByRole": "assistant",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

Pièces jointes futures :

```json
{
  "attachments": [
    {
      "id": "attachment-1",
      "type": "photo",
      "fileName": "incident.jpg",
      "storagePath": "incidents/incident-123/incident.jpg",
      "uploadedBy": "assistant-1",
      "uploadedAt": "Timestamp"
    }
  ]
}
```

Règle : les pièces jointes ne sont pas obligatoires dans la première version.

## 5. Workflow

Statuts officiels :

```txt
draft
sent
received_by_spw
in_review
additional_info_requested
closed
```

### `draft`

Le déclarant prépare le rapport.

Visible uniquement par le déclarant et les rôles autorisés selon validation future.

### `sent`

Le rapport est envoyé.

Il devient visible au SPW.

### `received_by_spw`

Le SPW confirme la réception.

### `in_review`

Le SPW analyse le dossier.

### `additional_info_requested`

Le SPW demande un complément.

Le complément peut être demandé à :

- convoyeuse ;
- chauffeur ;
- transporteur.

### `closed`

Le SPW clôture le dossier.

La clôture doit être horodatée et historisée.

## 6. Visibilité Par Rôle

### Convoyeuse

Peut :

- créer un incident lié à son circuit, ses élèves ou son transfert ;
- voir ses incidents déclarés ;
- compléter si le SPW demande un complément ;
- voir le statut du dossier.

Ne peut pas :

- décider de mesures ;
- exclure un élève ;
- modifier un incident clôturé ;
- voir les incidents hors périmètre.

### Chauffeur

Peut :

- créer un incident lié à son circuit, ses élèves ou son transfert ;
- voir ses incidents déclarés ;
- compléter si le SPW demande un complément ;
- voir le statut du dossier.

Ne peut pas :

- décider de mesures ;
- exclure un élève ;
- voir les incidents hors périmètre.

### Transporteur

Peut :

- voir les incidents liés à son périmètre transport ;
- suivre les statuts ;
- répondre à une demande de complément si concerné.

Ne peut pas :

- décider de mesures SPW ;
- modifier les données officielles de l'élève ;
- clôturer un dossier SPW ;
- exclure un élève.

### SPW

Peut :

- lire tous les incidents ;
- confirmer réception ;
- analyser ;
- demander un complément ;
- décider des mesures ;
- clôturer.

Le SPW est seul décisionnaire des mesures prises.

### Parent

Accès non automatique.

Le parent ne doit pas voir directement tous les rapports d'incident.

Une communication parentale peut être faite ultérieurement par le SPW via une information officielle ou un canal validé.

## 7. Notifications

Notifications prévues :

- création d'un incident ;
- réception SPW ;
- changement de statut ;
- demande de complément ;
- clôture.

Règles :

- aucune donnée sensible dans le push ;
- pas de détail d'incident dans la notification ;
- contenu complet uniquement après authentification ;
- notification parent uniquement si SPW décide de communiquer.

Exemples :

```txt
Nouvel incident à consulter
Demande de complément sur un incident
Incident clôturé
```

## 8. Historique Complet

Chaque incident doit conserver un historique.

Actions à tracer :

- création brouillon ;
- envoi ;
- réception SPW ;
- passage en analyse ;
- demande de complément ;
- ajout de complément ;
- changement de statut ;
- clôture ;
- consultation sensible ;
- ajout de pièce jointe future.

Exemple :

```json
{
  "action": "status_changed",
  "from": "sent",
  "to": "received_by_spw",
  "actorId": "spw-1",
  "actorRole": "spw",
  "at": "Timestamp"
}
```

## 9. Traçabilité

La traçabilité doit permettre de répondre à :

- qui a déclaré ?
- quand ?
- sur quel élève ?
- sur quel circuit ?
- qui a consulté ?
- qui a demandé un complément ?
- qui a clôturé ?
- quelle mesure a été décidée par le SPW ?

Toute consultation par un rôle non SPW doit rester limitée au périmètre autorisé.

## 10. Sécurité Et RGPD

Un incident peut contenir des données sensibles.

Principes :

- minimisation ;
- accès par rôle ;
- accès limité au périmètre ;
- pas de push avec détail sensible ;
- pas de partage parent automatique ;
- support sans accès direct aux contenus sensibles ;
- historique obligatoire ;
- suppression physique évitée.

Contenu à éviter dans les champs libres :

- diagnostic médical ;
- données de santé inutiles ;
- identité d'autres élèves si non nécessaire ;
- jugement personnel ;
- propos non factuels ;
- détails familiaux non pertinents.

Le rapport doit rester factuel.

Recommandation de formulation :

```txt
Décrire les faits observés, sans interprétation inutile.
```

## 11. Exclusion

Règle officielle :

```txt
Seul le SPW peut décider d'une exclusion.
```

Ne peuvent jamais décider d'une exclusion :

- chauffeur ;
- convoyeuse ;
- transporteur ;
- parent ;
- support.

Le système peut permettre de signaler un incident grave, mais la mesure d'exclusion reste une décision SPW.

Si une exclusion est décidée, elle doit être gérée dans le référentiel officiel élève ou dans un module SPW dédié, pas comme une simple action du rapport d'incident.

## 12. Intégration Future

### Informations Officielles

Le SPW peut publier une information officielle liée à un incident si nécessaire.

Exemple :

```txt
Consigne de prise en charge modifiée à partir du 20/06/2026.
```

### Briefing Du Jour

Le briefing du jour peut afficher une consigne issue d'un incident uniquement si elle est nécessaire au trajet.

Il ne doit pas afficher le rapport complet.

### Dossier Élève

Le dossier élève peut contenir un historique SPW des incidents.

Accès :

- SPW complet ;
- transporteur limité aux informations nécessaires ;
- chauffeur/convoyeuse uniquement consignes utiles ;
- parent selon décision SPW.

## 13. Gains Métier

Gains attendus :

- moins de papier ;
- moins de mails ;
- suivi transparent ;
- historique centralisé ;
- moins de double encodage ;
- meilleure visibilité SPW ;
- réduction des pertes d'information ;
- traçabilité des décisions ;
- clarification des responsabilités.

## 14. Roadmap

### Phase 1 : Documentation

Formaliser le modèle incident V2.

### Phase 2 : Lecture Et Brouillon

Créer une première structure en lecture/brouillon local si nécessaire.

### Phase 3 : Déclaration Numérique

Permettre chauffeur/convoyeuse de déclarer un incident.

### Phase 4 : Workflow SPW

Ajouter réception, analyse, demande de complément et clôture.

### Phase 5 : Notifications

Notifier les rôles concernés sans contenu sensible.

### Phase 6 : Historique Et Audit

Tracer toutes les actions.

### Phase 7 : Pièces Jointes Futures

Ajouter les pièces jointes seulement après validation sécurité/RGPD.

## 15. Recommandation Officielle

GTS V2 doit remplacer progressivement les rapports papier d'incident.

La première version doit rester simple :

- déclaration factuelle ;
- statut visible ;
- SPW décisionnaire ;
- historique complet ;
- pas de pièce jointe obligatoire ;
- pas de notification sensible.

Le rapport d'incident numérique n'est pas une sanction automatique.

Il est une source structurée pour permettre au SPW d'analyser, décider et tracer.
