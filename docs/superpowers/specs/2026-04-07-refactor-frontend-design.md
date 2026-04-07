# Frontend Redesign — Design Spec

**Date:** 2026-04-07  
**Status:** Approved

---

## Overview

Refactor the Nuxt 3 admin UI from hand-rolled scoped CSS to Nuxt UI + Tailwind CSS. Introduce a consistent design system, a shared layout component, and a new dashboard page. The visual direction is warm editorial — personal and inviting, not generic SaaS.

---

## Design System

### Typography

| Role | Font | Weight | Usage |
|---|---|---|---|
| Display / headings | Fraunces (serif, variable) | 200–300, italic | Page titles, large numbers, job titles |
| UI / body | Bricolage Grotesque (sans, variable) | 400–600 | Navigation, labels, body text, buttons |

Loaded via Google Fonts. Configured in `nuxt.config.ts` via `@nuxtjs/google-fonts`.

### Color Tokens

All tokens defined as CSS custom properties in a global stylesheet and mapped to Tailwind via `nuxt.config.ts`.

```
--color-bg:         #f5f2ea   warm parchment background
--color-card:       #fdfcf8   card / surface
--color-border:     #e3ddd4   subtle border
--color-border-2:   #cec7bc   stronger border (card outlines)
--color-text:       #18150f   near-black, warm
--color-muted:      #7a7168   secondary text
--color-faint:      #ada59a   tertiary text, labels
--color-accent:     #9f1239   burgundy — primary accent
--color-accent-bg:  #fff1f2   accent tint (badges, highlights)
--color-yes:        #2d6a4f   forest green — matched / success
--color-yes-bg:     #d8f3dc   success tint
--color-no:         #78350f   warm terracotta — not matched
--color-no-bg:      #fde8c8   terracotta tint
--color-warn:       #92400e   amber — warning states
```

### Background Texture

Subtle dot grid overlaid on the parchment background:

```css
background-image: radial-gradient(circle, #c8c0b4 1px, transparent 1px);
background-size: 28px 28px;
opacity: 0.35;
```

Applied via a fixed `::before` pseudo-element on `<body>` (pointer-events: none).

### Navigation

- Height: 72px
- Top border: 3px solid `--color-accent` (burgundy stripe)
- Background: `rgba(245,242,234,0.92)` with `backdrop-filter: blur(16px)`
- Max-width: 1040px, centered
- Sticky, z-index 100

**Brand lockup** (stacked, left side):
- Eyebrow: `"YOUR SEARCH"` — 10px, uppercase, `letter-spacing: 0.14em`, `--color-accent`
- Name: `"Job Seeker"` — 20px Fraunces light italic, `--color-text`

**Nav links:**
- Inactive: 13px Bricolage Grotesque 500, `--color-muted`
- Active: dark pill (`background: --color-text`, `color: --color-bg`), 14px Fraunces light italic
- Border radius: 999px (pill)

**Avatar:** 34px circle, `--color-text` background, Fraunces italic initials

### Cards & Surfaces

- Background: `--color-card`
- Border: 1px solid `--color-border-2`
- Border radius: 12px (standard), 16px (hero card)
- No box shadows — borders carry the depth, background texture provides atmosphere

### Buttons

| Variant | Style |
|---|---|
| Primary | `bg: --color-text`, `color: --color-bg`, 8px radius |
| Ghost | transparent, `border: --color-border`, `color: --color-muted` |
| Danger | `bg: --color-no-bg`, `color: --color-no` |

### Badges / Tags

Pill shape (border-radius: 999px), 3px 10px padding, 11px 500 weight.

| Semantic | Background | Text |
|---|---|---|
| New | `--color-accent-bg` | `--color-accent` |
| Matched | `--color-yes-bg` | `--color-yes` |
| Not matched | `--color-no-bg` | `--color-no` |

### Match Score Display

Scores displayed as plain Fraunces numbers (24px light) in the semantic color:
- ≥ 80%: `--color-yes`
- 50–79%: `--color-warn`
- < 50%: `--color-no`

