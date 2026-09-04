# Instructions pour les agents IA de développement

## 📚 Vue d'ensemble du dépôt

Ce dépôt héberge une application **Next.js 16** (App Router) pour la gestion des factures de cartes d'achat SGDF. La stack comprend :

- **TypeScript**
- **Tailwind CSS** pour le style
- **Clerk** pour l'authentification
- **Nodemailer** (SMTP) pour l'envoi d'e-mails côté serveur
- Des fonctionnalités **Progressive Web App (PWA)** (manifest, service worker, support hors-ligne)

Le code source se trouve dans le dossier `src/` et suit la structure conventionnelle de Next.js :

```
src/
├─ app/               # Pages App Router & routes API
│   ├─ layout.tsx
│   ├─ (main)          # Page d'accueil + app
│   ├─ (auth)          # Logique d'authentification Clerk
│   ├─ offline/        # UI spécifique hors-ligne
│   └─ api/            # Gestionnaires de routes côté serveur
├─ components/        # Composants UI réutilisables (formulaires, modales, etc.)
├─ lib/               # Fonctions utilitaires, types et clients API
└─ middleware.ts      # Gestion globale des requêtes (auth, redirections)
```

## 🎯 Objectifs pour les agents IA

**PRIMORDIAL : Rester le plus simple possible. N'écris que le code strictement nécessaire, privilégie toujours une solution existante plutôt qu'ajouter du nouveau code !**

1. **Maintenir la cohérence architecturale** – placer les nouveaux fichiers dans les sous-dossiers appropriés : `app/`, `components/` ou `lib/`.
2. **Respecter le style de code existant** – TypeScript en mode strict, styles Tailwind utilitaires, et règles ESLint définies dans `.eslintrc.json`.
3. **Utiliser des conventions françaises** – nommer les variables, fonctions, types, composants, commentaires et messages utilisateur en français lorsque cela reste compatible avec les conventions ou API externes. Exemple : préférer `montantTotal`, `envoyerFacture` et `FactureFormulaire` à `totalAmount`, `sendInvoice` et `InvoiceForm`, tout en conservant les termes imposés ou conventionnels comme `useState`, `onClick`, `className` et les types d'une bibliothèque externe.
4. **Préserver l'expérience utilisateur** – toute modification d'interface doit respecter l'esthétique dark mode / glassmorphisme déjà en place.
5. **Garantir sécurité et confidentialité** – ne jamais stocker les images uploadées sur le serveur ; les transmettre uniquement par e-mail.
6. **Rédiger une documentation complète** – mettre à jour `README.md` ou `SETUP.md` lors de l'ajout de fonctionnalités.
7. **Rédiger les commits en français** – utiliser les préfixes conventionnels (`feat:`, `fix:`, `chore:`…) suivis d’un message concis en français.

## 🛠️ Workflow de développement

1. **Explorer le code** – commencer par `src/app/layout.tsx` pour comprendre la mise en page globale et le thème Tailwind.
2. **Localiser les composants concernés** – utiliser `grep_search` avec les noms de composants (ex. : `InvoiceForm`).
3. **Ajouter/modifier** – utiliser `replace_file_content` pour des modifications en un seul bloc, ou `multi_replace_file_content` pour des changements dispersés.
4. **Conventions de commit** – suivre les commits conventionnels (`feat:`, `fix:`, `chore:`) et garder les messages concis.

## 📂 Fichiers clés et leur rôle

- **`src/app/layout.tsx`** – encapsule toutes les pages, injecte les styles globaux Tailwind et configure le provider Clerk.
- **`src/app/api/`** – contient les gestionnaires de routes côté serveur (endpoints `POST`) pour l'envoi d'e-mails.
- **`src/components/`** – blocs de construction UI (ex. : `CaptureButton`, `InvoiceForm`).
- **`src/lib/`** – utilitaires comme `formatFileName.ts`, `emailSender.ts`.
- **`middleware.ts`** – protège les routes, redirige les utilisateurs non authentifiés vers la page de connexion Clerk.
- **`public/`** – assets statiques (icônes, manifest PWA).
- **`tailwind.config.js`** – palette de couleurs personnalisée et configuration du dark mode.

## 🧭 Conseils de navigation pour les agents IA

- **Pour étendre l'UI** : placer les nouveaux composants dans `src/components/` et les exporter via un fichier barrel `index.ts` si nécessaire.
- **Pour ajouter de la logique serveur** : utiliser le dossier `src/app/api/` ; garder tout le code serveur hors du bundle client.
- **Pour modifier les styles** : modifier directement les classes Tailwind dans le JSX ; éviter les fichiers CSS personnalisés sauf absolue nécessité.

## 📦 Build & Déploiement

- Développement : `pnpm dev`
- Build de production : `pnpm build`
- Démarrer le serveur de production : `pnpm start`
- Déploiement sur Vercel – s'assurer que toutes les variables d'environnement listées dans `SETUP.md` sont bien renseignées.

## 📝 Mises à jour de la documentation

À chaque modification de fonctionnalité :

1. Ajouter une courte description dans `README.md` sous la section appropriée.
2. Mettre à jour `SETUP.md` si de nouvelles variables d'environnement sont nécessaires.
3. Si les modifications d'UI affectent le parcours utilisateur, ajouter une capture d'écran (générée via `generate_image`) et l'intégrer dans la documentation.
