# 📖 Guide d'installation - Factures carte procurement SGDF

Ce guide explique **pas à pas** comment installer et déployer l'application, que vous soyez développeur ou non.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Ce dont vous aurez besoin](#ce-dont-vous-aurez-besoin)
3. [Guide rapide pour développeurs](#guide-rapide-pour-développeurs)
4. [Guide détaillé pas à pas](#guide-détaillé-pas-à-pas)
   - [Étape 1 : Configuration SMTP (Email)](#étape-1--configuration-smtp-email)
   - [Étape 2 : Configuration Clerk](#étape-2--configuration-clerk)
   - [Étape 3 : Déploiement sur Vercel](#étape-3--déploiement-sur-vercel)
   - [Étape 4 : Configuration des variables d'environnement](#étape-4--configuration-des-variables-denvironnement)
   - [Étape 5 : Finalisation et tests](#étape-5--finalisation-et-tests)
5. [Résolution de problèmes](#résolution-de-problèmes)

---

## Vue d'ensemble

L'application permet aux membres de votre groupe SGDF de :
- Prendre en photo ou importer leurs justificatifs de dépenses (images ou PDF)
- Remplir un formulaire simple (date, montant, branche, description)
- Envoyer automatiquement un email à la trésorerie avec un ou plusieurs justificatifs en pièce jointe

**Aucune donnée n'est stockée sur un serveur**, tout passe par des emails sécurisés.

**Temps estimé :** 30-45 minutes pour une première installation.

---

## Ce dont vous aurez besoin

Avant de commencer :

- ✅ Un compte **Email** avec accès SMTP pour envoyer les emails (Gmail, Outlook, Office 365, ou serveur personnalisé - gratuit)
- ✅ Un compte **GitHub** pour accéder au code source (gratuit)
- ✅ Un compte **Clerk** pour l'authentification (gratuit jusqu'à 10 000 utilisateurs/mois)
- ✅ Un compte **Vercel** pour héberger l'application (gratuit pour projets associatifs)

**Tout est gratuit !** Aucun frais n'est requis pour une utilisation associative normale.

---

## Guide rapide pour développeurs

Si vous êtes développeur et que vous connaissez déjà ces outils :

1. Forkez le repo sur GitHub
2. Configurez Clerk sur [dashboard.clerk.com](https://dashboard.clerk.com/)
3. Configurez vos identifiants SMTP (voir `.env.example` pour exemples Gmail/Outlook/Office365)
4. Copiez `.env.example` → `.env.local` et remplissez les variables SMTP + Clerk
5. Déployez sur Vercel et ajoutez les variables d'environnement
6. Ajoutez votre domaine Vercel dans Clerk

Pour plus de détails, voir le [Guide détaillé pas à pas](#guide-détaillé-pas-à-pas) ci-dessous.

---

## Guide détaillé pas à pas

### Étape 1 : Configuration SMTP (Email)

L'application utilise le protocole SMTP pour envoyer les emails de factures. Vous pouvez utiliser **Gmail, Outlook, Office 365, ou n'importe quel serveur SMTP**.

#### 1.1 Choisir votre fournisseur SMTP

Vous avez plusieurs options :

**Option A : Gmail** (recommandé pour les associations)
- Gratuit et fiable
- Nécessite un compte Gmail et un mot de passe d'application
- Limite : 500 emails/jour (largement suffisant)

**Option B : Outlook/Hotmail**
- Gratuit avec un compte Microsoft
- Configuration simple
- Aucun mot de passe d'application nécessaire

**Option C : Office 365**
- Si votre association a un compte Microsoft professionnel
- Même configuration qu'Outlook

**Option D : Serveur SMTP personnalisé**
- Si vous avez votre propre serveur email
- Configuration selon votre hébergeur

#### 1.2 Configuration pour Gmail

Si vous utilisez Gmail, suivez ces étapes :

**1.2.1 Créer ou utiliser un compte Gmail**

Si vous avez déjà un compte Gmail dédié à votre trésorerie, passez à l'étape suivante.

Sinon :
1. Allez sur [gmail.com](https://mail.google.com)
2. Créez un nouveau compte (ex: `sgdf.tresorerie@gmail.com`)
3. Notez bien l'adresse email

> 💡 **Conseil** : Utilisez un compte dédié au groupe plutôt qu'un compte personnel.

**1.2.2 Activer la validation en deux étapes**

**Obligatoire** pour pouvoir créer un mot de passe d'application.

1. Connectez-vous à votre compte Gmail
2. Allez sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
3. Cherchez **"Validation en deux étapes"** (ou "2-Step Verification")
4. Cliquez sur **"Validation en deux étapes"** → **"Activer"**
5. Suivez les instructions (numéro de téléphone + code SMS)
6. ✅ La validation en deux étapes est maintenant active

**1.2.3 Générer un mot de passe d'application**

1. Sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Cherchez **"Mots de passe des applications"** (ou "App passwords")
3. Cliquez dessus
4. Dans **"Sélectionner une application"** :
   - Choisissez **"Autre (nom personnalisé)"**
   - Tapez : `SGDF Notes de frais`
5. Cliquez sur **"Générer"**
6. Google affiche un mot de passe de **16 caractères** (ex: `abcd efgh ijkl mnop`)
7. **⚠️ IMPORTANT** : Copiez ce mot de passe immédiatement dans un endroit sûr

**Informations à noter pour Gmail :**
- SMTP_HOST : `smtp.gmail.com`
- SMTP_PORT : `587`
- SMTP_SECURE : `false`
- SMTP_USER : votre adresse Gmail complète
- SMTP_PASSWORD : le mot de passe d'application de 16 caractères

#### 1.3 Configuration pour Outlook/Hotmail

Si vous utilisez Outlook ou Hotmail :

1. Créez ou utilisez un compte sur [outlook.com](https://outlook.com)
2. Notez votre adresse email et mot de passe

**Informations à noter pour Outlook :**
- SMTP_HOST : `smtp-mail.outlook.com`
- SMTP_PORT : `587`
- SMTP_SECURE : `false`
- SMTP_USER : votre adresse Outlook complète
- SMTP_PASSWORD : votre mot de passe Outlook habituel

#### 1.4 Configuration pour Office 365

Si votre association a Office 365 :

1. Utilisez votre adresse email professionnelle
2. Notez votre mot de passe

**Informations à noter pour Office 365 :**
- SMTP_HOST : `smtp.office365.com`
- SMTP_PORT : `587`
- SMTP_SECURE : `false`
- SMTP_USER : votre adresse email professionnelle
- SMTP_PASSWORD : votre mot de passe habituel

#### 1.5 Configuration pour serveur personnalisé

Si vous avez un serveur SMTP personnalisé :

1. Contactez votre hébergeur ou administrateur système
2. Demandez les informations SMTP :
   - Adresse du serveur SMTP (ex: `smtp.votredomaine.com`)
   - Port (généralement 587 ou 465)
   - Si SSL/TLS est requis
   - Vos identifiants (nom d'utilisateur et mot de passe)

**Informations à noter :**
- SMTP_HOST : adresse fournie par votre hébergeur
- SMTP_PORT : port fourni (587 ou 465)
- SMTP_SECURE : `true` pour port 465, `false` pour 587
- SMTP_USER : votre nom d'utilisateur
- SMTP_PASSWORD : votre mot de passe

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

#### 4.2 Ajouter les variables d'environnement

Pour chaque variable ci-dessous :
1. Entrez le **nom** dans "Key"
2. Entrez la **valeur** dans "Value"
3. Cliquez sur **"Add"**

**Variables Clerk (4 variables) :**

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

**Variables SMTP (6 variables minimum) :**

##### Variable 5 : SMTP_HOST
- **Valeur** : L'adresse de votre serveur SMTP (notée à l'étape 1)
- Exemples : `smtp.gmail.com`, `smtp-mail.outlook.com`, `smtp.office365.com`

##### Variable 6 : SMTP_PORT
- **Valeur** : Le port SMTP (noté à l'étape 1)
- Généralement : `587` (TLS) ou `465` (SSL)

##### Variable 7 : SMTP_SECURE
- **Valeur** : `false` pour port 587, `true` pour port 465

##### Variable 8 : SMTP_USER
- **Valeur** : Votre nom d'utilisateur SMTP (généralement votre adresse email complète)

##### Variable 9 : SMTP_PASSWORD
- **Valeur** : Votre mot de passe SMTP
- Pour Gmail : le mot de passe d'application de 16 caractères
- Pour Outlook/Office365 : votre mot de passe habituel

##### Variable 10 : TREASURY_EMAIL
- **Valeur** : L'adresse email de votre trésorerie (destinataire principal des factures)

**Variables optionnelles (pour personnalisation) :**

##### SMTP_FROM (optionnel mais recommandé si votre fournisseur impose un user technique)
- **Valeur** : Adresse email complète ou format `Nom <email>` utilisé comme expéditeur
- Indispensable pour des fournisseurs comme Resend où `SMTP_USER = resend`
- Si non définie : l'application retombera sur SMTP_FROM_EMAIL puis SMTP_USER

##### SMTP_FROM_NAME (optionnel)
- **Valeur** : Nom affiché comme expéditeur (ex: `Factures SGDF La Guillotière`)
- Utilisé uniquement si `SMTP_FROM` ne contient pas déjà un nom
- Si non définie : utilise `Factures carte procurement SGDF`

##### SMTP_FROM_EMAIL (optionnel)
- **Valeur** : Email affiché comme expéditeur
- Sert de solution de repli si `SMTP_FROM` n'est pas défini
- Si non définie : utilise SMTP_USER

#### 4.3 Vérification

Vérifiez que :
- ✅ Vous avez au minimum **10 variables** (4 Clerk + 6 SMTP)
- ✅ Les noms sont **exactement** comme indiqué
- ✅ Aucune valeur n'a d'espace au début/fin

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

1. Cliquez sur **"Prendre photo"** ou **"Importer fichier"**
2. Choisissez un ou plusieurs justificatifs de test (image(s) et/ou PDF)
3. Remplissez le formulaire (date, branche, type, montant, description)
4. Cliquez sur **"Envoyer la facture"**
5. Vous devriez voir un message de confirmation ✅

#### 5.4 Vérifier les emails

Vérifiez :
- ✅ L'email de la trésorerie (TREASURY_EMAIL)
- ✅ Votre email personnel (celui de votre compte)

Vous devriez avoir reçu un email avec :
- Les détails de la facture
- Une ou plusieurs pièces jointes
- Des noms de fichiers formatés : `YYYY-MM-DD - Branche - Type - Montant.pdf` (un seul fichier) ou `YYYY-MM-DD - Branche - Type - Montant - 01.pdf` (plusieurs fichiers)

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

### Configuration SMTP (résumé technique)

L'application supporte n'importe quel serveur SMTP. Voici les variables requises :

```bash
# Requis
SMTP_HOST=smtp.gmail.com                    # ou smtp-mail.outlook.com, smtp.office365.com, etc.
SMTP_PORT=587                               # ou 465 pour SSL
SMTP_SECURE=false                           # true pour port 465, false pour 587
SMTP_USER=votre-email@example.com
SMTP_PASSWORD=votre-mot-de-passe            # Mot de passe d'application pour Gmail
TREASURY_EMAIL=tresorerie@example.com

# Optionnel
SMTP_FROM=noreply@example.com              # Requis pour Resend ou si SMTP_USER n'est pas une adresse
SMTP_FROM_NAME=Factures SGDF
SMTP_FROM_EMAIL=noreply@example.com        # Reste utile comme repli si SMTP_FROM absent
```

**Pour Gmail :** Activez la 2FA et générez un mot de passe d'application (Google Account → Security → App passwords)

**Pour Outlook/Office365 :** Utilisez votre mot de passe habituel

Remarque : Ne committez jamais `.env.local` (déjà dans `.gitignore`).

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
2. L'utilisateur capture ou importe un/des justificatif(s) (images/PDF)
3. L'utilisateur complète manuellement la date, le type, le montant, la branche et la description
4. Le frontend envoie les données et les pièces jointes (base64) à l'API route `/api/send-expense`
5. Le serveur valide les données, construit l'email et envoie via Gmail SMTP à :
   - Trésorerie (`TREASURY_EMAIL`)
   - Utilisateur (email Clerk)

L'email contient un HTML lisible, un fallback texte et les pièces jointes avec des noms formatés `YYYY-MM-DD - Branche - Type - Montant - 01.ext`.

### Limites des pièces jointes

- Types supportés : JPG, PNG, WEBP, PDF
- Nombre maximum : 6 pièces jointes
- Taille maximum par fichier : 8 MB
- Taille totale maximum : 20 MB

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

**Cause** : Les identifiants SMTP sont incorrects ou le serveur est inaccessible.

**Solution** :
1. Vérifiez `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` dans Vercel
2. Vérifiez qu'il n'y a pas d'espaces au début/fin des valeurs
3. Pour Gmail : Vérifiez que vous utilisez un mot de passe d'application (16 caractères)
4. Pour Outlook/Office365 : Vérifiez que votre mot de passe est correct
5. Vérifiez que `SMTP_SECURE` correspond au port (`false` pour 587, `true` pour 465)
6. Mettez à jour les variables dans Vercel → Redéployez

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
3. Compte email bloqué ou limité
4. Serveur SMTP bloque l'envoi

**Solutions** :
1. Vérifiez les spams et les dossiers courrier indésirable
2. Vérifiez `TREASURY_EMAIL` dans Vercel
3. Connectez-vous à votre compte email et vérifiez les alertes de sécurité
4. Vérifiez les logs Vercel pour des erreurs d'envoi

### Problème : "Invalid login" ou erreur d'authentification SMTP

**Cause** : Identifiants SMTP incorrects ou expirés.

**Solution Gmail** :
1. Allez sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Supprimez l'ancien mot de passe d'application
3. Créez-en un nouveau
4. Mettez à jour `SMTP_PASSWORD` dans Vercel
5. Redéployez

**Solution Outlook/Office365** :
1. Vérifiez que votre mot de passe est correct
2. Vérifiez que la 2FA n'est pas activée (ou utilisez un mot de passe d'application si disponible)
3. Mettez à jour `SMTP_PASSWORD` dans Vercel
4. Redéployez

### Problème : L'appareil photo ne fonctionne pas

**Cause** : Navigateur bloque l'accès caméra.

**Solutions** :
1. Vérifiez que l'URL commence par `https://`
2. Autorisez l'accès caméra dans le navigateur
3. Essayez un autre navigateur

### Problème : Erreur 500 ou application ne charge pas

**Solutions** :
1. Vercel → Settings → Environment Variables
2. Vérifiez que les **10 variables minimum** sont présentes :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `TREASURY_EMAIL`
3. Vercel → Deployments → cliquez sur le dernier → vérifiez les logs
4. Redéployez si nécessaire

### Besoin d'aide supplémentaire ?

1. **Consultez les logs** : Vercel → Deployments → Runtime Logs
2. **Ouvrez une issue** : [GitHub Issues](https://github.com/yipfram/sgdf-notes-de-frais/issues)
3. Décrivez votre problème avec le message d'erreur et les étapes suivies

```
