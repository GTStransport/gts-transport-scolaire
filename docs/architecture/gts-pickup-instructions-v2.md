# Consignes De Prise En Charge GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

Le module **Consignes de prise en charge** définit les consignes opérationnelles du jour pour éviter qu'un élève soit pris en charge ou déposé au mauvais moment, au mauvais endroit, ou par mauvaise interprétation d'une information transmise hors GTS.

Principe officiel :

> Une consigne officielle visible au bon moment évite une erreur de prise en charge.

## 2. Problème Métier

Les consignes de transport circulent souvent par :

- téléphone ;
- mail ;
- WhatsApp ;
- relais chauffeur/convoyeuse ;
- message indirect via parent ou école ;
- note papier.

Cela crée des risques :

- élève pris alors qu'il ne doit pas monter ;
- élève déposé alors qu'un parent vient le chercher ;
- oubli d'une consigne liée à un congé pédagogique ;
- confusion entre semaine paire/impaire ;
- erreur lors d'un retour internat ;
- consigne non transmise à une remplaçante ;
- absence de preuve de diffusion.

GTS doit rendre la consigne officielle, ciblée, visible et traçable.

## 3. Rôle De La Consigne

Une consigne de prise en charge est une instruction opérationnelle applicable à :

- un élève ;
- une date ;
- une direction ;
- un trajet ;
- un circuit ;
- une école ;
- un transfert non PMR ;
- une période courte.

Elle ne remplace pas l'affectation normale de l'élève.

Elle indique ce qui doit être fait aujourd'hui ou pendant une période définie.

## 4. Types De Consignes

### Ne Pas Prendre Aujourd'hui

L'élève ne doit pas être pris en charge à la date indiquée.

Cas typiques :

- absence confirmée ;
- parent prévient que l'enfant ne prend pas le transport ;
- école fermée pour cet élève ;
- consigne SPW exceptionnelle.

### Reste À La Garderie

L'élève reste à la garderie ou dans un encadrement scolaire.

La consigne doit préciser :

- date ;
- direction concernée ;
- école ;
- heure ou période si utile ;
- personne ayant validé.

### Congé Pédagogique

L'école ou une classe est en congé pédagogique.

Impact possible :

- aucun transport matin ;
- aucun transport soir ;
- retour exceptionnel ;
- consigne valable pour plusieurs élèves.

### Parent Récupère L'Enfant

Un parent ou responsable vient chercher l'enfant.

La consigne doit préciser :

- parent concerné si nécessaire ;
- date ;
- école ou lieu ;
- direction concernée ;
- validation SPW si la situation est sensible.

### Retour Internat

La consigne indique un retour ou non-retour lié à l'internat.

Cas couverts :

- internat semaine complète ;
- retour chaque week-end ;
- retour un week-end sur deux ;
- garde alternée week-end ;
- élève majeur ou mineur.

### Garde Alternée Active

La consigne peut rappeler la résidence active calculée :

- semaine paire ;
- semaine impaire ;
- parent actif ;
- arrêt actif ;
- destination active.

Cette consigne ne doit pas dupliquer la logique `alternatingResidence`; elle l'affiche au bon moment.

### Consigne Exceptionnelle Validée SPW

Une consigne exceptionnelle validée par le SPW peut couvrir :

- changement ponctuel validé ;
- instruction de sécurité ;
- consigne de prise en charge spécifique ;
- restriction temporaire ;
- consigne liée à un dossier élève.

Elle doit être clairement identifiable comme validée SPW.

## 5. Priorité

Chaque consigne peut avoir une priorité :

- `normal` : information utile ;
- `important` : attention nécessaire ;
- `urgent` : action immédiate ou confirmation requise.

Une consigne urgente doit apparaître en haut du briefing du jour.

## 6. Visibilité Chauffeur

Le chauffeur voit uniquement les consignes liées :

- à son circuit du jour ;
- à ses trajets ;
- à son véhicule ;
- à ses élèves ;
- aux remplacements chauffeur qui le concernent ;
- aux transferts non PMR liés à son service.

Le chauffeur ne voit pas les consignes d'autres circuits.

## 7. Visibilité Convoyeuse

La convoyeuse voit uniquement les consignes liées :

- à son circuit du jour ;
- aux élèves qu'elle accompagne ;
- aux transferts non PMR de son service ;
- aux remplacements convoyeuse qui la concernent ;
- aux informations nécessaires à la prise en charge.

En cas de remplacement, l'accès est temporaire et limité à la période du remplacement.

## 8. Visibilité SPW

Le SPW voit l'ensemble des consignes liées :

