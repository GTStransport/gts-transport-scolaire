# GTS Student Attendance V2

Architecture validée le 17/06/2026

## 1. Problème Métier

Aujourd'hui, les convoyeuses utilisent des feuilles papier de présence.

Ces feuilles peuvent :

- arriver tard ;
- être incomplètes ;
- être perdues ;
- être difficiles à relire ;
- nécessiter un encodage manuel par le SPW ;
- compliquer le suivi mensuel des présences ;
- créer un décalage entre le terrain et l'administration.

Le SPW doit ensuite encoder, vérifier ou consolider les informations.

Ce fonctionnement augmente :

- le risque d'erreur ;
- la charge administrative ;
- le délai de traitement ;
- la difficulté à produire un récapitulatif fiable.

## 2. Objectif

Remplacer les feuilles papier par une saisie numérique très simple.

La convoyeuse ouvre son circuit du jour et indique uniquement :

```txt
Présent
Absent
```

La convoyeuse ne doit pas encoder :

- monté ;
- descendu ;
- heure de montée ;
- heure de descente.

Le système doit rester volontairement simple.

Objectif UX :

```txt
Une convoyeuse doit pouvoir encoder tout un circuit en moins d'une minute.
```

## 3. Principe Métier

La présence GTS V2 répond uniquement à la question :

```txt
L'élève prévu sur ce circuit est-il présent ou absent ?
```

Il ne s'agit pas :

- d'un suivi de géolocalisation ;
- d'un pointage horaire détaillé ;
- d'un contrôle montée/descente ;
- d'un journal complet de trajet.

La donnée attendue est binaire :

```txt
present
absent
```

## 4. Workflow Convoyeuse

### Ouverture

La convoyeuse ouvre GTS.

Elle voit :

- son circuit du jour ;
- le sens du trajet si nécessaire ;
- la liste des élèves attendus ;
- les éventuelles absences déjà signalées.

### Saisie

Pour chaque élève :

```txt
[Présent] [Absent]
```

La valeur par défaut recommandée est :

```txt
Non validé
```

La convoyeuse valide rapidement chaque élève.

### Validation

Une action finale peut être proposée :

```txt
Valider le circuit
```

Cette action marque le circuit comme vérifié par la convoyeuse.

### Correction

Avant synchronisation complète, une correction locale peut être possible.

Après synchronisation, une correction doit rester possible mais tracée.

## 5. Workflow SPW

Le SPW consulte les présences :

- par date ;
- par circuit ;
- par école ;
- par élève ;
- par transporteur ;
- par mois.

Le SPW peut :

- vérifier les circuits non validés ;
- consulter les absences ;
- corriger une présence si nécessaire ;
- exporter un PDF mensuel ;
- produire des statistiques.

Le SPW garde la responsabilité administrative finale.

## 6. Données Minimales À Enregistrer

Collection future possible :

```txt
studentAttendance
```

Aucune collection n'est créée dans cette phase documentaire.

Champs minimaux recommandés :

