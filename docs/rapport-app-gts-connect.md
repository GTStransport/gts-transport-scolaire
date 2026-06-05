# Rapport détaillé GTS Connect

## Présentation générale

GTS Connect est une application web de gestion du transport scolaire spécialisé. Elle centralise les informations nécessaires au suivi des élèves, des parents, des transporteurs, des chauffeurs, des convoyeuses, du SPW, du support et de l'administration technique.

L'application est publiée sur Firebase Hosting et utilise Cloud Firestore pour la synchronisation des données. Elle fonctionne aussi avec un stockage local de secours afin de conserver certaines informations côté navigateur lorsque la connexion est temporairement indisponible.

Adresse principale :

- https://gts-connect.be
- https://www.gts-connect.be
- https://gestion-transport-scolaire.web.app

## Objectifs de l'application

- Organiser le transport scolaire de manière centralisée.
- Donner à chaque rôle uniquement les informations utiles à sa mission.
- Sécuriser l'accès aux données sensibles des élèves.
- Faciliter la communication entre parents, chauffeurs, convoyeuses, transporteurs, SPW et support.
- Permettre aux parents de compléter et tenir à jour la fiche médicale / aide à la prise en charge.
- Suivre les demandes support avec numéro de ticket, e-mails et historique.
- Préparer une exploitation plus propre : sauvegardes, règles Firestore, suivi des accès et documentation utilisateur.

## Fonctionnalités principales

### Connexion et accès par rôle

L'application gère plusieurs types d'accès :

- parent ;
- chauffeur ;
- convoyeuse ;
- transporteur / gestionnaire transport ;
- SPW ;
- support ;
- administrateur système.

Chaque utilisateur possède un accès personnel. Les codes temporaires peuvent être utilisés pour une première connexion ou une réinitialisation, puis l'utilisateur doit définir son accès personnel si l'application le demande.

### Tableau de bord

Le tableau de bord s'adapte au rôle connecté.

Il peut afficher :

- les élèves liés ;
- les circuits ;
- les véhicules ;
- les chauffeurs ;
- les convoyeuses ;
- les messages récents ;
- les retards ;
- les alertes ;
- les demandes support ;
- les conflits de synchronisation ;
- les indicateurs opérationnels.

### Gestion des élèves

L'application permet de consulter et gérer les fiches élèves selon les droits du rôle connecté.

Les fiches peuvent contenir :

- identité de l'élève ;
- école ;
- circuit ;
- arrêt ou lieu de prise en charge ;
- véhicule ;
- chauffeur ;
- convoyeuse ;
- parents ou responsables ;
- personnes autorisées ;
- informations utiles au transport ;
- fiche médicale / aide à la prise en charge ;
- données sensibles réservées au SPW.

Les informations sensibles réservées au SPW ne sont pas affichées aux parents.

### Fiche médicale / aide à la prise en charge

Le parent peut compléter la fiche médicale de son enfant.

La fiche peut contenir :

- allergies ;
- affections médicales utiles au transport ;
- besoins particuliers ;
- consignes de prise en charge ;
- précisions nécessaires à la sécurité pendant le trajet.

Une fois enregistrée, la fiche reste modifiable par le parent si une information change.

### Personnes responsables et personnes autorisées

La fiche enfant peut afficher les responsables et personnes autorisées si ces données sont renseignées.

Ces informations servent à clarifier les personnes pouvant être contactées ou impliquées dans la prise en charge de l'enfant.

### Gestion transport

Le transporteur / gestionnaire transport peut gérer ou consulter, selon ses droits :

- chauffeurs ;
- convoyeuses ;
- véhicules ;
- écoles ;
- circuits ;
- affectations chauffeur / convoyeuse / véhicule ;
- lieux de transfert ;
- retards ;
- anomalies ;
- réparations véhicule ;
- congés ;
- demandes opérationnelles.

### Lieux de transfert

Le module de transfert permet de suivre :

- les lieux de transfert ;
- les circuits concernés ;
- les élèves concernés ;
- les horaires ;
- les véhicules ;
- les chauffeurs ;
- les convoyeuses ;
- les retards ou changements.

### Retards et alertes

L'application peut gérer les retards de transfert ou de circuit.

Selon les droits, un utilisateur autorisé peut :

- déclarer un retard ;
- indiquer une durée ;
- renseigner un motif ;
- prévenir les parents si le module est activé ;
- clôturer un retard ;
- consulter les retards actifs.

### Messages

L'application contient plusieurs formes de messagerie :

