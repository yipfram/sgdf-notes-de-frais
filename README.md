[![Deploy with Vercel](https://vercel.com/button)](<https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyipfram%2Fsgdf-notes-de-frais&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,NEXT_PUBLIC_CLERK_SIGN_IN_URL,NEXT_PUBLIC_CLERK_SIGN_UP_URL,APP_URL,SMTP_HOST,SMTP_PORT,SMTP_SECURE,SMTP_USER,SMTP_PASSWORD,SMTP_FROM,SMTP_FROM_NAME,MAINTENANCE_MODE&envDescription=Variables%20n%C3%A9cessaires%20pour%20le%20d%C3%A9ploiement%20(Clerk%20%2B%20SMTP)&envLink=https%3A%2F%2Fgithub.com%2Fyipfram%2Fsgdf-notes-de-frais%2Fblob%2Fmain%2FSETUP.md&project-name=scouticket&repository-name=scouticket>)

# Scouticket

Application web mobile-first pour la gestion des justificatifs et des notes de frais pour votre groupe scout.

Ce repository est sous license MIT, vous pouvez l'utiliser comme bon vous semble ! Réadaptez le, et, si vous voulez, taggez moi :)

# Docs

Pour savoir comment l'utiliser avec [la documentation](https://scouticket.fr)

## Fonctionnalités

- 📸 **Capture de justificatifs** : prise de photo + import d'images/PDF, avec plusieurs fichiers possibles (jusqu'à 6 justificatifs par envoi)
- 📝 **Saisie des informations** : date, branche, montant, type et description ; avec plusieurs justificatifs, un montant et une catégorie sont saisis pour chaque dépense et le total est calculé automatiquement
- ✉️ **Envoi e-mail automatique** : transmission à la trésorerie + copie à l’utilisateur avec une ou plusieurs pièces jointes
- 👥 **Multi-groupes** : chaque groupe configure ses unités, invite ses membres et valide sa propre adresse de trésorerie
- 📌 **Unité mémorisée** : le dernier choix d’unité est synchronisé avec le compte Clerk, séparément pour chaque groupe
- 🔐 **Validation de trésorerie** : aucun envoi n’est possible avant la confirmation reçue par e-mail du trésorier, via un e-mail HTML reprenant la charte Scouticket
- 🏷️ **Nom de fichier structuré** : `YYYY-MM-DD - Branche - Type - Montant - 01.pdf` (ou `.jpg/.png/.webp`)
- 📲 **Installation PWA** : Ajout possible à l'écran d'accueil (Android / iOS / Desktop)
- 🔄 **Mise à jour PWA sûre** : chaque déploiement active un nouveau cache et recharge automatiquement l’application à jour
- ⚡ **Mode hors ligne partiel** : Consultation et préparation possible sans réseau (l'envoi nécessite la connexion)
- 🔔 **Bannière d'installation** : Invitation A2HS personnalisée
- 🛠️ **Mode maintenance** : une variable d’environnement permet d’afficher une page dédiée et de désactiver temporairement les API
- 🌙 **Affichage plein écran** : Expérience proche d'une application native
- 📋 **Logs techniques structurés** : erreurs serveur et réponses API rejetées, consultables dans Vercel sans contenir de données personnelles ou de justificatifs

## Créer un groupe

Après votre inscription, créez ou sélectionnez votre groupe depuis le sélecteur dans l’en-tête. Son responsable configure l’adresse de trésorerie et les unités. Une confirmation est envoyée à la trésorerie : tant que le lien n’est pas validé, aucune note ne peut être transmise.

Définissez `APP_URL` avec l’URL publique de l’application (par exemple `https://app.scouticket.fr`) afin que les liens de confirmation envoyés par e-mail soient valides.

La liste d’unités par défaut peut être renommée, complétée ou simplifiée par chaque groupe. Chaque unité possède une couleur, reprise dans les e-mails de notes de frais.

Dans le tableau de bord Clerk, activez **Organizations** ainsi que les invitations d’organisation. Activez également Google dans **SSO connections** si vous souhaitez afficher « Continuer avec Google » en plus de l’e-mail/mot de passe.

Les responsables retrouvent les invitations et la liste des membres dans le menu **Administration** du formulaire.

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

Le projet utilise pnpm 11.22.0, déclaré dans `package.json` et automatiquement utilisé par les environnements compatibles avec Corepack.

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

## Tester avec Docker

Docker Desktop doit être démarré. Renseignez les variables Clerk et SMTP requises dans le fichier local `.env` (voir `.env.example`) ; ce fichier est ignoré par Git et n'est pas copié dans l'image.

```bash
# Construire, démarrer et attendre que le contrôle de santé réussisse
docker compose up --build --wait

# Vérifier la configuration de l'application
curl http://localhost:3000/api/health

# Consulter les journaux, puis arrêter le conteneur
docker compose logs -f app
docker compose down
```

Le point de santé valide `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` et `APP_URL`, sans envoyer d'e-mail. Pour un test strictement local, définissez `APP_URL=http://localhost:3000` ; une URL publique reste nécessaire pour les liens envoyés par e-mail en conditions réelles.

## Mode maintenance

Définissez `MAINTENANCE_MODE=true` puis redémarrez ou redéployez l’application pour afficher la page de maintenance. Les pages sont redirigées vers celle-ci, les API répondent avec le statut `503`, et `/api/health` répond `{ "ok": false, "status": "maintenance" }`. Remettez `MAINTENANCE_MODE=false` pour rétablir le service.

## Logs techniques

Les routes API écrivent des événements JSON dans les Runtime Logs Vercel. Ils distinguent les informations SMTP (`info`), les réponses HTTP 4xx attendues (`warn`) et les erreurs serveur (`error`).

Chaque réponse API contient l'en-tête `X-Request-Id` : communiquez sa valeur avec l'heure approximative de l'incident pour retrouver rapidement le log correspondant. Les rejets et erreurs de routes API contiennent également `identifiantUtilisateur`, l'identifiant technique Clerk (`user_…`) ou `null` pour une requête anonyme. Les corps de requête, e-mails, autres identifiants, pièces jointes et secrets sont masqués et ne doivent jamais être ajoutés manuellement aux journaux.

---

Pour toute amélioration ou besoin spécifique (ex: sauvegarde locale des brouillons), ouvrir une issue ou proposer une PR.
