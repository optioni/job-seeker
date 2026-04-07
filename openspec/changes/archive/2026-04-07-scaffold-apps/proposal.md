## Why

The repository currently contains only documentation and tooling configuration — no application code exists yet. This change scaffolds the full monorepo structure defined in `docs/architecture.md`: a NestJS backend with Bull queues and LLM integration, a Nuxt 3 admin UI, and a shared TypeScript package.

## What Changes

- Scaffold `apps/api/` — NestJS application with all modules, MikroORM entities, Bull queues, and environment configuration
- Scaffold `apps/web/` — Nuxt 3 admin UI with JWT auth and all defined pages
- Scaffold `packages/shared/` — shared TypeScript types used by both apps
- Add `docker-compose.yml` for local development (API, web, PostgreSQL, Redis)
- Add `docker/api.Dockerfile` and `docker/web.Dockerfile`
- Add monorepo-level `package.json` workspaces config with Yarn 4

## Capabilities

### New Capabilities

- `api-swc`: SWC compiler for NestJS — `nest-cli.json` builder, `.swcrc` with decorator metadata
- `api-auth`: JWT authentication — multi-user registration (email+bcrypt) and login, `REGISTRATION_ENABLED` flag
- `api-cv`: CvProfile CRUD — all sub-entities, scoped to authenticated user
- `api-preferences`: JobPreferences CRUD — locations, role, seniority, salary, industries, defaultLanguage, scoped to authenticated user
- `api-job-sources`: JobSourcePreset seed data + JobSource CRUD — preset browsing, source instance creation, filter config, active toggle, scoped to authenticated user
- `api-ingestion`: RSS adapter (rss-parser), cron trigger, deduplication — saves new JobListings to the ingestion queue
- `api-matching`: LLM match decision (Claude Haiku via Vercel AI SDK) — returns match, score, rationale; saves JobApplication for every listing
- `api-generation`: LLM CV tailoring + cover letter generation — two sequential generateObject calls for matched listings
- `api-document`: HTML template → PDF via Gotenberg HTTP sidecar — CV and cover letter rendered in memory, no Puppeteer
- `api-notification`: Daily digest email via Nodemailer — accumulates matched jobs, sends once per day with PDF attachments
- `api-applications`: JobApplication history — list all evaluated listings with match outcome, score, rationale, timestamp, scoped to authenticated user
- `web-app`: Nuxt 3 UI — JWT auth, registration page, CV editor, job preferences, job sources, application history pages
- `shared-types`: Shared TypeScript types package — entity types, API response shapes, queue payloads
- `infra-local`: Docker Compose local dev setup — API, web, PostgreSQL, Redis, Gotenberg services
- `infra-docker`: Dockerfiles for API (no Chromium) and web production images

### Modified Capabilities

_(none — this is a greenfield scaffold)_

## Impact

- Creates all source files under `apps/`, `packages/`, and `docker/`
- Introduces dependencies: NestJS, MikroORM, PostgreSQL driver, Redis, Bull, Vercel AI SDK, `@ai-sdk/anthropic`, rss-parser, `@nestjs/axios`, bcrypt, Nodemailer, `@klerick/nestjs-json-api`, `@swc/cli`, `@swc/core`, Nuxt 3, Vue 3
- Requires environment variables for: database URL, Redis URL, SMTP config, Anthropic API key, JWT secret, Gotenberg URL, `REGISTRATION_ENABLED`
- No existing code is modified
