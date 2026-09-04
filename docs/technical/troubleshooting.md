# Dépannage

## Erreurs Clerk fréquentes

- **Redirection boucle** : vérifier les URLs sign-in/sign-up
- **Accès refusé** : vérifier clés Clerk et domaine autorisé
- **Impossible de créer ou sélectionner un groupe** : activer **Organizations** dans Clerk et autoriser la création d’organisations par les responsables
- **Impossible d’inviter un membre** : vérifier que l’authentification e-mail et les invitations d’organisation sont actives dans Clerk

## Erreurs SMTP fréquentes

- **Invalid login** : identifiants SMTP incorrects
- **Connection error** : hôte/port/firewall non valides
- **Envoi partiel** : vérifier quotas fournisseur email

## Problèmes mobile / PWA

- Caméra indisponible : vérifier HTTPS
- PWA non installable : vérifier manifest/service worker
- Hors ligne limité : comportement normal (envoi nécessite réseau)

## Checklist rapide

- Variables d’environnement complètes
- Domaine Clerk bien configuré
- Test d’envoi vers trésorerie + utilisateur validé
- Fonctionnalité Organizations et création d’organisations activées dans Clerk
- Adresse de trésorerie du groupe confirmée depuis l’e-mail reçu
- Build local et déploiement sans erreur
