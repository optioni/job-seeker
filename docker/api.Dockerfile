# Stage 1: Build
FROM node:24-alpine@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd AS builder
WORKDIR /app

# Copy workspace files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN corepack enable && yarn install

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package first, then API
RUN yarn workspace @job-seeker/shared build 2>/dev/null || true
RUN yarn workspace @job-seeker/api build

# Stage 2: Production
FROM node:24-alpine@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd AS production
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy workspace config for production install
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install production deps only
RUN corepack enable && yarn workspaces focus @job-seeker/api --production

# Copy built output
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy templates (needed at runtime for PDF generation)
COPY apps/api/src/document/templates ./apps/api/dist/document/templates

ENV NODE_ENV=production
ENV GOTENBERG_URL=""
ENV PORT=3000

USER appuser
EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