```json
{
  "id": "attendance-2026-06-17-child-123-circuit-4104",
  "date": "2026-06-17",
  "studentId": "child-123",
  "studentName": "Nom Prénom",
  "circuitId": "circuit-4104",
  "circuitLabel": "4104",
  "direction": "morning",
  "status": "present",
  "assistantId": "assistant-1",
  "assistantName": "Convoyeuse Nom",
  "validatedAt": "Timestamp",
  "transportManagerId": "tm-1",
  "schoolId": "school-1",
  "source": "assistant",
  "syncStatus": "synced",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

Valeurs autorisées pour `status` :

```txt
present
absent
unvalidated
```

Champs obligatoires :

- `date` ;
- `studentId` ;
- `circuitId` ;
- `status` ;
- `assistantId` ;
- `validatedAt` ;
- `transportManagerId`.

Champs optionnels utiles :

- `direction` ;
- `schoolId` ;
- `studentName` ;
- `circuitLabel` ;
- `assistantName` ;
- `notes` ;
- `correctedBy` ;
- `correctedAt` ;
- `correctionReason`.

## 7. Fonctionnement Hors Ligne

La saisie de présence doit fonctionner sans connexion stable.

Principe :

1. La convoyeuse ouvre son circuit du jour.
2. Les élèves attendus sont disponibles localement.
3. Elle encode présent/absent.
4. Les données sont mises en file locale.
5. GTS synchronise dès que la connexion revient.

Statuts de synchronisation :

```txt
pending
synced
conflict
failed
```

L'écran doit afficher clairement :

- données enregistrées localement ;
- synchronisation en attente ;
- synchronisation réussie ;
- conflit à vérifier.

## 8. Synchronisation

Chaque présence doit être idempotente.

Identifiant recommandé :

```txt
attendance-{date}-{studentId}-{circuitId}-{direction}
```

Cela évite les doublons en cas de reconnexion ou de double clic.

Règle :

- une présence par élève ;
- par date ;
- par circuit ;
- par sens si le matin et le soir sont séparés.

En cas de conflit :

- conserver la dernière validation horodatée ;
- conserver l'historique ;
- afficher au SPW si correction nécessaire.

## 9. Historique

Toute modification doit être tracée.

Historique recommandé :

```json
{
  "action": "status_changed",
  "from": "unvalidated",
  "to": "present",
  "actorId": "assistant-1",
  "actorRole": "assistant",
  "at": "Timestamp"
}
```

Actions à journaliser :

- création ;
- validation présent ;
- validation absent ;
- correction ;
- synchronisation ;
- conflit ;
- validation SPW.

L'historique peut être stocké :

- dans un champ `history[]` si faible volume ;
- dans une sous-collection si le volume devient important.

## 10. Export PDF Mensuel

Le SPW doit pouvoir générer un PDF mensuel.

Filtres :

- mois ;
- école ;
- circuit ;
- transporteur ;
- élève ;
- statut.

Contenu recommandé :

```txt
Élève
Circuit
Date
Présent / absent
Convoyeuse
Validation
Correction éventuelle
```

Le PDF doit rester administratif et lisible.

Il ne doit pas contenir de données médicales ou détails sensibles inutiles.

## 11. Statistiques De Présence

Statistiques utiles :

- nombre de présences ;
- nombre d'absences ;
- taux de présence ;
- circuits non validés ;
- élèves souvent absents ;
- absences par école ;
- absences par transporteur ;
- validation en retard.

Exemples :

```txt
Circuit 4104 - juin 2026
Présents : 312
Absents : 18
Non validés : 2
Taux de présence : 94,5 %
```

Les statistiques doivent être accessibles au SPW.

Le transporteur peut voir les statistiques de son périmètre si validé.

## 12. Sécurité Et RGPD

La présence est une donnée personnelle liée à un élève.

Principes :

- minimisation ;
- finalité transport scolaire ;
- accès limité par rôle ;
- traçabilité ;
- conservation maîtrisée ;
- pas de données médicales dans la présence.

Règles :

- parent ne voit que la présence de son enfant si cette fonctionnalité est activée ;
- chauffeur ne voit que les élèves de ses circuits ;
- convoyeuse ne voit que les élèves de ses circuits ;
- transporteur voit uniquement son périmètre ;
- SPW supervise ;
- support n'a aucun accès direct aux présences élève.

Notifications :

- éviter les push automatiques aux parents pour chaque absence sans politique validée ;
- si push activé, ne pas inclure de détail sensible ;
- contenu complet uniquement après authentification.

Durée de conservation recommandée :

- année scolaire courante ;
- archivage administratif selon règle SPW ;
- suppression ou anonymisation après durée définie.

## 13. Impact Sur Les Rôles

### Convoyeuse

Peut :

- voir son circuit du jour ;
- voir les élèves prévus ;
- encoder `present` ou `absent` ;
- synchroniser hors ligne ;
- corriger avec trace si autorisé.

Ne peut pas :

- modifier l'affectation ;
- modifier la fiche élève ;
- encoder des données médicales ;
- voir les circuits non concernés.

### Chauffeur

Peut :

- consulter les présences de son circuit si nécessaire terrain ;
- voir les absences utiles au trajet.

Ne doit pas :

- modifier les présences si la responsabilité est confiée à la convoyeuse.

### SPW

Peut :

- consulter toutes les présences ;
- corriger ;
- valider administrativement ;
- exporter PDF ;
- consulter statistiques.

### Transporteur

Peut :

- consulter les présences de son périmètre ;
- identifier les circuits non validés ;
- suivre l'exploitation.

Ne peut pas :

- modifier les données officielles élève ;
- modifier le référentiel convoyeuses ;
- accéder hors périmètre.

### Parent

Accès optionnel.

Si activé :

- voit uniquement les présences de son enfant ;
- ne voit jamais les autres élèves.

### Support

Pas d'accès direct aux présences.

Peut éventuellement voir :

- statut technique de synchronisation ;
- erreur non sensible ;
- horodatage technique.

## 14. UI Prévue

### Écran Convoyeuse

Premier écran attendu :

```txt
Circuit 4104 - Aujourd'hui

