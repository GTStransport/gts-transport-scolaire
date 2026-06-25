# Présences Numériques GTS V2

Architecture validée le 17/06/2026

## 1. Objectif

Le module **Présences Numériques GTS V2** remplace les feuilles papier utilisées par les convoyeuses pour signaler la présence ou l'absence des élèves dans le transport scolaire.

Principe fondamental :

> Une présence est encodée une seule fois et réutilisée partout.

Le module doit rester volontairement simple.

La convoyeuse encode uniquement :

- `present` : présent ;
- `absent` : absent.

GTS ne doit pas demander :

- monté ;
- descendu ;
- pris en charge ;
- heure de montée ;
- heure de descente.

Le but est uniquement de savoir si l'élève était présent dans le transport.

## 2. Contexte Métier

Aujourd'hui, les convoyeuses utilisent des feuilles papier de présence.

Problèmes constatés :

- retard de transmission ;
- perte de documents ;
- remplaçantes sans feuille ;
- double encodage ;
- contrôle compliqué ;
- absence de visibilité en temps réel ;
- suivi mensuel lent pour le SPW.

Le numérique doit réduire la charge administrative sans complexifier le travail terrain.

## 3. Qui Encode

### Convoyeuse Titulaire

La convoyeuse titulaire encode les présences des élèves de son circuit.

Elle voit uniquement :

- son circuit du jour ;
- les élèves attendus ;
- les absences déjà signalées ;
- les consignes utiles ;
- les informations nécessaires à l'encodage.

### Convoyeuse Remplaçante

Une convoyeuse remplaçante peut encoder les présences si elle est affectée temporairement au circuit.

Conditions :

- remplacement actif ;
- accès limité au circuit concerné ;
- accès limité à la date ou période du remplacement ;
- révocation automatique après remplacement ;
- journalisation de l'accès et de la validation.

La remplaçante ne reçoit pas un accès global aux autres circuits.

### Chauffeur

Le chauffeur ne doit normalement pas encoder les présences.

Il peut voir l'état de validation si nécessaire au suivi du circuit, mais l'encodage reste le rôle de la convoyeuse.

## 4. Quand Encoder

### Matin

La convoyeuse encode la présence des élèves attendus sur le trajet matin.

Cas typiques :

- élève présent à l'arrêt ou au domicile ;
- élève absent ;
- absence déjà déclarée par parent/SPW ;
- consigne "ne pas prendre aujourd'hui".

### Soir

La convoyeuse encode la présence des élèves attendus sur le trajet retour.

Cas typiques :

- élève présent au départ école ;
- élève absent car parent récupère ;
- élève reste à la garderie ;
- congé pédagogique ;
- consigne SPW exceptionnelle.

### Internat

L'encodage doit tenir compte du mode internat :

- internat semaine complète ;
- internat continu ;
- retour chaque week-end ;
- retour un week-end sur deux ;
- retour selon garde alternée.

Un élève non attendu à cause de l'internat ne doit pas apparaître comme absence à encoder.

### Retour Week-End

Pour les retours week-end, la présence est encodée uniquement si l'élève est attendu dans le transport.

Si le week-end dépend de la garde alternée :

- afficher le parent actif ;
- afficher la destination active ;
- afficher la semaine active si utile.

## 5. Affichage

La feuille numérique affiche une liste courte et claire.

### Liste Élèves Attendus

Pour chaque élève :

- nom ;
- prénom ;
- arrêt actif ou domicile ;
- école ;
- direction : matin ou soir ;
- indicateurs utiles : PMR, internat, garde alternée, nouvel élève ;
- boutons `Présent` / `Absent`.

### Absences Déjà Signalées

Les absences déjà connues doivent apparaître clairement.

Exemples :

- absence parent déclarée ;
- absence SPW ;
- congé pédagogique ;
- parent récupère ;
- ne pas prendre aujourd'hui.

Une absence déjà signalée peut être préremplie comme `absent`, selon validation métier.

### Nouveaux Élèves

Les nouveaux élèves doivent être visibles avec un badge.

Objectif :

- éviter un oubli ;
- attirer l'attention d'une remplaçante ;
- aider l'équipage à vérifier la prise en charge.

### Garde Alternée

Si la garde alternée influence le trajet du jour, afficher :

- semaine active ;
- parent actif ;
- arrêt actif ;
- destination active.

La feuille de présence ne calcule pas une logique parallèle : elle réutilise la résidence active officielle.

## 6. Intégration Briefing Du Jour

Le module présence est intégré au briefing du jour.

Le briefing affiche :

- élèves attendus ;
- absences déjà signalées ;
- consignes de prise en charge ;
- nouveaux élèves ;
- garde alternée active ;
- internat ;
- bouton d'accès rapide à la feuille de présence.

La convoyeuse doit pouvoir encoder tout un circuit en moins d'une minute.

## 7. PDF Mensuel Automatique SPW

Le SPW doit pouvoir générer automatiquement un PDF mensuel.

Contenu recommandé :

- mois ;
- transporteur ;
- circuit ;
- école ;
- élève ;
- dates de transport ;
- présent / absent ;
- convoyeuse ayant validé ;
- date de validation ;
- corrections éventuelles ;
- taux de présence.

Objectif :

- remplacer les feuilles papier ;
- faciliter le contrôle ;
- éviter le double encodage ;
- conserver une preuve mensuelle.

Le PDF doit être généré depuis les données validées, pas depuis une seconde source.

## 8. Contrôles Et Corrections

### Validation Initiale

La convoyeuse valide la feuille du circuit.

Champs minimum :

- date ;
- direction ;
- circuit ;
- élève ;
- statut : présent ou absent ;
- convoyeuse ;
- date de validation.