- messages privés liés aux enfants ;
- messages entre rôles autorisés ;
- messages d'équipe transport ;
- messages support ;
- annonces par rôle.

Les messages sont filtrés selon les droits. Un utilisateur ne doit voir que les conversations auxquelles il est lié ou autorisé.

### Centre Support

Le Centre Support permet aux utilisateurs autorisés de créer une demande support.

Une demande support contient :

- numéro de ticket ;
- auteur ;
- rôle ;
- sujet ;
- catégorie ;
- priorité ;
- message ;
- contexte transmis au support ;
- statut ;
- historique ;
- conversation support.

Les e-mails support sont configurés :

- notification interne vers `support@gts-connect.be` ;
- confirmation au demandeur ;
- réponse support envoyée au demandeur par e-mail.

### Tableau support interne

Le tableau support complet est réservé :

- au compte support ;
- à l'administrateur système.

Il permet :

- de voir les tickets ;
- de filtrer par statut, priorité, catégorie ou recherche ;
- d'assigner un ticket ;
- de modifier le statut ;
- d'ajouter des notes internes ;
- d'utiliser des modèles de réponse ;
- de relancer un e-mail ;
- de consulter l'historique ;
- de suivre les tickets en retard ;
- d'exporter les tickets ;
- de consulter les rapports support ;
- de lancer certaines actions manuelles autorisées.

Le transporteur ne reçoit pas l'accès global au tableau support interne. Il peut seulement créer et suivre ses propres demandes support.

### Numéro de ticket support

Chaque demande support reçoit un numéro de ticket du type :

`GTS-AAAAMMJJ-XXXXXX`

Ce numéro est repris dans :

- l'application ;
- la notification au support ;
- la confirmation au demandeur ;
- les réponses par e-mail.

### Automatisations support

Des Cloud Functions gèrent :

- l'envoi de la notification support à la création d'un ticket ;
- l'envoi de la confirmation au demandeur ;
- l'envoi d'une réponse par e-mail au demandeur ;
- le renvoi manuel d'e-mails support ;
- le rapport hebdomadaire support ;
- le digest des tickets en retard ;
- la clôture automatique des tickets résolus ;
- l'anonymisation des tickets support fermés depuis plus de 12 mois.

### Rapports support

L'application suit :

- dernier rapport hebdomadaire ;
- statut du dernier rapport ;
- digest SLA ;
- clôture automatique ;
- anonymisation RGPD ;
- statistiques support ;
- temps moyen de résolution ;
- satisfaction ;
- respect SLA ;
- tickets urgents ;
- tickets non assignés ;
- tickets en retard.

### Notice utilisateur intégrée

Une notice utilisateur est visible dans l'application via le menu `Notice`.

Elle s'adapte au rôle connecté :

- parent ;
- transporteur ;
- chauffeur ;
- convoyeuse ;
- SPW ;
- support.

Elle rappelle :

- les règles communes ;
- les bonnes pratiques ;
- les actions principales ;
- les contacts support et RGPD.

### Pages légales

L'application contient :

- conditions générales d'utilisation ;
- politique de confidentialité RGPD ;
- mentions légales.

Contact support :

- `support@gts-connect.be`

Contact données personnelles / RGPD :

- `info@gts-connect.be`

## Règles par rôle

### Parent

Le parent peut :

- consulter ses enfants ;
- consulter les informations utiles au transport ;
- compléter et modifier la fiche médicale ;
- consulter les messages liés à ses enfants ;
- créer une demande support selon le périmètre prévu ;
- recevoir les réponses support par e-mail.

Le parent ne peut pas :

- voir les informations sensibles réservées au SPW ;
- voir les enfants d'autres familles ;
- accéder au tableau support interne ;
- gérer les circuits, chauffeurs, convoyeuses ou véhicules.

### Chauffeur

Le chauffeur peut :

- consulter son tableau de bord ;
- voir les élèves liés à son circuit ou véhicule ;
- consulter les informations nécessaires au transport ;
- utiliser les messages autorisés ;
- consulter les transferts qui le concernent ;
- signaler certains problèmes ou retards selon les droits ;
- créer et suivre ses propres demandes support.

Le chauffeur ne peut pas :

- voir les élèves hors de son périmètre ;
- gérer les accès ;
- accéder aux données SPW internes ;
- accéder au tableau support interne.

### Convoyeuse

La convoyeuse peut :

