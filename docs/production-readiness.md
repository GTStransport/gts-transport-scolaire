# Mise en production propre GTS

Ce document sert de checklist opérationnelle avant chaque mise en production.

## Contrôles obligatoires

1. Vérifier le compte Firebase :
   ```bash
   firebase login:list
   firebase use
   ```
   Le compte attendu est `info@gts-connect.be` et le projet attendu est `gestion-transport-scolaire`.

2. Lancer les contrôles locaux :
   ```bash
   npm run test:ci
   ```

3. Vérifier qu’aucun rapport de test n’est ajouté :
   ```bash
   git status --short
   ```
   Les dossiers `test-results/` et `playwright-report/` doivent rester ignorés.

4. Déployer uniquement ce qui est prévu :
   ```bash
   firebase deploy --only hosting
   ```
   Pour les fonctions ou règles, utiliser une commande explicite séparée.

## Tests fonctionnels à refaire après déploiement

- page de connexion ;
- profils parent, transporteur, chauffeur, convoyeuse, SPW et support ;
- formulaire support public ;
- fiche médicale parent ;
- messages ;
- affichage mobile ;
- pages légales ;
- Centre Support.

## Surveillance après déploiement

- vérifier le Centre Support ;
- vérifier les erreurs techniques dans la supervision ;
- vérifier les e-mails support ;
- vérifier que les conflits “données à vérifier” ne réapparaissent pas ;
- vérifier le cache PWA avec un rechargement forcé.

## Rollback

En cas d’incident bloquant :

1. arrêter toute modification de données ;
2. identifier le dernier déploiement stable dans Firebase Hosting ;
3. restaurer la version Hosting précédente depuis la console Firebase ;
4. documenter l’incident dans le support interne ;
5. ne redéployer qu’après `npm run test:ci`.

## Points restant sous surveillance

- vulnérabilité modérée Vite/esbuild : tester la montée de version dans une branche dédiée avant généralisation ;
- tests e-mail support réels : à exécuter seulement avec validation, car ils créent un ticket et envoient des e-mails ;
- sauvegardes Firestore : vérifier régulièrement qu’un export récent est disponible.
