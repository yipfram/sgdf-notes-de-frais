# Variables d’environnement

Copiez `.env.example` vers `.env.local`, puis renseignez les variables suivantes. Ne commitez jamais `.env.local`.

## Better Auth

| Variable             | Requis | Description                                                                 |
| -------------------- | :----: | --------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` |   ✅   | Secret Better Auth pour les sessions et signatures                          |
| `BETTER_AUTH_URL`    |   ✅   | URL publique de l’application                                               |
| `AUDIT_LOG_SECRET`   |   ✅   | Secret distinct, utilisé pour chiffrer les identifiants des audits des logs |

Les événements `auth.audit.*` sont des lignes JSON sur stdout. OpenObserve doit ingérer les logs du conteneur applicatif ; ils ne contiennent ni e-mail, ni identifiant Better Auth brut, ni secret. Les champs `utilisateur` et `organisation` sont chiffrés avec AES-256-GCM et peuvent être déchiffrés avec `dechiffrerIdentifiant` et la même valeur de `AUDIT_LOG_SECRET`.

## OpenObserve RUM

| Variable                               |  Requis   | Description                                    |
| -------------------------------------- | :-------: | ---------------------------------------------- |
| `NEXT_PUBLIC_OPENOBSERVE_SITE`         | Optionnel | URL de l’instance OpenObserve                  |
| `NEXT_PUBLIC_OPENOBSERVE_CLIENT_TOKEN` | Optionnel | Jeton navigateur OpenObserve                   |
| `NEXT_PUBLIC_OPENOBSERVE_ORGANISATION` | Optionnel | Organisation OpenObserve, `default` par défaut |

Lorsque le RUM est configuré et qu’un utilisateur est connecté, son identifiant est chiffré avec AES-256-GCM et `AUDIT_LOG_SECRET` avant d’être transmis à OpenObserve. Aucun e-mail ni identifiant Better Auth brut n’est envoyé.

## Publication des cartes sources OpenObserve

La publication GitHub Actions envoie automatiquement les cartes sources de chaque commit sur `main`, avant de publier l’image Docker. Configurez ces **secrets de dépôt GitHub** (et non des variables de l’application) :

| Secret               | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| `OPENOBSERVE_URL`    | URL HTTPS de l’instance OpenObserve, sans chemin d’API                         |
| `OPENOBSERVE_ORG_ID` | Identifiant de l’organisation OpenObserve                                      |
| `OPENOBSERVE_AUTH`   | Valeur complète de l’en-tête d’autorisation (`Basic …` ou `Bearer …`) de l’API |

Les cartes sont associées à `service=scouticket-web`, `env=production` et au SHA complet du commit. Ces trois valeurs doivent correspondre exactement aux métadonnées RUM. Les fichiers `.map` ne sont jamais inclus dans l’image de production ni accessibles par les navigateurs.

## Ancienne configuration Clerk

| Variable                            | Requis | Description                                  |
| ----------------------------------- | :----: | -------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |   ✅   | Clé publique de l’application Clerk          |
| `CLERK_SECRET_KEY`                  |   ✅   | Clé secrète de l’application Clerk           |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     |   ✅   | Route de connexion, généralement `/sign-in`  |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     |   ✅   | Route d’inscription, généralement `/sign-up` |

## Maintenance

| Variable           |  Requis   | Description                                                                                                                                                                                                     |
| ------------------ | :-------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MAINTENANCE_MODE` | Optionnel | `true` affiche la page de maintenance, bloque les API avec un statut `503` et fait répondre `/api/health` avec `{ "ok": false, "status": "maintenance" }`. Toute autre valeur, dont `false`, désactive ce mode. |

Après avoir modifié cette variable dans l’environnement de production, redéployez ou redémarrez l’application.

## E-mail SMTP

| Variable          |  Requis   | Description                                | Exemple                          |
| ----------------- | :-------: | ------------------------------------------ | -------------------------------- |
| `SMTP_HOST`       |    ✅     | Serveur SMTP                               | `smtp.gmail.com`                 |
| `SMTP_PORT`       |    ✅     | Port SMTP                                  | `587`                            |
| `SMTP_SECURE`     |    ✅     | `true` pour le port 465, sinon `false`     | `false`                          |
| `SMTP_USER`       |    ✅     | Identifiant SMTP                           | `tresorerie@exemple.fr`          |
| `SMTP_PASSWORD`   |    ✅     | Mot de passe SMTP                          | Mot de passe d’application Gmail |
| `SMTP_FROM`       | Optionnel | Adresse ou expéditeur complet à utiliser   | `notes@exemple.fr`               |
| `SMTP_FROM_NAME`  | Optionnel | Nom affiché de l’expéditeur                | `Notes de frais`                 |
| `SMTP_FROM_EMAIL` | Optionnel | Adresse de repli si `SMTP_FROM` est absent | `notes@exemple.fr`               |

L’adresse de trésorerie n’est **pas** une variable d’environnement. Chaque responsable la renseigne pour son groupe dans l’application, puis elle est confirmée par e-mail.

## Valeurs courantes

| Fournisseur     | `SMTP_HOST`             | `SMTP_PORT` | `SMTP_SECURE` |
| --------------- | ----------------------- | ----------- | ------------- |
| Gmail           | `smtp.gmail.com`        | `587`       | `false`       |
| Outlook/Hotmail | `smtp-mail.outlook.com` | `587`       | `false`       |
| Office 365      | `smtp.office365.com`    | `587`       | `false`       |
| SMTP avec SSL   | Selon le fournisseur    | `465`       | `true`        |
