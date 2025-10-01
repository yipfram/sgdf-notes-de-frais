# 📖 Guide d'installation pour utilisateurs non-techniques

Ce guide vous explique **pas à pas** comment installer et déployer l'application de factures SGDF sur internet, même sans connaissances techniques.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Ce dont vous aurez besoin](#ce-dont-vous-aurez-besoin)
3. [Étape 1 : Créer un compte Gmail](#étape-1--créer-un-compte-gmail)
4. [Étape 2 : Activer la validation en deux étapes sur Gmail](#étape-2--activer-la-validation-en-deux-étapes-sur-gmail)
5. [Étape 3 : Générer un mot de passe d'application Gmail](#étape-3--générer-un-mot-de-passe-dapplication-gmail)
6. [Étape 4 : Créer un compte Clerk](#étape-4--créer-un-compte-clerk)
7. [Étape 5 : Configurer Clerk](#étape-5--configurer-clerk)
8. [Étape 6 : Créer un compte Vercel](#étape-6--créer-un-compte-vercel)
9. [Étape 7 : Déployer l'application sur Vercel](#étape-7--déployer-lapplication-sur-vercel)
10. [Étape 8 : Configurer les variables d'environnement](#étape-8--configurer-les-variables-denvironnement)
11. [Étape 9 : Mettre à jour Clerk avec votre domaine](#étape-9--mettre-à-jour-clerk-avec-votre-domaine)
12. [Étape 10 : Tester l'application](#étape-10--tester-lapplication)
13. [Résolution de problèmes](#résolution-de-problèmes)

---

## Vue d'ensemble

L'application permet aux membres de votre groupe SGDF de :
- Prendre en photo leurs justificatifs de dépenses
- Remplir un formulaire simple (date, montant, branche, description)
- Envoyer automatiquement un email à la trésorerie avec le justificatif en pièce jointe

**Aucune donnée n'est stockée sur un serveur**, tout passe par des emails sécurisés.

**Temps estimé pour l'installation complète : 30-45 minutes**

---

## Ce dont vous aurez besoin

Avant de commencer, assurez-vous d'avoir :

- ✅ Un compte **Gmail** pour envoyer les emails (gratuit)
- ✅ Un compte **GitHub** pour accéder au code source (gratuit)
- ✅ Un compte **Clerk** pour l'authentification des utilisateurs (gratuit jusqu'à 10 000 utilisateurs/mois)
- ✅ Un compte **Vercel** pour héberger l'application (gratuit pour les projets personnels/associatifs)
- ✅ Environ 30-45 minutes de temps disponible
- ✅ Un navigateur web (Chrome, Firefox, Safari, etc.)

**Tout est gratuit !** Aucun frais n'est requis pour une utilisation associative normale.

---

## Étape 1 : Créer un compte Gmail

Si vous avez déjà un compte Gmail dédié à votre trésorerie SGDF, vous pouvez passer cette étape.

1. Allez sur [Gmail](https://mail.google.com)
2. Cliquez sur **"Créer un compte"**
3. Suivez les instructions pour créer un compte
4. Choisissez une adresse email professionnelle, par exemple : `sgdf.tresorerie@gmail.com`
5. Notez bien votre adresse email et votre mot de passe

> 💡 **Conseil** : Utilisez un compte Gmail dédié à votre groupe SGDF plutôt que votre compte personnel.

---

## Étape 2 : Activer la validation en deux étapes sur Gmail

La validation en deux étapes est **obligatoire** pour pouvoir créer un mot de passe d'application.

1. Connectez-vous à votre compte Gmail
2. Allez sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
3. Cherchez la section **"Validation en deux étapes"** (ou "2-Step Verification")
4. Cliquez sur **"Validation en deux étapes"**
5. Cliquez sur **"Commencer"** ou **"Activer"**
6. Suivez les instructions à l'écran :
   - Entrez votre numéro de téléphone
   - Recevez un code par SMS
   - Entrez le code pour confirmer
7. La validation en deux étapes est maintenant activée ✅

---

## Étape 3 : Générer un mot de passe d'application Gmail

Ce mot de passe spécial permettra à l'application d'envoyer des emails sans utiliser votre mot de passe principal.

1. Restez sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Cherchez la section **"Mots de passe des applications"** (ou "App passwords")
3. Cliquez sur **"Mots de passe des applications"**
4. On vous demandera peut-être de vous reconnecter - entrez votre mot de passe Gmail
5. Dans le champ **"Sélectionner une application"** :
   - Choisissez **"Autre (nom personnalisé)"**
   - Tapez : `SGDF Notes de frais`
6. Cliquez sur **"Générer"**
7. Google affiche un mot de passe de **16 caractères** (par exemple : `abcd efgh ijkl mnop`)
8. **IMPORTANT** : Copiez ce mot de passe et gardez-le dans un endroit sûr (bloc-notes, gestionnaire de mots de passe)

> ⚠️ **Attention** : Ce mot de passe ne sera affiché qu'une seule fois ! Si vous le perdez, vous devrez en créer un nouveau.

> 💡 **Note** : Les espaces dans le mot de passe peuvent être gardés ou supprimés (les deux fonctionnent).

---

## Étape 4 : Créer un compte Clerk

Clerk gère l'authentification des utilisateurs (connexion/inscription).

1. Allez sur [https://dashboard.clerk.com/sign-up](https://dashboard.clerk.com/sign-up)
2. Créez un compte :
   - Vous pouvez utiliser votre compte Google, GitHub ou une adresse email
   - Suivez les instructions d'inscription
3. Une fois connecté, vous arriverez sur le tableau de bord Clerk

> 💡 **C'est gratuit** pour jusqu'à 10 000 utilisateurs actifs par mois (largement suffisant pour un groupe SGDF).

---

## Étape 5 : Configurer Clerk

Maintenant, nous allons créer une application dans Clerk pour votre projet.

### 5.1 Créer une nouvelle application

1. Sur le tableau de bord Clerk, cliquez sur **"Create application"** (Créer une application)
2. Donnez un nom à votre application : `SGDF Notes de Frais`
3. Dans la section **"Authentication methods"** (Méthodes d'authentification), cochez :
   - ✅ **Email** (recommandé - obligatoire)
   - ✅ **Google** (optionnel - permet aux utilisateurs de se connecter avec leur compte Google)
4. Cliquez sur **"Create application"** en bas de la page

### 5.2 Récupérer vos clés API

1. Une fois l'application créée, vous êtes redirigé vers une page avec vos **clés API**
2. Vous verrez deux clés importantes :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`)
3. **IMPORTANT** : Copiez ces deux clés dans un bloc-notes sécurisé
4. Vous en aurez besoin à l'étape 8

> 💡 **Astuce** : Vous pouvez toujours retrouver ces clés en allant dans **API Keys** dans le menu de gauche.

### 5.3 Note importante sur le domaine

Pour l'instant, laissez Clerk tel quel. Nous reviendrons configurer votre domaine final à l'étape 9, après avoir déployé l'application sur Vercel.

---

## Étape 6 : Créer un compte Vercel

Vercel va héberger votre application gratuitement.

1. Allez sur [https://vercel.com/signup](https://vercel.com/signup)
2. Cliquez sur **"Continue with GitHub"** (Continuer avec GitHub)
3. Si vous n'avez pas de compte GitHub :
   - Créez d'abord un compte sur [https://github.com/signup](https://github.com/signup)
   - Puis revenez sur Vercel et connectez-vous avec GitHub
4. Autorisez Vercel à accéder à votre compte GitHub
5. Vous arrivez sur le tableau de bord Vercel

> 💡 Le plan gratuit de Vercel est parfait pour les projets associatifs.

---

## Étape 7 : Déployer l'application sur Vercel

### 7.1 Forker le projet sur GitHub

Avant de déployer sur Vercel, vous devez créer votre propre copie du projet.

1. Allez sur [https://github.com/yipfram/sgdf-notes-de-frais](https://github.com/yipfram/sgdf-notes-de-frais)
2. Cliquez sur le bouton **"Fork"** en haut à droite
3. Sur la page suivante, cliquez sur **"Create fork"**
4. GitHub crée maintenant une copie du projet dans votre compte

### 7.2 Importer le projet sur Vercel

1. Retournez sur [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Cliquez sur **"Add New..."** puis **"Project"**
3. Vous verrez une liste de vos dépôts GitHub
4. Trouvez **sgdf-notes-de-frais** dans la liste
5. Cliquez sur **"Import"** à côté du projet

### 7.3 Configurer le projet (ne pas déployer encore !)

1. Vercel vous demande de configurer le projet
2. **IMPORTANT** : Ne cliquez PAS encore sur "Deploy" !
3. Nous devons d'abord ajouter les variables d'environnement
4. Passez directement à l'étape 8

---

## Étape 8 : Configurer les variables d'environnement

Les variables d'environnement sont les "réglages secrets" de votre application.

### 8.1 Accéder aux paramètres

Si vous n'avez pas encore déployé (recommandé) :
1. Sur la page de configuration du projet, descendez jusqu'à **"Environment Variables"**

Si vous avez déjà déployé :
1. Allez sur votre projet dans Vercel
2. Cliquez sur **"Settings"** (Paramètres)
3. Cliquez sur **"Environment Variables"** dans le menu de gauche

### 8.2 Ajouter les variables une par une

Vous allez ajouter **7 variables**. Pour chaque variable :

1. Cliquez sur le champ **"Key"** (première colonne)
2. Tapez le nom de la variable (voir ci-dessous)
3. Cliquez sur le champ **"Value"** (deuxième colonne)
4. Collez ou tapez la valeur correspondante
5. Cliquez sur **"Add"** pour ajouter la variable

Voici les **7 variables à ajouter** :

#### Variable 1 : NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- **Key** : `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Value** : Votre clé Clerk publique (commence par `pk_test_...`)
- Où la trouver : Dashboard Clerk → API Keys → Publishable key

#### Variable 2 : CLERK_SECRET_KEY
- **Key** : `CLERK_SECRET_KEY`
- **Value** : Votre clé Clerk secrète (commence par `sk_test_...`)
- Où la trouver : Dashboard Clerk → API Keys → Secret key

#### Variable 3 : NEXT_PUBLIC_CLERK_SIGN_IN_URL
- **Key** : `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- **Value** : `/sign-in`
- ⚠️ Attention : tapez exactement `/sign-in` (avec le slash au début)

#### Variable 4 : NEXT_PUBLIC_CLERK_SIGN_UP_URL
- **Key** : `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- **Value** : `/sign-up`
- ⚠️ Attention : tapez exactement `/sign-up` (avec le slash au début)

#### Variable 5 : GMAIL_USER
- **Key** : `GMAIL_USER`
- **Value** : Votre adresse Gmail complète (ex: `sgdf.tresorerie@gmail.com`)

#### Variable 6 : GMAIL_APP_PASSWORD
- **Key** : `GMAIL_APP_PASSWORD`
- **Value** : Le mot de passe d'application Gmail de 16 caractères (créé à l'étape 3)
- ⚠️ Les espaces peuvent être gardés ou supprimés

#### Variable 7 : TREASURY_EMAIL
- **Key** : `TREASURY_EMAIL`
- **Value** : L'adresse email de votre trésorerie (peut être la même que GMAIL_USER)

### 8.3 Vérifier vos variables

Avant de continuer, vérifiez que :
- ✅ Vous avez bien **7 variables**
- ✅ Les noms sont **exactement** comme indiqué (attention aux majuscules/minuscules)
- ✅ Aucune valeur ne contient d'espace au début ou à la fin (sauf GMAIL_APP_PASSWORD qui peut avoir des espaces entre les groupes de 4 lettres)

---

## Étape 9 : Mettre à jour Clerk avec votre domaine

Une fois l'application déployée sur Vercel, vous devez indiquer à Clerk l'adresse de votre site.

### 9.1 Récupérer votre URL Vercel

1. Retournez sur [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Cliquez sur votre projet **sgdf-notes-de-frais**
3. En haut de la page, vous verrez une URL comme : `https://sgdf-notes-de-frais-xxx.vercel.app`
4. Copiez cette URL complète

### 9.2 Configurer Clerk

1. Retournez sur [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sélectionnez votre application **SGDF Notes de Frais**
3. Dans le menu de gauche, cliquez sur **"Domains"** (Domaines)
4. Vous verrez une section **"Frontend API"** avec un domaine temporaire
5. Cliquez sur **"Add domain"** (Ajouter un domaine)
6. Dans le champ qui apparaît, collez votre URL Vercel (ex: `sgdf-notes-de-frais-xxx.vercel.app`)
   - ⚠️ Enlevez le `https://` au début, gardez seulement `sgdf-notes-de-frais-xxx.vercel.app`
7. Cliquez sur **"Add"** ou **"Continue"**
8. Clerk détecte automatiquement que c'est un domaine Vercel et le valide

### 9.3 Redéployer sur Vercel (si nécessaire)

Si vous avez déjà déployé avant cette étape :
1. Allez sur votre projet Vercel
2. Cliquez sur l'onglet **"Deployments"**
3. Cliquez sur les **trois points** à côté du dernier déploiement
4. Cliquez sur **"Redeploy"**
5. Confirmez en cliquant sur **"Redeploy"**

---

## Étape 10 : Tester l'application

Félicitations ! Votre application est maintenant en ligne. Testons qu'elle fonctionne correctement.

### 10.1 Accéder à l'application

1. Allez sur votre URL Vercel (ex: `https://sgdf-notes-de-frais-xxx.vercel.app`)
2. Vous devriez voir la page de connexion Clerk

### 10.2 Créer un compte test

1. Cliquez sur **"Sign up"** (S'inscrire)
2. Créez un compte avec votre email personnel
3. Vérifiez votre email pour confirmer votre compte
4. Connectez-vous

### 10.3 Tester l'envoi d'une facture

1. Une fois connecté, vous voyez le formulaire de facture
2. Cliquez sur **"Capturer une photo"** ou **"Importer"**
3. Choisissez une image de test (n'importe quelle photo)
4. Remplissez le formulaire :
   - Date
   - Branche SGDF
   - Type de dépense
   - Montant
   - Description
5. Cliquez sur **"Envoyer la facture"**
6. Si tout fonctionne, vous verrez un message de confirmation ✅

### 10.4 Vérifier la réception des emails

1. Vérifiez l'email de votre trésorerie (TREASURY_EMAIL)
2. Vérifiez votre email personnel (celui avec lequel vous vous êtes inscrit)
3. Vous devriez avoir reçu un email avec :
   - Les détails de la facture
   - La photo en pièce jointe
   - Un nom de fichier formaté : `YYYY-MM-DD - Branche - Type - Montant.jpg`

### 10.5 Si tout fonctionne

🎉 **Bravo !** Votre application est opérationnelle !

Vous pouvez maintenant :
- Partager l'URL avec les membres de votre groupe SGDF
- Les inviter à créer un compte
- Commencer à recevoir les factures par email

### 10.6 Installation sur mobile

Pour une meilleure expérience, les utilisateurs peuvent installer l'application sur leur téléphone :

**Sur Android (Chrome) :**
1. Ouvrez l'application dans Chrome
2. Un bandeau apparaît : "Ajouter à l'écran d'accueil"
3. Tapez sur "Ajouter"
4. L'icône apparaît sur l'écran d'accueil

**Sur iPhone/iPad (Safari) :**
1. Ouvrez l'application dans Safari
2. Tapez sur l'icône de partage (carré avec une flèche)
3. Faites défiler et tapez sur "Sur l'écran d'accueil"
4. Tapez sur "Ajouter"

---

## Résolution de problèmes

### Problème : "Configuration SMTP invalide"

**Cause** : Le mot de passe d'application Gmail est incorrect ou mal configuré.

**Solution** :
1. Vérifiez que la variable `GMAIL_APP_PASSWORD` dans Vercel contient bien le mot de passe de 16 caractères
2. Vérifiez qu'il n'y a pas d'espaces au début ou à la fin (les espaces entre les groupes de 4 lettres sont OK)
3. Si le problème persiste, générez un nouveau mot de passe d'application Gmail (étape 3) et mettez à jour la variable dans Vercel
4. Redéployez l'application

### Problème : "Non autorisé" ou impossible de se connecter

**Cause** : Les clés Clerk sont incorrectes ou le domaine n'est pas configuré.

**Solution** :
1. Vérifiez les variables `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` dans Vercel
2. Vérifiez que vous avez bien ajouté votre domaine Vercel dans Clerk (étape 9)
3. Assurez-vous d'utiliser les clés de la bonne application Clerk
4. Redéployez l'application

### Problème : Les emails ne sont pas reçus

**Causes possibles** :
1. Le compte Gmail est bloqué par Google
2. L'email est dans les spams
3. L'adresse email du trésorier est incorrecte

**Solutions** :
1. Vérifiez les spams de votre boîte mail
2. Vérifiez que la variable `TREASURY_EMAIL` est correcte dans Vercel
3. Vérifiez que le compte Gmail n'est pas bloqué :
   - Connectez-vous à Gmail
   - Vérifiez s'il y a des alertes de sécurité
4. Essayez d'envoyer un email de test depuis ce compte Gmail manuellement

### Problème : "Invalid login" (Connexion invalide)

**Cause** : Le mot de passe d'application Gmail est expiré ou révoqué.

**Solution** :
1. Allez sur [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Cliquez sur "Mots de passe des applications"
3. Supprimez l'ancien mot de passe pour "SGDF Notes de frais"
4. Créez-en un nouveau (suivez l'étape 3)
5. Mettez à jour la variable `GMAIL_APP_PASSWORD` dans Vercel
6. Redéployez l'application

### Problème : L'appareil photo ne fonctionne pas

**Cause** : Le navigateur ou le système bloque l'accès à la caméra.

**Solutions** :
1. Vérifiez que vous utilisez HTTPS (votre URL Vercel commence par `https://`)
2. Sur mobile, autorisez l'accès à la caméra quand le navigateur le demande
3. Sur ordinateur, vérifiez les paramètres du navigateur (icône de cadenas dans la barre d'adresse)
4. Essayez avec un autre navigateur

### Problème : L'application ne charge pas ou affiche une erreur 500

**Causes possibles** :
1. Variables d'environnement manquantes ou incorrectes
2. Erreur lors du déploiement

**Solutions** :
1. Allez sur Vercel → votre projet → Settings → Environment Variables
2. Vérifiez que les **7 variables** sont bien présentes et correctes
3. Allez sur Vercel → votre projet → Deployments
4. Cliquez sur le dernier déploiement
5. Regardez les logs pour identifier l'erreur
6. Si besoin, cliquez sur "Redeploy" pour redéployer

### Problème : "Cannot read properties of undefined"

**Cause** : Une variable d'environnement est manquante.

**Solution** :
1. Vérifiez que TOUTES les 7 variables sont présentes dans Vercel :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `TREASURY_EMAIL`
2. Redéployez l'application

### Besoin d'aide supplémentaire ?

Si vous rencontrez un problème qui n'est pas listé ci-dessus :

1. **Consultez les logs** :
   - Vercel → votre projet → Deployments → cliquez sur le dernier → Runtime Logs
   - Notez le message d'erreur exact

2. **Ouvrez une issue sur GitHub** :
   - Allez sur [https://github.com/yipfram/sgdf-notes-de-frais/issues](https://github.com/yipfram/sgdf-notes-de-frais/issues)
   - Cliquez sur "New issue"
   - Décrivez votre problème avec :
     - Le message d'erreur
     - Les étapes que vous avez suivies
     - Ce que vous avez déjà essayé

3. **Documentation technique** :
   - Pour plus de détails techniques, consultez le fichier [SETUP.md](./SETUP.md)

---

## 🎉 Félicitations !

Vous avez maintenant une application de gestion de factures SGDF en ligne, gratuite et sécurisée !

**Rappels importants** :
- ✅ Aucune donnée n'est stockée sur un serveur (tout passe par email)
- ✅ L'authentification est sécurisée par Clerk
- ✅ Le service est gratuit pour une utilisation associative
- ✅ Les utilisateurs peuvent installer l'app sur leur téléphone
- ✅ L'application fonctionne hors ligne pour préparer les factures

**Prochaines étapes** :
1. Partagez l'URL avec les membres de votre groupe SGDF
2. Créez une documentation simple pour les utilisateurs (comment se connecter, comment envoyer une facture)
3. Testez régulièrement que les emails arrivent bien
4. Gardez vos mots de passe en lieu sûr

**Besoin d'aide ?** N'hésitez pas à ouvrir une issue sur GitHub ou à consulter le fichier SETUP.md pour plus de détails techniques.

Bon courage avec votre groupe SGDF ! 🏕️⚜️
