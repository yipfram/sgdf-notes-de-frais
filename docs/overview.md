# Vue d’ensemble du projet

## Fonctionnalités principales

- Capture photo et import de justificatifs (images/PDF)
- Saisie guidée des informations de dépense
- Envoi automatique par email (trésorerie + utilisateur)
- Support PWA (installation écran d’accueil)
- Mode hors ligne partiel (préparation possible, envoi en ligne)

## Stack technique

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Clerk** pour l’authentification
- **SMTP / Nodemailer** pour l’envoi des emails

## Architecture simplifiée

```text
Frontend (Next.js + Clerk)
  -> API Route /api/send-expense
  -> SMTP
  -> Destinataires (trésorerie + utilisateur)
```
