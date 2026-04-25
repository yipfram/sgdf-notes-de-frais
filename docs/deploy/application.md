# Déploiement applicatif

## Vercel (recommandé)

1. Importer le repo GitHub dans Vercel
2. Configurer les variables d’environnement (Clerk + SMTP)
3. Déployer
4. Ajouter le domaine Vercel dans Clerk
5. Tester connexion + envoi d’email

## Docker

Exemple de build et run en local/prod :

```bash
docker build -t sgdf-notes-de-frais .
docker run -p 3000:3000 --env-file .env.local sgdf-notes-de-frais
```

Points importants :

- Fournir toutes les variables d’environnement au conteneur
- Exposer l’application derrière HTTPS en production
- Vérifier l’accès SMTP sortant depuis l’hébergeur

## Coolify

1. Connecter le dépôt GitHub dans Coolify
2. Choisir build Node/Next.js (ou image Docker)
3. Ajouter les variables d’environnement
4. Définir le domaine et activer HTTPS
5. Déployer et valider le flux complet (auth + envoi)
