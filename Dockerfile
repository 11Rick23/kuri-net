# syntax=docker/dockerfile:1

FROM oven/bun:1.4.4 AS bun

FROM node:25.9.0-bookworm-slim AS base
WORKDIR /app
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_ASSET_BASE_URL
ENV NEXT_PUBLIC_ASSET_BASE_URL=${NEXT_PUBLIC_ASSET_BASE_URL} \
    NEXT_OUTPUT_STANDALONE=1
RUN DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kuri_net \
    BETTER_AUTH_SECRET=build-only-7qfY1mP9vL3xN8kR2sW6cA4dH0jT5uB \
    BETTER_AUTH_URL=http://localhost:3000 \
    bun run build
RUN bun build ./src/database/migrate.ts --target=bun --outfile=./build/migrate.js

FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/src/features/home/data/announcements.md ./src/features/home/data/announcements.md
COPY --from=build --chown=node:node /app/build/migrate.js ./migrate.js
COPY --from=build --chown=node:node /app/drizzle ./drizzle
USER node
EXPOSE 3000
CMD ["sh", "-c", "bun ./migrate.js && exec node server.js"]
