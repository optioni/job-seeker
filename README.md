# job-seeker

An automated job application pipeline for the Finnish job market. Monitors job boards, uses an LLM to match listings against your profile and preferences, generates a tailored CV and cover letter, and sends them via email.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS |
| Frontend | Nuxt 3 (Vue) |
| Database | PostgreSQL + MikroORM |
| Queue / Cache | Redis + Bull (`@nestjs/bull`) |
| LLM | Claude Haiku via Vercel AI SDK |
| Document rendering | Puppeteer (HTML → PDF) |
| Email | Nodemailer |
| API spec | JSON:API (`@klerick/nestjs-json-api`) |
| Package manager | Yarn 4.13.0 |
| Deployment | Kubernetes |
| Local dev | Docker Compose |

---

## Project Structure

```
job-seeker/
├── apps/
│   ├── api/          ← NestJS (backend, worker, cron)
│   └── web/          ← Nuxt 3 (admin UI)
├── packages/
│   └── shared/       ← shared TypeScript types
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── docs/
│   └── architecture.md
└── docker-compose.yml
```

---

## How It Works

```
Cron (per JobSource interval)
    ↓
RSS adapters (TE-palvelut, Duunitori, Oikotie, Indeed FI, Kuntarekry, Valtiolle.fi)
    ↓
Pre-filter (keywords / location from JobSource.filters)
    ↓
Dedup check (skip seen listings)
    ↓
[ingestion queue] → save JobListing
    ↓
[matching queue] → LLM match decision + score + rationale
    ↓
Save JobApplication (all evaluated listings)
    ↓  if matched = true
[generation queue] → tailored CV + cover letter (LLM)
    ↓
[document queue] → HTML templates → Puppeteer → PDFs
    ↓
[notification queue] → daily digest email with PDF attachments
```

Each stage is a Bull queue backed by Redis — failures retry independently without cascading.

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (see `.nvmrc` or `package.json` for version)
- Yarn 4.x (`corepack enable`)

### Local development

```bash
# Install dependencies
yarn install

# Start all services (API, web, PostgreSQL, Redis)
docker compose up
```

Services:

| Service | URL |
|---------|-----|
| API (NestJS) | http://localhost:3000 |
| Web (Nuxt 3) | http://localhost:3001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Environment variables

Configure SMTP, database, Redis, and Anthropic API key via environment variables before starting the API. See `apps/api` for the full list.

---

## Key Features

- **Multi-source ingestion** — RSS feeds from six Finnish job boards, with per-source keyword and location filters
- **LLM matching** — Claude Haiku evaluates each listing against your CV and preferences, returning a boolean match, score (0–100), and rationale
- **Application history** — every evaluated listing is recorded for reviewing and tuning match criteria
- **Tailored documents** — matched listings get a role-specific CV rewrite and cover letter, rendered to PDF via Puppeteer
- **Daily digest** — matched jobs accumulate and are emailed once a day with PDFs attached
- **Admin UI** — Nuxt 3 frontend for managing CV, preferences, job sources, and viewing application history
- **Per-source language** — output language follows the job source (`fi` / `en`), falling back to your default preference

---

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full architecture reference, including data model, module breakdown, LLM integration details, and design decisions.

---

## Code Quality

ESLint + Prettier are configured at the monorepo root:

- **ESLint** — `@juuso.piikkila/eslint-config-typescript`
- **Prettier** — default config, enforced via ESLint

```bash
yarn lint
yarn format
```
