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

## 15. Gestion Des Remplacements Convoyeuses

### 15.1 Problème Métier

Lorsqu'une convoyeuse est absente, une convoyeuse de remplacement peut être affectée au dernier moment.

Problèmes constatés :

- la remplaçante ne reçoit pas toujours les documents à temps ;
- elle ne connaît pas les élèves ;
- elle ne connaît pas les absences signalées ;
- elle ne connaît pas les consignes du jour ;
- elle peut arriver sans aucune information utile.

GTS doit éviter qu'une convoyeuse remplaçante arrive sur un circuit sans les informations minimales nécessaires à la prise en charge.

### 15.2 Objectif

Lorsqu'une convoyeuse de remplacement est affectée à un circuit, GTS doit lui donner automatiquement :

- accès à la liste des élèves du jour ;
- accès à la feuille de présence numérique ;
- accès au chauffeur avec qui elle travaille ;
- accès aux informations ciblées concernant le circuit ;
- accès aux consignes utiles du jour ;
- accès aux transferts du jour si concernés ;
- accès aux informations nécessaires à la prise en charge.

Le chauffeur concerné doit être informé automatiquement du remplacement et voir la convoyeuse avec qui il travaille pendant la période concernée.

L'accès doit rester temporaire, limité et tracé.

### 15.3 Workflow SPW

Le SPW peut affecter une convoyeuse de remplacement à un circuit.

Étapes recommandées :

1. choisir la date ;
2. choisir le circuit ;
3. choisir la convoyeuse absente ;
4. choisir la convoyeuse remplaçante ;
5. définir la période de remplacement ;
6. valider l'accès temporaire.

Après validation, GTS prépare automatiquement les droits temporaires nécessaires.

GTS doit aussi préparer la visibilité temporaire entre le chauffeur concerné et la convoyeuse remplaçante.

Le SPW peut aussi révoquer manuellement l'accès si le remplacement est annulé.

### 15.4 Workflow Convoyeuse Remplaçante

La convoyeuse remplaçante ouvre GTS.

Elle voit uniquement :

- le circuit concerné ;
- la date concernée ;
- la liste des élèves du jour ;
- la feuille de présence numérique ;
- les absences déjà signalées ;
- les consignes ciblées du jour ;
- les transferts concernés si le circuit passe par un transfert ;
- le chauffeur avec qui elle travaille ;
- les informations nécessaires à la prise en charge.

Elle ne voit pas :

- les autres circuits ;
- les autres élèves ;
- les informations hors période ;
- le répertoire global des chauffeurs ou convoyeuses ;
- les données sensibles non nécessaires.

### 15.5 Workflow Chauffeur Concerné

Lorsqu'une convoyeuse remplaçante est affectée, le chauffeur concerné doit être informé automatiquement.

Il voit temporairement :

- la convoyeuse remplaçante avec qui il travaille ;
- son rôle ;
- son téléphone professionnel si disponible ;
- le circuit concerné ;
- l'horaire de service.

Il ne voit pas :

- le répertoire global des convoyeuses ;
- les convoyeuses hors circuit ;
- les informations hors période de remplacement.

### 15.6 Droits Temporaires

Les droits de remplacement doivent être bornés.

Champs recommandés pour un futur modèle de remplacement :

```json
{
  "replacementAssistantId": "assistant-remplacement",
  "originalAssistantId": "assistant-absente",
  "driverId": "driver-1",
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

Règles :

- accès limité au circuit concerné ;
- accès limité à la date ou période du remplacement ;
- partage des contacts limité au chauffeur et à la convoyeuse remplaçante concernés ;
- révocation automatique à `endsAt` ;
- révocation manuelle possible par SPW ;
- aucun accès permanent ajouté sans validation SPW.

### 15.7 Données De Contact Visibles Temporairement

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
- au chauffeur concerné ;
- à la convoyeuse remplaçante concernée.

Après la fin du remplacement, l'accès doit être révoqué automatiquement.

### 15.8 Sécurité

Principes de sécurité :

- la remplaçante n'obtient pas un accès global transporteur ;
- l'accès ne doit pas être basé uniquement sur `transportManagerId` ;
- l'accès doit être lié au circuit, à la date et à la période ;
- le partage de contact est limité au binôme chauffeur / convoyeuse remplaçante ;
- pas de partage global du répertoire ;
- révocation automatique après la fin du remplacement ;
- les données médicales restent minimisées ;
- le support n'a pas d'accès direct aux contenus sensibles ;
- le parent ne voit pas les informations de remplacement internes.

La convoyeuse remplaçante peut consulter uniquement les données nécessaires à l'exécution du remplacement.

### 15.9 Traçabilité

Toute attribution de remplacement doit être journalisée.

Actions à tracer :

- création du remplacement ;
- activation des droits temporaires ;
- première consultation par la remplaçante ;
- notification automatique du chauffeur ;
- notification automatique de la convoyeuse remplaçante ;
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
  "assistantId": "assistant-remplacement",
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

### 15.10 Impact Sur La Feuille De Présence

La feuille de présence numérique doit accepter une convoyeuse titulaire ou remplaçante.

Champs utiles :

```json
{
  "assistantId": "assistant-remplacement",
  "originalAssistantId": "assistant-absente",
  "driverId": "driver-1",
  "replacement": true,
  "replacementReason": "absence",
  "validatedAt": "Timestamp"
}
```

La présence reste simple :

```txt
Présent
Absent
```

La remplaçante ne doit pas encoder plus d'informations qu'une convoyeuse titulaire.

### 15.11 Impact Sur La Diffusion Ciblée D'Informations

La diffusion ciblée doit inclure automatiquement la convoyeuse remplaçante pendant la période active.

Elle doit notifier automatiquement :

- le chauffeur concerné ;
- la convoyeuse remplaçante.

La convoyeuse remplaçante doit recevoir :

- informations du circuit ;
- consignes SPW liées au circuit ;
- informations de transfert si concernée ;
- retards ou changements de trajet ;
- incidents utiles à la prise en charge.

Le chauffeur doit recevoir :

- information qu'une convoyeuse remplaçante est affectée ;
- prénom/nom de la convoyeuse remplaçante ;
- téléphone professionnel si disponible ;
- circuit concerné ;
- horaire de service.

Elle ne doit plus recevoir ces informations après la fin du remplacement.

Les destinataires calculés doivent donc tenir compte :

- des `assistantIds` titulaires ;
- des remplaçantes actives ;
- du chauffeur concerné ;
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
