# Job Seeker — Architecture

A general-purpose automated job application pipeline. Monitors Finnish job boards, uses an LLM to match listings against the candidate's profile and preferences, generates a tailored CV and cover letter, and sends them via email.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS |
| Frontend | Nuxt 3 (Vue) |
| Database | PostgreSQL + MikroORM |
| Queue / Cache | Redis + Bull (`@nestjs/bull`) |
| LLM | Claude Haiku via Vercel AI SDK (`ai`, `@ai-sdk/anthropic`) |
| Document rendering | Puppeteer (HTML → PDF) |
| Email | Nodemailer |
| API spec | JSON:API (`@klerick/nestjs-json-api`) |
| Deployment | Kubernetes |
| Local dev | Docker Compose |

---

## Monorepo Structure

```
job-seeker/
├── apps/
│   ├── api/                  ← NestJS (backend, worker, cron)
│   └── web/                  ← Nuxt 3 (admin UI)
├── packages/
│   └── shared/               ← shared TypeScript types
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
└── docker-compose.yml        ← local dev (API, web, PostgreSQL, Redis)
```

---

## System Flow

```
NestJS Cron (configurable interval per JobSource)
    ↓
Job Source Adapters (RSS parser or Playwright scraper, using JobSourcePreset config)
    ↓
Pre-filter (keyword/location filters from JobSource.filters)
    ↓
Dedup check (JobListing table — skip seen URLs)
    ↓
[ingestion queue] → save new JobListings
    ↓
[matching queue] → LLM match decision + rationale (Claude Haiku)
    ↓
Save JobApplication (matched, score, rationale — for all evaluated listings)
    ↓  if matched = true
[generation queue] → LLM CV tailoring + cover letter
    ↓
[document queue] → HTML template → Puppeteer → PDF
    ↓
[notification queue] → email with PDF attachments
    ↓
Update JobApplication (tailored CV snapshot, cover letter, emailedAt)
```

Each stage is a Bull queue backed by Redis. Failures retry independently without cascading.

---

## NestJS Modules

| Module | Responsibility |
|--------|---------------|
| `AuthModule` | JWT authentication for admin UI |
| `CvModule` | CRUD for CvProfile and all sub-entities |
| `PreferencesModule` | CRUD for JobPreferences |
| `JobSourcesModule` | Manage JobSourcePresets and JobSource instances |
| `IngestionModule` | RSS + scraper adapters, cron trigger, dedup |
| `MatchingModule` | LLM match decision with rationale |
| `GenerationModule` | LLM CV tailoring and cover letter generation |
| `DocumentModule` | HTML template rendering to PDF via Puppeteer |
| `NotificationModule` | Email sending with attachments via Nodemailer |
| `ApplicationsModule` | Application history and records |

---

## Data Model

### User
Single admin user. Used for authentication only.

### CvProfile
Structured CV stored in normalized tables, linked to User.

```
CvProfile
├── personalInfo       (name, title, email, phone, location, links)
├── summary            (text)
├── WorkExperience[]   (company, role, startDate, endDate, description, highlights[])
├── Education[]        (institution, degree, field, startDate, endDate)
├── Skill[]            (name, category)
├── Language[]         (language, proficiency)
├── Certification[]    (name, issuer, date)
└── Project[]          (name, description, url)
```

### JobPreferences
Linked to User. Defines what "interesting" means for matching.

Fields: desired locations, job type (full-time/part-time/contract), target role, seniority level, salary range (min/max), desired industries, industries to exclude, `defaultLanguage: 'fi' | 'en'`.

### JobSourcePreset
Ships as seed data. Defines how to interact with a specific job board.

Fields: `name`, `baseUrl`, `filterConfig` (available filter fields and their URL param mappings), `defaultLanguage`, `defaultPollingInterval`.

Built-in presets: TE-palvelut, Duunitori, Oikotie Työpaikat, Indeed Finland, Kuntarekry, Valtiolle.fi.

### JobSource
User-configured instance of a JobSourcePreset.

