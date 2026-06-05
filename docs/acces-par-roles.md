# Accès par rôles

Ce document décrit les accès métier appliqués dans GTS Connect. Les droits sont contrôlés à deux niveaux :

- interface applicative : menus, boutons et données affichées selon le rôle connecté ;
- règles Firestore : lecture, création, modification et suppression côté serveur.

Les règles de référence sont dans `firestore.rules`.

## Principes généraux

- Un utilisateur non connecté ne peut pas lire les données privées.
- Chaque compte est identifié par un rôle : `parent`, `driver`, `assistant`, `transport_manager`, `spw`, `support`, `system_admin`.
- Les accès transporteur sont cloisonnés par `transportManagerId`.
- Les accès chauffeur/convoyeuse sont limités aux circuits, véhicules, élèves et messages liés.
- Les parents ne voient que leurs enfants liés.
- Les données sensibles SPW ne sont pas destinées aux parents.
- Les logs critiques sont en lecture seule ou réservés à l’administrateur système.
- Les actions refusées par Firestore ne doivent pas être remises en boucle dans la file hors ligne.

## Parent

Le parent peut :

- consulter son espace `Accueil` ;
- consulter `Enfant(s)` uniquement pour ses enfants liés ;
- voir les informations utiles au transport de ses enfants ;
- voir chauffeur, convoyeuse, véhicule, circuit, arrêt et heure de passage matin si disponible ;
- compléter la fiche médicale/aide à la prise en charge ;
- modifier la fiche médicale après enregistrement ;
- envoyer et lire les messages qui le concernent ;
- créer une demande de changement parent ;
- créer certaines demandes ou messages support selon le parcours prévu ;
- recevoir et lire ses notifications.

Le parent ne peut pas :

- consulter les enfants non liés à son compte ;
- voir les informations sensibles réservées au SPW ;
- voir la mention interne `élève nécessitant une attention particulière` ;
- modifier les champs administratifs de l’élève ;
- modifier les données transport, circuit, chauffeur, convoyeuse ou véhicule ;
- créer ou supprimer des utilisateurs ;
- accéder au centre support technique ;
- supprimer des logs, messages système ou historiques.

## SPW

Le SPW peut :

- consulter les élèves accessibles dans son périmètre ;
- lire et gérer les données sensibles SPW ;
- voir les informations médicales et administratives prévues pour le SPW ;
- créer, modifier ou supprimer les données `studentSensitive` ;
- gérer les convoyeuses ;
- lire les chauffeurs, véhicules, écoles et circuits ;
- créer, modifier ou supprimer écoles et circuits ;
- gérer certains paramètres applicatifs ;
- consulter l’historique métier ;
- gérer les contacts SPW ;
- créer ou gérer des annonces de rôle ;
- lire et traiter certaines demandes support et demandes d’accès.

Le SPW ne peut pas :

- agir comme parent sur une fiche enfant ;
- gérer librement tous les chauffeurs comme le transporteur ;
- gérer les véhicules si la règle Firestore réserve l’écriture au transporteur ;
- consulter les transferts si la règle exclut le SPW ;
- modifier les logs de sécurité, connexion ou historique ;
- supprimer les notifications ou logs en dehors des règles prévues.

## Transporteur / gestionnaire transport

Le transporteur peut :

- consulter son tableau de bord opérationnel ;
- gérer les chauffeurs ;
- gérer les véhicules ;
- gérer les circuits ;
- gérer les écoles ;
- gérer les élèves dans son périmètre, hors données sensibles SPW ;
- gérer les parents ;
- gérer les transferts ;
- gérer les retards ;
- gérer les règles de remplacement ;
- traiter les incidents et anomalies ;
- lire et traiter les demandes support selon ses droits ;
- gérer les demandes d’accès ;
- créer des annonces de rôle ;
- consulter l’historique métier ;
- gérer les transports supplémentaires ou pool transport ;
- lire les congés, réparations véhicule et anomalies créés par les chauffeurs ;
- valider ou mettre à jour ces demandes.

