# GTS Official Information V2

Architecture validée le 17/06/2026

## 1. Vision

GTS doit devenir la source officielle de vérité du transport scolaire.

Principe officiel :

```txt
Une information publiée dans GTS fait foi.
```

Cela signifie qu'une information publiée dans GTS remplace les chaînes informelles comme source de référence opérationnelle.

## 2. Problème Métier

Aujourd'hui, les informations circulent par :

- WhatsApp ;
- téléphone ;
- transferts de messages ;
- captures d'écran ;
- bouche à oreille.

Conséquences :

- informations contradictoires ;
- personnes oubliées ;
- tensions entre chauffeurs ;
- tensions entre convoyeuses ;
- tensions entre transporteurs ;
- perte de temps ;
- absence de preuve officielle ;
- difficulté à vérifier qui a reçu ou lu l'information.

Exemple réel :

```txt
Le SPW décide qu'un seul coup de sifflet sera utilisé au lieu de deux.
```

L'information est correcte, mais elle circule mal.

Certaines personnes peuvent penser :

- que l'information n'est pas officielle ;
- qu'elle ne concerne pas leur circuit ;
- qu'elle a été déformée ;
- qu'elle vient d'une source non autorisée.

GTS doit résoudre ce problème en centralisant la publication officielle.

## 3. Source Officielle

Une information devient officielle lorsqu'elle est :

- créée dans GTS par un émetteur autorisé ;
- publiée avec un niveau d'importance ;
- horodatée ;
- liée à un périmètre métier ;
- diffusée aux destinataires calculés ;
- conservée dans l'historique.

Une information officielle doit contenir :

```txt
auteur
rôle de l'auteur
date de publication
type d'information
périmètre concerné
destinataires
statut
historique
```

Statuts recommandés :

```txt
draft
published
updated
archived
cancelled
```

## 4. Types D'Informations

### `information`

Information générale.

Exemples :

- rappel d'organisation ;
- consigne de fonctionnement ;
- précision non urgente ;
- information école.

### `important`

Information nécessitant une attention particulière.

Exemples :

- changement durable de consigne ;
- changement de lieu de rendez-vous ;
- règle SPW importante ;
- adaptation d'organisation.

### `urgent`

Information nécessitant une lecture rapide et une confirmation.

Exemples :

- changement de procédure immédiat ;
- incident impactant un circuit ;
- consigne de sécurité ;
- annulation ou modification opérationnelle du jour.

Règle :

```txt
urgent = confirmation obligatoire
```

## 5. Émetteurs Autorisés

### SPW

Peut publier :

- consignes officielles ;
- informations élèves ;
- informations écoles ;
- informations transferts ;
- règles de sécurité ;
- informations concernant les convoyeuses ;
- communications de supervision.

### Transporteur

Peut publier :

- informations circuit ;
- retards ;
- changements véhicule ;
- changements chauffeur ;
- informations opérationnelles de son périmètre ;
- consignes transporteur validées.

Le transporteur ne peut pas publier comme officielle une donnée SPW sensible ou modifier une consigne SPW.

### Admin

Peut publier selon son périmètre :

- admin SPW : comme SPW ;
- admin transporteur : comme transporteur ;
- admin système : réservé aux annonces techniques ou interventions exceptionnelles.

Le support technique ne doit pas publier d'informations métier officielles.

## 6. Destinataires Automatiques

GTS doit calculer automatiquement les destinataires selon le périmètre.

Destinataires possibles :

- chauffeurs ;
- convoyeuses ;
- parents ;
- écoles ;
- transporteurs ;
- SPW.

Exemples de ciblage :

### Information SPW Générale

Destinataires :

- transporteurs concernés ;
- chauffeurs concernés ;
- convoyeuses concernées ;
- SPW.

Parents uniquement si l'information concerne leurs enfants.

### Information Circuit

Destinataires :

- chauffeur du circuit ;
- convoyeuse du circuit ;
- transporteur ;
- parents des élèves concernés si impact parent ;
- SPW selon importance.

### Information Transfert

Destinataires :

- chauffeurs entrants/sortants ;
- convoyeuses entrantes/sortantes ;
- transporteurs concernés ;
- SPW ;
- parents uniquement si leurs enfants sont impactés.

### Information École

Destinataires :

- transporteurs desservant l'école ;
- chauffeurs concernés ;
- convoyeuses concernées ;
- parents des élèves concernés ;
- SPW.

## 7. Accusés De Lecture

Chaque information officielle peut demander un accusé de lecture.

Recommandation :

- `information` : accusé optionnel ;
- `important` : accusé recommandé ;
- `urgent` : accusé obligatoire.

Un accusé doit contenir :

```json
{
  "userId": "user-1",
  "role": "driver",
  "readAt": "Timestamp",
  "acknowledgedAt": "Timestamp",
  "informationId": "info-123"
}
```

Chaque utilisateur ne peut accuser lecture que pour lui-même.

## 8. Confirmation Obligatoire Pour Les Urgences

Pour une information `urgent`, GTS doit afficher clairement :

```txt
Confirmation requise
```

L'utilisateur doit confirmer :

