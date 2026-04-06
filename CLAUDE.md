# CLAUDE.md

This file provides context for Claude Code when working in this repository.

---

## Project Overview

Automated job application pipeline for the Finnish job market. Monitors RSS feeds from Finnish job boards, uses Claude Haiku (via Vercel AI SDK) to match listings against a candidate profile, generates tailored CVs and cover letters, renders them to PDF with Puppeteer, and sends a daily digest email.

Full architecture: [`docs/architecture.md`](docs/architecture.md)

---

## Monorepo Structure

```
apps/api/        ← NestJS backend (REST API, Bull workers, cron jobs)
apps/web/        ← Nuxt 3 admin UI
packages/shared/ ← shared TypeScript types
docker/          ← Dockerfiles for API and web
docker-compose.yml
```

---

## Tech Stack

- **Backend**: NestJS, MikroORM, PostgreSQL, Redis, Bull (`@nestjs/bull`)
- **Frontend**: Nuxt 3 (Vue 3)
- **LLM**: Claude Haiku via `@ai-sdk/anthropic` + Vercel AI SDK (`generateObject`)
- **PDF**: Puppeteer (HTML templates → PDF in memory, not persisted)
- **Email**: Nodemailer (SMTP, daily digest)
- **API spec**: JSON:API via `@klerick/nestjs-json-api`
- **Package manager**: Yarn 4.13.0

---

## NestJS Modules

| Module | Responsibility |
|--------|---------------|
| `AuthModule` | JWT auth for admin UI |
| `CvModule` | CRUD for CvProfile and sub-entities |
| `PreferencesModule` | CRUD for JobPreferences |
| `JobSourcesModule` | JobSourcePresets and JobSource instances |
| `IngestionModule` | RSS adapters, cron trigger, dedup |
| `MatchingModule` | LLM match decision with rationale |
| `GenerationModule` | LLM CV tailoring and cover letter |
| `DocumentModule` | HTML → PDF via Puppeteer |
| `NotificationModule` | Email via Nodemailer |
| `ApplicationsModule` | Application history and records |

---

## Data Model (key entities)

- **CvProfile** — structured CV (personalInfo, summary, WorkExperience[], Education[], Skill[], Language[], Certification[], Project[])
- **JobPreferences** — matching criteria (locations, role, seniority, salary, industries, defaultLanguage)
- **JobSourcePreset** — seed data defining how to interact with a job board (baseUrl, filterConfig, defaultLanguage, defaultPollingInterval)
- **JobSource** — user-configured instance of a preset (filters, language override, pollingInterval, active)
- **JobListing** — raw scraped listing (source, externalId, url, title, company, description, scrapedAt)
- **JobApplication** — result for every evaluated listing (matched, matchScore, matchRationale, tailoredCvSnapshot, coverLetterText, emailedAt)

---

## Pipeline Queues

Each stage is an independent Bull queue backed by Redis:

1. `ingestion` — save new JobListings
2. `matching` — LLM match decision
3. `generation` — LLM CV tailoring + cover letter (matched only)
4. `document` — render PDFs
5. `notification` — send daily digest email

---

## LLM Usage

Model: `claude-haiku-4-5-20251001` via `generateObject` (Vercel AI SDK).

- **Matching**: returns `{ match: boolean, score: number, rationale: string }`
- **Generation**: two sequential calls — CV tailoring (structured JSON) + cover letter (plain text)
- Language instruction derived from `JobSource.language` → `JobPreferences.defaultLanguage`

---

## Built-in Job Board Presets

TE-palvelut, Duunitori, Oikotie Työpaikat, Indeed Finland, Kuntarekry, Valtiolle.fi — all RSS-based.

---

## Deduplication

Listings are matched against existing `JobListing` records by company name + title + source date. Duplicates across boards are discarded before the matching queue.

---

## Code Style

- ESLint: `@juuso.piikkila/eslint-config-typescript`
- Prettier: default config, enforced via ESLint
- Indent: 4 spaces (see `.editorconfig`)

---

## Local Dev

```bash
yarn install
docker compose up   # API :3000, web :3001, postgres :5432, redis :6379
```