Hero card score panel: full burgundy background panel, 56px Fraunces 200 white number.

---

## Architecture

### Nuxt UI + Tailwind

Install `@nuxt/ui` (v3) which bundles Tailwind CSS v4. Note: Tailwind v4 uses CSS-based configuration (`@theme` in a `.css` file) rather than `tailwind.config.js` — design tokens are defined there, not in `nuxt.config.ts`. Use Nuxt UI components where they cover existing patterns (modals, tables, tabs, form inputs, drawers) and apply Tailwind utility classes for layout and custom styling.

### Shared Layout

Replace the duplicated per-page header/nav with a single `layouts/default.vue`:

```
layouts/
  default.vue      ← AppNav + <slot> + dot-grid body
  auth.vue         ← minimal centered layout for login/register
```

All authenticated pages use `default` layout. Login and register use `auth` layout (no nav, centered card).

### Pages

| Page | Route | Notes |
|---|---|---|
| Dashboard | `/` | New page — replaces redirect to applications |
| Applications | `/applications` | Table → Nuxt UI Table + detail drawer |
| Sources | `/sources` | Lists + add modal → Nuxt UI Modal |
| Preferences | `/preferences` | Form → Nuxt UI Form inputs |
| CV | `/cv` | Section cards + add forms → Nuxt UI Accordion per section |
| Login | `/login` | Auth layout, centered card |
| Register | `/register` | Auth layout, centered card |

---

## Dashboard Page

**Purpose:** Answer "did anything good come in?" at a glance.

**Layout (top to bottom):**

1. **Page header** — date eyebrow, large Fraunces headline with italic burgundy new-match count ("*5 new matches* since yesterday."), week-on-week stats top-right (matches this week + avg score, both with trend arrows)

2. **Best new match card** — hero card with two columns:
   - Left: company/location meta, job title (Fraunces 26px), LLM rationale text, "View full application" + "Open listing" buttons
   - Right: burgundy panel with large score number, "Excellent/Good/Fair" badge

3. **Also new today** — 3-column grid of other new matches. Each card: title, company, score, "New" tag.

4. **This week strip** — 4-cell horizontal bar: Evaluated / Matched / Avg score / In digest. Each with a week-on-week change indicator.

**Data requirements** (new API endpoints needed):
- `GET /dashboard` — returns: `newMatchesToday`, `bestMatch` (with rationale), `otherNewMatches`, `weekStats` (current + previous week counts/avg)

---

## DESIGN.md

A `DESIGN.md` file at the repo root documents the complete design system for future reference:
- Color tokens (hex values + semantic meaning)
- Typography scale + font pairings
- Component patterns (buttons, badges, cards, nav)
- Do/don't guidelines (e.g. never use violet, never use Inter)
- Background texture recipe

---

## Page-by-Page Changes

### Login / Register
- `auth` layout: centered card (400px), parchment background with dot grid
- Fraunces italic heading ("Welcome back." / "Create your account.")
- Nuxt UI form inputs styled with custom tokens
- Primary button full-width

### Applications
- Nuxt UI Table replacing hand-rolled `<table>`
- Match score column: colored Fraunces number
- Matched column: badge (Matched / Not matched)
- Row click opens a Nuxt UI Drawer (right side, 560px)
- Drawer: job title + company header, rationale section, Tabs for CV snapshot / cover letter

### Sources
- Available presets: card grid instead of plain list
- My sources: list with active/paused toggle and delete
- Add source: Nuxt UI Modal with dynamic filter fields

### Preferences
- Single card with Nuxt UI form inputs
- 2-column grid layout preserved
- Save button + inline success/error feedback

### CV Editor
- Each section (Work, Education, Skills, etc.) as a Nuxt UI Accordion item
- Add forms inline within each accordion panel
- Skills / Languages rendered as tag chips

---

## What Is Not Changing

- All composables (`useApi`, `useAuth`, `useApplications`, `useJobSources`) — logic unchanged
- API endpoints — no backend changes except the new `/dashboard` endpoint
- Auth middleware — unchanged
- TypeScript interfaces — moved to `types/` but content unchanged
