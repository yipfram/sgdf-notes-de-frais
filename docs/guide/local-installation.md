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

Renseigner ensuite les variables Clerk + SMTP + `TREASURY_EMAIL`.

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
