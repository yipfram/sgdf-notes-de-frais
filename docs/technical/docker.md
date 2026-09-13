# Deploiement Docker

## Variables d'environnement

Variables optionnelles et exemples fournisseurs : [Variables d'environnement](/technical/environment-variables).

## Build et run

```bash
docker build -t sgdf-notes-de-frais .
docker run -p 3000:3000 --env-file .env.local sgdf-notes-de-frais
```

## Checklist

- Fournir toutes les variables d'environnement au conteneur
- Exposer l'application derriere HTTPS en production
- Verifier l'acces SMTP sortant depuis l'hebergeur
- Configurer les secrets GitHub `OPENOBSERVE_URL`, `OPENOBSERVE_ORG_ID` et `OPENOBSERVE_AUTH` pour publier les cartes sources RUM

## Publication GitHub Container Registry

Chaque push sur `main` exécute `.github/workflows/release.yml`. Le workflow archive les cartes sources du build, les envoie à OpenObserve, puis publie `ghcr.io/yipfram/scouticket:latest` et une image étiquetée avec le SHA du commit. L’échec de l’envoi des cartes bloque la publication, afin que le code publié et les cartes sources restent synchronisés.
