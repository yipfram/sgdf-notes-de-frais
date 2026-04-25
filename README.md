[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyipfram%2Fsgdf-notes-de-frais&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,NEXT_PUBLIC_CLERK_SIGN_IN_URL,NEXT_PUBLIC_CLERK_SIGN_UP_URL,SMTP_HOST,SMTP_PORT,SMTP_SECURE,SMTP_USER,SMTP_PASSWORD,SMTP_FROM,TREASURY_EMAIL&envDescription=Variables%20n%C3%A9cessaires%20pour%20le%20d%C3%A9ploiement%20(Clerk%20%2B%20SMTP)&envLink=https%3A%2F%2Fgithub.com%2Fyipfram%2Fsgdf-notes-de-frais%2Fblob%2Fmain%2FSETUP.md&project-name=sgdf-factures&repository-name=sgdf-factures)

<br/>
<img width="350" height="785" alt="image" src="https://github.com/user-attachments/assets/9c01c1a9-5bb7-4c72-95da-a413e1c8be9b" />

# Factures carte procurement SGDF

Application web mobile-first pour la gestion des factures carte procurement du groupe SGDF La Guillotière.

> **Avertissement — Non officiel**  
> Cette application n'est pas affiliée aux Scouts et Guides de France (SGDF) et n'est pas une application officielle.

Ce repository est sous license MIT, vous pouvez l'utiliser comme bon vous semble ! Réadaptez le, et, si vous voulez, taggez moi :)

# Docs
Pour savoir comment l'utiliser avec [la documentation](https://yipfram.github.io/sgdf-notes-de-frais)

## Fonctionnalités

- 📸 **Capture de justificatifs** : prise de photo + import d'images/PDF, avec plusieurs fichiers possibles
- 📝 **Saisie des informations** : Date, branche SGDF, montant, type et description
- ✉️ **Envoi email automatique** : transmission à la trésorerie + copie à l'utilisateur avec une ou plusieurs pièces jointes
- 🏷️ **Nom de fichier structuré** : `YYYY-MM-DD - Branche - Type - Montant - 01.pdf` (ou `.jpg/.png/.webp`)
- 📲 **Installation PWA** : Ajout possible à l'écran d'accueil (Android / iOS / Desktop)
- ⚡ **Mode hors ligne partiel** : Consultation et préparation possible sans réseau (l'envoi nécessite la connexion)
- 🔔 **Bannière d'installation** : Invitation A2HS personnalisée
- 🌙 **Affichage plein écran** : Expérience proche d'une application native

## PWA & Expérience Mobile

L'application est maintenant une **Progressive Web App** :

| Capacité | Détails |
|----------|---------|
| Installation | Icône sur écran d'accueil + splash screen natif |
| Service Worker | Cache Shell applicatif + stratégie network-first pour API |
| Offline | Formulaire utilisable, justificatifs conservés en mémoire, envoi différé impossible (pas de queue persistée) |
| Icônes | Logo SGDF bleu & blanc (maskable) |
| Performance | Stratégie *stale-while-revalidate* pour actifs statiques |
| Sécurité | Toujours via HTTPS (caméra + SW) |

> Limitation actuelle : pas encore de stockage local durable des brouillons. Si la page est rechargée hors ligne, la note en cours est perdue.

## Branches SGDF supportées

- Farfadets
- Louveteaux
- Jeannettes
- Scouts
- Guides
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

# Lancer en production (si déployé localement)
pnpm start
```

## Utilisation

1. Se connecter via Clerk
2. Capturer une photo ou importer un/des justificatif(s) (images/PDF)
3. Saisir la date, la branche, le montant et la description
4. Envoyer : un email est généré côté serveur et envoyé à la trésorerie et à l'utilisateur
5. Installer l'application sur l'écran d'accueil pour un accès rapide
6. 
---

Pour toute amélioration ou besoin spécifique (ex: sauvegarde locale des brouillons), ouvrir une issue ou proposer une PR.
