# Build context is the monorepo root (see docker-compose.yml) so the
# workspace dependency on @wartungstermine/shared can be resolved.
FROM node:24-slim

# Prisma's query engine needs libssl to be present and detectable.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10

WORKDIR /app

COPY pnpm-workspace.yaml package.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN pnpm install --filter @wartungstermine/api... --filter @wartungstermine/shared

WORKDIR /app/apps/api
RUN pnpm exec prisma generate

ENV NODE_ENV=production
EXPOSE 4000

CMD pnpm exec prisma migrate deploy && node ./src/server.js
