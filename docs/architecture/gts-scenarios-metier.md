# GTS Scenarios Metier

Architecture validée le 17/06/2026

Ce document liste les scenarios metier valides pour GTS Connect. Ils servent de reference pour les developpements futurs, les tests fonctionnels et les discussions avec le SPW, les transporteurs et les prestataires.

## 1. Eleve Simple

Situation : un eleve prend le meme car tous les jours depuis le meme arret TEC vers son ecole, sans transfert.

Acteurs : SPW, transporteur, chauffeur, convoyeuse, parent.

Donnees :

- eleve cree par le SPW ;
- ecole officielle ;
- arret TEC ;
- circuit ;
- chauffeur ;
- convoyeuse ;
- vehicule ;
- jours de transport.

Resultat attendu : le parent voit l'arret et l'heure ; le chauffeur et la convoyeuse voient l'eleve dans leur liste.

## 2. Transfert Simple

Situation : l'eleve monte dans un car, descend au transfert, puis prend un second car vers l'ecole.

Acteurs : transporteur, deux chauffeurs, convoyeuse, parent, SPW.

Donnees :

- segment arret TEC vers transfert ;
- segment transfert vers ecole ;
- deux passages ;
- deux circuits possibles.

Resultat attendu : chaque chauffeur voit l'eleve sur son segment ; le parent voit le transfert prevu.

## 3. Changement De Car

Situation : l'eleve descend du car A au transfert et monte dans le car B.

Acteurs : chauffeurs, convoyeuses, transporteur.

Donnees :

- deux segments ;
- deux vehicules ;
- deux passages au transfert ;
- assignment avec deux `passageIds`.

Resultat attendu : le changement de car est visible et chaque equipage voit uniquement son segment.

## 4. Meme Car Apres Transfert

Situation : l'eleve passe par un transfert mais reste dans le meme car.

Acteurs : chauffeur, convoyeuse, transporteur, parent.

Donnees :

- deux segments ;
- meme `vehicleId` ;
- meme `driverIds` ;
- meme `assistantId`.

Resultat attendu : le transfert est visible, mais le systeme indique que l'eleve reste dans le meme car.

## 5. Garde Alternee Simple

Situation : l'eleve est depose chez maman en semaine paire et chez papa en semaine impaire, sur le meme circuit.

Acteurs : SPW, transporteur, parent, chauffeur, convoyeuse.

Donnees :

- `alternatingResidence` gere par le SPW ;
- `motherPickupStop` ;
- `fatherPickupStop` ;
- meme circuit ;
- assignments `even` et `odd`.

Resultat attendu : l'arret actif suit automatiquement la semaine ISO.

## 6. Garde Alternee Avec Autre Circuit

Situation : semaine paire sur le circuit 4104, semaine impaire sur le circuit 4220.

Acteurs : SPW, transporteur, chauffeurs, convoyeuses, parents.

Donnees :

- assignment semaine paire ;
- assignment semaine impaire ;
- arrets differents ;
- circuits differents.

Resultat attendu : chaque chauffeur voit l'eleve uniquement la semaine concernee.

## 7. Vendredi Different

Situation : l'eleve suit un trajet du lundi au jeudi, mais un autre trajet le vendredi.

Acteurs : SPW, transporteur, parent, chauffeur.

Donnees :

- assignment normal ;
- assignment `validDays: ["friday"]` ;
- arret ou circuit different.

Resultat attendu : le vendredi, le trajet specifique remplace le trajet habituel.

## 8. Chauffeur Remplacant

Situation : le chauffeur habituel est absent.

Acteurs : transporteur, chauffeur habituel, chauffeur remplacant.

Donnees :

- passage du jour avec chauffeur remplacant ;
- date ou periode de remplacement ;
- circuit conserve.

Resultat attendu : le chauffeur remplacant voit les eleves du jour.

## 9. Convoyeuse Remplacante

Situation : la convoyeuse habituelle est remplacee sur un trajet.

Acteurs : transporteur, convoyeuse habituelle, convoyeuse remplacante, chauffeur.

Donnees :

- `assistantId` remplace sur le passage ou segment ;
- date de remplacement.

Resultat attendu : la convoyeuse remplacante voit les eleves concernes.

## 10. Vehicule Au Garage

Situation : le vehicule prevu est indisponible.

Acteurs : transporteur, chauffeur, convoyeuse, parent.

Donnees :

