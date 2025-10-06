# Plan d’Action Universalisation SGDF Notes de Frais

<!-- PostgreSQL db on coolify -->

# Schéma Postgres cible
| Table | Description |
|-------|-------------|
| `Groupe` | Identifie le groupe SGDF (nom, code partagé, emails trésorerie, options de personnalisation). |
| `Branche` | Branches officielles + nom interne éventuel, attachées à un groupe, avec l'email d'unité et l'état de validation. |
| `Chef` | Lien vers l'utilisateur Clerk (`userId`), branche(s) autorisées, informations de contact miroir des métadonnées Clerk. |
| `DemandeAcces` | File d'attente des nouvelles inscriptions (email, groupe, branche, statut, horodatage) utilisée pour l'approbation. |
| `Validation` | Trace des décisions du trésorier (approuvé/refusé, qui, quand, commentaire facultatif). |
| `EmailUnite` | Historique des adresses par branche (statut proposé/validé) afin de gérer les propositions des chefs et les modifications. |
| `LogEvenement` | Audit minimal des actions critiques (demandes, validations, envois de notes) pour diagnostic. |

## Session 1 — Auth & Accès ✅ COMPLÉTÉ
- [x] Inventorier l'usage actuel de Clerk (pages `sign-in`, `sign-up`, composants `ClerkSignInClient`, `ClerkSignUpClient`, appels `useUser`, API `update-branch`). *Objectif : lister chaque dépendance avant de modifier les flux afin d'éviter les régressions et de savoir quelles pièces refactorer.*
- [x] Définir le modèle de métadonnées multi-branche : schéma PostgreSQL avec `groups`, `branches`, `userBranchRoles`, `userSessions`. *Permet de gérer l'accès multi-branche avec rôles au lieu de simples métadonnées Clerk.*
- [x] Implémenter AuthContext multi-branche : `userBranches`, `activeBranch`, `activeBranchRole`, `setActiveBranch`. *Remplace les métadonnées Clerk par une gestion dynamique des accès via API et base de données.*
- [x] Créer les tables `groups`, `branches`, `userBranchRoles`, `userSessions` avec Drizzle ORM. *Structure de données multi-groupe avec permissions granulaires par branche.*
- [x] Développer les routes API : `/user/branches`, `/user/active-branch`, `/user/migrate`, `/init-database`. *Endpoints pour gérer les accès utilisateurs et l'initialisation de la base.*
- [x] Implémenter la migration automatique des utilisateurs existants depuis Clerk metadata vers le nouveau schéma. *Transition transparente des utilisateurs legacy vers le système multi-branche.*
- [x] Mettre à jour `ExpenseForm` et `layout.tsx` pour utiliser le nouveau AuthContext et les données dynamiques. *Intégration complète avec le nouveau système de permissions.*

## Session 2 — Modèle de données & API ✅ COMPLÉTÉ
- [x] Introduire Drizzle ORM et le schéma de base : `groups`, `branches`, `userBranchRoles`, `userSessions`. *Base de données multi-groupe avec rôles et permissions.*
- [x] Créer un client DB partagé `src/lib/db/` et ajouter les scripts d'initialisation. *Accès centralisé à la base et initialisation automatique.*
- [x] Créer les routes API restantes :  \
  - `POST /api/access/request` (enregistre la demande, envoie l'email au trésorier).  *Sert d'entrée publique au parcours chef.*  \
  - `POST /api/access/approve` et `/reject` (met à jour `isApproved` dans Clerk + enregistre `Validation`).  *Expose les actions trésorier via un endpoint sécurisé, réutilisable par l'UI et par les boutons d'email.*  \
  - `POST /api/admin/propositions` (pour email d'unité / nom interne). *Centralise les propositions soumises par les chefs et simplifie leur traitement côté admin.*
- [x] Compléter le schéma avec tables avancées : `EmailUnite`, `DemandeAcces`, `Validation`. *Structure complète pour la gestion des accès et validations.*
- [x] Mettre à jour `send-expense` pour charger les destinataires dans Postgres (trésorerie, chef, email d'unité validé) et conserver le mode Lite (pas de stockage pièce jointe). *Aligne l'envoi d'emails sur les nouvelles données et retire les dépendances aux variables d'environnement par groupe.*

## Session 3 — Interfaces Chef & Trésorier

- [ ] Refonte page d’accueil : champ `code groupe`, saisie email, message “Vérifiez votre boîte mail”. *Remplace la page de connexion Clerk par un parcours orienté produit et donnant clairement la prochaine étape.*
- [ ] Page “En attente de validation” affichée aux chefs non approuvés. *Évite les erreurs d’accès en montrant explicitement que la validation du trésorier est requise.*
- [ ] Vue `/admin/ma-branche` : infos branche, liste des chefs, propositions d’email d’unité/nom interne. *Offre aux chefs un espace limité mais utile pour vérifier leur statut et suggérer des corrections.*
- [ ] Vue `/admin/groupe` : listing branches (édition inline), file d’attente chefs (Approuver/Refuser), gestion code (copie lien, génération QR). *Donne au trésorier la console de pilotage centralisée exigée par le PRD.*
- [ ] Préparer le walkthrough de rentrée (squelette de flow, bouton “Lancer Walkthrough”). *Anticipe la fonctionnalité Phase 2 en posant les hooks UI/techniques sans tout implémenter.*

## Session 4 — Emails & Notifications
- [ ] Centraliser les templates d’emails (`src/lib/email.ts`) : demande d’accès, confirmation chef, refus, notification proposition, digest (option). *Permet de maintenir une seule source de vérité pour les contenus, facilement personnalisables.*
- [ ] Ajouter les boutons `Approuver/Refuser` dans l’email trésorier avec liens sécurisés (token court). *Réduit la friction d’approbation et réutilise les routes API créées en session 2.*
- [ ] Paramétrer la personnalisation (nom groupe, CC optionnelle) côté admin. *Assure que chaque groupe peut ajuster les destinataires et mentions sans changer le code.*
- [ ] Documenter le “mode Lite” dans le mail d’envoi de note (pas de stockage serveur). *Rappelle aux chefs et trésoriers la politique de confidentialité pour éviter les malentendus.*

## Session 5 — Tests & Outillage
- [ ] Écrire tests e2e (Playwright/Cypress) pour : demande d’accès, approbation trésorier, envoi note validé. *Valide bout à bout les parcours critiques et protège contre les régressions UI/API.*
- [ ] Ajouter des tests unitaires pour `send-expense` (validation montant, email). *Sécurise la logique métier sensible (montant >0, destinataires) indépendamment de l’UI.*
- [ ] Prévoir un script de migration des données existantes (groupe historique) vers le nouveau schéma. *Garantit une transition sans perte pour La Guillotière et autres groupes déjà onboardés.*
- [ ] Mettre à jour la documentation (`docs/`) : guide trésorier (code, QR, approbations), guide chef (inscription, envoi). *Offre l’accompagnement nécessaire pour déployer la nouvelle version auprès des utilisateurs finaux.*

- [ ] Retirer SGDF, puisque c'est un mouvement ausein de tous les mouvements scouts de France, ce qui va a l'encontre de notre volonté de généraliser le projet à tous les mouvements
