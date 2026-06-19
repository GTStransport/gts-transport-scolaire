# Informations Officielles GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

Le module **Informations Officielles GTS** permet de publier une information une seule fois dans GTS, avec des destinataires calculés ou sélectionnés selon le périmètre métier concerné.

Une information publiée dans GTS devient la référence officielle pour les personnes concernées.

Le module remplace progressivement les circuits informels actuels :

- mails dispersés ;
- appels téléphoniques ;
- messages WhatsApp ;
- captures d'écran ;
- relais humains ;
- bouche à oreille.

## 2. Problème Métier

Aujourd'hui, une information peut circuler par plusieurs canaux non synchronisés.

Cela entraîne :

- perte d'information ;
- personnes oubliées ;
- incompréhensions ;
- versions contradictoires ;
- polémiques sur le caractère officiel d'une consigne ;
- absence de preuve de diffusion ;
- absence de preuve de lecture ;
- difficulté à retrouver l'historique.

GTS doit devenir la source officielle de vérité pour les informations transport scolaire.

## 3. Qui Peut Publier

### SPW

Le SPW peut publier :

- informations générales officielles ;
- consignes liées aux élèves ;
- consignes liées aux écoles ;
- consignes liées aux transferts ;
- changements de procédure ;
- informations sensibles métier validées ;
- consignes exceptionnelles.

Le SPW reste l'autorité de référence pour les décisions officielles liées aux élèves et au cadre scolaire.

### Transporteur

Le transporteur peut publier dans son périmètre :

- information circuit ;
- information véhicule ;
- retard ;
- remplacement chauffeur ;
- information organisationnelle ;
- consigne terrain non sensible ;
- modification opérationnelle validée.

Le transporteur ne publie pas de décision administrative sur un élève.

### Admin

Un admin peut publier selon son périmètre :

- admin SPW : périmètre SPW ;
- admin transporteur : périmètre transporteur ;
- admin système : usage technique exceptionnel, journalisé.

L'admin système ne doit pas devenir un émetteur métier courant.

## 4. Types D'Informations

Types officiels prévus :

- `pedagogical_leave` : congé pédagogique ;
- `school_closure` : fermeture école ;
- `transfer` : information liée à un transfert ;
- `procedure_change` : changement de procédure ;
- `replacement` : remplacement chauffeur ou convoyeuse ;
- `exceptional_instruction` : consigne exceptionnelle ;
- `general_information` : information générale.

Types complémentaires possibles à terme :

- `delay` : retard ;
- `vehicle_change` : changement de véhicule ;
- `route_change` : changement de trajet ;
- `daily_instruction` : consigne du jour ;
- `safety_instruction` : consigne sécurité.

## 5. Destinataires

Les destinataires peuvent être directs ou calculés automatiquement.

### Parents

Un parent reçoit uniquement les informations qui concernent :

- son enfant ;
- le trajet de son enfant ;
- l'école de son enfant ;
- un transfert utilisé par son enfant ;
- une fermeture ou consigne qui impacte son enfant.

Un parent ne voit jamais les informations concernant d'autres élèves.

### Chauffeurs

Un chauffeur reçoit les informations qui concernent :

- ses circuits ;
- ses trajets ;
- ses élèves ;
- ses véhicules ;
- ses transferts ;
- ses remplacements éventuels ;
- les consignes du jour liées à son service.

### Convoyeuses

Une convoyeuse reçoit les informations qui concernent :

- ses circuits ;
- ses trajets ;
- ses élèves ;
- ses transferts ;
- ses remplacements éventuels ;
- les consignes utiles à la prise en charge.

Les convoyeuses étant gérées par le SPW, leur accès reste limité au besoin opérationnel.

### Transporteurs

Un transporteur voit les informations liées :

- à son organisation de transport ;
- à ses circuits ;
- à ses véhicules ;
- à ses chauffeurs ;
- aux affectations qu'il organise ;
- aux transferts de son périmètre.

Le transporteur ne voit pas les informations SPW sensibles hors nécessité transport.

### SPW

Le SPW dispose d'une visibilité globale sur les informations officielles liées au transport scolaire.

Le SPW peut superviser :

- informations élèves ;
- informations écoles ;
- informations transferts ;
- informations transporteurs ;
- informations de procédure.

## 6. Priorités

### Normale

Information utile mais non urgente.

Exemples :

- rappel administratif ;
- information générale ;
- changement prévu longtemps à l'avance.

### Importante

Information nécessitant une prise de connaissance rapide.

Exemples :

- changement de procédure ;
- modification d'organisation ;
- consigne impactant un trajet du lendemain.

### Urgente

Information nécessitant une attention immédiate.

Exemples :

- fermeture école le jour même ;
- changement de transfert ;
- remplacement de dernière minute ;
- consigne exceptionnelle de sécurité.

Les informations urgentes peuvent exiger une confirmation de lecture.

## 7. Accusés De Lecture

Chaque information peut activer ou non un accusé de lecture.

Accusé simple :

- destinataire ;
- date de première consultation ;
- rôle ;
- support de consultation.

Confirmation renforcée pour urgence :

