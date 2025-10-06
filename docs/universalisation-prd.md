# Universalisation SGDF Notes de Frais — PRD

## 1. Contexte & Objectifs

- Outil initialement conu pour un seul groupe (La Guillotiere) a rendre utilisable par tous les groupes SGDF sans multiplier les depots.
- Hebergement centralise par l'auteur, avec un minimum de dependances externes.
- Permettre aux tresoriers de recevoir rapidement les justificatifs tout en gardant un controle leger sur les acces.
- Simplifier l'experience chef : un code groupe, validation par le tresorier, formulaire mobile-first.

## 2. Principes Directeurs

- Simplicite avant tout : peu de parametres, parcours guides, terminologie SGDF familiere.
- Confiance et confidentialite : pas de stockage durable des justificatifs (mode Lite), metadonnees limitees.
- Gouvernance legere : le tresorier approuve les chefs, gere les adresses d'unite, sans devoir manipuler des comptes.
- Universalisation : memes fondations produit pour tous les groupes, personnalisation a travers donnees (nom du groupe, branches, emails).

## 3. Utilisateurs & Besoins

- **Chefs de branche** : envoyer facilement leurs notes de frais a la tresorerie, garder leur branche en copie, acceder mobile/PWA, voir qui est valide dans leur unite.
- **Tresoriers de groupe** : partager un code au debut de l'annee, approuver les chefs, gerer les adresses d'unite (souvent stables), controler ponctuellement les acces, sans actions repetitives complexes.
- **Chefs multi-unites** (option) : basculer entre plusieurs branches si necessaire, conserver les emails d'unite par branche.

## 4. Parcours Cles

### 4.1 Chef de branche

1. Recoit le code groupe (reunion, mail, QR).
2. Saisit le code -> renseigne son email -> confirme via lien magique (anti faute de frappe).
3. Tant que le tresorier n'a pas approuve : acces limite (pas de formulaire, pas de `/admin`), message "En attente de validation".
4. Apres approbation : acces au formulaire d'envoi, vue `/admin` "Ma branche".
5. Selectionne la branche (nom officiel + nom interne), peut proposer un email d'unite si absent.
6. Envoie la note : l'email part a la tresorerie, chef en CC, unite en CC si validee.

### 4.2 Tresorier

1. Configure le groupe (nom, emails tresorerie, branches, emails d'unite) via `/admin`.
2. Partage le code et le QR aux chefs.
3. Recoit les demandes d'acces : approuve/refuse en un clic depuis l'email ou depuis `/admin`.
4. Peut supprimer un chef a tout moment (depart, changement d'annee).
5. Recoit les justificatifs avec contexte complet.
6. Walkthrough de rentree : revalide branche par branche (liste guidee), sans suppression automatique.

## 5. Experience Produit

### 5.1 Accueil & Onboarding

- Page d'accueil : champ "Code groupe", explication 2 lignes, lien d'aide, QR utilisable.
- Apres code valide : collecte email chef + envoi lien magique.
- Si non approuve : ecran dedie, rappel que la tresorerie doit valider (pas de navigation vers `/admin` ou formulaire).

### 5.2 Formulaire d'envoi

- Champs : date, montant, type, description, branche (selecteur), justificatif photo.
- Resume destinataires : Tresorerie, Chef (copie), Unite (si email valide) avec statut.
- Objet d'email : `[Groupe – Branche (Nom interne)] Type – Montant – Date` (le nom interne entre parentheses apparait seulement s'il existe).
- Message explicatif sur l'absence de stockage serveur (mode Lite).

### 5.3 Espace `/admin`

#### Vue Chef — "Ma branche"

- Affiche : nom officiel, nom interne (editable via proposition), email d'unite (statut valide / en attente / absent).
- Liste des chefs de la branche : prenom nom, email, statut (approuve / en attente).
- Actions : proposer un nom interne, proposer un email d'unite si absent/errone, consulter l'etat de sa validation.
- Information : rappel destinataires, lien vers tutoriel utile.

#### Vue Tresorier — "Groupe"

- Barre haute : nom du groupe, emails tresorerie, bouton "Copier le code", bouton "Telecharger QR".
- Tableau Branches : branche officielle (pre-liste SGDF + custom), nom interne, email d'unite, nb utilisateurs approuves, statut email (valide/en attente). Edition inline + ajout rapide.
- Propositions chefs : nom interne ou email d'unite soumis -> boutons Accepter / Refuser.
- Personnes : onglet "En attente" (Approuver/Refuser), onglet "Approuves" (Supprimer). Pas d'ajout manuel.
- Walkthrough rentree : flow guide (ex: modal ou page) qui parcourt chaque branche pour confirmer les chefs a conserver, retirer, ou laisser en attente.

## 6. Emails & Notifications

- **Demande d'acces** (vers tresorier) : "Nouvelle demande d'approbation" avec boutons Approuver / Refuser, detail de la branche et de l'email chef.
- **Approbation chef** (vers chef) : confirmation d'acces avec lien vers l'app.
- **Refus chef** : explication courte, contact tresorier.
- **Proposition email d'unite** : notification au tresorier pour action.
- Digest optionnel (hebdo) : chefs en attente, propositions en attente.
- Aucun envoi si chef non approuve (formulaire inaccessible et `/admin` verrouille).

## 7. Donnees & Securite

- Base Postgres : tables Groupe, Branche, EmailUnite, Chef, Validation, Demande.
- Pas de stockage de pieces jointes ou justificatifs apres envoi (mode Lite).
- Lien magique pour verifier l'email du chef (validite courte).
- Validation manuelle du tresorier obligatoire pour activer un chef.
- `/admin` accessible seulement aux roles valides (chef approuve ou tresorier), sinon redirige vers ecran attente.
- Logs minimaux (evenements d'envoi, validation) pour diagnostic.

## 8. Portee Fonctionnelle

### 8.1 MVP (Phase 1)

- Gestion des groupes : nom, emails tresorerie, code unique.
- Parcours entree code -> validation email chef -> attente approbation.
- Approbation/refus tresorier (email + interface).
- Formulaire d'envoi avec routage (Tresorerie + Chef, Unite si validee).
- Vue `/admin` Chef (lecture seule + propositions d'email).
- Vue `/admin` Tresorier (liste en attente, approuves, tableau branches, actions de base).
- Objet et corps d'email contextualises.

### 8.2 Evolutions futures (Phase 2+)

- Walkthrough de rentree guide (flow de revalidation par branche).
- Digest hebdo pour tresoriers.
- Export CSV des envois (metadonnees uniquement).
- Parametres de quotas / alertes anti-abus.
- Option conservation temporaire (30 jours) si besoin futur.

## 9. Questions Ouvertes & Points a Valider

- Forme exacte du walkthrough de rentree : modal multi-etapes ou page dediee ?
- Delai d'expiration du lien magique chef (24h par defaut ?) et du code groupe (illimite ?).
- Message type a afficher au chef refuse (standard ou personnalisable par le tresorier ?).
- Gestion multi-groupes pour un meme chef (ex: chef qui aide deux groupes) : support dans MVP ou plus tard ?
- Format QR fourni : statique (URL + code en query) suffisant ?

## 10. Prochaines Etapes

1. Valider ce PRD avec un tresorier referent (feedback parcours, walkthrough rentree).
2. Preparer le pack communication tresorier (message, QR, tuto 3 etapes).
3. Definir l'architecture technique detaillee (schema Postgres, routes API, protections) — document separe.
4. Decouper un plan de livraison (MVP puis iterations) avec backlog priorise.
