# Installation locale (développement)

## Prérequis

- Node.js 20+
- npm, pnpm, ou bun

## Installation

::: code-group

```bash [npm]
npm install
```

```bash [pnpm]
pnpm install
```

```bash [bun]
bun install
```

:::

## Configuration locale

```bash
cp .env.example .env.local
```

Renseigner ensuite les variables Clerk et SMTP. L’adresse de trésorerie est configurée dans l’application, groupe par groupe.

## Lancement et vérification

::: code-group

```bash [npm]
npm run dev
npm run lint
npm run build
```

```bash [pnpm]
pnpm dev
pnpm lint
pnpm build
```

```bash [bun]
bun run dev
bun run lint
bun run build
```

:::
