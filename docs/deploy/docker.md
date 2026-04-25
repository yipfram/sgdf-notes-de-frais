# Deploiement Docker

## Variables d'environnement

Variables optionnelles et exemples fournisseurs : [Variables d'environnement](/reference/environment-variables).

## Build et run

```bash
docker build -t sgdf-notes-de-frais .
docker run -p 3000:3000 --env-file .env.local sgdf-notes-de-frais
```

## Checklist

- Fournir toutes les variables d'environnement au conteneur
- Exposer l'application derriere HTTPS en production
- Verifier l'acces SMTP sortant depuis l'hebergeur
