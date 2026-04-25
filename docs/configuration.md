# Configuration

## Variables d’environnement

### Clerk

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (`/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (`/sign-up`)

### SMTP / Trésorerie

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `TREASURY_EMAIL`

### Optionnelles

- `SMTP_FROM`
- `SMTP_FROM_NAME`
- `SMTP_FROM_EMAIL`

## Exemples SMTP

- Gmail : `smtp.gmail.com:587` (`SMTP_SECURE=false`, mot de passe d’application)
- Outlook : `smtp-mail.outlook.com:587`
- Office365 : `smtp.office365.com:587`
- Serveur custom : selon l’hébergeur

## Sécurité

- Ne jamais committer `.env.local`
- Utiliser HTTPS en production (caméra + PWA)
- Limiter l’accès aux clés Clerk et aux identifiants SMTP