```txt
J'ai lu et compris
```

La confirmation doit être tracée.

Une urgence non confirmée doit rester visible dans :

- briefing du jour ;
- tableau de bord ;
- suivi SPW ou transporteur ;
- relances éventuelles.

## 9. Historique

Toute information officielle doit conserver son historique.

Actions à tracer :

- création ;
- publication ;
- modification ;
- archivage ;
- annulation ;
- résolution des destinataires ;
- notification envoyée ;
- notification échouée ;
- lecture ;
- confirmation.

Exemple :

```json
{
  "action": "published",
  "actorId": "spw-1",
  "actorRole": "spw",
  "at": "Timestamp",
  "details": {
    "recipientCount": 42,
    "importance": "urgent"
  }
}
```

## 10. Journalisation

La journalisation doit prouver :

- qui a publié ;
- quand ;
- pour quel périmètre ;
- qui était destinataire ;
- qui a lu ;
- qui a confirmé ;
- quelles notifications ont été envoyées.

Les logs techniques ne doivent pas exposer de contenu sensible au support.

## 11. Notifications Push

Les notifications push doivent rester sobres.

Règle :

```txt
Aucune donnée sensible dans le push.
```

Exemples autorisés :

```txt
Nouvelle information officielle GTS
Information urgente à confirmer
Nouvelle consigne concernant votre circuit
```

Le contenu complet doit être consulté uniquement après authentification dans GTS.

## 12. Sécurité Et RGPD

Principes :

- minimisation des destinataires ;
- minimisation du contenu ;
- accès strictement lié au rôle ;
- parent limité à son enfant ;
- chauffeur limité à ses circuits, élèves et transferts ;
- convoyeuse limitée à ses circuits, élèves et transferts ;
- transporteur limité à son périmètre ;
- SPW en supervision ;
- support sans accès direct au contenu sensible.

Données à éviter dans le contenu libre :

- diagnostic médical ;
- détail de handicap ;
- coordonnées personnelles inutiles ;
- identité d'un autre élève pour les parents ;
- informations disciplinaires non validées ;
- captures d'écran ou messages transférés depuis canaux externes.

Durée de conservation :

- information simple : durée limitée ;
- information importante : année scolaire ;
- information urgente ou sécurité : conservation selon politique SPW ;
- logs de notification : durée courte maîtrisée.

## 13. Gestion Des Remplacements

Les informations officielles doivent intégrer les remplacements.

Cas convoyeuse absente :

- le chauffeur reste sur son circuit ;
- la convoyeuse remplaçante est ajoutée comme destinataire temporaire ;
- le chauffeur reçoit l'information du remplacement ;
- les contacts utiles sont partagés uniquement pendant la période.

Cas chauffeur absent :

- un chauffeur volant remplace temporairement le titulaire ;
- la convoyeuse prévue reste normalement la même ;
- le chauffeur volant reçoit les informations du circuit ;
- la convoyeuse reçoit l'information du remplacement chauffeur ;
- le chauffeur titulaire n'est pas supprimé du circuit.

Cas chauffeur et convoyeuse absents :

- un chauffeur volant est affecté ;
- une convoyeuse remplaçante est affectée ;
- les deux reçoivent les informations du même circuit ;
- les contacts sont partagés uniquement entre les personnes affectées au remplacement.

Règles :

- accès limité au circuit concerné ;
- accès limité à la période du remplacement ;
- révocation automatique ;
- journalisation des accès.

## 14. Intégration Avec Diffusion Ciblée

La fonctionnalité d'information officielle s'appuie sur la diffusion ciblée.

Diffusion ciblée :

```txt
qui doit recevoir ?
```

Information officielle :

```txt
quelle information fait foi ?
```

Les deux modèles doivent partager :

- destinataires calculés ;
- accusés de lecture ;
- logs de livraison ;
- notifications push ;
- règles RGPD ;
- historique.

## 15. Intégration Avec Briefing Du Jour

Le briefing du jour doit afficher les informations officielles utiles.

Pour chauffeur :

- urgences non confirmées ;
- consignes du circuit ;
- remplacement convoyeuse ;
- changement véhicule ;
- retard ou modification trajet.

Pour convoyeuse :

- urgences non confirmées ;
- consignes du circuit ;
- remplacement chauffeur ;
- élèves attendus ;
- informations nécessaires à l'accompagnement.

Pour transporteur :

- informations officielles SPW ;
- urgences non confirmées par les équipages ;
- incidents ;
- changements opérationnels.

Pour SPW :

- informations publiées ;
- confirmations manquantes ;
- incidents ou retours terrain ;
- suivi des remplacements.

## 16. Recommandation Officielle

GTS doit devenir la source officielle.

Principe :

```txt
Une information publiée dans GTS fait foi.
```

WhatsApp, téléphone, captures d'écran ou bouche à oreille peuvent rester des moyens informels, mais ne doivent pas être considérés comme source officielle.

L'information officielle doit être :

- publiée dans GTS ;
- ciblée automatiquement ;
- traçable ;
- consultable après authentification ;
- confirmée si urgente ;
- historisée.
