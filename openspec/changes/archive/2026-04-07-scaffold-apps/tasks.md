## 1. Monorepo & Shared Package

- [x] 1.1 Initialize root `package.json` with Yarn 4 workspaces (`apps/*`, `packages/*`)
- [x] 1.2 Create `packages/shared/` with `package.json` (`@job-seeker/shared`), `tsconfig.json`, and `src/index.ts`
- [x] 1.3 Add entity interfaces to shared: `CvProfile`, `WorkExperience`, `Education`, `Skill`, `Language`, `Certification`, `Project`
- [x] 1.4 Add entity interfaces to shared: `JobPreferences`, `JobSourcePreset`, `JobSource`, `JobListing`, `JobApplication`
- [x] 1.5 Add queue payload interfaces: `IngestionJobPayload`, `MatchingJobPayload`, `GenerationJobPayload`, `DocumentJobPayload`, `NotificationJobPayload`

## 2. NestJS API — Bootstrap

- [x] 2.1 Scaffold `apps/api/` with NestJS CLI (`@nestjs/cli`), configure `tsconfig.json` for 4-space indent and strict mode
- [x] 2.2 Add `@swc/cli` and `@swc/core` as dev dependencies; create `.swcrc` with `experimentalDecorators: true` and `emitDecoratorMetadata: true`; set `"builder": "swc"` in `nest-cli.json`
- [x] 2.3 Add `package.json` dependencies: `@nestjs/bull`, `bull`, `@mikro-orm/nestjs`, `@mikro-orm/postgresql`, `@mikro-orm/migrations`, `@klerick/nestjs-json-api`, `@ai-sdk/anthropic`, `ai`, `rss-parser`, `@nestjs/axios`, `bcrypt`, `nodemailer`, `@nestjs/schedule`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `zod`
- [x] 2.4 Configure `mikro-orm.config.ts` with PostgreSQL connection from env vars, entity discovery, and migrations path
- [x] 2.5 Wire `AppModule` to import: `MikroOrmModule`, `BullModule` (Redis from env), `ScheduleModule`, and all feature modules
- [x] 2.6 Create `.env.example` documenting all required variables: `DATABASE_URL`, `REDIS_URL`, `ANTHROPIC_API_KEY`, `JWT_SECRET`, `REGISTRATION_ENABLED`, `GOTENBERG_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `DIGEST_RECIPIENT`, `DIGEST_CRON`

## 3. Database Entities & Migration

- [x] 3.1 Create MikroORM entities: `User` (`email` unique, `passwordHash`, `createdAt`), `CvProfile`, `PersonalInfo`, `WorkExperience`, `Education`, `Skill`, `Language`, `Certification`, `Project`
- [x] 3.2 Create MikroORM entities: `JobPreferences`, `JobSourcePreset`, `JobSource`, `JobListing`, `JobApplication`
- [x] 3.3 Generate and commit initial MikroORM migration from entity schema
- [x] 3.4 Create `JobSourcePreset` seed script with 6 built-in presets (TE-palvelut, Duunitori, Oikotie Työpaikat, Indeed Finland, Kuntarekry, Valtiolle.fi)

## 4. AuthModule

- [x] 4.1 Create `AuthModule` with `AuthService` (bcrypt password hashing, user lookup by email), `AuthController` (`POST /auth/register`, `POST /auth/login`), and JWT signing
- [x] 4.2 Add `REGISTRATION_ENABLED` env check to register handler (return 403 when `false`)
- [x] 4.3 Create `JwtStrategy` (passport-jwt) and `JwtAuthGuard`; create `@CurrentUser()` parameter decorator extracting `userId` from JWT payload
- [x] 4.4 Register `JwtAuthGuard` as global guard in `AppModule`

## 5. CvModule

- [x] 5.1 Create `CvModule` with JSON:API controllers for `CvProfile`, `WorkExperience`, `Education`, `Skill`, `Language`, `Certification`, `Project`; scope all queries by `userId` from `@CurrentUser()`; return 404 on cross-user access
- [x] 5.2 Register all CV entities with `MikroOrmModule.forFeature` in `CvModule`

## 6. PreferencesModule

- [x] 6.1 Create `PreferencesModule` with JSON:API controller for `JobPreferences`; scope all queries by `userId`; return 404 on cross-user access
- [x] 6.2 Register `JobPreferences` entity with `MikroOrmModule.forFeature` in `PreferencesModule`

## 7. JobSourcesModule

- [x] 7.1 Create `JobSourcesModule` with JSON:API controllers for `JobSourcePreset` (read-only) and `JobSource` (full CRUD); scope JobSource queries by `userId`; return 404 on cross-user access
- [x] 7.2 Add filter key validation against `filterConfig` in `JobSource` creation/update (return 422 on unknown keys)
- [x] 7.3 Register `JobSourcePreset` and `JobSource` entities in `JobSourcesModule`

## 8. IngestionModule

- [x] 8.1 Create `IngestionModule` and register `ingestion` Bull queue
- [x] 8.2 Implement `RssAdapter` using `rss-parser` — builds feed URL from `baseUrl` + filter params, maps items to candidate listings
- [x] 8.3 Implement `IngestionCron` (`@Cron`) that iterates active `JobSource` records, fetches RSS, deduplicates by company+title+date, enqueues new listings to `ingestion` queue
- [x] 8.4 Implement `IngestionProcessor` (`@Processor('ingestion')`) that saves `JobListing` and enqueues ID to `matching` queue
- [x] 8.5 Register `JobListing`, `JobSource`, `JobSourcePreset` entities in `IngestionModule`

## 9. MatchingModule

- [x] 9.1 Create `MatchingModule` and register `matching` Bull queue
- [x] 9.2 Implement `MatchingProcessor` (`@Processor('matching')`) — loads listing + CV + preferences, calls `generateObject` (Claude Haiku) with match schema `{ match, score, rationale }`
- [x] 9.3 Save `JobApplication` for every processed listing (matched or not); enqueue to `generation` queue if `match: true`
- [x] 9.4 Inject language instruction into prompt from `JobSource.language` → `JobPreferences.defaultLanguage`

## 10. GenerationModule

- [x] 10.1 Create `GenerationModule` and register `generation` Bull queue
- [x] 10.2 Implement `GenerationProcessor` (`@Processor('generation')`) — call 1: `generateObject` for tailored CV JSON; call 2: `generateObject` for cover letter text
- [x] 10.3 Save `tailoredCvSnapshot` and `coverLetterText` to `JobApplication`; enqueue to `document` queue
- [x] 10.4 Apply language instruction to both generation prompts

## 11. DocumentModule

- [x] 11.1 Create `DocumentModule` and register `document` Bull queue; add `@nestjs/axios` HttpModule
- [x] 11.2 Create HTML templates at `apps/api/src/document/templates/cv.html` and `cover-letter.html` (professional CSS styling)
- [x] 11.3 Implement `DocumentProcessor` (`@Processor('document')`) — render each template to an HTML string with CV/cover letter data, POST multipart/form-data to `$GOTENBERG_URL/forms/chromium/convert/html`, receive PDF buffer in response
- [x] 11.4 Enqueue `JobApplication` ID + PDF buffers to `notification` queue

## 12. NotificationModule

- [x] 12.1 Create `NotificationModule` and register `notification` Bull queue
- [x] 12.2 Implement `NotificationProcessor` (`@Processor('notification')`) — receives application ID + PDF buffers, stores them pending digest
- [x] 12.3 Implement `DigestCron` (`@Cron` from `DIGEST_CRON` env, default `0 8 * * *`) — queries unemailed matched applications, generates any missing PDFs, sends single digest email via Nodemailer, sets `emailedAt`
- [x] 12.4 Configure Nodemailer transport from `SMTP_*` environment variables

## 13. ApplicationsModule

- [x] 13.1 Create `ApplicationsModule` with JSON:API controller for `JobApplication` (GET list + GET detail only, no POST); scope queries to authenticated user via `JobListing → JobSource → user`; return 404 on cross-user access
- [x] 13.2 Include `JobListing` and `JobSource` relationships in response
- [x] 13.3 Default ordering: `scrapedAt` descending

## 14. Nuxt 3 Web App

- [x] 14.1 Scaffold `apps/web/` with Nuxt 3 (`nuxi init`), configure `nuxt.config.ts` with runtime config (`NUXT_PUBLIC_API_BASE_URL`)
- [x] 14.2 Add Nuxt auth middleware — redirect unauthenticated users to `/login`; store JWT in httpOnly cookie via `useCookie`
- [x] 14.3 Implement `/login` page with email/password form calling `POST /auth/login`
- [x] 14.3b Implement `/register` page with email/password form calling `POST /auth/register`; handle 409 (duplicate email) and 403 (registration disabled) responses
- [x] 14.4 Implement `/cv` page — forms for all CvProfile sections with add/edit/delete for list sub-entities
- [x] 14.5 Implement `/preferences` page — form for all JobPreferences fields
- [x] 14.6 Implement `/sources` page — preset browser, JobSource list with create/edit/toggle-active
- [x] 14.7 Implement `/applications` page — table of all JobApplication records with detail view modal/drawer

## 15. Infrastructure

- [x] 15.1 Write `docker-compose.yml` with `api`, `web`, `postgres`, `redis`, `gotenberg` (`gotenberg/gotenberg:8`, internal network only) services; set `GOTENBERG_URL=http://gotenberg:3000` in api environment; named volume for postgres data; `env_file: .env`
- [x] 15.2 Write `docker/api.Dockerfile` — multi-stage build, no Chromium deps, `ENV GOTENBERG_URL=""`, non-root user, expose 3000
- [x] 15.3 Write `docker/web.Dockerfile` — multi-stage Nuxt build, non-root user, expose 3001
