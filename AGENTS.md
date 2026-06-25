# AGENTS

Document de référence projet pour GTS.

## Vision

GTS est une application métier critique pour le transport scolaire spécialisé.

Le projet doit privilégier :

- la sécurité ;
- la traçabilité ;
- la simplicité d'usage terrain ;
- la cohérence métier ;
- la compatibilité progressive avec l'existant ;
- la documentation avant l'implémentation.

## Principes

- Aucune rustine.
- Aucun refactoring hors périmètre.
- Une fonctionnalité = un lot = un commit.
- Les changements doivent rester petits, vérifiables et réversibles.
- Les données élèves, parents, chauffeurs, convoyeuses et transporteurs sont sensibles.
- Toute évolution doit respecter la séparation SPW / transporteur.
- Le legacy doit rester compatible tant que la migration V2 n'est pas validée.

## Workflow Obligatoire

Toute nouvelle fonctionnalité structurante suit obligatoirement :

1. Architecture
2. Documentation
3. Validation
4. Firestore Rules
5. Implémentation
6. Tests
7. Déploiement

Ce workflow est obligatoire pour toute nouvelle collection Firestore, tout nouveau module métier et toute migration.

## Firestore

- `docs/firestore` est la référence officielle pour les collections Firestore.
- Aucune collection Firestore ne peut être implémentée sans document d'architecture validé.
- Aucune collection ne doit être créée directement dans le code sans validation préalable.
- Toute collection doit définir :
  - objectif ;
  - schéma ;
  - champs obligatoires ;
  - champs optionnels ;
  - index ;
  - règles de lecture ;
  - règles d'écriture ;
  - migration ;
  - exemples JSON ;
  - règles métier.
- Les écritures Firestore doivent être explicitement autorisées par les règles.
- Les suppressions physiques sont interdites par défaut.
- Les migrations doivent être précédées d'un backup et d'un dry-run.
- Les champs legacy ne sont pas supprimés tant que la migration n'est pas validée.

## Sécurité

- Deny by default.
- Accès minimum par rôle.
- Le SPW est propriétaire des élèves et des convoyeuses.
- Le transporteur organise le transport mais ne possède pas les élèves.
- Les parents ne voient que les informations de leurs enfants.
- Les chauffeurs et convoyeuses ne voient que les données nécessaires à leurs circuits, trajets, transferts ou remplacements.
- Le support n'a aucun accès sensible par défaut.
- Les actions sensibles doivent être journalisées.
- Les notifications ne doivent pas contenir de données sensibles.

## Documentation

- La documentation précède l'implémentation.
- Les documents d'architecture validés sont la source de vérité.
- Toute nouvelle collection va dans `docs/firestore`.
- Toute nouvelle logique métier structurante va dans `docs/architecture`.
- Les décisions métier importantes doivent être documentées avant le code.
- Une documentation obsolète doit être mise à jour dans le même lot que le changement concerné.

## Git

- Une fonctionnalité = un lot = un commit.
- Ne pas mélanger documentation, refactoring et fonctionnalité si ce n'est pas strictement nécessaire.
- Ne pas inclure de fichiers hors périmètre.
- Vérifier `git status --short` avant commit.
- Vérifier le diff avant commit.
- Ne jamais annuler des changements utilisateur sans demande explicite.
- Les commits doivent être lisibles et ciblés.

## Déploiement

- Aucun déploiement sans validation explicite.
- Aucun déploiement avec un build obsolète.
- Le déploiement Hosting doit reconstruire `dist` avant publication.
- Ne pas déployer de règles Firestore sans tests.
- Ne pas déployer une migration sans backup, dry-run et validation.

## Tests

- `npm run check` est obligatoire avant commit pour tout changement de code, règles ou configuration.
- Les règles Firestore doivent être testées avec l'émulateur dès qu'elles changent.
- Les migrations doivent avoir un mode dry-run par défaut.
- Les tests doivent couvrir les rôles concernés :
  - SPW ;
  - transporteur ;
  - chauffeur ;
  - convoyeuse ;
  - parent ;
  - support ;
  - admin.

## UI/UX

- L'interface doit rester simple, lisible et professionnelle.
- Les écrans terrain doivent privilégier les informations utiles immédiatement.
- Les libellés humains doivent remplacer les IDs techniques.
- Les écrans lecture seule ne doivent jamais déclencher d'écriture Firestore.
- Aucun changement UI ne doit modifier la logique métier ou les données sans validation.
- Les workflows transporteur, chauffeur, convoyeuse, parent et SPW doivent rester clairement séparés.

## Codex

- Lire le code existant avant de modifier.
- Respecter le périmètre exact demandé.
- Ne pas refactoriser hors sujet.
- Ne pas créer de fonctionnalité non demandée.
- Ne pas modifier les règles Firestore sans demande explicite.
- Ne pas modifier les écrans si la demande est documentation uniquement.
- Toujours signaler les fichiers modifiés.
- Toujours signaler les vérifications exécutées.
- Ne jamais lancer de migration réelle sans validation.

## Interdictions

- Aucune rustine.
- Aucun refactoring hors périmètre.
- Aucun déploiement non demandé.
- Aucune écriture Firestore non validée.
- Aucune nouvelle collection sans architecture validée.
- Aucune suppression de champs legacy sans migration validée.
- Aucune modification des données élèves hors périmètre SPW.
- Aucun accès global aux données sensibles par défaut.
- Aucun secret ou fichier `.env` ne doit être commité.

## Checklist Avant Commit

- Le périmètre demandé est respecté.
- Les fichiers modifiés sont strictement nécessaires.
- `git status --short` a été vérifié.
- Le diff a été relu.
- `npm run check` a été exécuté si le lot touche du code, des règles ou de la configuration.
- La documentation est à jour si le changement touche l'architecture ou Firestore.
- Aucun fichier hors sujet n'est inclus.
- Le commit correspond à un seul lot.

## Checklist Avant Deploy

- Validation utilisateur explicite obtenue.
- `npm run check` exécuté.
- Build exécuté.
- Règles Firestore testées si concernées.
- Backup réalisé si migration ou écriture sensible.
- Dry-run validé si migration.
- Rollback identifié.
- Projet Firebase vérifié.
- Aucun changement hors périmètre déployé.
