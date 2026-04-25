# Installation locale (développement)

## Prérequis

- Node.js 20+
- npm ou pnpm

## Installation

```bash
npm ci
```

## Configuration locale

```bash
cp .env.example .env.local
```

Renseigner ensuite les variables Clerk + SMTP + `TREASURY_EMAIL`.

## Lancement et vérification

```bash
npm run dev
npm run lint
npm run build
```
