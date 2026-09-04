[![Deploy with Vercel](https://vercel.com/button)](<https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyipfram%2Fsgdf-notes-de-frais&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,NEXT_PUBLIC_CLERK_SIGN_IN_URL,NEXT_PUBLIC_CLERK_SIGN_UP_URL,SMTP_HOST,SMTP_PORT,SMTP_SECURE,SMTP_USER,SMTP_PASSWORD,SMTP_FROM,NEXT_PUBLIC_TREASURY_EMAIL&envDescription=Variables%20n%C3%A9cessaires%20pour%20le%20d%C3%A9ploiement%20(Clerk%20%2B%20SMTP)&envLink=https%3A%2F%2Fgithub.com%2Fyipfram%2Fsgdf-notes-de-frais%2Fblob%2Fmain%2FSETUP.md&project-name=sgdf-factures&repository-name=sgdf-factures>)

<br/>
<img width="350" height="785" alt="image" src="https://github.com/user-attachments/assets/9c01c1a9-5bb7-4c72-95da-a413e1c8be9b" />

# Factures carte procurement SGDF

Application web mobile-first pour la gestion des factures carte procurement des groupes SGDF.

> **Avertissement — Non officiel**  
> Cette application n'est pas affiliée aux Scouts et Guides de France (SGDF) et n'est pas une application officielle.

Ce repository est sous license MIT, vous pouvez l'utiliser comme bon vous semble ! Réadaptez le, et, si vous voulez, taggez moi :)

# Docs

Pour savoir comment l'utiliser avec [la documentation](https://yipfram.github.io/sgdf-notes-de-frais)

## Fonctionnalités

- 📸 **Capture de justificatifs** : prise de photo + import d'images/PDF, avec plusieurs fichiers possibles (jusqu'à 6 justificatifs par envoi)
- 📝 **Saisie des informations** : Date, branche SGDF, montant, type et description ; avec plusieurs justificatifs, un montant et une catégorie sont saisis pour chaque dépense et le total est calculé automatiquement
- ✉️ **Envoi email automatique** : transmission à la trésorerie + copie à l'utilisateur avec une ou plusieurs pièces jointes
- 👥 **Multi-groupes** : chaque groupe configure ses unités, invite ses membres et valide sa propre adresse de trésorerie
- 🔐 **Validation de trésorerie** : aucun envoi n’est possible avant la confirmation reçue par e-mail du trésorier
- 🏷️ **Nom de fichier structuré** : `YYYY-MM-DD - Branche - Type - Montant - 01.pdf` (ou `.jpg/.png/.webp`)
- 📲 **Installation PWA** : Ajout possible à l'écran d'accueil (Android / iOS / Desktop)
- ⚡ **Mode hors ligne partiel** : Consultation et préparation possible sans réseau (l'envoi nécessite la connexion)
- 🔔 **Bannière d'installation** : Invitation A2HS personnalisée
- 🌙 **Affichage plein écran** : Expérience proche d'une application native

## Créer un groupe

Après votre inscription, créez ou sélectionnez votre groupe depuis le sélecteur dans l’en-tête. Le responsable configure l’adresse de trésorerie et les unités. Une confirmation est envoyée à la trésorerie : tant que le lien n’est pas validé, aucune note ne peut être transmise.

La liste d’unités est proposée avec les branches SGDF courantes, mais chaque groupe peut la renommer, compléter ou simplifier. Chaque unité possède une couleur, reprise dans les e-mails de notes de frais.

Dans le tableau de bord Clerk, activez **Organizations** ainsi que les invitations d’organisation. Activez également Google dans **SSO connections** si vous souhaitez afficher « Continuer avec Google » en plus de l’e-mail/mot de passe.

## Unités proposées par défaut

- Farfadets
- Louveteaux-Jeannettes
- Scouts-Guides
- Pionniers-Caravelles
- Compagnons
- Groupe

## Technologies utilisées

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Clerk** (authentification)
- **Nodemailer / SMTP générique** (envoi d'emails côté serveur - compatible Gmail, Outlook, Office 365, serveurs personnalisés)
- **PWA** (manifest + service worker)

## Développement (quickstart)

```bash
# Installer les dépendances
pnpm install

# Lancer en développement
pnpm dev

# Build pour production
pnpm build

# Lancer les tests
pnpm test

# Lancer les tests en mode watch
pnpm test:watch

# Lancer les vérifications de PR
pnpm validate
pnpm format

# Lancer en production (si déployé localement)
pnpm start
```

---

Pour toute amélioration ou besoin spécifique (ex: sauvegarde locale des brouillons), ouvrir une issue ou proposer une PR.
