# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yaml ./
COPY .yarn ./.yarn
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN corepack enable && yarn install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN yarn workspace @job-seeker/shared build 2>/dev/null || true
RUN yarn workspace @job-seeker/web build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json yarn.lock .yarnrc.yaml ./
COPY .yarn ./.yarn
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN corepack enable && yarn workspaces focus @job-seeker/web --production

COPY --from=builder /app/apps/web/.output ./apps/web/.output

ENV NODE_ENV=production
ENV PORT=3001

USER appuser
EXPOSE 3001

CMD ["node", "apps/web/.output/server/index.mjs"]
