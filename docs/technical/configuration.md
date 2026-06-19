# Configuration

Voir aussi la reference centralisee : [Variables d'environnement](/technical/environment-variables).

## Variables d'environnement

### Tableau récapitulatif

| Variable                            | Requis | Description             | Exemple               |
| ----------------------------------- | :----: | ----------------------- | --------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |   ✅   | Clé publique Clerk      | `pk_test_abc123...`   |
| `CLERK_SECRET_KEY`                  |   ✅   | Clé secrète Clerk       | `sk_test_xyz789...`   |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     |   ✅   | URL de connexion        | `/sign-in`            |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     |   ✅   | URL d'inscription       | `/sign-up`            |
| `SMTP_HOST`                         |   ✅   | Serveur SMTP            | `smtp.gmail.com`      |
| `SMTP_PORT`                         |   ✅   | Port SMTP               | `587`                 |
| `SMTP_SECURE`                       |   ✅   | SSL/TLS                 | `false`               |
| `SMTP_USER`                         |   ✅   | Identifiant             | `user@example.com`    |
| `SMTP_PASSWORD`                     |   ✅   | Mot de passe            | `xxxx xxxx xxxx xxxx` |
| `NEXT_PUBLIC_TREASURY_EMAIL`        |   ✅   | Destinataire            | `treso@sgdf.fr`       |
| `SMTP_FROM`                         |   ♠️   | Expéditeur personnalisé | `noreply@domain.fr`   |
| `SMTP_FROM_NAME`                    |   ♠️   | Nom expéditeur          | `Factures SGDF`       |
| `SMTP_FROM_EMAIL`                   |   ♠️   | Email de repli          | `send@domain.fr`      |

> ✅ = Requis • ♠️ = Optionnel

### Valeurs par fournisseur

| Fournisseur     | SMTP_HOST               | SMTP_PORT | SMTP_SECURE |
| --------------- | ----------------------- | --------- | ----------- |
| Gmail           | `smtp.gmail.com`        | `587`     | `false`     |
| Outlook/Hotmail | `smtp-mail.outlook.com` | `587`     | `false`     |
| Office 365      | `smtp.office365.com`    | `587`     | `false`     |
| SSL (port 465)  | `smtp.gmail.com`        | `465`     | `true`      |

## Commandes

::: code-group

```bash [npm]
npm ci
npm run dev
npm run lint
npm run build
```

```bash [pnpm]
pnpm install
pnpm dev
pnpm lint
pnpm build
```

```bash [bun]
bun install
bun run dev
bun run lint
bun run build
```

:::

## Sécurité

- Ne jamais committer `.env.local`
- Utiliser HTTPS en production (caméra + PWA)
- Limiter l'accès aux clés Clerk et aux identifiants SMTP
