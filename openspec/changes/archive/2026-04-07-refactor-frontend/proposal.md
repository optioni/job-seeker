## Why

The frontend was scaffolded with hand-rolled scoped CSS duplicated across every page — no shared layout, no design system, no consistent tokens. The UI lacks personality and is harder to maintain as pages grow. This refactor introduces Nuxt UI + Tailwind CSS, a warm editorial design system, and a proper dashboard that surfaces what the user actually cares about.

## What Changes

- **Install Nuxt UI v3** (bundles Tailwind CSS v4) as the component and styling foundation
- **Create `DESIGN.md`** at repo root — documents color tokens, typography, component patterns for future consistency
- **Replace all scoped per-page CSS** with Tailwind utility classes and Nuxt UI components
- **Add shared layout** (`layouts/default.vue`) with the redesigned top nav — eliminates duplicated nav across all pages
- **Add auth layout** (`layouts/auth.vue`) for login/register — centered card, no nav
- **New dashboard page** (`pages/index.vue`) — user-first: shows new matches today, best match with LLM rationale, week-on-week stats
- **Redesign all existing pages** — Applications (Nuxt UI Table + Drawer), Sources (modal, card grid), Preferences (form inputs), CV (Accordion sections), Login/Register (auth layout)
- **New `GET /dashboard` API endpoint** — returns new matches, best match with rationale, and weekly stats

## Capabilities

### New Capabilities
- `dashboard`: Dashboard page showing new matches, best match with rationale snippet, and week-on-week pipeline stats
- `design-system`: Design tokens, typography scale, DESIGN.md, Tailwind/Nuxt UI configuration

### Modified Capabilities
- `frontend-ui`: All existing pages redesigned — new layout system, Nuxt UI components replace hand-rolled HTML/CSS

## Impact

- `apps/web/` — full refactor of all pages, new layouts, new composables for dashboard data
- `apps/web/nuxt.config.ts` — add `@nuxt/ui`, `@nuxtjs/google-fonts`
- `apps/web/package.json` — new dependencies
- `apps/api/` — new `/dashboard` endpoint (read-only aggregation of existing data)
- `DESIGN.md` — new file at repo root
- No changes to existing composables, auth middleware, or TypeScript interfaces