- consulter son tableau de bord ;
- consulter les élèves de son périmètre ;
- voir les consignes utiles à l'accompagnement ;
- consulter les informations médicales nécessaires à la sécurité selon droits ;
- utiliser les messages autorisés ;
- consulter les transferts qui la concernent ;
- créer et suivre ses propres demandes support.

La convoyeuse ne peut pas :

- voir les élèves hors de son périmètre ;
- gérer les comptes ;
- accéder aux données SPW internes non nécessaires ;
- accéder au tableau support interne.

### Transporteur / gestionnaire transport

Le transporteur peut :

- gérer les données opérationnelles de transport ;
- gérer chauffeurs, convoyeuses, véhicules, circuits et écoles selon ses droits ;
- consulter les élèves nécessaires à l'organisation du transport ;
- suivre les transferts ;
- gérer certains accès ;
- consulter les messages opérationnels ;
- créer et suivre ses propres demandes support.

Le transporteur ne peut pas :

- accéder au tableau support interne global ;
- voir les tickets support des autres utilisateurs ;
- accéder aux informations internes réservées au SPW ;
- modifier des données sensibles non autorisées.

### SPW

Le SPW peut :

- consulter les élèves selon son périmètre ;
- accéder aux informations nécessaires au suivi administratif et à la sécurité ;
- consulter les données sensibles réservées au SPW ;
- suivre les transferts et informations transport selon droits ;
- utiliser les messages autorisés ;
- créer et suivre ses propres demandes support.

Le SPW ne doit pas :

- communiquer les informations internes sensibles aux parents si elles sont réservées au SPW ;
- copier des données sensibles hors application sans base autorisée ;
- utiliser les données hors finalité transport / sécurité.

### Support

Le support peut :

- accéder au Centre Support complet ;
- consulter et traiter les tickets ;
- répondre aux demandeurs ;
- gérer les statuts ;
- relancer des e-mails ;
- consulter les rapports support ;
- déclencher certaines actions manuelles autorisées ;
- accéder à la supervision technique selon permissions.

Le support ne doit pas :

- consulter des données sensibles qui ne sont pas nécessaires à la résolution du problème ;
- utiliser l'assistance temporaire hors cadre ;
- exporter ou communiquer des données non nécessaires.

### Administrateur système

L'administrateur système peut :

- gérer la configuration technique ;
- accéder à la supervision ;
- gérer les comptes support ;
- accéder au Centre Support complet ;
- consulter les tests de permissions ;
- gérer les paramètres système.

L'administrateur système est traité comme un rôle technique. L'accès aux fiches élèves complètes et aux données sensibles doit rester limité au strict nécessaire.

## Sécurité mise en place

### Règles Firestore

Les règles Firestore limitent les lectures et écritures selon :

- authentification ;
- rôle ;
- identifiant utilisateur ;
- enfant lié ;
- circuit affecté ;
- école affectée ;
- statut support ;
- appartenance à une conversation ;
- séparation des données publiques, médicales et sensibles.

Les règles bloquent notamment :

- l'accès parent aux données sensibles SPW ;
- l'accès à un enfant non lié ;
- la modification de champs sensibles par un rôle non autorisé ;
- la lecture de conversations privées non destinées ;
- l'accès global aux tickets support pour les transporteurs ;
- l'accès support global aux rôles non autorisés.

### Séparation des données élèves

Les données élèves sont séparées entre :

- fiche élève publique / transport ;
- fiche médicale ;
- données sensibles SPW.

Cette séparation limite le risque qu'une information médicale ou sensible soit exposée à un rôle non autorisé.

### Masquage des données sensibles

En assistance support temporaire, les données sensibles sont masquées. Le support peut aider sans voir les informations qui ne sont pas nécessaires.

### Accès support temporaire

L'utilisateur peut générer un accès support temporaire.

Caractéristiques :

- durée limitée ;
- lecture seule ;
- données sensibles masquées ;
- révocation possible ;
- journalisation.

### Gestion des sessions

L'application gère :

- session locale ;
- expiration d'inactivité ;
- verrouillage mobile / appareil ;
- déconnexion ;
- restauration de session ;
- session d'assistance support séparée.

### Codes temporaires

Les codes temporaires sont utilisés pour :

- première connexion ;
- réinitialisation d'accès ;
- accès support temporaire.

L'utilisateur peut être forcé à définir un code personnel après un accès temporaire.

### Journalisation

L'application contient des journaux et suivis :

- connexions ;
- erreurs ;
- actions support ;
- historique de modifications ;
- conflits de synchronisation ;
- accès support temporaire.

