# Registre RGPD des traitements

Ce registre sert de base interne pour documenter les traitements de données de GTS Connect. Il doit être validé et complété par le responsable du traitement avant exploitation réelle.

## Responsable du traitement

- Organisation : Gestion Services Mobilité
- Contact opérationnel : Jérémy Bailly
- Contact données personnelles : info@gts-connect.be
- Sous-traitants techniques identifiés : Firebase Hosting, Firebase Authentication, Cloud Firestore, Google Cloud Platform

## Traitements principaux

| Traitement | Données concernées | Personnes concernées | Finalité | Base légale à valider | Destinataires | Conservation proposée |
| --- | --- | --- | --- | --- | --- | --- |
| Gestion des comptes | Identité, rôle, identifiant, statut, accès, logs de première connexion | Parents, chauffeurs, convoyeuses, SPW, transporteurs, support | Authentifier et limiter les accès | Mission d’intérêt public / contrat / intérêt légitime selon contexte | Administrateurs autorisés, support limité | Durée du service + 12 mois |
| Gestion des élèves | Identité élève, école, circuit, arrêt, responsables, personnes autorisées | Élèves, parents/responsables | Organiser le transport scolaire | Mission d’intérêt public / obligation légale à confirmer | SPW, transporteur, chauffeur/convoyeuse liés, parent lié | Année scolaire + durée légale utile |
| Fiche médicale / aide à la prise en charge | Allergies, affections, consignes, besoins de prise en charge | Élèves | Sécurité et prise en charge pendant le transport | Données de santé : exception RGPD art. 9 à valider | Parent lié, SPW, intervenants strictement autorisés | Durée strictement nécessaire, révision annuelle |
| Données sensibles SPW | Attention particulière, notes internes, exclusions, informations administratives sensibles | Élèves | Suivi administratif et sécurité | Mission d’intérêt public / intérêt public important à confirmer | SPW uniquement, selon règles | Durée définie par SPW ou obligation applicable |
| Gestion transport | Circuits, véhicules, chauffeurs, convoyeuses, horaires, transferts, retards | Élèves, parents, personnel transport | Exécuter et suivre le transport scolaire | Contrat / mission d’intérêt public / intérêt légitime selon contexte | Transporteur, SPW, intervenants liés | Année scolaire + archivage nécessaire |
| Messagerie | Messages, auteurs, destinataires, dates, statuts | Utilisateurs de l’app | Communication liée au transport | Intérêt légitime / mission d’intérêt public | Participants uniquement | 12 à 24 mois selon nécessité |
| Support | Demandes support, messages, contexte technique, accès temporaire masqué | Utilisateurs | Assistance, résolution d’incidents | Intérêt légitime / contrat | Support, administrateurs autorisés | 12 mois après clôture |
| Sécurité et logs | Connexions, erreurs, statut, navigateur, actions, historique | Utilisateurs | Sécurité, audit, preuve d’accès | Intérêt légitime / obligation de sécurité | Admin système, responsables autorisés | 6 à 24 mois selon type |
| Notifications | Tokens, préférences, destinataires, statut | Utilisateurs | Informer les personnes concernées | Consentement / intérêt légitime selon notification | Utilisateur concerné, service technique | Tant que l’utilisateur accepte les notifications |

## Catégories particulières de données

L’application peut traiter des données relatives à la santé d’un élève. Ces données sont protégées de manière renforcée et ne doivent être collectées que si elles sont nécessaires à la sécurité et à la prise en charge pendant le transport.

Avant mise en production large, le responsable du traitement doit confirmer :

- la base légale du traitement ;
- l’exception applicable pour les données de santé ;
- les destinataires exacts ;
- la durée de conservation ;
- la nécessité d’une analyse d’impact relative à la protection des données.

## Mesures de sécurité prévues

- Accès par rôles documentés dans `docs/acces-par-roles.md`.
- Règles Firestore strictes dans `firestore.rules`.
- Séparation des données médicales et des données sensibles SPW.
- Masquage des données sensibles pendant l’assistance support.
- Journalisation des connexions et actions de sécurité.
- Limitation des messages aux participants et destinataires.
- Nettoyage des conflits Firestore non autorisés.
- Page confidentialité RGPD visible dans l’application.

## Points à compléter avant validation

- Nom juridique complet du responsable du traitement.
- DPO ou contact protection des données officiel.
- Bases légales validées par traitement.
- Durées définitives de conservation.
- Contrats de sous-traitance avec les prestataires.
- Procédure d’exercice des droits.
- Analyse d’impact si nécessaire.
