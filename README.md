# Scouticket

Scouticket est une application gratuite (et open-source) destinée aux groupes scouts pour envoyer plus facilement les justificatifs aux trésorier·e.
l'appication est disponible ici: https://scouticket.fr

## Authentification et migration

Application web mobile-first pour la gestion des justificatifs et des notes de frais pour votre groupe scout.

Ce repository est sous license MIT, vous pouvez l'utiliser comme bon vous semble ! Réadaptez le, et, si vous voulez, taggez moi :)

# Docs

Pour savoir comment l'utiliser avec [la documentation](https://scouticket.fr)

## Fonctionnalités

- 📸 **Capture de justificatifs** : prise de photo + import d'images/PDF, avec plusieurs fichiers possibles (jusqu'à 6 justificatifs par envoi)
- 📝 **Saisie des informations** : date, branche, montant, type et description ; avec plusieurs justificatifs, un montant et une catégorie sont saisis pour chaque dépense et le total est calculé automatiquement
- ✉️ **Envoi e-mail automatique** : transmission à la trésorerie + copie à l’utilisateur avec une ou plusieurs pièces jointes
- 👥 **Multi-groupes** : chaque groupe configure ses unités, invite ses membres et valide sa propre adresse de trésorerie
- 📌 **Préférences mémorisées** : le dernier choix d’unité et le groupe principal sont enregistrés par compte
- 🔐 **Connexion complète** : inscription, vérification d’e-mail, connexion e-mail/mot de passe, réinitialisation sécurisée et Google en option
- 🔐 **Validation de trésorerie** : aucun envoi n’est possible avant la confirmation reçue par e-mail du trésorier, via un e-mail HTML reprenant la charte Scouticket
- 🏷️ **Nom de fichier structuré** : `YYYY-MM-DD - Branche - Type - Montant - 01.pdf` (ou `.jpg/.png/.webp`)
- 📲 **Installation PWA** : Ajout possible à l'écran d'accueil (Android / iOS / Desktop)
- 🔄 **Mise à jour PWA sûre** : chaque déploiement active un nouveau cache et recharge automatiquement l’application à jour
- ⚡ **Mode hors ligne partiel** : Consultation et préparation possible sans réseau (l'envoi nécessite la connexion)
- 🔔 **Bannière d'installation** : Invitation A2HS personnalisée
- 🛠️ **Mode maintenance** : une variable d’environnement permet d’afficher une page dédiée et de désactiver temporairement les API
- 🌙 **Affichage plein écran** : Expérience proche d'une application native
- 📋 **Logs techniques structurés** : erreurs serveur et réponses API rejetées, sans contenir de données personnelles ou de justificatifs
- 🔎 **Audit Better Auth** : les actions d’authentification et de groupes sont journalisées en JSON sur stdout ; OpenObserve peut les ingérer depuis les logs Docker, avec des identifiants pseudonymisés
- 📈 **RUM OpenObserve optionnel** : mesure les performances réelles et les erreurs côté navigateur ; le rejeu de session est limité à 50 % et les saisies sont masquées

## Créer un groupe

Après votre inscription, créez ou sélectionnez votre groupe depuis le sélecteur dans l’en-tête. Son responsable configure l’adresse de trésorerie et les unités. Une confirmation est envoyée à la trésorerie : tant que le lien n’est pas validé, aucune note ne peut être transmise.

Définissez `APP_URL` avec l’URL publique de l’application (par exemple `https://app.scouticket.fr`) afin que les liens de confirmation envoyés par e-mail soient valides.

La liste d’unités par défaut peut être renommée, complétée ou simplifiée par chaque groupe. Chaque unité possède une couleur, reprise dans les e-mails de notes de frais.

Better Auth gère les organisations et les invitations dans la base PostgreSQL. Google reste optionnel : renseignez ses identifiants OAuth si vous souhaitez afficher « Continuer avec Google » en plus de l’e-mail/mot de passe.

Un membre qui crée son compte depuis une invitation revient automatiquement, connecté, sur cette invitation après la validation de son adresse e-mail. Après l’acceptation, le groupe rejoint devient son groupe actif et principal.

Dans Google Cloud Console, ajoutez `http://localhost:3000/api/auth/callback/google` en développement et `https://votre-domaine/api/auth/callback/google` en production aux URI de redirection autorisés. `BETTER_AUTH_URL` doit correspondre exactement à l’URL publique de l’application.

Les responsables retrouvent la gestion des membres et des unités dans le panneau **Administration**. Le lien « Changer de groupe » se trouve à droite de l’en-tête. La gestion des membres accepte plusieurs adresses e-mail séparées par des virgules.

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
- **Better Auth** (authentification)
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

Docker Desktop doit être démarré. Compose démarre aussi PostgreSQL avec un volume persistant `postgres_data`. Renseignez les variables Better Auth, Google et SMTP dans le fichier local `.env` (voir `.env.example`) ; ce fichier est ignoré par Git et n'est pas copié dans l'image.

```bash
# Construire, démarrer et attendre que le contrôle de santé réussisse
docker compose up --build --wait

# Initialiser Better Auth et les tables Scouticket (à chaque nouvelle migration)
docker compose exec app pnpm auth:migrate
docker compose exec app pnpm db:migrate

# Vérifier la configuration de l'application
curl http://localhost:3000/api/health

# Consulter les journaux, puis arrêter le conteneur
docker compose logs -f app
docker compose down
```

Le point de santé valide `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` et `APP_URL`, sans envoyer d'e-mail. Pour un test strictement local, définissez `APP_URL=http://localhost:3000` ; une URL publique reste nécessaire pour les liens envoyés par e-mail en conditions réelles.

## Audit Better Auth et OpenObserve

Définissez `AUDIT_LOG_SECRET` avec une valeur aléatoire distincte de `BETTER_AUTH_SECRET`. Scouticket écrit alors les opérations Better Auth importantes (connexion, inscription, mots de passe, vérification e-mail, organisations et invitations) au format JSON sur stdout. Configurez votre collecteur OpenObserve pour ingérer les logs du conteneur `app`; les champs `utilisateur` et `organisation` sont des empreintes HMAC stables, sans e-mail ni identifiant brut.

## RUM OpenObserve

Pour mesurer l’expérience navigateur, renseignez ces variables publiques dans l’environnement de déploiement, puis redéployez :

```bash
NEXT_PUBLIC_OPENOBSERVE_SITE=openobserve.exemple.fr
NEXT_PUBLIC_OPENOBSERVE_CLIENT_TOKEN=votre-jeton-rum
NEXT_PUBLIC_OPENOBSERVE_ORGANISATION=default
```

Sans `NEXT_PUBLIC_OPENOBSERVE_SITE` ou `NEXT_PUBLIC_OPENOBSERVE_CLIENT_TOKEN`, le SDK ne se charge pas. Scouticket collecte les performances, ressources, tâches longues, interactions et erreurs de toutes les sessions ; le rejeu est échantillonné à 50 %, sans contexte utilisateur et avec les champs de saisie masqués.

## Mode maintenance

Définissez `MAINTENANCE_MODE=true` puis redémarrez ou redéployez l’application pour afficher la page de maintenance. Les pages sont redirigées vers celle-ci, les API répondent avec le statut `503`, et `/api/health` répond `{ "ok": false, "status": "maintenance" }`. Remettez `MAINTENANCE_MODE=false` pour rétablir le service.

---

Pour toute amélioration ou besoin spécifique (ex: sauvegarde locale des brouillons), ouvrir une issue ou proposer une PR.
