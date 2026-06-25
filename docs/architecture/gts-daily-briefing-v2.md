# Briefing Du Jour GTS V2

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

## 8. Nouveaux Élèves

Le briefing doit signaler les élèves récemment ajoutés au circuit ou pris en charge pour la première fois par l'équipage du jour.

Objectifs :

- attirer l'attention du chauffeur et de la convoyeuse ;
- éviter qu'un nouvel élève soit oublié ;
- rappeler l'arrêt actif, l'école et les consignes utiles ;
- aider une remplaçante à identifier rapidement l'élève.

Informations visibles :

- nom et prénom ;
- arrêt actif ou domicile ;
- école ;
- direction concernée ;
- date de première prise en charge si disponible ;
- badge `Nouvel élève`.

Le badge doit rester temporaire, par exemple quelques jours ou jusqu'à confirmation de prise de connaissance.

## 9. Consignes De Prise En Charge

Le briefing affiche les consignes opérationnelles du jour.

Exemples :

- ne pas prendre aujourd'hui ;
- reste à la garderie ;
- congé pédagogique ;
- parent récupère l'enfant ;
- retour internat ;
- garde alternée active ;
- consigne exceptionnelle validée SPW.

La consigne doit apparaître au bon endroit :

- en haut si urgente ;
- sur la carte de l'élève concerné ;
- dans la liste de présence si elle modifie la prise en charge ;
- dans le bloc transfert si elle concerne un transfert non PMR.

Une consigne officielle visible au bon moment évite une erreur de prise en charge.

## 10. Élèves PMR

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

## 11. Internat Et Retour Week-End

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

## 12. Garde Alternée Active

Si la garde alternée influence le trajet du jour, le briefing affiche :

- semaine active : paire ou impaire ;
- parent actif ;
- arrêt actif ;
- destination active.

La logique doit réutiliser la résidence active calculée officiellement.

Ne pas recréer une seconde logique de garde alternée.

## 13. Transferts Du Jour

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

## 14. Consignes SPW

Le briefing affiche les consignes SPW applicables au jour et au circuit.

Exemples :

- consigne de sécurité ;
- changement de procédure ;
- consigne école ;
- consigne transfert ;
- règle officielle du jour.

Une consigne SPW publiée dans GTS fait foi.

## 15. Informations Officielles Importantes

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

## 16. Alertes Importantes

Les alertes importantes doivent être visibles avant la liste complète des élèves.

Alertes possibles :

- information urgente non confirmée ;
- absence signalée tardivement ;
- remplacement chauffeur ;
- remplacement convoyeuse ;
- véhicule remplacé ;
- transfert modifié ;
- consigne de prise en charge urgente ;
- garde alternée active avec arrêt différent ;
- retour internat à ne pas oublier.

Les alertes doivent être courtes, actionnables et liées à une donnée officielle.

## 17. Présences À Encoder

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

## 18. Mode Remplaçant

Le briefing doit fonctionner pour :

- chauffeur volant ;
- convoyeuse remplaçante ;
- chauffeur et convoyeuse remplaçants en même temps.

En mode remplaçant, le briefing affiche uniquement :

- le circuit concerné ;
- la période de remplacement ;
- l'équipage réel du jour ;
- les élèves attendus ;
- les absences signalées ;
- les consignes de prise en charge ;
- les informations officielles utiles ;
- les contacts temporaires autorisés.

Le remplaçant ne reçoit aucun accès global aux autres circuits.

## 19. Contacts Temporaires Autorisés

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

## 20. Notifications

Le briefing peut être alimenté par des notifications ciblées.

Notifications à prévoir :

- nouvelle information officielle urgente ;
- nouvelle consigne de prise en charge ;
- remplacement chauffeur ;
- remplacement convoyeuse ;
- absence signalée ;
- changement véhicule ;
- briefing du jour disponible ;
- confirmation urgente attendue.

Règles :

- pas de donnée sensible dans le push ;
- contenu complet uniquement après authentification ;
- notification limitée au rôle et au circuit concerné ;
- trace de l'envoi et de la consultation.

Exemple de notification :

```txt
Nouvelle consigne GTS à consulter avant le départ.
```

## 21. Ordre D'Affichage

Ordre recommandé :

1. Alertes urgentes à confirmer.
2. Équipage du jour.
3. Véhicule du jour.
4. Circuit du jour.
5. Remplacements actifs.
6. Informations officielles importantes.
7. Consignes de prise en charge.
8. Absences signalées.
9. Nouveaux élèves.
10. Garde alternée active.
11. Internat / retour week-end.
12. Transferts du jour.
13. Élèves attendus.
14. Présences à encoder.
15. Contacts temporaires autorisés.

L'ordre doit privilégier ce qui évite une erreur immédiate avant les détails de consultation.

## 22. Traçabilité Des Consultations

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

## 23. Sécurité

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

## 24. Sécurité / RGPD

Le briefing concentre des informations opérationnelles sensibles. Il doit respecter :

- minimisation ;
- accès limité au jour ;
- accès limité au circuit ;
- accès limité au rôle ;
- révocation automatique des remplacements ;
- journalisation des accès ;
- absence de données sensibles inutiles ;
- support sans accès direct.

Les données médicales ne doivent apparaître que sous forme de besoins opérationnels strictement nécessaires.

Exemples acceptables :

- véhicule adapté requis ;
- fauteuil roulant ;
- aide à la montée.

Exemples à éviter :

- diagnostic ;
- historique médical ;
- détails familiaux sensibles.

## 25. Données Sources

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

## 26. UI Prévue

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

## 27. Gains Métier

Le briefing du jour apporte :

- moins d'oublis avant départ ;
- moins d'appels de dernière minute ;
- meilleure préparation des remplaçants ;
- meilleure prise en compte des absences ;
- meilleure gestion des gardes alternées ;
- moins d'erreurs de prise ou dépose ;
- meilleure coordination chauffeur/convoyeuse ;
- meilleure traçabilité ;
- réduction des relais WhatsApp ou papier ;
- meilleure preuve de consultation.

## 28. Roadmap

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

## 29. Recommandation Officielle

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
