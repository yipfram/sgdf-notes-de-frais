# Configuration SGDF Notes de Frais

## ⚙️ Configuration requise

### 1. Configuration Clerk (Authentification)
C'est gratuit !!

1. Créez un compte sur [Clerk Dashboard](https://dashboard.clerk.com/)
2. Créez une nouvelle application
3. Activez les providers de connexion :
   - **Email** (recommandé)
   - **Google** (optionnel)
4. Copiez les clés dans `.env.local` :
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### 2. Configuration Gmail SMTP

1. **Activer l'authentification à 2 facteurs** sur votre email
2. **Générer un mot de passe d'application** :
   - Aller dans [Google Account Security](https://myaccount.google.com/security)
   - Rechercher "Mots de passe d'application" 
   - Créer un nouveau mot de passe pour "Application personnalisée"
   - Nommer : "SGDF Notes de Frais"
3. **Ajouter les variables d'environnement** :
   ```bash
   GMAIL_USER=sgdf.tresolaguillotiere@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   TREASURY_EMAIL=sgdf.tresolaguillotiere@gmail.com
   ```

### 3. Configuration complète `.env.local`

Copiez le fichier `.env.example` vers `.env.local` et remplissez les valeurs :

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Gmail SMTP Configuration
GMAIL_USER=sgdf.tresolaguillotiere@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Application Settings
TREASURY_EMAIL=sgdf.tresolaguillotiere@gmail.com
```

## 🚀 Installation et lancement

```bash
# Installation
pnpm install

# Lancement en développement
pnpm dev

# Build pour production
pnpm build
pnpm start
```

## 📧 Fonctionnement de l'envoi d'email

1. **Utilisateur se connecte** via Clerk (Google ou email)
2. **Capture une photo** du justificatif avec OCR automatique
3. **Remplit le formulaire** avec les informations de la dépense
4. **Soumet le formulaire** → L'email est automatiquement envoyé à :
   - **Trésorerie** : `sgdf.tresolaguillotiere@gmail.com`
   - **Utilisateur** : son email de connexion
5. **Email contient** :
   - Toutes les informations de la note de frais
   - Photo du justificatif en pièce jointe
   - Nom de fichier formaté : `YYYY-MM-DD - Branche - Montant.jpg`

## 🔒 Sécurité

- **Authentification obligatoire** : Seuls les utilisateurs connectés peuvent accéder
- **Variables d'environnement** : Toutes les clés sensibles sont dans `.env.local` (ignoré par Git)
- **Validation côté serveur** : Toutes les données sont validées avant envoi
- **HTTPS requis** : Pour l'accès caméra en production

## 🏗️ Architecture

```
Frontend (React + Clerk) → API Route (/api/send-expense) → Gmail SMTP → Email delivery
                      ↓
               Authentification
```

## 📱 Déploiement

### Vercel (Recommandé)
1. Connecter le repository GitHub à Vercel
2. Ajouter les variables d'environnement dans Vercel Dashboard
3. Deploy automatique

### Autres plateformes
- Assurer que les variables d'environnement sont configurées
- Platform doit supporter les API routes Next.js
- HTTPS obligatoire pour l'accès caméra

## 🆘 Dépannage

### Erreurs courantes

**"Configuration SMTP invalide"**
- Vérifier le mot de passe d'application Gmail
- S'assurer que l'authentification 2FA est activée

**"Non autorisé"**
- Vérifier la configuration Clerk
- S'assurer que l'utilisateur est connecté

**"Erreur de format email"**
- Vérifier que l'email utilisateur est valide
- Contrôler les variables d'environnement

### Logs et debug
- Consulter la console navigateur pour les erreurs frontend
- Consulter les logs Vercel pour les erreurs backend
- Tester l'envoi d'email avec un formulaire simple