Le transporteur ne peut pas :

- modifier les champs sensibles SPW d’un élève ;
- voir ou modifier les données d’un autre transporteur hors `transportManagerId` ;
- modifier son propre rôle ou devenir admin système ;
- modifier les logs système ;
- supprimer certaines demandes verrouillées comme congés, réparations ou anomalies ;
- gérer les convoyeuses si l’écriture est réservée au SPW.

## Chauffeur

Le chauffeur peut :

- consulter son espace chauffeur ;
- voir ses circuits affectés ;
- voir les élèves liés à son circuit ou à son transport ;
- consulter les informations utiles au transport ;
- consulter son véhicule associé ;
- lire les messages où il est participant ou destinataire ;
- envoyer des messages dans les conversations autorisées ;
- créer un retard de transfert le concernant ;
- créer une demande de congé ;
- créer une demande de réparation véhicule ;
- créer une anomalie ;
- mettre à jour certains éléments qui le concernent directement ;
- modifier son propre code d’accès selon le parcours prévu.

Le chauffeur ne peut pas :

- consulter les élèves hors circuit/périmètre ;
- modifier les données sensibles SPW ;
- modifier les informations administratives d’un élève ;
- créer ou supprimer des utilisateurs ;
- gérer véhicules, circuits ou écoles globalement ;
- valider lui-même ses congés, anomalies ou réparations ;
- lire les logs système ;
- accéder aux fonctions SPW ou transporteur.

## Convoyeuse

La convoyeuse peut :

- consulter son espace convoyeuse ;
- voir les circuits qui la concernent ;
- voir les élèves liés à son circuit ou à son transport ;
- consulter les informations utiles à la prise en charge ;
- lire les messages où elle est participante ou destinataire ;
- envoyer des messages dans les conversations autorisées ;
- consulter les chauffeurs, véhicules ou écoles liés à son affectation ;
- modifier certains éléments de son profil qui ne changent pas son rôle ou ses droits ;
- modifier son propre code d’accès selon le parcours prévu.

La convoyeuse ne peut pas :

- consulter les élèves hors circuit/périmètre ;
- modifier les données sensibles SPW ;
- modifier les informations administratives d’un élève ;
- gérer les véhicules, circuits ou écoles globalement ;
- créer ou supprimer des comptes ;
- lire les logs système ;
- accéder aux fonctions transporteur/SPW non prévues.

## Support

Le support peut :

- consulter le centre support ;
- lire et traiter les demandes support ;
- créer ou mettre à jour certains statuts de support ;
- gérer les permissions support si l’admin système les lui attribue ;
- accéder aux outils prévus pour l’assistance.

Le support ne peut pas :

- lire les fiches élèves métier ;
- accéder aux données parent comme un parent ;
- accéder aux données sensibles SPW ;
- modifier les données transport ;
- créer ou supprimer librement des comptes métier ;
- modifier les règles ou logs système hors permissions prévues.

## Administrateur système

L’administrateur système peut :

- gérer la configuration globale ;
- lire les logs de sécurité, connexion et accès ;
- gérer les permissions support ;
- créer ou gérer certains comptes administratifs ;
- gérer le statut de service ;
- effectuer les opérations techniques centrales.

L’administrateur système ne doit pas être utilisé pour l’exploitation quotidienne transport. C’est un compte de supervision et de sécurité.

## Matrice synthétique