### Correction

Une correction doit être possible selon règles métier.

Principes :

- correction journalisée ;
- ancienne valeur conservée ;
- auteur de la correction enregistré ;
- motif recommandé ;
- SPW peut superviser ;
- transporteur peut voir selon son périmètre.

### Verrouillage

Après une période définie, les présences peuvent être verrouillées.

Exemple :

- correction libre le jour même ;
- correction encadrée après validation ;
- clôture mensuelle SPW.

## 9. Cas Particuliers

### Internat

Un élève en internat ne doit apparaître que lorsqu'il est réellement attendu.

Cas :

- pas attendu en semaine ;
- attendu le vendredi ;
- attendu un week-end sur deux ;
- destination selon parent actif.

### Garde Alternée

La présence doit suivre l'arrêt ou la destination active.

Exemples :

- semaine paire : maman ;
- semaine impaire : papa ;
- vendredi différent selon parent actif.

### Congé Pédagogique

Si l'élève n'est pas attendu à cause d'un congé pédagogique, il ne doit pas être traité comme absent simple.

Il doit être marqué comme non attendu ou prérempli selon décision métier.

### Élève Non Attendu

Un élève non attendu ne doit pas polluer la feuille de présence.

Exemples :

- jour sans transport ;
- internat ;
- congé pédagogique ;
- consigne officielle "ne pas prendre aujourd'hui" ;
- parent récupère l'enfant.

## 10. Visibilité

### SPW

Le SPW voit :

- toutes les présences ;
- les corrections ;
- les historiques ;
- les exports PDF ;
- les anomalies ;
- les absences répétées.

### Transporteur

Le transporteur voit :

- présences de son périmètre ;
- circuits ;
- validations ;
- corrections opérationnelles ;
- taux de présence utiles à l'organisation.

Il ne voit pas les informations sensibles non nécessaires.

### Chauffeur

Le chauffeur peut voir :

- si la feuille du circuit est validée ;
- les absences utiles au trajet ;
- les consignes de prise en charge.

Il n'encode pas sauf décision métier future.

### Convoyeuse

La convoyeuse voit et encode :

- son circuit du jour ;
- ses élèves attendus ;
- les absences déjà signalées ;
- les consignes utiles ;
- son historique récent si nécessaire.

### Parent

Le parent ne voit pas nécessairement toute la feuille de présence.

Il peut voir uniquement les informations validées concernant son enfant, selon politique SPW.

Exemples possibles :

- absence déclarée prise en compte ;
- présence non exposée par défaut ;
- historique parent seulement si validé.

## 11. Sécurité / RGPD

Principes :

- accès minimum ;
- données limitées au circuit et au jour ;
- support sans accès sensible par défaut ;
- chauffeur sans accès global ;
- convoyeuse sans accès global ;
- parent limité à son enfant ;
- traçabilité des consultations et corrections ;
- durée de conservation définie ;
- export contrôlé.

Les présences sont des données de suivi scolaire et transport. Elles doivent être protégées.

Les notifications ne doivent pas contenir de données sensibles.

## 12. Données Minimales

Champs minimum d'une présence :

```json
{
  "id": "attendance-2026-06-19-child-1-circuit-4104-morning",
  "date": "2026-06-19",
  "direction": "morning",
  "studentId": "child-1",
  "circuitId": "circuit-4104",
  "transportManagerId": "tm-1",
  "assistantId": "assistant-1",
  "status": "present",
  "validatedAt": "2026-06-19T07:35:00.000Z",
  "validatedBy": "assistant-1"
}
```

Statuts autorisés :

- `present` ;
- `absent`.

Statuts exclus :

- `boarded` ;
- `dropped_off` ;
- `picked_up`.

## 13. Traçabilité

Actions à journaliser :

- ouverture de la feuille ;
- validation présence ;
- validation absence ;
- correction ;
- export PDF ;
- consultation SPW ;
- consultation transporteur ;
- accès remplaçante ;
- synchronisation hors ligne.

Chaque correction doit conserver :

- ancienne valeur ;
- nouvelle valeur ;
- auteur ;
- rôle ;
- date ;
- motif si disponible.

## 14. Fonctionnement Hors Ligne

La feuille doit pouvoir fonctionner en cas de réseau faible.

Principe :

- charger le circuit du jour avant départ si possible ;
- permettre l'encodage local ;
- synchroniser dès retour réseau ;
- afficher clairement les éléments non synchronisés ;
- éviter les doublons.

Une présence ne doit pas être encodée deux fois pour le même élève, circuit, direction et date.

## 15. Gains Métier

Le module apporte :

- fin progressive des feuilles papier ;
- moins de pertes de documents ;
- remplaçantes mieux informées ;
- moins de double encodage ;
- contrôle SPW plus rapide ;
- export mensuel automatique ;
- meilleure traçabilité ;
- meilleure qualité des données ;
- moins d'erreurs de présence ;
- meilleure continuité terrain.

## 16. Collections Futures Possibles

Collections candidates :

- `studentAttendance` ;
- `studentAttendanceCorrections` ;
- `studentAttendanceExports` ;
- `studentAttendanceLogs`.

Ces collections ne doivent pas être créées avant validation des règles Firestore.

## 17. Roadmap

1. Documentation officielle.
2. Modèle de données minimal.
3. Règles Firestore lecture seule.
4. Vue briefing lecture seule.
5. Encodage présent/absent.
6. Mode remplaçante.
7. Hors ligne et synchronisation.
8. Corrections encadrées.
9. Export PDF mensuel SPW.
10. Statistiques de présence.

## 18. Principe Officiel

La présence numérique GTS remplace la feuille papier uniquement si elle reste plus simple que le papier.
