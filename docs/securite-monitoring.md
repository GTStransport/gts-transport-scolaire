# Sécurité et monitoring GTS

## Journaux disponibles

- `loginLogs` : connexions réussies, refusées ou bloquées.
- `securityLogs` : événements sensibles, réinitialisations, blocages.
- `historyLogs` : modifications métier importantes.
- `supportReports` : rapports support, retards SLA, anonymisation.
- `serviceStatus/current` : état de service affiché dans l’application.

## Contrôles réguliers

Chaque semaine :

- vérifier les échecs de connexion répétés ;
- vérifier les tickets support non assignés ou en retard ;
- vérifier les erreurs e-mail support ;
- vérifier que les comptes inutilisés sont désactivés ;
- vérifier qu’aucun compte partagé n’est utilisé.

Chaque mois :

- exporter une sauvegarde Firestore ;
- vérifier la restauration d’un export sur un environnement séparé ;
- revoir les accès SPW, support et transporteur ;
- relire les demandes RGPD reçues ;
- contrôler les règles Firestore avec `npm run test:rules`.

## Commandes utiles

```bash
npm run test:ci
npm run backup:firestore
firebase login:list
firebase use
```

## Données sensibles

Les informations sensibles SPW et les données médicales doivent rester limitées aux rôles autorisés. Les parents ne doivent voir que les informations nécessaires à leur enfant et à la fiche médicale parent.
