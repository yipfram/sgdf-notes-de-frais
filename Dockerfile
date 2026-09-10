FROM node:22-bookworm-slim AS dependances

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-bookworm-slim AS construction

WORKDIR /app

RUN corepack enable

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

FROM node:22-bookworm-slim AS execution

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
COPY --from=construction /app/.next ./.next
COPY --from=construction /app/public ./public

EXPOSE 3000

CMD ["pnpm", "start"]
