# Variables d’environnement

Copiez `.env.example` vers `.env.local`, puis renseignez les variables suivantes. Ne commitez jamais `.env.local`.

## Clerk

| Variable                            | Requis | Description                                  |
| ----------------------------------- | :----: | -------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |   ✅   | Clé publique de l’application Clerk          |
| `CLERK_SECRET_KEY`                  |   ✅   | Clé secrète de l’application Clerk           |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     |   ✅   | Route de connexion, généralement `/sign-in`  |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     |   ✅   | Route d’inscription, généralement `/sign-up` |

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
