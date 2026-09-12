# 📖 Guide d'installation - Scouticket

Ce guide explique **pas à pas** comment installer et déployer l'application, que vous soyez développeur ou non.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Ce dont vous aurez besoin](#ce-dont-vous-aurez-besoin)
3. [Guide rapide pour développeurs](#guide-rapide-pour-développeurs)
4. [Guide détaillé pas à pas](#guide-détaillé-pas-à-pas)
   - [Étape 1 : Configuration SMTP (Email)](#étape-1--configuration-smtp-email)
   - [Étape 2 : Configuration Better Auth](#étape-2--configuration-better-auth)
   - [Étape 3 : Configuration des variables d'environnement](#étape-3--configuration-des-variables-denvironnement)
   - [Étape 4 : Finalisation et tests](#étape-4--finalisation-et-tests)
5. [Résolution de problèmes](#résolution-de-problèmes)

---

## Vue d'ensemble

L'application permet aux membres de votre groupe scout de :

- Prendre en photo ou importer leurs justificatifs de dépenses (images ou PDF)
- Remplir un formulaire simple (date, montant, branche, description)
- Envoyer automatiquement un e-mail à la trésorerie avec un ou plusieurs justificatifs en pièce jointe

**Aucune donnée n'est stockée sur un serveur**, tout passe par des emails sécurisés.

**Temps estimé :** 30-45 minutes pour une première installation.

---

## Ce dont vous aurez besoin

Avant de commencer :

- ✅ Un compte **Email** avec accès SMTP pour envoyer les emails (Gmail, Outlook, Office 365, ou serveur personnalisé - gratuit)
- ✅ Un compte **GitHub** pour accéder au code source (gratuit)
- ✅ Une base PostgreSQL et les variables **Better Auth** pour l'authentification

**Tout est gratuit !** Aucun frais n'est requis pour une utilisation associative normale.

---

## Guide rapide pour développeurs

Si vous êtes développeur et que vous connaissez déjà ces outils :

1. Forkez le repo sur GitHub
2. Configurez PostgreSQL et Better Auth dans `.env.local`
3. Configurez vos identifiants SMTP (voir `.env.example` pour exemples Gmail/Outlook/Office365)
4. Copiez `.env.example` → `.env.local` et remplissez les variables SMTP + Better Auth
5. Déployez l’application chez l’hébergeur de votre choix et ajoutez les variables d’environnement
6. Ajoutez les URL de production dans `BETTER_AUTH_URL` et `APP_URL`

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
2. Créez un nouveau compte (ex: `tresorerie-de-votre-groupe@example.com`)
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
   - Tapez : `Scouticket`
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

### Étape 2 : Configuration Better Auth

Better Auth gère l’authentification depuis l’application. Configurez une base PostgreSQL, puis définissez `DATABASE_URL`, `BETTER_AUTH_SECRET` (une valeur longue et aléatoire), `AUDIT_LOG_SECRET` (une valeur différente, utilisée pour pseudonymiser les audits), `BETTER_AUTH_URL` et `APP_URL`. L’inscription e-mail/mot de passe requiert aussi la configuration SMTP afin d’envoyer les liens de vérification et de réinitialisation.

Après le déploiement, exécutez `pnpm auth:migrate`, puis `pnpm db:migrate`. Cette dernière commande charge le fichier `.env` lorsqu’il existe. La première commande crée les tables Better Auth ; la seconde applique une seule fois chaque migration de `sql/` et l’historise dans PostgreSQL. Relancez ces deux commandes avant un déploiement qui introduit une migration. Google est optionnel : ajoutez `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` pour l’activer.

Si une connexion sociale échoue avec `column "id" of relation "rateLimit" does not exist`, la base n’a pas encore reçu la migration Scouticket : exécutez `pnpm db:migrate` avec la `DATABASE_URL` de cet environnement.

Si Google est activé, configurez dans Google Cloud Console l’URI `http://localhost:3000/api/auth/callback/google` en local et `https://votre-domaine/api/auth/callback/google` en production. Cette URL est construite à partir de `BETTER_AUTH_URL`.

---

### Étape 3 : Configuration des variables d'environnement

Les variables d'environnement sont les "réglages secrets" de l'application.

#### 3.1 Tableau récapitulatif des variables

| Variable             | Requis | Description                                     | Exemple                     |
| -------------------- | :----: | ----------------------------------------------- | --------------------------- |
| `DATABASE_URL`       |   ✅   | Connexion PostgreSQL                            | `postgresql://…/scouticket` |
| `BETTER_AUTH_SECRET` |   ✅   | Secret Better Auth long et aléatoire            | `…`                         |
| `BETTER_AUTH_URL`    |   ✅   | URL publique de l’application                   | `https://app.exemple.fr`    |
| `SMTP_HOST`          |   ✅   | Adresse du serveur SMTP                         | `smtp.gmail.com`            |
| `SMTP_PORT`          |   ✅   | Port SMTP (587 TLS, 465 SSL)                    | `587`                       |
| `SMTP_SECURE`        |   ✅   | SSL/TLS activé (`true`/`false`)                 | `false`                     |
| `SMTP_USER`          |   ✅   | Identifiant SMTP (votre email)                  | `monemail@gmail.com`        |
| `SMTP_PASSWORD`      |   ✅   | Mot de passe SMTP                               | `motdepasse16caracteres`    |
| `APP_URL`            |   ✅   | URL publique utilisée dans les liens par e-mail | `https://app.scouticket.fr` |
| `MAINTENANCE_MODE`   |   ♠️   | Active la page de maintenance et bloque les API | `false`                     |
| `SMTP_FROM`          |   ♠️   | Adresse e-mail expéditrice personnalisée        | `noreply@mondomaine.fr`     |
| `SMTP_FROM_NAME`     |   ♠️   | Nom utilisé pour tous les e-mails expédiés      | `Scouticket`                |
| `SMTP_FROM_EMAIL`    |   ♠️   | Email expéditeur de repli                       | `expediteur@email.fr`       |

> ✅ = Requis • ♠️ = Optionnel

Pour interrompre temporairement le service, définissez `MAINTENANCE_MODE=true`, puis redéployez l’application. Les pages afficheront la maintenance, les API répondront avec le statut `503` et `/api/health` signalera l’état `maintenance`. Remettez la valeur à `false` puis redéployez pour rétablir le service.

#### Valeurs par fournisseur

| Fournisseur     | SMTP_HOST               | SMTP_PORT | SMTP_SECURE |
| --------------- | ----------------------- | --------- | ----------- |
| Gmail           | `smtp.gmail.com`        | `587`     | `false`     |
| Outlook/Hotmail | `smtp-mail.outlook.com` | `587`     | `false`     |
| Office 365      | `smtp.office365.com`    | `587`     | `false`     |
| SSL (port 465)  | `smtp.gmail.com`        | `465`     | `true`      |

#### 3.2 Vérification

Vérifiez que :

- ✅ Vous avez `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `APP_URL` et les variables SMTP
- ✅ Les noms sont **exactement** comme indiqué
- ✅ Aucune valeur n'a d'espace au début/fin

---

### Étape 4 : Finalisation et tests

#### 4.1 Tester l'application

1. Allez sur l’URL publique de l’application
2. Vous voyez la page de connexion ✅
3. Cliquez sur **"Sign up"** et créez un compte test
4. Confirmez votre email
5. Connectez-vous

#### 4.2 Tester l'envoi d'une facture

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

Le projet utilise Better Auth pour l'authentification et envoie les justificatifs par email via Gmail SMTP. Il n'y a pas de stockage centralisé des factures.

### Configuration Better Auth (résumé technique)

#### Activer les groupes et Google

Les responsables créent directement leurs groupes dans l’application et invitent leurs membres par e-mail. Better Auth stocke les organisations dans PostgreSQL. Google est optionnel ; renseignez les identifiants OAuth de votre projet Google pour proposer ce moyen de connexion en plus de l’inscription e-mail/mot de passe.

L’adresse de trésorerie n’est plus une variable d’environnement : chaque responsable la renseigne dans son groupe. L’application envoie un lien de validation à cette adresse et bloque les notes de frais tant qu’elle n’est pas confirmée.

Renseignez les variables suivantes dans `.env.local`, puis lancez `pnpm auth:migrate` suivi de `pnpm db:migrate` :

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/scouticket
BETTER_AUTH_SECRET=une_valeur_longue_et_aleatoire
BETTER_AUTH_URL=https://app.exemple.fr
APP_URL=https://app.exemple.fr
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
APP_URL=https://app.scouticket.fr              # URL publique de l'application

# Optionnel
SMTP_FROM=noreply@example.com              # Requis pour Resend ou si SMTP_USER n'est pas une adresse
SMTP_FROM_NAME=Scouticket
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
- `public/sw.js` : cache versionné par déploiement et stratégies runtime
- Enregistrement du SW par le composant client `src/components/register-sw.tsx`, monté dans `src/app/layout.tsx`
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

1. L'utilisateur se connecte via Better Auth
2. L'utilisateur capture ou importe un/des justificatif(s) (images/PDF)
3. L'utilisateur complète manuellement la date, le type, le montant, la branche et la description
4. Le frontend envoie les données et les pièces jointes (base64) à l'API route `/api/send-expense`
5. Le serveur valide les données, construit l'email et envoie via Gmail SMTP à :
   - Trésorerie
   - Utilisateur (e-mail du compte)

L'email contient un HTML lisible, un fallback texte et les pièces jointes avec des noms formatés `YYYY-MM-DD - Branche - Type - Montant - 01.ext`.

### Limites des pièces jointes

- Types supportés : JPG, PNG, WEBP, PDF
- Nombre maximum : 6 pièces jointes
- Taille maximum par fichier : 8 MB
- Taille totale maximum : 20 MB

## 🔒 Sécurité

- Authentification obligatoire (Better Auth)
- Variables sensibles dans `.env.local` (ignoré par Git)
- Validation côté serveur avant envoi
- HTTPS requis en production pour l'accès caméra

## Architecture

```
Frontend (React + Better Auth) → API Route (/api/send-expense) → Gmail SMTP → Email delivery
                      ↓
               Authentification
```

## 📱 Déploiement

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
- Logs du serveur pour erreurs backend
- Tester l'API `/api/send-expense` en local avec des données minimales

---

## Résolution de problèmes

### Problème : "Configuration SMTP invalide"

**Cause** : Les identifiants SMTP sont incorrects ou le serveur est inaccessible.

**Solution** :

1. Vérifiez `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` dans l’environnement de déploiement
2. Vérifiez qu'il n'y a pas d'espaces au début/fin des valeurs
3. Pour Gmail : Vérifiez que vous utilisez un mot de passe d'application (16 caractères)
4. Pour Outlook/Office365 : Vérifiez que votre mot de passe est correct
5. Vérifiez que `SMTP_SECURE` correspond au port (`false` pour 587, `true` pour 465)
6. Mettez à jour les variables puis redéployez

### Problème : "Non autorisé" ou impossible de se connecter

**Cause** : Les clés Clerk sont incorrectes ou le domaine n'est pas configuré.

**Solution** :

1. Vérifiez `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` dans l’environnement de déploiement
2. Vérifiez que votre domaine est configuré dans Clerk → Domains
3. Redéployez l'application

### Problème : Les emails ne sont pas reçus

**Causes possibles** :

1. Email dans les spams
2. Compte email bloqué ou limité
3. Serveur SMTP bloque l'envoi

**Solutions** :

1. Vérifiez les spams et les dossiers courrier indésirable
2. Connectez-vous à votre compte email et vérifiez les alertes de sécurité
3. Vérifiez les logs du serveur pour des erreurs d'envoi

### Problème : "Invalid login" ou erreur d'authentification SMTP

**Cause** : Identifiants SMTP incorrects ou expirés.

**Solution Gmail** :

1. Allez sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Supprimez l'ancien mot de passe d'application
3. Créez-en un nouveau
4. Mettez à jour `SMTP_PASSWORD` dans l’environnement de déploiement
5. Redéployez

**Solution Outlook/Office365** :

1. Vérifiez que votre mot de passe est correct
2. Vérifiez que la 2FA n'est pas activée (ou utilisez un mot de passe d'application si disponible)
3. Mettez à jour `SMTP_PASSWORD` dans l’environnement de déploiement
4. Redéployez

### Problème : L'appareil photo ne fonctionne pas

**Cause** : Navigateur bloque l'accès caméra.

**Solutions** :

1. Vérifiez que l'URL commence par `https://`
2. Autorisez l'accès caméra dans le navigateur
3. Essayez un autre navigateur

### Problème : Erreur 500 ou application ne charge pas

**Solutions** :

1. Vérifiez les variables d’environnement de votre hébergeur.
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
3. Consultez les logs du dernier déploiement
4. Redéployez si nécessaire

### Besoin d'aide supplémentaire ?

1. **Consultez les logs** de votre hébergeur
2. **Ouvrez une issue** : [GitHub Issues](https://github.com/yipfram/sgdf-notes-de-frais/issues)
3. Décrivez votre problème avec le message d'erreur et les étapes suivies

```

```
