# Déployer la documentation sur GitHub Pages

## Principe

La doc VitePress est buildée puis publiée sur GitHub Pages via GitHub Actions.

## Build local

```bash
npm run docs:build
npm run docs:preview
```

Sortie générée : `docs/.vitepress/dist`.

## CI GitHub Actions

Workflow : `.github/workflows/deploy-docs.yml`

- Déclenchement : push sur `main` + manuel (`workflow_dispatch`)
- Étapes :
  1. Installation des dépendances
  2. Build VitePress
  3. Upload de l’artefact Pages
  4. Déploiement GitHub Pages

## Configuration GitHub

Dans **Settings > Pages** :

- Source : **GitHub Actions**

## Vérification post-déploiement

- Vérifier que le workflow est vert
- Ouvrir l’URL GitHub Pages du repo
- Contrôler navigation, liens et assets
