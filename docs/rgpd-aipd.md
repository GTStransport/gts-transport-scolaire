# AIPD / DPIA - GTS Connect

Ce document sert de base d’analyse d’impact relative à la protection des données. Il doit être relu, complété et validé par le responsable du traitement ou le DPO avant un usage réel à grande échelle.

## Pourquoi une AIPD est nécessaire

GTS Connect traite plusieurs catégories de données à risque :

- données d’enfants ;
- données de santé ou d’aide à la prise en charge ;
- données de transport scolaire ;
- messages entre intervenants ;
- accès par rôles multiples ;
- logs de connexion et sécurité.

## Description du traitement

Finalités :

- organiser le transport scolaire ;
- sécuriser la prise en charge des élèves ;
- faciliter la communication entre parents, SPW, transporteurs, chauffeurs et convoyeuses ;
- gérer les demandes support ;
- tracer les accès et incidents.

Personnes concernées :

- élèves ;
- parents ou responsables ;
- personnes autorisées ;
- chauffeurs ;
- convoyeuses ;
- agents SPW ;
- gestionnaires transport ;
- support technique.

## Nécessité et proportionnalité

Mesures prévues :

- accès limités par rôle ;
- séparation `studentMedical` et `studentSensitive` ;
- données sensibles SPW réservées au SPW ;
- masquage des données sensibles pour le support ;
- journalisation des connexions et erreurs ;
- page confidentialité RGPD ;
- registre des traitements ;
- politique de conservation ;
- procédure incident.

Points à valider :

- base légale exacte pour chaque traitement ;
- exception applicable aux données de santé ;
- durée de conservation définitive ;
- liste exacte des destinataires ;
- contrat de sous-traitance Firebase/Google ;
- procédure de purge automatique.

## Risques identifiés

| Risque | Impact | Mesures existantes | Mesures à renforcer |
| --- | --- | --- | --- |
| Parent accédant à une donnée SPW sensible | Élevé | Séparation des écrans, règles Firestore verrouillées | Tests réguliers des règles |
| Mauvaise attribution de rôle | Élevé | Claims, règles par rôle, logs | Audit périodique des comptes |
| Fuite de données médicales | Élevé | Accès limité, séparation médicale/sensible | Journal dédié aux consultations sensibles |
| Support voyant trop de données | Moyen/élevé | Masquage assistance support | Revue des permissions support |
| Message envoyé au mauvais destinataire | Moyen | Conversations par participants | Tests de messagerie par rôle |
| Données conservées trop longtemps | Moyen | Politique de conservation proposée | Purge automatique et validation juridique |
| Déploiement de règles ouvertes | Élevé | README, règles production séparées | CI bloquant sur `firestore.dev.rules` |

## Décision de mise en production

Statut proposé : **mise en production contrôlée uniquement après validation**.

À faire avant validation finale :

- valider le registre des traitements ;
- valider les bases légales ;
- valider la politique de conservation ;
- tester les règles Firestore ;
- vérifier les sous-traitants ;
- définir le DPO/contact officiel ;
- documenter la procédure incident.

