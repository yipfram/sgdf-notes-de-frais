# 📖 Guide d'installation - Factures carte procurement SGDF

Ce guide explique **pas à pas** comment installer et déployer l'application, que vous soyez développeur ou non.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Ce dont vous aurez besoin](#ce-dont-vous-aurez-besoin)
3. [Guide rapide pour développeurs](#guide-rapide-pour-développeurs)
4. [Guide détaillé pas à pas](#guide-détaillé-pas-à-pas)
   - [Étape 1 : Configuration Gmail](#étape-1--configuration-gmail)
   - [Étape 2 : Configuration Clerk](#étape-2--configuration-clerk)
   - [Étape 3 : Déploiement sur Vercel](#étape-3--déploiement-sur-vercel)
   - [Étape 4 : Configuration des variables d'environnement](#étape-4--configuration-des-variables-denvironnement)
   - [Étape 5 : Finalisation et tests](#étape-5--finalisation-et-tests)
5. [Résolution de problèmes](#résolution-de-problèmes)

---

## Vue d'ensemble

L'application permet aux membres de votre groupe SGDF de :
- Prendre en photo leurs justificatifs de dépenses
- Remplir un formulaire simple (date, montant, branche, description)
- Envoyer automatiquement un email à la trésorerie avec le justificatif en pièce jointe

**Aucune donnée n'est stockée sur un serveur**, tout passe par des emails sécurisés.

**Temps estimé :** 30-45 minutes pour une première installation.

---

## Ce dont vous aurez besoin

Avant de commencer :

- ✅ Un compte **Gmail** pour envoyer les emails (gratuit)
- ✅ Un compte **GitHub** pour accéder au code source (gratuit)
- ✅ Un compte **Clerk** pour l'authentification (gratuit jusqu'à 10 000 utilisateurs/mois)
- ✅ Un compte **Vercel** pour héberger l'application (gratuit pour projets associatifs)

**Tout est gratuit !** Aucun frais n'est requis pour une utilisation associative normale.

---

## Guide rapide pour développeurs

Si vous êtes développeur et que vous connaissez déjà ces outils :

1. Forkez le repo sur GitHub
2. Configurez Clerk sur [dashboard.clerk.com](https://dashboard.clerk.com/)
3. Activez la 2FA Gmail et générez un mot de passe d'application
4. Copiez `.env.example` → `.env.local` et remplissez les 7 variables
5. Déployez sur Vercel et ajoutez les variables d'environnement
6. Ajoutez votre domaine Vercel dans Clerk

Pour plus de détails, voir le [Guide détaillé pas à pas](#guide-détaillé-pas-à-pas) ci-dessous.

---

## Guide détaillé pas à pas

### Étape 1 : Configuration Gmail

Gmail sera utilisé pour envoyer les emails de factures.

#### 1.1 Créer ou utiliser un compte Gmail

Si vous avez déjà un compte Gmail dédié à votre trésorerie SGDF, passez à l'étape 1.2.

Sinon :
1. Allez sur [gmail.com](https://mail.google.com)
2. Créez un nouveau compte (utilisez une adresse professionnelle type `sgdf.tresorerie@gmail.com`)
3. Notez bien l'adresse email et le mot de passe

> 💡 **Conseil** : Utilisez un compte dédié au groupe SGDF plutôt qu'un compte personnel.

#### 1.2 Activer la validation en deux étapes

**Obligatoire** pour pouvoir créer un mot de passe d'application.

1. Connectez-vous à votre compte Gmail
2. Allez sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
3. Cherchez **"Validation en deux étapes"** (ou "2-Step Verification")
4. Cliquez sur **"Validation en deux étapes"** → **"Activer"**
5. Suivez les instructions :
   - Entrez votre numéro de téléphone
   - Recevez et entrez le code SMS
6. ✅ La validation en deux étapes est maintenant active

#### 1.3 Générer un mot de passe d'application

Ce mot de passe permettra à l'application d'envoyer des emails.

1. Sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Cherchez **"Mots de passe des applications"** (ou "App passwords")
3. Cliquez dessus (vous devrez peut-être vous reconnecter)
4. Dans **"Sélectionner une application"** :
   - Choisissez **"Autre (nom personnalisé)"**
   - Tapez : `SGDF Notes de frais`
5. Cliquez sur **"Générer"**
6. Google affiche un mot de passe de **16 caractères** (ex: `abcd efgh ijkl mnop`)
7. **⚠️ IMPORTANT** : Copiez ce mot de passe immédiatement dans un endroit sûr

> Les espaces dans le mot de passe peuvent être gardés ou supprimés (les deux fonctionnent).

---

### Étape 2 : Configuration Clerk

Clerk gère l'authentification des utilisateurs (connexion/inscription).

#### 2.1 Créer un compte Clerk

1. Allez sur [https://dashboard.clerk.com/sign-up](https://dashboard.clerk.com/sign-up)
2. Créez un compte (vous pouvez utiliser Google, GitHub ou email)
3. Confirmez votre compte si nécessaire

> 💡 Gratuit jusqu'à 10 000 utilisateurs actifs/mois.

#### 2.2 Créer une application

1. Sur le tableau de bord Clerk, cliquez sur **"Create application"**
2. Nom : `SGDF Notes de Frais`
3. Dans **"Authentication methods"**, cochez :
   - ✅ **Email** (recommandé - obligatoire)
   - ✅ **Google** (optionnel)
4. Cliquez sur **"Create application"**

#### 2.3 Récupérer vos clés API

1. Après création, vous voyez vos **clés API**
2. Copiez dans un bloc-notes sécurisé :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`)

> 💡 Vous pouvez les retrouver dans **API Keys** dans le menu de gauche.

> ⚠️ **Note** : Nous configurerons le domaine plus tard (après déploiement sur Vercel).

---

### Étape 3 : Déploiement sur Vercel

Vercel hébergera votre application gratuitement.

#### 3.1 Créer un compte Vercel

1. Allez sur [https://vercel.com/signup](https://vercel.com/signup)
2. Cliquez sur **"Continue with GitHub"**
3. Si besoin, créez d'abord un compte GitHub sur [github.com/signup](https://github.com/signup)
4. Autorisez Vercel à accéder à votre compte GitHub

#### 3.2 Forker le projet sur GitHub

1. Allez sur [https://github.com/yipfram/sgdf-notes-de-frais](https://github.com/yipfram/sgdf-notes-de-frais)
2. Cliquez sur **"Fork"** en haut à droite
3. Cliquez sur **"Create fork"**
4. Vous avez maintenant votre propre copie du projet

#### 3.3 Importer sur Vercel

1. Retournez sur [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Cliquez sur **"Add New..."** → **"Project"**
3. Trouvez **sgdf-notes-de-frais** dans la liste
4. Cliquez sur **"Import"**

> ⚠️ **Ne cliquez pas encore sur "Deploy"** ! Nous devons d'abord configurer les variables.

---

### Étape 4 : Configuration des variables d'environnement

Les variables d'environnement sont les "réglages secrets" de l'application.

#### 4.1 Accéder aux paramètres Vercel

Sur la page de configuration du projet dans Vercel, descendez jusqu'à **"Environment Variables"**.

Si vous avez déjà déployé :
1. Allez sur votre projet → **"Settings"** → **"Environment Variables"**

#### 4.2 Ajouter les 7 variables

Pour chaque variable ci-dessous :
1. Entrez le **nom** dans "Key"
2. Entrez la **valeur** dans "Value"
3. Cliquez sur **"Add"**

##### Variable 1 : NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- **Valeur** : Votre clé Clerk publique (commence par `pk_test_...`)
- Où la trouver : Dashboard Clerk → API Keys

##### Variable 2 : CLERK_SECRET_KEY
- **Valeur** : Votre clé Clerk secrète (commence par `sk_test_...`)
- Où la trouver : Dashboard Clerk → API Keys

##### Variable 3 : NEXT_PUBLIC_CLERK_SIGN_IN_URL
- **Valeur** : `/sign-in`
- ⚠️ Tapez exactement `/sign-in` (avec le slash)

##### Variable 4 : NEXT_PUBLIC_CLERK_SIGN_UP_URL
- **Valeur** : `/sign-up`
- ⚠️ Tapez exactement `/sign-up` (avec le slash)

##### Variable 5 : GMAIL_USER
- **Valeur** : Votre adresse Gmail complète (ex: `sgdf.tresorerie@gmail.com`)

##### Variable 6 : GMAIL_APP_PASSWORD
- **Valeur** : Le mot de passe d'application de 16 caractères (créé à l'étape 1.3)
- Les espaces peuvent être gardés ou supprimés

##### Variable 7 : TREASURY_EMAIL
- **Valeur** : L'adresse email de votre trésorerie (peut être la même que GMAIL_USER)

#### 4.3 Vérification

Vérifiez que :
- ✅ Vous avez bien **7 variables**
- ✅ Les noms sont **exactement** comme indiqué
- ✅ Aucune valeur n'a d'espace au début/fin (sauf GMAIL_APP_PASSWORD entre les groupes)

#### 4.4 Déployer

Maintenant, cliquez sur **"Deploy"** !

Vercel va :
1. Construire l'application (2-3 minutes)
2. La déployer automatiquement
3. Vous donner une URL (ex: `https://sgdf-notes-de-frais-xxx.vercel.app`)

---

### Étape 5 : Finalisation et tests

#### 5.1 Configurer le domaine dans Clerk

1. Copiez votre URL Vercel (ex: `sgdf-notes-de-frais-xxx.vercel.app`)
2. Retournez sur [https://dashboard.clerk.com](https://dashboard.clerk.com)
3. Sélectionnez votre application
4. Menu de gauche → **"Domains"**
5. Cliquez sur **"Add domain"**
6. Collez votre domaine Vercel (⚠️ sans le `https://`, juste `sgdf-notes-de-frais-xxx.vercel.app`)
7. Cliquez sur **"Add"**

Clerk détecte automatiquement que c'est un domaine Vercel.

#### 5.2 Tester l'application

1. Allez sur votre URL Vercel
2. Vous voyez la page de connexion ✅
3. Cliquez sur **"Sign up"** et créez un compte test
4. Confirmez votre email
5. Connectez-vous

#### 5.3 Tester l'envoi d'une facture

1. Cliquez sur **"Capturer une photo"** ou **"Importer"**
2. Choisissez une image de test
3. Remplissez le formulaire (date, branche, type, montant, description)
4. Cliquez sur **"Envoyer la facture"**
5. Vous devriez voir un message de confirmation ✅

#### 5.4 Vérifier les emails

Vérifiez :
- ✅ L'email de la trésorerie (TREASURY_EMAIL)
- ✅ Votre email personnel (celui de votre compte)

Vous devriez avoir reçu un email avec :
- Les détails de la facture
- La photo en pièce jointe
- Un nom de fichier formaté : `YYYY-MM-DD - Branche - Type - Montant.jpg`

#### 5.5 Installation sur mobile (optionnel)

**Android (Chrome) :**
1. Ouvrez l'app dans Chrome
2. Un bandeau "Ajouter à l'écran d'accueil" apparaît
3. Tapez "Ajouter"

**iPhone/iPad (Safari) :**
1. Ouvrez l'app dans Safari
2. Icône de partage → "Sur l'écran d'accueil"
3. Tapez "Ajouter"

---

## Configuration requise (référence technique)

Le projet utilise Clerk pour l'authentification et envoie les justificatifs par email via Gmail SMTP. Il n'y a pas de stockage centralisé des factures.

### Configuration Clerk (résumé technique)

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

### Configuration Gmail SMTP (résumé technique)

1. Activez l'authentification à 2 facteurs sur le compte Gmail utilisé pour l'envoi
2. Générez un mot de passe d'application (Google Account → Security → App passwords)
3. Ajoutez ces variables d'environnement :

```bash
GMAIL_USER=sgdf.tresolaguillotiere@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
TREASURY_EMAIL=sgdf.tresolaguillotiere@gmail.com
```

Remarque : utilisez un mot de passe d'application (16 caractères) et ne committez jamais `.env.local`.

### Fichier `.env.local`

Copiez `.env.example` → `.env.local` et remplissez les valeurs ci-dessus.

### PWA (Progressive Web App)

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

---

## Résolution de problèmes

### Problème : "Configuration SMTP invalide"

**Cause** : Le mot de passe d'application Gmail est incorrect.

**Solution** :
1. Vérifiez `GMAIL_APP_PASSWORD` dans Vercel (16 caractères)
2. Vérifiez qu'il n'y a pas d'espaces au début/fin
3. Si le problème persiste, générez un nouveau mot de passe d'application
4. Mettez à jour la variable dans Vercel → Redéployez

### Problème : "Non autorisé" ou impossible de se connecter

**Cause** : Les clés Clerk sont incorrectes ou le domaine n'est pas configuré.

**Solution** :
1. Vérifiez `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` dans Vercel
2. Vérifiez que votre domaine Vercel est dans Clerk → Domains
3. Redéployez l'application

### Problème : Les emails ne sont pas reçus

**Causes possibles** :
1. Email dans les spams
2. Adresse `TREASURY_EMAIL` incorrecte
3. Compte Gmail bloqué

**Solutions** :
1. Vérifiez les spams
2. Vérifiez `TREASURY_EMAIL` dans Vercel
3. Connectez-vous à Gmail et vérifiez les alertes de sécurité

### Problème : "Invalid login"

**Cause** : Mot de passe d'application expiré.

**Solution** :
1. Allez sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Supprimez l'ancien mot de passe d'application
3. Créez-en un nouveau
4. Mettez à jour `GMAIL_APP_PASSWORD` dans Vercel
5. Redéployez

### Problème : L'appareil photo ne fonctionne pas

**Cause** : Navigateur bloque l'accès caméra.

**Solutions** :
1. Vérifiez que l'URL commence par `https://`
2. Autorisez l'accès caméra dans le navigateur
3. Essayez un autre navigateur

### Problème : Erreur 500 ou application ne charge pas

**Solutions** :
1. Vercel → Settings → Environment Variables
2. Vérifiez que les **7 variables** sont présentes :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `TREASURY_EMAIL`
3. Vercel → Deployments → cliquez sur le dernier → vérifiez les logs
4. Redéployez si nécessaire

### Besoin d'aide supplémentaire ?

1. **Consultez les logs** : Vercel → Deployments → Runtime Logs
2. **Ouvrez une issue** : [GitHub Issues](https://github.com/yipfram/sgdf-notes-de-frais/issues)
3. Décrivez votre problème avec le message d'erreur et les étapes suivies

```