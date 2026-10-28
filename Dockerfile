FROM node:26.12.1-trixie-slim@sha256:94816674c62774da0d099a947bf4613b9e1972a2733abd0d0cd80e795f8411d0 AS node-base
WORKDIR /app

FROM node-base AS pnpm-base
# renovate: datasource=npm depName=pnpm versioning=npm
ARG PNPM_VERSION=12.15.0
RUN npm install --global pnpm@${PNPM_VERSION}

FROM pnpm-base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

FROM pnpm-base AS production-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

FROM pnpm-base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH="/home/node/.npm-global/bin:${PATH}"
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=production-deps --chown=node:node /app/package.json ./
COPY --from=production-deps --chown=node:node /app/pnpm-lock.yaml ./
COPY --from=production-deps --chown=node:node /app/pnpm-workspace.yaml ./
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]