### Protection côté Hosting

Firebase Hosting sert l'application avec plusieurs en-têtes de sécurité :

- `Content-Security-Policy` ;
- `Strict-Transport-Security` ;
- `X-Content-Type-Options` ;
- `X-Frame-Options` ;
- `Referrer-Policy` ;
- `Permissions-Policy`.

### Sauvegardes

Une sauvegarde native Firestore est planifiée :

- base : `(default)` ;
- fréquence : hebdomadaire, le lundi ;
- conservation : 84 jours.

Cela permet de récupérer les données en cas d'erreur grave, suppression accidentelle ou incident.

## RGPD et données personnelles

### Mesures déjà prévues

- Page confidentialité RGPD visible.
- Contact données personnelles : `info@gts-connect.be`.
- Registre des traitements documenté.
- Procédures RGPD documentées.
- Politique de conservation et suppression documentée.
- AIPD / DPIA préparée.
- Séparation des données sensibles.
- Limitation d'accès par rôle.
- Anonymisation support après conservation.
- Masquage des données sensibles en assistance support.
- Documentation des accès par rôle.

### Points à faire valider officiellement

La validation RGPD finale doit être faite par le responsable légal, DPO ou conseil compétent.

À confirmer :

- responsable du traitement ;
- bases légales exactes ;
- exception applicable aux données de santé ;
- durées de conservation définitives ;
- sous-traitants ;
- procédures d'exercice des droits ;
- analyse d'impact ;
- mentions légales définitives.

## Avantages métier

### Pour les parents

- Accès simple aux informations de transport.
- Possibilité de tenir à jour la fiche médicale.
- Communication centralisée.
- Confirmation des demandes support par e-mail.
- Meilleure transparence sur le suivi.

### Pour les chauffeurs et convoyeuses

- Accès rapide aux élèves concernés.
- Informations utiles au trajet disponibles au même endroit.
- Meilleure coordination sur les messages et transferts.
- Réduction du risque d'information manquante.

### Pour le transporteur

- Gestion centralisée des chauffeurs, convoyeuses, véhicules, écoles et circuits.
- Suivi opérationnel des retards, transferts, réparations et anomalies.
- Moins d'informations dispersées.
- Meilleure traçabilité.

### Pour le SPW

- Accès aux informations nécessaires au suivi.
- Séparation des informations sensibles.
- Visibilité sur les élèves, circuits et situations particulières.
- Réduction du risque de transmission non contrôlée.

### Pour le support

- Tickets structurés.
- Numéro de ticket.
- Historique.
- E-mails automatiques.
- Relance manuelle.
- Reporting.
- Anonymisation RGPD.

### Pour l'exploitation technique

- Déploiement Firebase Hosting.
- Règles Firestore strictes.
- Tests de règles.
- Sauvegardes planifiées.
- Documentation.
- Raccourci bureau Mac pour accès support rapide admin.

## État actuel de mise en production

### Validé

- Déploiement Firebase Hosting.
- Domaine `gts-connect.be`.
- Domaine `www.gts-connect.be`.
- E-mails support.
- Raccourci Centre Support sur Mac.
- Nettoyage des données de démonstration connues.
- Sauvegarde Firestore planifiée.
- Notice utilisateur intégrée.
- Pages légales intégrées.
- Règles Firestore testées.

### Reste à valider

- Test réel complet de chaque rôle.
- Changement ou retrait des codes temporaires restants.
- Validation RGPD officielle.
- Surveillance des premiers jours de production.

## Points de surveillance recommandés

Pendant les premiers jours :

- surveiller les conflits `Données à vérifier` ;
- vérifier les e-mails support échoués ;
- vérifier les tickets support non traités ;
- surveiller les erreurs Firebase Functions ;
- vérifier les connexions refusées ;
- vérifier que les utilisateurs voient uniquement leur périmètre ;
- vérifier les retours terrain parents/chauffeurs/convoyeuses/SPW.

## Conclusion

GTS Connect est une application métier complète pour gérer le transport scolaire spécialisé avec séparation des rôles, gestion des élèves, fiches médicales, messagerie, support, règles Firestore, sauvegardes et documentation utilisateur.

La base technique est en place pour une exploitation réelle. Les derniers points avant usage officiel sont surtout des validations terrain, sécurité opérationnelle et RGPD : tester les vrais comptes, retirer les codes temporaires inutiles, valider juridiquement les textes et surveiller les premiers jours d'utilisation.
