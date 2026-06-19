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

## Informations personnelles

L'application n'a pas de mémoire, ou de base de donnée en dehors de celle gérée par Clerk.
Clerk est utilisé pour connecter les utilisateurs à la plateforme.

Concernant https://treso.romain-rochas.fr/ Les informations des utilisateurs ne sont pas utilisés en dehors de la connection de ces dernier à la plateforme, et l'utilisation de l'adresse email pour définir le destinataire du mail.

Plus d'information, contactez moi ! (yipfram)
