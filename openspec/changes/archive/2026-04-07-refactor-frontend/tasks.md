## 1. Dependencies & Configuration

- [x] 1.1 Add `@nuxt/ui`, `@nuxtjs/google-fonts` to `apps/web/package.json` and run `yarn install`
- [x] 1.2 Update `apps/web/nuxt.config.ts` — add `@nuxt/ui` and `@nuxtjs/google-fonts` modules, configure Fraunces + Bricolage Grotesque font families
- [x] 1.3 Create `apps/web/assets/css/main.css` — define all design tokens in `@theme` block (background, card, borders, text, accent burgundy, success forest green, error terracotta, warning)
- [x] 1.4 Register `assets/css/main.css` as a global stylesheet in `nuxt.config.ts`
- [x] 1.5 Configure Nuxt UI primary color to use `#9f1239` (burgundy) in `nuxt.config.ts`

## 2. DESIGN.md

- [x] 2.1 Create `DESIGN.md` at repo root — document all color token hex values with semantic descriptions, typography pairing rules, component patterns (buttons, badges, cards, nav), and explicit do/don't guidelines

## 3. Shared Layouts

- [x] 3.1 Create `apps/web/layouts/default.vue` — 72px nav with burgundy top stripe, stacked brand lockup ("YOUR SEARCH" / "Job Seeker" italic Fraunces), nav links (Dashboard / Applications / Sources / Preferences / CV), active pill (dark bg, italic Fraunces), 1040px centered inner, user avatar, parchment background with dot grid texture
- [x] 3.2 Create `apps/web/layouts/auth.vue` — minimal centered card layout, no nav, parchment background with dot grid texture
- [x] 3.3 Update `apps/web/app.vue` to use `<NuxtLayout>` and `<NuxtPage>`

## 4. API — Dashboard Endpoint

- [x] 4.1 Create `DashboardModule` in `apps/api/src/dashboard/` with controller, service, and module files
- [x] 4.2 Implement `GET /dashboard` in `DashboardController` — JWT-protected, returns `DashboardResponse` shape (newMatchesToday, bestMatch, otherNewMatches, thisWeek, lastWeek)
- [x] 4.3 Implement `DashboardService.getData()` — query `JobApplication` for matched records with `createdAt >= now - 24h`, compute week-on-week stats from `JobApplication` and `JobListing` counts
- [x] 4.4 Register `DashboardModule` in `AppModule`

## 5. Dashboard Page (Web)

- [x] 5.1 Create `apps/web/composables/useDashboard.ts` — fetches `GET /dashboard`, exposes `data`, `pending`, `error`
- [x] 5.2 Create `apps/web/pages/index.vue` — dashboard page using `default` layout: date eyebrow, new-matches headline (italic burgundy count), week stats top-right, best match hero card (score panel + rationale + actions), "Also new today" 3-column grid, "This week" stats strip
- [x] 5.3 Update auth middleware to redirect authenticated users to `/` instead of `/applications`

## 6. Login & Register Pages

- [x] 6.1 Refactor `apps/web/pages/login.vue` — use `auth` layout, remove `<style scoped>`, apply Tailwind + Nuxt UI form inputs, Fraunces italic heading
- [x] 6.2 Refactor `apps/web/pages/register.vue` — use `auth` layout, remove `<style scoped>`, apply Tailwind + Nuxt UI form inputs

## 7. Preferences Page

- [x] 7.1 Refactor `apps/web/pages/preferences.vue` — use `default` layout (remove inline nav + logout), remove `<style scoped>`, replace inputs with Nuxt UI form components, apply Tailwind layout classes

## 8. Sources Page

- [x] 8.1 Refactor `apps/web/pages/sources.vue` — use `default` layout, remove `<style scoped>`
- [x] 8.2 Replace preset plain list with a card grid using Tailwind grid utilities
- [x] 8.3 Replace add-source overlay with a Nuxt UI Modal component

## 9. Applications Page

- [x] 9.1 Refactor `apps/web/pages/applications.vue` — use `default` layout, remove `<style scoped>`
- [x] 9.2 Replace hand-rolled `<table>` with Nuxt UI Table component
- [x] 9.3 Apply score color coding (forest green ≥ 80%, amber 50–79%, terracotta < 50%) using Tailwind text utilities
- [x] 9.4 Replace drawer overlay with a Nuxt UI Drawer (slideOver) component for application detail

## 10. CV Page

- [x] 10.1 Refactor `apps/web/pages/cv.vue` — use `default` layout, remove `<style scoped>`
- [x] 10.2 Replace per-section toggle pattern with Nuxt UI Accordion — one item per CV section (Work, Education, Skills, Languages, Certifications, Projects)
- [x] 10.3 Move add forms inside each Accordion panel, apply Tailwind grid for 2-column fields
- [x] 10.4 Render Skills and Languages as tag chips (pill badges with delete button)

## 11. Cleanup

- [x] 11.1 Verify all pages have no remaining `<style scoped>` blocks
- [x] 11.2 Remove any unused CSS utility classes or leftover inline styles
- [x] 11.3 Confirm `definePageMeta({ layout: 'auth' })` on login and register, and `definePageMeta({ middleware: [] })` still present on login
- [x] 11.4 Update `apps/web/vitest.config.ts` if any test paths changed due to new pages/composables