- lecture obligatoire ;
- bouton de confirmation ;
- horodatage ;
- relance si non lu ;
- suivi lu/non lu par l'émetteur autorisé.

Les accusés de lecture ne doivent pas révéler de données d'autres destinataires aux parents.

## 8. Historique

Chaque information conserve :

- auteur ;
- rôle auteur ;
- date de publication ;
- priorité ;
- type ;
- périmètre ;
- destinataires calculés ;
- modifications ;
- archivage ;
- consultations ;
- confirmations de lecture.

Toute modification doit être tracée.

Une information importante ne doit pas être supprimée sans trace.

## 9. Archivage

Les informations peuvent avoir plusieurs états :

- `draft` : brouillon ;
- `published` : publiée ;
- `updated` : mise à jour ;
- `archived` : archivée ;
- `cancelled` : annulée.

Archivage recommandé :

- automatique après une durée définie selon le type ;
- manuel par SPW ou transporteur selon périmètre ;
- conservation des informations urgentes et de procédure plus longue ;
- conservation des accusés de lecture selon politique RGPD validée.

Une information archivée n'est plus mise en avant, mais reste consultable par les rôles autorisés si la durée de conservation le permet.

## 10. Intégration Briefing Du Jour

Le briefing du jour doit afficher automatiquement les informations officielles pertinentes :

- consignes SPW importantes ;
- informations urgentes non lues ;
- remplacements du jour ;
- changements de procédure ;
- informations liées au circuit du jour ;
- informations liées au transfert du jour ;
- informations liées aux élèves attendus.

Pour chauffeur et convoyeuse :

- seules les informations du circuit/service concerné apparaissent ;
- les informations urgentes sont placées en haut ;
- les informations déjà confirmées peuvent rester consultables sans bloquer l'écran.

Pour remplaçants :

- les informations du circuit remplacé sont visibles uniquement pendant la période autorisée ;
- l'accès est révoqué après le remplacement.

## 11. Notifications

Les notifications doivent être ciblées.

Canaux possibles :

- notification push ;
- badge dans l'application ;
- rappel dans briefing du jour ;
- e-mail futur si validé.

Principe de sécurité :

- pas de donnée sensible dans le contenu push ;
- push générique pour les informations sensibles ;
- contenu complet uniquement après authentification dans GTS.

Exemple push :

```text
Nouvelle information officielle GTS à consulter.
```

À éviter :

```text
Votre enfant [nom] est concerné par [détail sensible].
```

## 12. Sécurité Et Traçabilité

Principes :

- deny by default ;
- lecture selon périmètre ;
- écriture limitée aux rôles autorisés ;
- support sans accès direct aux contenus sensibles ;
- parent limité à son enfant ;
- chauffeur limité à ses circuits, élèves, transferts et remplacements ;
- convoyeuse limitée à ses circuits, élèves, transferts et remplacements ;
- transporteur limité à son organisation ;
- SPW supervision globale.

Chaque action doit être journalisée :

- création ;
- publication ;
- modification ;
- archivage ;
- annulation ;
- lecture ;
- confirmation ;
- notification envoyée ;
- échec de notification.

Les logs doivent permettre de prouver :

- qui a publié ;
- qui était destinataire ;
- qui a lu ;
- qui n'a pas lu ;
- quand l'information a été modifiée.

## 13. Données Sensibles Et RGPD

Le module doit respecter :

- minimisation des données ;
- finalité explicite ;
- accès par rôle ;
- durée de conservation ;
- traçabilité ;
- droit d'accès ;
- rectification ;
- archivage contrôlé.

Les informations ne doivent pas contenir inutilement :

- détails médicaux ;
- diagnostic ;
- données de santé ;
- données familiales sensibles ;
- informations sur d'autres élèves ;
- sanctions ou mesures non validées.

Les informations sensibles liées à un élève doivent être visibles uniquement par les personnes autorisées et nécessaires à la prise en charge.

## 14. Gains Métier

Le module apporte :

- source officielle unique ;
- moins de WhatsApp ;
- moins d'appels ;
- moins de pertes d'information ;
- réduction des conflits ;
- meilleure traçabilité ;
- meilleure preuve de diffusion ;
- meilleure préparation chauffeur/convoyeuse ;
- meilleure coordination SPW/transporteurs ;
- historique consultable ;
- amélioration RGPD.

## 15. Collections Futures Possibles

Collections candidates :

- `officialInformation` ;
- `officialInformationReadReceipts` ;
- `officialInformationDeliveryLogs` ;
- `officialInformationTargets`.

Ces collections ne doivent pas être créées avant validation des règles Firestore et du modèle de ciblage.

## 16. Roadmap

1. Documentation officielle.
2. Modèle de données détaillé.
3. Helpers de ciblage destinataires.
4. Firestore Rules lecture seule.
5. Écran liste lecture seule.
6. Création publication SPW/transporteur.
7. Accusés de lecture.
8. Notifications push.
9. Intégration briefing du jour.
10. Archivage et exports.

## 17. Principe Officiel

Une information publiée dans GTS fait foi pour les personnes auxquelles elle est destinée.