| Module | Parent | Chauffeur | Convoyeuse | Transporteur | SPW | Support | Admin système |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Accueil | Oui | Oui | Oui | Oui | Oui | Oui | Oui |
| Enfants / élèves | Enfants liés | Circuit lié | Circuit lié | Périmètre transport | Oui | Non | Non métier |
| Fiche médicale parent | Compléter/modifier | Lecture utile selon accès | Lecture utile selon accès | Lecture selon accès | Oui | Non | Non métier |
| Données sensibles SPW | Non | Non | Non | Non | Oui | Non | Non métier |
| Chauffeurs | Non | Profil lié | Lecture liée | Gestion | Lecture | Non | Selon besoin |
| Convoyeuses | Non | Lecture liée | Profil lié | Lecture selon règles | Gestion | Non | Selon besoin |
| Véhicules | Lecture utile | Véhicule lié | Véhicule lié | Gestion | Lecture | Non | Selon besoin |
| Circuits | Lecture utile | Circuits liés | Circuits liés | Gestion | Gestion | Non | Selon besoin |
| Écoles | Lecture utile | Écoles liées | Écoles liées | Gestion | Gestion | Non | Selon besoin |
| Messages enfant | Liés à l’enfant | Si destinataire | Si destinataire | Oui | Oui | Non | Non métier |
| Messages internes | Non | Participant | Participant | Participant | Participant | Non | Non |
| Support | Limité | Oui | Oui | Oui | Oui | Gestion | Supervision |
| Demandes d’accès | Création publique | Création publique | Création publique | Lecture/traitement | Lecture/traitement | Lecture/traitement | Selon besoin |
| Retards/transferts | Lecture liée | Création liée | Lecture/participation | Gestion | Non selon règles transfert | Non | Non métier |
| Congés chauffeur | Non | Création | Non | Validation/lecture | Non | Non | Non métier |
| Réparations/anomalies | Non | Création | Non | Traitement | Non | Non | Non métier |
| Logs métier | Non | Non | Non | Lecture historique | Lecture historique | Non | Oui pour logs système |
| Paramètres | Préférences perso | Préférences perso | Préférences perso | Certains réglages | Certains réglages | Statut service | Global |

## Collections Firestore principales

| Collection | Règle principale |
| --- | --- |
| `students`, `children` | Lecture selon lien enfant/circuit/rôle. Création SPW ou transporteur. Modification sensible réservée SPW. |
| `studentMedical` | Lecture SPW, parent lié, chauffeur/convoyeuse liés. Modification parent autorisée sur la fiche médicale. Suppression SPW. |
| `studentSensitive` | Données sensibles réservées au SPW en écriture. |
| `users` | Lecture/écriture selon rôle et périmètre. Rôle et droits protégés. |
| `parents` | Lecture parent lui-même, transporteur, SPW, chauffeur, convoyeuse. Gestion transporteur/SPW. |
| `drivers` | Gestion transporteur. Lecture SPW et utilisateurs liés. |
| `assistants` | Gestion SPW. Lecture transporteur/SPW/utilisateurs liés. |
| `vehicles` | Gestion transporteur. Lecture utilisateurs liés et circuits affectés. |
| `schools`, `circuits` | Gestion transporteur/SPW. Lecture selon rôle et affectation. |
| `privateMessages`, `teamMessages`, `directMessages` | Lecture/écriture limitée aux participants ou rôles concernés. |
| `supportRequests` | Support, transporteur, SPW et demandeur non-parent selon règles. |
| `accessRequests` | Création publique contrôlée. Traitement support/transporteur/SPW. |
| `transportTransfers`, `transferDelays` | Gestion transporteur, participation chauffeur/convoyeuse selon la donnée. |
| `historyLogs` | Lecture transporteur/SPW. Création par utilisateur connecté autorisé. Non modifiable. |
| `securityLogs`, `loginLogs`, `connectionLogs` | Lecture admin système. Création contrôlée. Non modifiables. |
| `serviceStatus` | Lecture publique. Modification support/admin système. |
| `settings`, `appSettings` | Lecture connecté. Modification transporteur/SPW/admin selon collection. |

## Points de vigilance

- Les boutons visibles dans l’interface doivent toujours correspondre aux règles Firestore.
- Une action affichée mais refusée par Firestore crée une mauvaise expérience utilisateur.
- Les champs médicaux parent et les champs sensibles SPW doivent rester séparés.
- Les accès transporteur doivent toujours conserver un `transportManagerId`.
- Les comptes système ne doivent pas être utilisés pour gérer les opérations quotidiennes.
- Toute nouvelle collection doit avoir une règle Firestore explicite avant déploiement.

