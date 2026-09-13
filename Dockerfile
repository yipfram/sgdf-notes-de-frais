FROM node:22-bookworm-slim AS dependances

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-bookworm-slim AS construction

WORKDIR /app

RUN corepack enable

ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA

# Next.js évalue certains modules serveur pendant le build. Ces valeurs ne sont
# présentes que dans cette étape ; Compose injecte les vraies valeurs au runtime.
ENV BETTER_AUTH_SECRET=build-only-secret-not-used-at-runtime-1234567890
ENV BETTER_AUTH_URL=http://localhost:3000
ENV GOOGLE_CLIENT_ID=build-only-google-client-id
ENV GOOGLE_CLIENT_SECRET=build-only-google-client-secret
ENV DATABASE_URL=postgresql://scouticket:scouticket@localhost:5432/scouticket

COPY --from=dependances /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM construction AS archive-cartes-sources

RUN apt-get update \
  && apt-get install --yes --no-install-recommends zip \
  && cd .next/static \
  && find . -type f -name "*.js.map" -print | while IFS= read -r carte; do fichier="${carte%.map}"; if [ -f "$fichier" ]; then printf '%s\\n' "$fichier"; fi; printf '%s\\n' "$carte"; done | sort -u | zip -@ /cartes-sources.zip \
  && rm -rf /var/lib/apt/lists/*

FROM scratch AS cartes-sources

COPY --from=archive-cartes-sources /cartes-sources.zip /cartes-sources.zip

FROM construction AS construction-sans-cartes-sources

RUN find .next -type f -name "*.map" -delete

FROM node:22-bookworm-slim AS execution

WORKDIR /app

LABEL org.opencontainers.image.source="https://github.com/yipfram/scouticket"
LABEL org.opencontainers.image.description="Application de gestion de justificatifs et de notes de frais pour les scouts"
LABEL org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
COPY --from=construction-sans-cartes-sources /app/.next ./.next
COPY --from=construction /app/public ./public
COPY --from=construction /app/scripts/migrate-base-de-donnees.mjs ./scripts/migrate-base-de-donnees.mjs
COPY --from=construction /app/sql ./sql

EXPOSE 3000

CMD ["pnpm", "start"]
