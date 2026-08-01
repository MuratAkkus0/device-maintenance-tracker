# Build context is the monorepo root (see docker-compose.yml) so the
# workspace dependency on @wartungstermine/shared can be resolved.
FROM node:24-slim

RUN npm install -g pnpm@10

WORKDIR /app

COPY pnpm-workspace.yaml package.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN pnpm install --filter @wartungstermine/web... --filter @wartungstermine/shared

WORKDIR /app/apps/web

EXPOSE 5173

# Local/dev container: runs the Vite dev server (HMR) rather than a
# production build+serve step. VITE_API_URL is read from the environment
# by Vite at dev-server start (see docker-compose.yml).
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