- aux élèves ;
- aux écoles ;
- aux décisions officielles ;
- aux dossiers de suivi ;
- aux incidents ou mesures éventuelles ;
- aux consignes exceptionnelles.

Le SPW peut valider, corriger, archiver ou annuler une consigne selon les droits prévus.

## 9. Visibilité Transporteur

Le transporteur voit les consignes nécessaires à l'organisation du transport :

- circuit ;
- chauffeur ;
- véhicule ;
- horaire ;
- remplacement ;
- transfert non PMR ;
- information opérationnelle.

Le transporteur ne doit pas accéder aux détails sensibles non nécessaires.

## 10. Visibilité Parent

Le parent peut voir uniquement les consignes qui concernent son enfant et qui sont destinées aux parents.

Certaines consignes internes peuvent rester réservées :

- SPW ;
- chauffeur ;
- convoyeuse ;
- transporteur.

Une consigne parent doit être claire, limitée et non ambiguë.

## 11. Intégration Briefing Du Jour

Le briefing du jour doit afficher automatiquement les consignes pertinentes :

- en haut si urgence ;
- près de l'élève concerné ;
- dans le circuit concerné ;
- dans la liste des présences si la consigne impacte la prise en charge ;
- dans la vue remplaçant si un remplacement est actif.

Exemples dans le briefing :

```text
Ne pas prendre aujourd'hui - Élève absent confirmé
```

```text
Parent récupère l'enfant à l'école - Trajet retour annulé
```

```text
Semaine impaire - Parent actif : Papa - Arrêt actif : Jemeppe
```

## 12. Intégration Informations Officielles

Une consigne peut être liée à une information officielle.

Exemples :

- fermeture école ;
- congé pédagogique ;
- changement de procédure ;
- remplacement chauffeur ;
- consigne SPW exceptionnelle.

L'information officielle explique le contexte.

La consigne de prise en charge indique l'action concrète à faire.

## 13. Traçabilité

Chaque consigne doit conserver :

- auteur ;
- rôle auteur ;
- date de création ;
- date de validation ;
- validateur si applicable ;
- date ou période d'application ;
- destinataires ;
- consultations ;
- confirmations éventuelles ;
- modifications ;
- archivage ;
- annulation.

Les actions sensibles doivent être journalisées :

- création ;
- validation SPW ;
- modification ;
- annulation ;
- consultation ;
- confirmation par chauffeur ;
- confirmation par convoyeuse.

## 14. Sécurité Et RGPD

Principes :

- minimisation des données ;
- accès par rôle ;
- accès limité à la période utile ;
- support sans accès sensible par défaut ;
- parent limité à son enfant ;
- chauffeur limité à son service ;
- convoyeuse limitée à son service ;
- transporteur limité à son organisation ;
- SPW propriétaire des informations officielles liées aux élèves.

Les notifications push ne doivent pas contenir de donnée sensible.

Message push recommandé :

```text
Nouvelle consigne GTS à consulter.
```

Contenu complet uniquement après authentification.

## 15. Données Sensibles À Éviter

Une consigne ne doit pas exposer inutilement :

- données médicales détaillées ;
- diagnostic ;
- conflit familial ;
- décision disciplinaire détaillée ;
- information sur un autre élève ;
- coordonnées privées inutiles ;
- justification sensible non nécessaire à la prise en charge.

Si une information sensible est nécessaire, elle doit être limitée au strict besoin opérationnel.

## 16. Collections Futures Possibles

Collections candidates :

- `pickupInstructions` ;
- `pickupInstructionReadReceipts` ;
- `pickupInstructionLogs` ;
- `pickupInstructionTargets`.

Ces collections ne doivent pas être créées avant validation du modèle de données et des règles Firestore.

## 17. Statuts Possibles

Statuts recommandés :

- `draft` : brouillon ;
- `pending_spw_validation` : en attente de validation SPW ;
- `active` : active ;
- `cancelled` : annulée ;
- `expired` : expirée ;
- `archived` : archivée.

Une consigne expirée ne doit plus apparaître comme action du jour, mais peut rester dans l'historique.

## 18. Roadmap

1. Documentation officielle.
2. Modèle de données.
3. Helpers de ciblage.
4. Règles Firestore lecture seule.
5. Intégration briefing du jour lecture seule.
6. Création SPW.
7. Création transporteur limitée aux consignes opérationnelles.
8. Validation SPW pour consignes sensibles.
9. Accusés de lecture.
10. Notifications.
11. Archivage.

## 19. Principe Officiel

Une consigne officielle visible au bon moment dans GTS prime sur les relais informels.