- vehicule indisponible ;
- vehicule de remplacement ;
- passages mis a jour operationnellement.

Resultat attendu : l'equipage voit le vehicule correct ; le parent peut voir une information de remplacement si autorisee.

## 11. Absence Eleve

Situation : le parent signale une absence temporaire.

Acteurs : parent, chauffeur, convoyeuse, transporteur.

Donnees :

- absence datee ;
- eleve lie ;
- affectation normale conservee.

Resultat attendu : l'eleve reste affecte, mais apparait absent pour les dates concernees.

## 12. Plusieurs Ecoles Apres Transfert

Situation : un car quitte un transfert et dessert plusieurs ecoles.

Acteurs : transporteur, chauffeur, convoyeuse, SPW.

Donnees :

- `transferHubId` ;
- segment transfert vers ecoles ;
- plusieurs `schoolIds` ;
- passages ordonnes.

Resultat attendu : les eleves sont repartis par ecole et l'ordre de desserte est clair.

## 13. Plusieurs Cars Au Meme Arret TEC

Situation : trois circuits passent au meme arret TEC a des heures differentes.

Acteurs : transporteur, chauffeurs, parents.

Donnees :

- meme `tecStopId` ;
- plusieurs `stopPassages` ;
- heures differentes ;
- circuits differents.

Resultat attendu : l'eleve est lie au passage exact, pas seulement a l'arret.

## 14. Plusieurs Cars Au Meme Transfert

Situation : plusieurs cars arrivent et repartent du meme transfert.

Acteurs : transporteur, chauffeurs, convoyeuses.

Donnees :

- `transferHubId` commun ;
- passages entrants ;
- passages sortants ;
- assignments eleves.

Resultat attendu : le systeme sait quels eleves descendent, montent ou restent dans le meme car.

## 15. Trajet Matin Different Du Soir

Situation : l'eleve prend un circuit le matin et un autre le soir.

Acteurs : SPW, transporteur, parent, chauffeurs.

Donnees :

- assignment `direction: "morning"` ;
- assignment `direction: "evening"` ;
- passages et circuits differents.

Resultat attendu : chaque chauffeur voit l'eleve uniquement sur son trajet.

## 16. Circuit Ferme

Situation : un car effectue une sequence d'arrets sans transfert.

Acteurs : transporteur, chauffeur, convoyeuse, parents.

Donnees :

- `transportType: "circuit_ferme"` ;
- plusieurs passages ordonnes ;
- pas de `transferHubId`.

Resultat attendu : le chauffeur suit l'ordre des arrets ; chaque eleve est associe a son passage precis.

## 17. Porte-A-Porte PMR

Situation : un eleve en fauteuil roulant est pris en charge a domicile avec un vehicule adapte.

Acteurs : SPW, transporteur, chauffeur, convoyeuse, parent.

Donnees :

- PMR officiel dans `children` ;
- `transportType: "porte_a_porte"` ;
- `stopType: "home_address"` ;
- vehicule `pmrCompatible` ;
- `requiresAdaptedVehicle: true`.

Resultat attendu : le transporteur affecte un vehicule adapte ; l'equipage voit les consignes utiles ; le parent voit l'heure de prise en charge.

## 18. Retard Sur Segment Apres Transfert

Situation : le premier segment est a l'heure, mais le car apres transfert est en retard.

Acteurs : chauffeur du second segment, convoyeuse, transporteur, parents.

Donnees :

- retard lie au segment ou passage concerne ;
- eleves affectes a ce segment.

Resultat attendu : seuls les parents des eleves concernes sont notifies.

## 19. Eleve Sans Affectation Transport

Situation : le SPW cree un eleve, mais le transporteur ne l'a pas encore affecte.

Acteurs : SPW, transporteur.

Donnees :

- eleve dans `children` ;
- aucun `studentAssignment` actif.

Resultat attendu : le SPW voit l'eleve officiel ; le transporteur voit une affectation a faire ; aucun chauffeur ne voit l'eleve.

## 20. Arret TEC Identique Mais Destination Differente

Situation : deux eleves montent au meme arret TEC mais vont vers deux transferts differents.

Acteurs : transporteur, chauffeurs, convoyeuses.

Donnees :

- meme arret ;
- passages differents ;
- circuits differents ;
- transferts differents.

Resultat attendu : l'arret seul ne determine jamais le trajet ; le passage exact fait foi.

