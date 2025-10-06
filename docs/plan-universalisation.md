# Plan d’Action Universalisation SGDF Notes de Frais

<!-- PostgreSQL db on coolify -->

## Session 1 — Auth & Accès
- [ ] Inventorier l’usage actuel de Clerk (pages `sign-in`, `sign-up`, composants `ClerkSignInClient`, `ClerkSignUpClient`, appels `useUser`, API `update-branch`).
- [ ] Définir le modèle de métadonnées Clerk : `publicMetadata.branch`, `publicMetadata.groupCode`, `privateMetadata.role`.
- [ ] Ajouter la validation “code groupe” dans le flux d’inscription (formulaire personnalisé avant `SignUp`) et stocker le `groupCode` en métadonnée.
- [ ] Créer une `waitlist` côté base (table `DemandeAcces`) et un flag `isApproved` dans les métadonnées Clerk ; bloquer l’accès formulaire/admin tant que le flag est `false`.
- [ ] Mettre à jour le middleware et `ExpenseForm` pour lire `isApproved` + `branch` depuis Clerk avant d’autoriser l’envoi.

## Session 2 — Modèle de données & API
- [ ] Introduire l’ORM choisi (Prisma/Drizzle) et le schéma : `Groupe`, `Branche`, `EmailUnite`, `DemandeAcces`, `Validation`, `Chef` (lié à l’`userId` Clerk).
- [ ] Créer les routes API :  
  - `POST /api/access/request` (enregistre la demande, envoie l’email au trésorier).  
  - `POST /api/access/approve` et `/reject` (met à jour `isApproved` dans Clerk + enregistre `Validation`).  
  - `POST /api/admin/propositions` (pour email d’unité / nom interne).
- [ ] Mettre à jour `send-expense` pour charger les destinataires dans Postgres (trésorerie, chef, email d’unité validé) et conserver le mode Lite (pas de stockage pièce jointe).
- [ ] Créer un client DB partagé `src/lib/db.ts` et ajouter un script de migration + seed.

## Session 3 — Interfaces Chef & Trésorier
- [ ] Refonte page d’accueil : champ `code groupe`, saisie email, message “Vérifiez votre boîte mail”.
- [ ] Page “En attente de validation” affichée aux chefs non approuvés.
- [ ] Vue `/admin/ma-branche` : infos branche, liste des chefs, propositions d’email d’unité/nom interne.
- [ ] Vue `/admin/groupe` : listing branches (édition inline), file d’attente chefs (Approuver/Refuser), gestion code (copie lien, génération QR).
- [ ] Préparer le walkthrough de rentrée (squelette de flow, bouton “Lancer Walkthrough”).

## Session 4 — Emails & Notifications
- [ ] Centraliser les templates d’emails (`src/lib/email.ts`) : demande d’accès, confirmation chef, refus, notification proposition, digest (option).
- [ ] Ajouter les boutons `Approuver/Refuser` dans l’email trésorier avec liens sécurisés (token court).
- [ ] Paramétrer la personnalisation (nom groupe, CC optionnelle) côté admin.
- [ ] Documenter le “mode Lite” dans le mail d’envoi de note (pas de stockage serveur).

## Session 5 — Tests & Outillage
- [ ] Écrire tests e2e (Playwright/Cypress) pour : demande d’accès, approbation trésorier, envoi note validé.
- [ ] Ajouter des tests unitaires pour `send-expense` (validation montant, email).
- [ ] Prévoir un script de migration des données existantes (groupe historique) vers le nouveau schéma.
- [ ] Mettre à jour la documentation (`docs/`) : guide trésorier (code, QR, approbations), guide chef (inscription, envoi).

