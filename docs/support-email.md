# Notification e-mail support

Des Cloud Functions envoient des e-mails pour le support :

- une notification interne quand un document est créé dans `supportRequests/{requestId}` ;
- un accusé de réception au demandeur ;
- un e-mail au demandeur quand le support répond.
- un récapitulatif quotidien des tickets en retard.
- un rapport hebdomadaire support.

Fonction concernée :

- `emailSupportRequestCreated`
- `notifySupportMessageCreated`
- `resendSupportEmail`
- `sendSupportOverdueDigest`
- `sendSupportOverdueDigestNow`
- `sendSupportWeeklyReport`
- `sendSupportWeeklyReportNow`
- `closeResolvedSupportTickets`
- `anonymizeClosedSupportTickets`
- `anonymizeClosedSupportTicketsNow`

## Destinataire par défaut

Si aucune variable `SUPPORT_EMAIL_TO` n’est définie, le destinataire par défaut est :

- `support@gts-connect.be`

## Variables d’environnement nécessaires

Les fonctions v2 lisent les variables depuis l’environnement. En local et au déploiement Firebase CLI, utiliser un fichier `functions/.env` :

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=utilisateur@example.com
SMTP_PASS=mot-de-passe-ou-app-password
SUPPORT_EMAIL_FROM="GTS Support <utilisateur@example.com>"
SUPPORT_EMAIL_TO=support@gts-connect.be
```

Ne pas versionner `functions/.env`.

## Contenu envoyé au support

La notification interne au support contient :

- numéro de ticket ;
- identifiant de la demande ;
- nom du demandeur ;
- rôle ;
- sujet ;
- statut ;
- date ;
- téléphone et e-mail si disponibles ;
- contexte enfant, école, circuit, chauffeur ou convoyeuse si disponible ;
- message ;
- lien vers l’application.

## Contenu envoyé au demandeur

L’accusé de réception contient :

- numéro de ticket ;
- identifiant technique de la demande ;
- sujet ;
- date ;
- copie du message transmis.

Quand le support répond, le demandeur reçoit :

- numéro de ticket ;
- identifiant technique de la demande ;
- sujet ;
- auteur de la réponse ;
- date ;
- texte de la réponse.

## Suivi dans Firestore

La demande support reçoit ensuite ces champs :

- `emailNotificationStatus` : `sent`, `skipped` ou `failed` ;
- `emailNotificationReason` si la configuration manque ;
- `emailNotificationSentAt` si le mail est envoyé ;
- `requesterConfirmationEmailStatus` : statut de l’accusé de réception ;
- `requesterConfirmationEmailSentAt` si l’accusé est envoyé ;
- `emailNotificationCheckedAt` ;
- `emailNotificationError` si l’envoi échoue.

Chaque message support peut recevoir :

- `emailToRequesterStatus` ;
- `emailToRequesterSentAt` ;
- `emailToRequesterCheckedAt` ;
- `emailToRequesterError` si l’envoi échoue.

## Audit et renvoi manuel

Le tableau de bord support affiche un compteur `E-mails support` quand une notification ou une réponse est en statut `failed` ou `skipped`.

Depuis ce panneau, un compte support ou administrateur autorisé peut :

- renvoyer les e-mails d’un ticket : notification interne vers `support@gts-connect.be` et confirmation au demandeur ;
- renvoyer une réponse support au demandeur.

Le renvoi manuel met à jour :

- `emailNotificationResentAt` et `emailNotificationResentBy` sur la demande ;
- `emailToRequesterResentAt` et `emailToRequesterResentBy` sur le message concerné.

## Rappel automatique des tickets en retard

La fonction planifiée `sendSupportOverdueDigest` s’exécute tous les jours à 08:00, heure de Bruxelles.

Elle envoie à `support@gts-connect.be` la liste des tickets ouverts dont `dueAt` est dépassé, puis écrit sur chaque ticket :

- `lastOverdueDigestAt` ;
- `lastOverdueDigestStatus` ;
- `lastOverdueDigestReason` si le mail n’est pas envoyé.

Un même ticket n’est pas remis dans le digest plus d’une fois par jour.

Depuis l’interface support, le bouton `Relancer SLA` déclenche `sendSupportOverdueDigestNow` et force un digest immédiat des tickets en retard.

## Rapport hebdomadaire support

La fonction planifiée `sendSupportWeeklyReport` s’exécute chaque lundi à 08:30, heure de Bruxelles.

Elle envoie à `support@gts-connect.be` :

- nombre total de tickets ;
- tickets ouverts, fermés/résolus, en retard, urgents et non assignés ;
- temps moyen de résolution ;
- satisfaction moyenne ;
- taux de respect SLA ;
- répartition par catégorie et priorité ;
- derniers tickets mis à jour.

Depuis l’interface support, le bouton `Rapport e-mail` déclenche `sendSupportWeeklyReportNow`.

La dernière exécution est écrite dans `supportReports/weekly`.

## Clôture automatique

La fonction planifiée `closeResolvedSupportTickets` s’exécute tous les jours à 07:45, heure de Bruxelles.

Elle passe automatiquement en `closed` les tickets restés en statut `resolved` depuis au moins 7 jours. Le ticket reçoit :

- `closedAt` ;
- `autoClosedAt` ;
- `autoClosedReason: resolved_7_days` ;
- une entrée dans `history`.

## Anonymisation RGPD support

La fonction planifiée `anonymizeClosedSupportTickets` s’exécute chaque lundi à 03:15, heure de Bruxelles.

Elle anonymise les tickets support fermés depuis plus de 12 mois :

- nom du demandeur remplacé par `Demandeur anonymisé` ;
- sujet et message masqués ;
- contexte et coordonnées vidés ;
- note interne vidée ;
- messages du ticket remplacés par un texte anonymisé ;
- `anonymizedAt` et `anonymizedReason: closed_12_months` ajoutés.

Depuis l’interface support, le bouton `Anonymiser anciens` déclenche `anonymizeClosedSupportTicketsNow`.
