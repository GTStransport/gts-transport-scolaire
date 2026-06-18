# GTS Daily Briefing V2

Architecture validée le 17/06/2026

## 1. Objectif

Le briefing du jour est l'écran quotidien destiné aux chauffeurs et convoyeuses.

Il doit donner, en une seule vue, les informations nécessaires pour effectuer le circuit du jour.

Il concerne :

- chauffeur titulaire ;
- chauffeur volant ;
- convoyeuse titulaire ;
- convoyeuse remplaçante.

Objectif terrain :

```txt
Avant de démarrer, l'équipage sait exactement quoi faire aujourd'hui.
```

## 2. Principe Général

Le briefing du jour rassemble uniquement les informations utiles au circuit concerné, pour la date concernée.

Il ne doit pas devenir une fiche élève complète ni un accès global au transporteur.

Principes :

- une vue par circuit ;
- une vue par jour ;
- accès limité au rôle ;
- données sensibles minimisées ;
- informations officielles prioritaires ;
- traçabilité des consultations.

## 3. Circuit Du Jour

Le briefing affiche :

- numéro ou libellé du circuit ;
- sens si nécessaire : matin / soir ;
- date ;
- transporteur ;
- école(s) desservie(s) ;
- type de trajet :
  - `circuit_ferme` ;
  - `avec_transfert` ;
  - `porte_a_porte`.

Exemple :

```txt
Circuit 4104
Jeudi 18 juin 2026
Matin
École Horizon
```

## 4. Équipage Du Jour

Le briefing affiche l'équipage réellement prévu pour la journée.

### Chauffeur

Cas possibles :

- chauffeur titulaire ;
- chauffeur volant.

Affichage recommandé :

```txt
Chauffeur : Jean Dupont
Statut : titulaire
```

ou :

```txt
Chauffeur : Marc Martin
Statut : volant, remplacement de Jean Dupont
```

### Convoyeuse

Cas possibles :

- convoyeuse titulaire ;
- convoyeuse remplaçante.

Affichage recommandé :

```txt
Convoyeuse : Nadia Leroy
Statut : titulaire
```

ou :

```txt
Convoyeuse : Sophie Durant
Statut : remplaçante, remplacement de Nadia Leroy
```

## 5. Véhicule

Le briefing affiche le véhicule prévu.

Informations utiles :

- numéro de car ;
- plaque si disponible ;
- véhicule adapté PMR si nécessaire ;
- remplacement véhicule si garage ou indisponibilité.

Exemple :

```txt
Véhicule : Car 12 - 1ABC123
Statut : prévu
```

## 6. Élèves Attendus

La liste des élèves attendus doit être claire et rapide à lire.

Pour chaque élève :

- nom ;
- prénom ;
- arrêt actif ou domicile ;
- école ;
- ordre ou horaire prévu si disponible ;
- indicateur PMR si nécessaire ;
- indicateur internat si concerné ;
- indicateur garde alternée si active.

Le briefing ne doit pas afficher les autres élèves.

## 7. Absences Signalées

Le briefing affiche les absences déjà connues.

Exemples :

```txt
Absent aujourd'hui
Absent toute la semaine
Absence parent déclarée
```

Objectif :

- éviter d'attendre inutilement un élève absent ;
- éviter les appels inutiles ;
- aider la convoyeuse à encoder les présences.

## 8. Élèves PMR

Le briefing affiche les élèves PMR uniquement si l'information est nécessaire à la prise en charge.

Informations autorisées :

- besoin véhicule adapté ;
- fauteuil roulant si nécessaire ;
- aide à la montée ou descente si strictement utile ;
- domicile ou centre spécialisé si concerné.

Informations à éviter :

- diagnostic médical ;
- détails médicaux non nécessaires ;
- notes sensibles non utiles au trajet.

Rappel métier :

- PMR ne passe jamais par transfert ;
- centre spécialisé = trajet direct.

## 9. Internat Et Retour Week-End

Le briefing doit signaler les cas internat utiles au jour.

Exemples :

- internat semaine complète ;
- retour chaque week-end ;
- retour un week-end sur deux ;
- destination week-end selon parent actif.

Informations utiles :

```txt
Internat : oui
Retour week-end : vendredi
Parent actif : maman
Destination : domicile maman
```

## 10. Garde Alternée Active

Si la garde alternée influence le trajet du jour, le briefing affiche :

- semaine active : paire ou impaire ;
- parent actif ;
- arrêt actif ;
- destination active.

La logique doit réutiliser la résidence active calculée officiellement.

Ne pas recréer une seconde logique de garde alternée.

## 11. Transferts Du Jour

Si le circuit comporte un transfert, le briefing affiche :

- lieu de transfert officiel ;
- heure d'arrivée prévue ;
- heure de départ prévue ;
- car entrant ;
- car sortant ;
- élèves qui changent de car ;
- élèves qui restent dans le même car ;
- chauffeur entrant/sortant si différent ;
- convoyeuse entrante/sortante si différente.

Les transferts concernent uniquement les élèves non PMR.

