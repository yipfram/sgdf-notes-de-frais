# Configuration

## Configuration indispensable de Clerk

L’application utilise une organisation Clerk pour chaque groupe scout. Sans cette fonctionnalité, il est impossible de créer des groupes, de distinguer leurs configurations ou d’inviter les membres.

Dans le tableau de bord Clerk :

1. Activez **Organizations** dans les réglages de l’application.
2. Activez l’authentification par **e-mail** : les invitations de membres sont envoyées par e-mail.
3. Autorisez la création d’organisations par les utilisateurs : les responsables créent leur groupe depuis l’application.
4. Réglez la limite de membres par organisation pour qu’elle couvre les besoins de vos groupes.
5. Conservez les rôles par défaut : le créateur du groupe est administrateur et les personnes invitées sont membres.

Le mode « adhésion obligatoire » est recommandé : l’application est conçue pour fonctionner dans le contexte d’un groupe. Consultez la [documentation officielle de configuration des organisations Clerk](https://clerk.com/docs/guides/organizations/configure) si les libellés du tableau de bord évoluent.

## Configuration SMTP

Configurez un serveur SMTP qui peut envoyer les e-mails de justificatifs et de validation de trésorerie. Consultez la [référence des variables d’environnement](/technical/environment-variables) pour les valeurs attendues.

Pour Gmail, activez la validation en deux étapes et créez un mot de passe d’application. Pour les autres fournisseurs, utilisez les paramètres SMTP fournis par votre hébergeur.

## Configuration dans l’application

Après le déploiement, le responsable crée son groupe dans l’application. Il configure alors l’adresse de trésorerie, les unités et leurs couleurs. L’adresse doit être confirmée depuis l’e-mail de validation avant le premier envoi de justificatif.
