# Configuration Factures carte procurement SGDF

## ⚙️ Configuration requise

Le projet utilise Clerk pour l'authentification et envoie les justificatifs par email via Gmail SMTP. Il n'y a pas de stockage centralisé des factures.

### 1. Configuration Clerk (authentification)

1. Créez un compte sur https://dashboard.clerk.com/
2. Créez une nouvelle application
3. Activez les providers souhaités : Email (recommandé), Google (optionnel)
4. Copiez les clés dans `.env.local` :

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### 2. Configuration Gmail SMTP (envoi d'emails côté serveur)

1. Activez l'authentification à 2 facteurs sur le compte Gmail utilisé pour l'envoi
2. Générez un mot de passe d'application (Google Account → Security → App passwords)
3. Ajoutez ces variables d'environnement :

```bash
GMAIL_USER=sgdf.tresolaguillotiere@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
TREASURY_EMAIL=sgdf.tresolaguillotiere@gmail.com
```

Remarque : utilisez un mot de passe d'application (16 caractères) et ne committez jamais `.env.local`.

### 3. Fichier `.env.local`

Copiez `.env.example` → `.env.local` et remplissez les valeurs ci-dessus.

### 4. PWA (Progressive Web App)

Déjà configurée :

- `public/manifest.json` : nom, couleurs, icônes
- `public/sw.js` : cache shell + stratégies runtime
- Icônes : `SGDF_symbole_RVB.png` & `SGDF_symbole_blanc.png`
- Enregistrement du SW dans `app/layout.tsx`
- Invite d'installation personnalisée (`InstallPrompt.tsx`)

Limitations hors ligne :

- L'envoi d'email nécessite une connexion
- Pas de persistance locale des brouillons par défaut

## 🚀 Installation et lancement

```powershell
# Installation
pnpm install

# Lancement en développement
pnpm dev

# Build pour production
pnpm build

# Lancer en production (si déployé localement)
pnpm start
```

## 📧 Fonctionnement de l'envoi d'email

1. L'utilisateur se connecte via Clerk
2. L'utilisateur capture ou importe une photo du justificatif
3. L'utilisateur complète manuellement la date, le type, le montant, la branche et la description
4. Le frontend envoie les données et l'image en base64 à l'API route `/api/send-expense`
5. Le serveur valide les données, construit l'email et envoie via Gmail SMTP à :
   - Trésorerie (`TREASURY_EMAIL`)
   - Utilisateur (email Clerk)

L'email contient un HTML lisible, un fallback texte et la photo en pièce jointe avec un nom formatté `YYYY-MM-DD - Branche - Montant.jpg`.

## 🔒 Sécurité

- Authentification obligatoire (Clerk)
- Variables sensibles dans `.env.local` (ignoré par Git)
- Validation côté serveur avant envoi
- HTTPS requis en production pour l'accès caméra

## Architecture

```
Frontend (React + Clerk) → API Route (/api/send-expense) → Gmail SMTP → Email delivery
                      ↓
               Authentification
```

## 📱 Déploiement

### Vercel (Recommandé)
1. Connectez le repo GitHub à Vercel
2. Ajoutez les variables d'environnement dans Vercel Dashboard
3. Déployez (build automatique)

### Autres plateformes

- Assurez-vous que les variables d'environnement sont configurées
- La plateforme doit supporter les API routes Next.js
- HTTPS requis pour l'accès caméra

## ⚙️ Dépannage

**"Configuration SMTP invalide"**

- Vérifiez GMAIL_APP_PASSWORD (mot de passe d'application)
- Vérifiez que le compte n'est pas bloqué par Google

**"Non autorisé"**

- Vérifiez les clés Clerk
- Assurez-vous que l'utilisateur est connecté

**Logs & debug**

- Console navigateur pour erreurs frontend
- Logs Vercel / serveur pour erreurs backend
- Tester l'API `/api/send-expense` en local avec des données minimales

```