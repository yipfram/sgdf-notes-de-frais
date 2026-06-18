# Variables d'environnement

## Tableau recapitulatif

| Variable                            | Requis | Description             | Exemple               |
| ----------------------------------- | :----: | ----------------------- | --------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |   ✅   | Cle publique Clerk      | `pk_test_abc123...`   |
| `CLERK_SECRET_KEY`                  |   ✅   | Cle secrete Clerk       | `sk_test_xyz789...`   |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     |   ✅   | URL de connexion        | `/sign-in`            |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     |   ✅   | URL d'inscription       | `/sign-up`            |
| `SMTP_HOST`                         |   ✅   | Serveur SMTP            | `smtp.gmail.com`      |
| `SMTP_PORT`                         |   ✅   | Port SMTP               | `587`                 |
| `SMTP_SECURE`                       |   ✅   | SSL/TLS                 | `false`               |
| `SMTP_USER`                         |   ✅   | Identifiant             | `user@example.com`    |
| `SMTP_PASSWORD`                     |   ✅   | Mot de passe            | `xxxx xxxx xxxx xxxx` |
| `NEXT_PUBLIC_TREASURY_EMAIL`        |   ✅   | Destinataire            | `treso@sgdf.fr`       |
| `SMTP_FROM`                         |   ♠️   | Expediteur personnalise | `noreply@domain.fr`   |
| `SMTP_FROM_NAME`                    |   ♠️   | Nom expediteur          | `Factures SGDF`       |
| `SMTP_FROM_EMAIL`                   |   ♠️   | Email de repli          | `send@domain.fr`      |

> ✅ = Requis • ♠️ = Optionnel

## Valeurs par fournisseur

| Fournisseur     | SMTP_HOST               | SMTP_PORT | SMTP_SECURE |
| --------------- | ----------------------- | --------- | ----------- |
| Gmail           | `smtp.gmail.com`        | `587`     | `false`     |
| Outlook/Hotmail | `smtp-mail.outlook.com` | `587`     | `false`     |
| Office 365      | `smtp.office365.com`    | `587`     | `false`     |
| SSL (port 465)  | `smtp.gmail.com`        | `465`     | `true`      |
