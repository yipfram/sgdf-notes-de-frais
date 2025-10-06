# Contexte Produit - Universalisation SGDF Notes de Frais

Ce document complete le PRD (docs/universalisation-prd.md) avec les points actes lors des echanges pour conserver une vision partagee.

## Principes actes

- Code groupe unique partage par le tresorier (reunion, e-mail, QR). Pas de rotation imposee.
- Aucun acces au formulaire ni a /admin tant que le chef n'est pas approuve par le tresorier.
- Mode Lite : justificatifs non conserves cote serveur, transmission uniquement par e-mail.
- Personnalisation sobre : nom du groupe dans l'interface, contexte riche dans l'objet et le corps des e-mails.

## Acces et roles

- Chefs : saisissent le code, valident leur e-mail via lien magique, puis attendent l'approbation du tresorier.
- Tresorier : approuve ou refuse en un clic depuis l'e-mail ou via /admin, peut supprimer un chef quand il le souhaite.
- Garde-fous : ecran "En attente de validation" tant que le chef n'est pas valide ; aucune autre action possible.

## /admin - un seul slug, deux vues

- Vue Chef "Ma branche" : nom officiel et nom interne, e-mail d'unite (statut), liste des chefs (approuve ou en attente). Possibilite de proposer nom interne ou e-mail d'unite quand il manque ou change.
- Vue Tresorier "Groupe" : nom du groupe, e-mails tresorerie, boutons "Copier le lien avec code" et "Telecharger QR". Tableau des branches (nom officiel, nom interne, e-mail d'unite, nombre de chefs). File d'attente pour accepter ou refuser les propositions. Onglets "En attente" et "Approuves" avec action Supprimer.
- Controle par role : les chefs ne voient que "Ma branche", les tresoriers la vue "Groupe".

## E-mails d'unite

- Dans la pratique les e-mails d'unite changent peu ; ce sont les chefs qui tournent.
- Le tresorier definit et edite les e-mails par branche. Un chef peut proposer une adresse si absente ou obsolete.
- Tant que l'e-mail d'unite n'est pas valide, l'envoi part uniquement a la tresorerie et au chef (pas de copie unite).

## Objet et corps des e-mails

- Objet : [Groupe - Branche (Nom interne)] Type - Montant - Date. Le nom interne n'est affiche que s'il existe (ex. "Piok 2").
- Corps : resume Groupe, Branche (officielle et interne), Chef (nom et e-mail), Unite en copie, Date, Montant, Type, Description, puis justificatif en piece jointe.

## Rentree : pas de suppression automatique

- Aucun effacement massif des chefs a la nouvelle annee.
- Un walkthrough simple passe branche par branche pour confirmer, mettre en attente ou supprimer les chefs selon la realite locale.

## Distribution du code

- Actions principales proposees :
  - Copier le code
  - Copier un lien avec code pre-rempli
  - Telecharger un QR a afficher en reunion

## Cas multi-branches ou multi-groupes

- Un chef peut appartenir a plusieurs branches du groupe et basculer facilement.
- L'e-mail d'unite est memorise par branche cote chef si besoin.
- Multi-groupes pour un meme chef envisage plus tard (hors MVP), non bloquant.

## Options supplementaires (OFF par defaut)

- CC "groupe" (ex. secretariat) definie par le tresorier.
- Digest hebdo avec resume des chefs ou propositions en attente.

## Regles de securite

- Verification de l'e-mail chef par lien magique avant demande d'approbation.
- Approbation explicite du tresorier obligatoire avant tout envoi.
- Journaux minimaux (validation, envoi) sans stockage d'images.