Fields: `preset → JobSourcePreset`, `label`, `filters` (values for preset's filter fields — keywords, location, category, etc.), `language: 'fi' | 'en'` (overrides preset default), `pollingInterval`, `active`.

A user can create multiple sources from the same preset (e.g. two Duunitori searches with different keywords).

### JobListing
Raw scraped listing before matching.

Fields: `source → JobSource`, `externalId`, `url`, `title`, `company`, `description`, `scrapedAt`.

### JobApplication
Created for every evaluated listing, regardless of match outcome. Enables reviewing and tuning matching criteria over time.

Fields: `listing → JobListing`, `matched: boolean`, `matchScore` (0–100), `matchRationale`, `tailoredCvSnapshot` (JSON, nullable — only set when matched), `coverLetterText` (nullable), `emailedAt` (nullable).

---

## Job Source Adapters

Single adapter implementation:

- **RssAdapter** — parses RSS/Atom feeds using `rss-parser`. URL is constructed from `baseUrl` + resolved filter values from `JobSource.filters`.

**Built-in RSS presets:**

| Board | Focus |
|-------|-------|
| TE-palvelut | General, official |
| Duunitori | General, popular |
| Oikotie Työpaikat | General |
| Indeed Finland | General, international |
| Kuntarekry | Municipal sector |
| Valtiolle.fi | Government sector |

Pre-filters (keywords, location, category) are applied at the URL/query level before fetching, reducing the volume of listings the LLM sees.

Deduplication is applied after fetching — listings are matched against existing `JobListing` records by company name + title + source date. Duplicate listings across multiple boards are discarded before entering the matching queue.

---

## LLM Integration

Uses the Vercel AI SDK with `@ai-sdk/anthropic` (Claude Haiku).

### Matching

```typescript
const { object } = await generateObject({
  model: anthropic('claude-haiku-4-5-20251001'),
  schema: z.object({
    match: z.boolean(),
    score: z.number().min(0).max(100),
    rationale: z.string(),
  }),
  prompt, // CV + JobPreferences + job listing + language instruction
})
```

Result saved to `JobApplication` for every evaluated listing — useful for reviewing and tuning matching criteria over time.

### Generation

Two sequential calls when `match = true`:

1. **CV tailoring** — rewrites the summary and reorders/emphasizes relevant sections for the specific role. Returns structured JSON matching the CV schema (not freeform), enabling consistent PDF rendering.
2. **Cover letter** — writes a cover letter based on the tailored CV + job listing + preferences. Returns plain text.

Both calls receive a language instruction based on `JobSource.language` (falling back to `JobPreferences.defaultLanguage`).

---

## Document Rendering

Puppeteer renders HTML templates to PDF:

```
TailoredCV (JSON) → CV HTML template → Puppeteer → cv.pdf
CoverLetter (text) → Cover letter HTML template → Puppeteer → cover_letter.pdf
```

Templates live in `apps/api/src/document/templates/`. Styled with CSS for a clean, professional output.

PDFs are generated in memory, attached to the email, and not persisted — the source data lives in `JobApplication` and can be regenerated at any time.

---

## Email Notification

Nodemailer with SMTP (configured via environment variables).

Matched jobs accumulate throughout the day and are sent as a single daily digest email (schedule configured via environment variable, default: 08:00). The digest lists all matches since the last send, each with title, company, link, match score, and rationale. CV and cover letter PDFs are attached for each match.

Language of the email body follows `JobSource.language` / `JobPreferences.defaultLanguage`.

---

## Admin UI (Nuxt 3)

JWT-authenticated. Talks to the NestJS REST API (JSON:API spec).

Pages:
- **CV editor** — structured forms for each CV section
- **Job preferences** — location, role, salary, industries, language preference
- **Job sources** — browse available presets, create source instances, configure filters, toggle active
- **Application history** — list of all evaluated listings with match outcome, score, rationale, and timestamp

---

## Local Development

Docker Compose runs all services:

```yaml
services:
  api:      # NestJS (port 3000)
  web:      # Nuxt 3 (port 3001)
  postgres: # PostgreSQL (port 5432)
  redis:    # Redis (port 6379)
```

---

## Key Design Decisions

- **Structured CV over freeform document** — enables section-level LLM targeting, incremental updates, and better admin UI forms.
- **Preset + instance model for job sources** — separates site configuration (preset) from user search configuration (instance). Supports multiple searches per board without code changes.
- **CV snapshot per application** — `JobApplication` stores the exact tailored CV JSON at send time. The base CV can evolve without losing historical accuracy.
- **Pre-filtering before LLM** — keyword/location filters at the source level reduce token usage and improve match quality.
- **Bull queues per pipeline stage** — each stage retries independently. A PDF rendering failure doesn't lose the match result.
- **Per-source language, global fallback** — `JobSource.language` sets the output language for that board; `JobPreferences.defaultLanguage` is the fallback.
- **Daily digest only** — matches accumulate and are sent once a day. Simpler than per-match emails and less noisy when the ingestion cron runs frequently.
- **Score for display only** — the LLM boolean match decision is the gate; the score (0–100) is stored and shown in the history view for transparency but not exposed as a configurable threshold.

---

## Code Quality

Both `apps/api` and `apps/web` use a shared ESLint + Prettier setup configured at the monorepo root:

- **ESLint** — `@juuso.piikkila/eslint-config-typescript`
- **Prettier** — default config, enforced via ESLint

---

## Future Development

- **Scraper support** — add a `ScraperAdapter` backed by `amerkurev/scrapper` (HTTP sidecar) for boards without RSS. `JobSourcePreset` would gain a `type: 'rss' | 'scraper'` field and `scraperConfig` (CSS selectors for title, company, description, URL, pagination).
- **Configurable prompt templates** — allow the user to edit the LLM matching and generation prompts from the admin UI. Store templates in the DB. Enables tuning the matching criteria and CV/cover letter tone without code changes.
