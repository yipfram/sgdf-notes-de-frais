# Vue d’ensemble du projet

## Fonctionnalités principales

- Capture photo et import de justificatifs (images/PDF)
- Saisie guidée des informations de dépense
- Envoi automatique par email (trésorerie + utilisateur)
- Groupes indépendants : unités, couleurs et adresse de trésorerie propres à chaque groupe
- Validation de l’adresse de trésorerie avant le premier envoi
- Support PWA (installation écran d’accueil)
- Mode hors ligne partiel (préparation possible, envoi en ligne)

## Stack technique

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Clerk** pour l’authentification, les organisations et les invitations
- **SMTP / Nodemailer** pour l’envoi des emails

## Architecture simplifiée

```text
Utilisateur + groupe Clerk
  -> API Route /api/send-expense
  -> SMTP
  -> Trésorerie du groupe + utilisateur en copie
```

## Informations personnelles

L'application n'a pas de base de données persistante pour les justificatifs. Les pièces jointes sont transmises par e-mail et ne sont pas stockées par l’application.

Clerk gère les comptes, les groupes, les rôles de responsable/membre et la configuration propre à chaque groupe. L’adresse e-mail de la trésorerie est conservée dans les métadonnées privées du groupe afin d’envoyer les justificatifs au bon destinataire.