## 12. Consignes SPW

Le briefing affiche les consignes SPW applicables au jour et au circuit.

Exemples :

- consigne de sécurité ;
- changement de procédure ;
- consigne école ;
- consigne transfert ;
- règle officielle du jour.

Une consigne SPW publiée dans GTS fait foi.

## 13. Informations Officielles Importantes

Le briefing doit afficher les informations officielles :

- importantes ;
- urgentes ;
- non encore confirmées ;
- liées au circuit, à l'école, au transfert ou à l'élève.

Les informations urgentes doivent rester visibles jusqu'à confirmation.

Exemple :

```txt
Information urgente à confirmer
Nouvelle consigne SPW sur le transfert
[J'ai lu et compris]
```

## 14. Présences À Encoder

La convoyeuse voit la feuille de présence du jour.

Règle métier :

```txt
Présent / Absent uniquement.
```

La convoyeuse ne doit pas encoder :

- monté ;
- descendu ;
- heure de montée ;
- heure de descente.

Le briefing doit afficher :

- élèves non validés ;
- présents ;
- absents ;
- bouton de validation du circuit.

## 15. Contacts Temporaires Autorisés

En cas de remplacement, GTS peut partager temporairement les contacts utiles.

Données visibles temporairement :

- prénom/nom ;
- rôle ;
- téléphone professionnel si disponible ;
- circuit concerné ;
- horaire de service.

Cas convoyeuse absente :

- chauffeur titulaire voit la convoyeuse remplaçante ;
- convoyeuse remplaçante voit le chauffeur titulaire.

Cas chauffeur absent :

- chauffeur volant voit la convoyeuse titulaire ;
- convoyeuse titulaire voit le chauffeur volant.

Cas chauffeur et convoyeuse absents :

- chauffeur volant et convoyeuse remplaçante voient uniquement les contacts nécessaires entre eux.

Règles :

- pas de répertoire global ;
- accès limité au circuit ;
- accès limité au jour ou à la période ;
- révocation automatique après remplacement.

## 16. Traçabilité Des Consultations

Chaque consultation importante doit être journalisée.

Actions à tracer :

- ouverture du briefing ;
- lecture d'une information officielle ;
- confirmation d'une urgence ;
- accès à un contact temporaire ;
- validation de présence ;
- consultation hors ligne ;
- synchronisation.

Exemple :

```json
{
  "action": "daily_briefing_opened",
  "actorId": "driver-1",
  "actorRole": "driver",
  "circuitId": "circuit-4104",
  "date": "2026-06-18",
  "at": "Timestamp"
}
```

## 17. Sécurité

Règles de sécurité :

- accès limité au circuit concerné ;
- accès limité au jour concerné ;
- données médicales minimisées ;
- remplacement = accès temporaire uniquement ;
- révocation automatique après remplacement ;
- journalisation des accès ;
- support sans accès direct aux contenus sensibles ;
- parent sans accès au briefing équipage.

Le briefing ne doit pas permettre :

- de voir tous les circuits ;
- de voir tous les élèves ;
- de voir tout le personnel ;
- de consulter des données médicales non nécessaires ;
- de conserver un accès après remplacement.

## 18. Données Sources

Le briefing peut être construit depuis :

- `studentAssignments` ;
- `stopPassages` ;
- `tripSegments` ;
- `transportTransfers` ;
- `children` ;
- `vehicles` ;
- `drivers` ;
- `assistants` ;
- `targetedInformation` ;
- `studentAttendance` future ;
- remplacements d'équipage futurs.

Le briefing doit rester une vue calculée, pas une duplication complète de toutes les données.

## 19. UI Prévue

Structure recommandée :

```txt
Briefing du jour

1. Circuit
2. Équipage
3. Véhicule
4. Informations urgentes
5. Élèves attendus
6. Absences
7. Transferts
8. Présences
9. Contacts temporaires
```

Priorités UX :

- mobile d'abord ;
- lecture rapide ;
- badges clairs ;
- urgences en haut ;
- pas de longs formulaires ;
- présence en un geste.

## 20. Roadmap

### Phase 1 : Documentation

Formaliser le briefing du jour.

### Phase 2 : Vue Lecture Seule

Construire une première vue depuis les données existantes.

### Phase 3 : Informations Officielles

Afficher les consignes importantes et urgentes.

### Phase 4 : Présences

Ajouter la saisie simple présent/absent.

### Phase 5 : Remplacements

Ajouter contacts temporaires et droits bornés.

### Phase 6 : Hors Ligne

Permettre consultation et saisie de présence sans réseau stable.

### Phase 7 : Journalisation

Tracer les consultations et confirmations.

## 21. Recommandation Officielle

Le briefing du jour doit devenir l'écran quotidien principal des équipages.

Il doit répondre à une question simple :

```txt
Que dois-je savoir pour mon circuit aujourd'hui ?
```

Il doit rester :

- ciblé ;
- court ;
- officiel ;
- sécurisé ;
- utilisable sur mobile ;
- limité au circuit et au jour concernés.
