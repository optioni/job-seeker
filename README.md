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
| Document rendering | Gotenberg (HTML → PDF via Chromium sidecar) |
| Email | Nodemailer |
| API spec | JSON:API (`@klerick/nestjs-json-api`) |
| Package manager | Yarn 4.13.0 |
| Deployment | Docker |
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
[document queue] → HTML templates → Gotenberg → PDFs
    ↓
[notification queue] → daily digest email with PDF attachments
```

Each stage is a Bull queue backed by Redis — failures retry independently without cascading.

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 20+ and Yarn 4.x (`corepack enable`)

### 1. Configure environment

```bash
cp apps/api/.env.example .env
```

Open `.env` and fill in the required values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (`sk-ant-...`) |
| `JWT_SECRET` | Secret for signing JWTs — use a long random string |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP credentials for digest emails |
| `SMTP_FROM` | From address for outgoing email |
| `DIGEST_RECIPIENT` | Email address to receive daily digests |
| `REGISTRATION_ENABLED` | Set to `false` after creating your account to disable new sign-ups |
| `DIGEST_CRON` | Cron schedule for digest emails (default: `0 8 * * *`) |

`GOTENBERG_URL` and Docker service hostnames are set automatically in `docker-compose.yml` — leave them as-is.

### 2. Start all services

```bash
docker compose up
```

This starts PostgreSQL, Redis, Gotenberg (PDF renderer), the NestJS API, and the Nuxt web UI.

### 3. Run database migrations

```bash
docker compose exec api yarn workspace @job-seeker/api mikro-orm migration:up
```

### 4. Seed built-in job source presets

```bash
docker compose exec api node apps/api/dist/seed
```

This loads the six built-in Finnish job board presets (TE-palvelut, Duunitori, Oikotie Työpaikat, Indeed Finland, Kuntarekry, Valtiolle.fi).

### 5. Open the admin UI

Navigate to **http://localhost:3001** and register an account.

Then:
1. **CV** — add your work experience, education, skills, and other details
2. **Preferences** — set your target role, locations, salary range, and preferred language
3. **Sources** — pick job boards and configure keyword/location filters

The ingestion cron runs hourly. Matched applications accumulate and are emailed as a daily digest.

---

### Services

| Service | URL |
|---------|-----|
| Web UI (Nuxt 3) | http://localhost:3001 |
| API (NestJS) | http://localhost:3000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| Gotenberg | internal only (no host port) |

### Local development (without Docker)

```bash
yarn install

# Start infrastructure only
docker compose up postgres redis gotenberg -d

# Run API in watch mode
yarn workspace @job-seeker/api start:dev

# Run web in dev mode
yarn workspace @job-seeker/web dev
```

---

## Key Features

- **Multi-source ingestion** — RSS feeds from six Finnish job boards, with per-source keyword and location filters
- **LLM matching** — Claude Haiku evaluates each listing against your CV and preferences, returning a boolean match, score (0–100), and rationale
- **Application history** — every evaluated listing is recorded for reviewing and tuning match criteria
- **Tailored documents** — matched listings get a role-specific CV rewrite and cover letter, rendered to PDF via Gotenberg
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
