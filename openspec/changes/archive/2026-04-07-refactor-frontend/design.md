## Context

The web app (`apps/web/`) is a Nuxt 3 admin UI with 5 authenticated pages (Applications, Sources, Preferences, CV, Login/Register). All styling is hand-rolled scoped CSS duplicated across every page — the same `.page`, `.card`, `.btn-primary` definitions appear in every `.vue` file. There is no shared layout component, no design system, and no dashboard landing page.

The app is a single-user personal tool. The redesign prioritises personality and usability over generic SaaS conventions, adopting a warm editorial aesthetic (Fraunces serif + Bricolage Grotesque, warm parchment background, burgundy accent).

Full visual design decisions and token values are documented in `docs/superpowers/specs/2026-04-07-refactor-frontend-design.md`.

## Goals / Non-Goals

**Goals:**
- Replace all scoped CSS with Tailwind utility classes and Nuxt UI components
- Introduce a single source of truth for design tokens (CSS custom properties + Tailwind theme)
- Shared layout eliminates nav duplication across pages
- New dashboard page surfaces useful information (new matches, best match with rationale, weekly trends)
- New `GET /dashboard` API endpoint to support the dashboard page
- Ship `DESIGN.md` as the living brand reference

**Non-Goals:**
- No changes to existing composables, auth middleware, or TypeScript interfaces
- No changes to the API pipeline (ingestion, matching, generation, etc.)
- No dark mode support
- No mobile-first or responsive breakpoints (personal admin tool, desktop-only is acceptable)
- No i18n changes

## Decisions

### 1. Nuxt UI v3 over plain Tailwind or shadcn/vue

**Decision:** Use `@nuxt/ui` v3 as the component and styling layer.

**Rationale:** The app already has a drawer, modal, table, tabs, badges, and form inputs across its pages. Nuxt UI covers all of these with accessible, Nuxt-native components. It bundles Tailwind v4 and integrates directly with Nuxt's auto-import system. Building the same components from scratch with plain Tailwind would require significantly more work and testing.

**Alternative considered:** shadcn/vue — copy-paste approach gives full ownership but requires manual setup and component copying for each primitive. More friction than value for a 5-page app.

### 2. Tailwind v4 CSS-based configuration

**Decision:** Define design tokens via `@theme` in a global CSS file (`assets/css/main.css`), not via `tailwind.config.js`.

**Rationale:** Nuxt UI v3 uses Tailwind v4 which adopts a CSS-first configuration model. Tokens defined in `@theme` are available as both Tailwind utilities (`bg-accent`, `text-muted`) and CSS custom properties (`var(--color-accent)`). This is the correct approach for the version in use — a `tailwind.config.js` would be ignored.

### 3. Two layouts: `default` and `auth`

**Decision:** `layouts/default.vue` for all authenticated pages, `layouts/auth.vue` for login/register.

**Rationale:** Every authenticated page currently duplicates the same `<header>` + nav markup. A shared layout eliminates this and ensures nav changes propagate everywhere. Auth pages need no nav — a separate minimal layout avoids conditional logic in the default layout.

### 4. Dashboard as the new `/` route

**Decision:** Add `pages/index.vue` as the dashboard. Update the auth middleware redirect to point to `/` instead of `/applications`.

**Rationale:** The current app has no home — the auth middleware redirects to `/applications`. A dashboard at `/` gives the user a meaningful landing that answers "did anything good come in?" without requiring them to navigate first.

### 5. New `GET /dashboard` endpoint on the API

**Decision:** Add a dedicated `/dashboard` endpoint that aggregates data from `JobApplication` and `JobSource` entities.

**Rationale:** The dashboard needs: new matches since last visit (or last 24h), the best new match with its rationale, other new matches, and week-on-week stats (evaluated count, matched count, avg score). Fetching this data from multiple existing endpoints on the client would require 3–4 serial requests. A single aggregation endpoint is cleaner and easier to extend.

**Response shape:**
```typescript
interface DashboardResponse {
  newMatchesToday: number
  bestMatch: {
    id: string
    jobTitle: string
    company: string
    location: string
    matchScore: number
    matchRationale: string
    jobUrl: string
  } | null
  otherNewMatches: Array<{
    id: string
    jobTitle: string
    company: string
    matchScore: number
  }>
  thisWeek: {
    evaluated: number
    matched: number
    avgScore: number
    digestsSent: number
  }
  lastWeek: {
    evaluated: number
    matched: number
    avgScore: number
  }
}
```

### 6. Google Fonts via `@nuxtjs/google-fonts`

**Decision:** Load Fraunces and Bricolage Grotesque via `@nuxtjs/google-fonts`.

**Rationale:** The Nuxt module handles preconnect, preload, and font-display automatically. No manual `<link>` tags in `app.vue`.

**Variable font axes:** Fraunces uses `opsz` (optical size) and `wght`. Bricolage Grotesque uses `opsz` and `wght`. Both are variable fonts — load once, use any weight.

## Risks / Trade-offs

**Nuxt UI v3 is relatively new** → Some components may have rough edges or incomplete documentation. Mitigation: use the `nuxt-ui` skill for accurate v3 API. Fall back to Nuxt UI v2 patterns only if a specific component is broken.

**Tailwind v4 CSS config is unfamiliar** → The `@theme` syntax differs significantly from v3. Mitigation: the `nuxt-ui` skill covers this. Tokens defined in `@theme` must use `--color-*` naming to generate both utilities and CSS vars correctly.

**Dashboard endpoint adds a backend task** → The `/dashboard` endpoint must be implemented before the frontend dashboard is functional. Mitigation: stub the composable to return mock data during frontend development; wire up the real endpoint as a separate task.

**Scoped CSS removal is mechanical but large** → All 5 pages need their `<style scoped>` blocks removed and templates rewritten with Tailwind classes. Risk of regressions on interactive states. Mitigation: do pages one at a time; keep the auth middleware and composables untouched.

## Migration Plan

1. Install `@nuxt/ui` and `@nuxtjs/google-fonts`, update `nuxt.config.ts`
2. Create `assets/css/main.css` with `@theme` token definitions
3. Create `layouts/default.vue` (nav) and `layouts/auth.vue`
4. Add `DESIGN.md` at repo root
5. Implement `GET /dashboard` on the API (`apps/api/`)
6. Add `useDashboard` composable in `apps/web/`
7. Create `pages/index.vue` (dashboard)
8. Refactor pages one by one: Login → Register → Preferences → Sources → Applications → CV
9. Remove all `<style scoped>` blocks after each page is verified

Rollback: all changes are in `apps/web/` and `apps/api/` — reverting is a single git revert. No database migrations involved.

## Open Questions

- Should "new matches" on the dashboard be scoped to the last 24 hours, or since the user's last login? Last 24h is simpler to implement and sufficient for a daily-digest tool.
- Should the CV page use Nuxt UI Accordion or keep the current toggle-per-section pattern? Accordion is cleaner but changes the interaction model. Decision deferred to implementation — either works.
