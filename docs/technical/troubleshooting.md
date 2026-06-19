# Dépannage

## Erreurs Clerk fréquentes

- **Redirection boucle** : vérifier les URLs sign-in/sign-up
- **Accès refusé** : vérifier clés Clerk et domaine autorisé

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
- Build local et déploiement sans erreur
