# Runbook support GTS

## Cycle de vie d’un ticket

1. Le demandeur crée une demande support.
2. GTS attribue un numéro de ticket.
3. Un e-mail interne est envoyé à `support@gts-connect.be` si la configuration SMTP est complète.
4. Le demandeur reçoit une confirmation par e-mail si son adresse est disponible.
5. Le support répond dans l’application.
6. La réponse est envoyée au demandeur par e-mail.
7. Le ticket est clôturé après résolution.
8. Les tickets clôturés depuis plus de 12 mois sont anonymisés par la fonction planifiée.

## Contrôle e-mail support

Vérifier dans un ticket :

- `emailNotificationStatus` pour l’e-mail interne ;
- `requesterConfirmationEmailStatus` pour la confirmation demandeur ;
- `emailToRequesterStatus` sur les messages de réponse ;
- les champs `Reason` ou `Error` en cas d’échec.

## Test manuel complet e-mail

À faire uniquement avec accord, car cela crée une vraie donnée support :

1. ouvrir la page de connexion ;
2. cliquer sur `Contactez le support` ;
3. saisir une adresse e-mail contrôlée ;
4. envoyer la demande ;
5. vérifier la réception sur `support@gts-connect.be` ;
6. vérifier la confirmation côté demandeur ;
7. se connecter au support ;
8. répondre au ticket ;
9. vérifier que le demandeur reçoit la réponse ;
10. clôturer le ticket.

## En cas de non-réception

1. Vérifier la configuration SMTP des fonctions Firebase.
2. Vérifier les logs Cloud Functions.
3. Vérifier les champs de statut e-mail du ticket.
4. Utiliser le bouton de renvoi e-mail depuis le Centre Support si disponible.
5. Vérifier le dossier spam de la boîte LWS.