Élève 1    [Présent] [Absent]
Élève 2    [Présent] [Absent]
Élève 3    [Présent] [Absent]

Présents : 2
Absents : 1
Non validés : 0

[Valider le circuit]
```

Priorités UX :

- boutons très visibles ;
- pas de champs horaires ;
- pas de formulaire long ;
- mode mobile prioritaire ;
- fonctionnement hors ligne ;
- validation rapide.

### Écran SPW

Vue administrative :

- filtres ;
- tableau mensuel ;
- circuits non validés ;
- export PDF ;
- statistiques.

## 15. Gestion Des Remplacements D'Équipage

### 15.1 Problème Métier

Lorsqu'un membre de l'équipage est absent, un remplacement peut être affecté au dernier moment.

Problèmes constatés :

- le remplaçant ou la remplaçante ne reçoit pas toujours les documents à temps ;
- il ou elle ne connaît pas les élèves ;
- il ou elle ne connaît pas les absences signalées ;
- il ou elle ne connaît pas les consignes du jour ;
- il ou elle peut arriver sans aucune information utile.

GTS doit éviter qu'un remplaçant arrive sur un circuit sans les informations minimales nécessaires à la prise en charge.

### 15.2 Règles Métier

Un chauffeur titulaire est attribué à un circuit ou à un car.

Les chauffeurs volants ne sont attribués à aucun car fixe.

Un chauffeur volant intervient uniquement lorsqu'un chauffeur titulaire est absent.

Le remplacement chauffeur ne doit pas être confondu avec le remplacement convoyeuse.

### 15.3 Cas 1 : Convoyeuse Absente

Cas métier :

- un chauffeur a déjà son circuit attribué ;
- une convoyeuse titulaire est prévue sur ce même circuit ;
- si la convoyeuse titulaire est absente, le SPW affecte une convoyeuse remplaçante sur ce même circuit ;
- le chauffeur reste sur son circuit ;
- seule la convoyeuse affectée au circuit change temporairement.

Conséquence :

- aucun accès à d'autres circuits ne doit être créé ;
- aucun changement d'affectation chauffeur ne doit être créé ;
- aucun transfert de circuit ne doit être déduit du remplacement ;
- la remplaçante reçoit uniquement les informations du circuit concerné.

### 15.4 Cas 2 : Chauffeur Absent

Cas métier :

- un chauffeur titulaire est prévu sur le circuit ou le car ;
- le chauffeur titulaire est absent ;
- un chauffeur volant remplace temporairement le chauffeur titulaire ;
- la convoyeuse prévue reste normalement la même ;
- le chauffeur volant reçoit les informations du circuit concerné ;
- le chauffeur volant reçoit un accès temporaire uniquement pour la période du remplacement ;
- le chauffeur titulaire ne doit pas être supprimé du circuit ;
- le chauffeur titulaire est seulement remplacé temporairement.

Conséquence :

- aucun changement définitif du circuit ne doit être créé ;
- aucun nouveau circuit ne doit être attribué au chauffeur volant ;
- le chauffeur volant ne reçoit pas d'accès global transporteur ;
- la convoyeuse prévue doit voir le chauffeur volant avec qui elle travaille pendant la période concernée.

### 15.5 Cas 3 : Chauffeur Et Convoyeuse Absents

Cas métier :

- le chauffeur titulaire est absent ;
- la convoyeuse titulaire est absente ;
- un chauffeur volant est affecté ;
- une convoyeuse remplaçante est affectée ;
- les deux remplaçants interviennent sur le même circuit ;
- les deux reçoivent les informations du même circuit ;
- les contacts sont partagés uniquement entre les personnes affectées au remplacement.

Conséquence :

- aucun accès à d'autres circuits ne doit être créé ;
- les droits temporaires concernent uniquement le circuit, la date et la période définis ;
- les titulaires ne sont pas supprimés du circuit ;
- les remplaçants cessent d'avoir accès à la fin du remplacement.

### 15.6 Objectif

Lorsqu'un remplacement est affecté à un circuit, GTS doit donner automatiquement au remplaçant :

- accès à la liste des élèves du jour ;
- accès à la feuille de présence numérique ;
- accès à la personne avec qui il travaille sur le circuit ;
- accès aux informations ciblées concernant le circuit ;
- accès aux consignes utiles du jour ;
- accès aux transferts du jour si concernés ;
- accès aux informations nécessaires à la prise en charge.

Les membres d'équipage concernés doivent être informés automatiquement du remplacement.

L'accès doit rester temporaire, limité et tracé.

### 15.7 Workflow SPW

Le SPW peut affecter un remplacement à un circuit existant.

Étapes recommandées :

1. choisir la date ;
2. choisir le circuit concerné ;
3. indiquer le type de remplacement : chauffeur, convoyeuse ou les deux ;
4. choisir le titulaire absent ;
5. choisir le remplaçant ;
6. définir la période de remplacement ;
7. valider l'accès temporaire.

Après validation, GTS prépare automatiquement les droits temporaires nécessaires.

Le circuit reste inchangé.

GTS prépare aussi la visibilité temporaire entre les personnes qui travaillent ensemble sur ce circuit pendant le remplacement.

Le SPW peut aussi révoquer manuellement l'accès si le remplacement est annulé.

### 15.8 Workflow Convoyeuse Remplaçante

La convoyeuse remplaçante ouvre GTS.

Elle voit uniquement :

- le circuit concerné ;
- la date concernée ;
- la liste des élèves du jour ;
- la feuille de présence numérique ;
- les absences déjà signalées ;
- les consignes ciblées du jour ;
- les transferts concernés si le circuit passe par un transfert ;
- le chauffeur titulaire ou volant avec qui elle travaille ;
- les informations nécessaires à la prise en charge.

Elle ne voit pas :

- les autres circuits ;
- les autres élèves ;
- les informations hors période ;
- le répertoire global des chauffeurs ou convoyeuses ;
- les données sensibles non nécessaires.

### 15.9 Workflow Chauffeur Titulaire Concerné

Lorsqu'une convoyeuse remplaçante est affectée, le chauffeur titulaire concerné doit être informé automatiquement.

Il reste sur son circuit attribué.

Il voit temporairement :

- la convoyeuse remplaçante avec qui il travaille ;
- son rôle ;
- son téléphone professionnel si disponible ;
- le circuit concerné ;
- l'horaire de service.

Il ne voit pas :

- le répertoire global des convoyeuses ;
- les convoyeuses hors circuit ;
- les autres circuits ;
- les informations hors période de remplacement.

### 15.10 Workflow Chauffeur Volant

Lorsqu'un chauffeur titulaire est absent, le chauffeur volant ouvre GTS.

Il voit uniquement :

- le circuit concerné ;
- la date concernée ;
- la liste des élèves du jour ;
- les absences déjà signalées ;
- les consignes ciblées du jour ;
- les transferts concernés si le circuit passe par un transfert ;
- la convoyeuse prévue ou remplaçante avec qui il travaille ;
- les informations nécessaires à la prise en charge.

Il ne voit pas :

- les autres circuits ;
- les autres élèves ;
- les informations hors période ;
- le répertoire global des chauffeurs ou convoyeuses ;
- les données sensibles non nécessaires.

Le chauffeur volant n'est pas ajouté comme chauffeur titulaire du circuit.

### 15.11 Droits Temporaires

Les droits de remplacement doivent être bornés.

Champs recommandés pour un futur modèle de remplacement :

```json
{
  "replacementType": "assistant",
  "replacementAssistantId": "assistant-remplacement",
  "originalAssistantId": "assistant-absente",
  "replacementDriverId": "",
  "originalDriverId": "driver-1",
  "circuitId": "circuit-4104",
  "date": "2026-06-17",
  "startsAt": "2026-06-17T06:00:00.000Z",
  "endsAt": "2026-06-17T18:00:00.000Z",
  "transportManagerId": "tm-1",
  "createdBy": "spw-1",
  "createdByRole": "spw",
  "active": true
}
```

Valeurs possibles de `replacementType` :

```txt
assistant
driver
driver_and_assistant
```

Règles :

- accès limité au circuit concerné ;
- accès limité à la date ou période du remplacement ;
- partage des contacts limité aux personnes affectées au remplacement ;
- aucun accès à d'autres circuits ;
- aucun changement définitif de circuit chauffeur ;
- aucun changement définitif de convoyeuse titulaire ;
- aucun remplaçant ne devient titulaire par ce mécanisme ;
- aucun accès global transporteur ;
- révocation automatique à `endsAt` ;
- révocation manuelle possible par SPW ;
- aucun accès permanent ajouté sans validation SPW.

### 15.12 Données De Contact Visibles Temporairement

Les contacts utiles peuvent être partagés uniquement pendant la période du remplacement.

Données visibles temporairement :

- prénom/nom ;
- rôle ;
- téléphone professionnel si disponible ;
- circuit concerné ;
- horaire de service.

Ces données ne doivent pas créer un accès global au répertoire.

Elles doivent être limitées :

- au circuit concerné ;
- à la date ou période du remplacement ;
- au chauffeur titulaire ou volant concerné ;
- à la convoyeuse titulaire ou remplaçante concernée.

Après la fin du remplacement, l'accès doit être révoqué automatiquement.

### 15.13 Sécurité

Principes de sécurité :

- un remplaçant n'obtient pas un accès global transporteur ;
- l'accès ne doit pas être basé uniquement sur `transportManagerId` ;
- l'accès doit être lié au circuit, à la date et à la période ;
- le chauffeur titulaire conserve son circuit attribué sauf absence temporaire ;
- le chauffeur volant ne devient pas titulaire du circuit ;
- la convoyeuse titulaire n'est pas supprimée du circuit en cas de remplacement ;
- le remplacement ne crée aucun accès à d'autres circuits ;
- le partage de contact est limité aux personnes affectées au remplacement ;
- pas de partage global du répertoire ;
- révocation automatique après la fin du remplacement ;
- les données médicales restent minimisées ;
- le support n'a pas d'accès direct aux contenus sensibles ;
- le parent ne voit pas les informations de remplacement internes.

Le remplaçant peut consulter uniquement les données nécessaires à l'exécution du remplacement.

### 15.14 Traçabilité

Toute attribution de remplacement doit être journalisée.

Actions à tracer :

- création du remplacement ;
- activation des droits temporaires ;
- type de remplacement ;
- confirmation que les titulaires ne sont pas supprimés du circuit ;
- première consultation par le remplaçant ;
- notification automatique des personnes concernées ;
- accès aux coordonnées temporaires ;
- validation de présence ;
- modification de présence ;
- révocation automatique ;
- révocation manuelle ;
- conflit de synchronisation éventuel.

Exemple d'historique :

```json
{
  "action": "replacement_access_granted",
  "replacementType": "assistant",
  "assistantId": "assistant-remplacement",
  "driverId": "driver-1",
  "circuitId": "circuit-4104",
  "date": "2026-06-17",
  "actorId": "spw-1",
  "actorRole": "spw",
  "at": "Timestamp"
}
```

Exemple d'accès contact :

```json
{
  "action": "replacement_contact_accessed",
  "viewerId": "driver-1",
  "viewedUserId": "assistant-remplacement",
  "circuitId": "circuit-4104",
  "date": "2026-06-17",
  "at": "Timestamp"
}
```

### 15.15 Impact Sur La Feuille De Présence

La feuille de présence numérique doit accepter :

- une convoyeuse titulaire ;
- une convoyeuse remplaçante ;
- un chauffeur titulaire ;
- un chauffeur volant.

Champs utiles :

```json
{
  "assistantId": "assistant-remplacement",
  "originalAssistantId": "assistant-absente",
  "driverId": "driver-volant",
  "originalDriverId": "driver-titulaire",
  "replacement": true,
  "replacementType": "driver_and_assistant",
  "replacementReason": "absence_equipage",
  "validatedAt": "Timestamp"
}
```

La présence reste simple :

```txt
Présent
Absent
```

Le remplacement ne change pas la simplicité de saisie.

La convoyeuse titulaire ou remplaçante ne doit pas encoder plus d'informations.

### 15.16 Impact Sur La Diffusion Ciblée D'Informations

La diffusion ciblée doit inclure automatiquement les remplaçants pendant la période active.

Elle doit notifier automatiquement :

- le chauffeur titulaire si une convoyeuse remplaçante est affectée ;
- la convoyeuse titulaire si un chauffeur volant est affecté ;
- le chauffeur volant ;
- la convoyeuse remplaçante.

La convoyeuse remplaçante ou le chauffeur volant doit recevoir :

- informations du circuit ;
- consignes SPW liées au circuit ;
- informations de transfert si concernée ;
- retards ou changements de trajet ;
- incidents utiles à la prise en charge.

Le chauffeur titulaire doit recevoir, en cas de remplacement convoyeuse :

- information qu'une convoyeuse remplaçante est affectée ;
- prénom/nom de la convoyeuse remplaçante ;
- téléphone professionnel si disponible ;
- circuit concerné ;
- horaire de service.

La convoyeuse titulaire doit recevoir, en cas de remplacement chauffeur :

- information qu'un chauffeur volant est affecté ;
- prénom/nom du chauffeur volant ;
- téléphone professionnel si disponible ;
- circuit concerné ;
- horaire de service.

Les notifications doivent préciser le cas métier :

- convoyeuse absente : le chauffeur reste sur son circuit, seule la convoyeuse change temporairement ;
- chauffeur absent : le chauffeur volant remplace temporairement le titulaire, la convoyeuse prévue reste normalement la même ;
- chauffeur et convoyeuse absents : les deux remplaçants sont affectés sur le même circuit.

Les remplaçants ne doivent plus recevoir ces informations après la fin du remplacement.

Les destinataires calculés doivent donc tenir compte :

- des `assistantIds` titulaires ;
- des `driverIds` titulaires ;
- des remplaçantes actives ;
- des chauffeurs volants actifs ;
- de la date ;
- du circuit ;
- du transfert éventuel.

Toute notification liée au remplacement doit être tracée dans l'historique ou dans `deliveryLogs`.

## 16. Roadmap

### Phase 1 : Documentation

Formaliser le modèle simplifié.

### Phase 2 : Helpers Mémoire

Préparer :

- liste élèves attendus par circuit ;
- statut par défaut `unvalidated` ;
- génération d'identifiants idempotents.

### Phase 3 : Lecture Seule

Afficher la feuille numérique sans écriture.

### Phase 4 : Écriture Contrôlée

Autoriser la convoyeuse à enregistrer uniquement :

```txt
present
absent
```

### Phase 5 : Hors Ligne

Ajouter :

- file locale ;
- synchronisation ;
- conflit ;
- indicateurs visuels.

### Phase 6 : SPW

Ajouter :

- correction ;
- validation ;
- export PDF ;
- statistiques.

### Phase 7 : Remplacements Convoyeuses

Ajouter :

- affectation temporaire par SPW ;
- accès borné par circuit et date ;
- révocation automatique ;
- journalisation ;
- intégration dans la feuille de présence ;
- intégration dans la diffusion ciblée.

### Phase 8 : RGPD Et Archivage

Définir :

- durée de conservation ;
- archivage ;
- anonymisation éventuelle.

## 17. Recommandation Officielle

Le modèle GTS V2 de présence doit rester volontairement minimal.

Décision officielle :

```txt
La convoyeuse encode uniquement Présent ou Absent.
```

Ne pas ajouter :

- heure de montée ;
- heure de descente ;
- montée ;
- descente ;
- géolocalisation ;
- justification médicale.

Cette simplicité est une condition de réussite terrain.
