## Why

The admin UI is forced to light mode only, which is uncomfortable in low-light environments and inconsistent with OS-level preferences. Dark mode is a baseline expectation for developer-facing tools.

## What Changes

- Remove the forced `preference: 'light'` color mode lock in `nuxt.config.ts`
- Define dark-mode CSS variable overrides for all 12 brand design tokens using Nuxt UI's `.dark` class selector
- Pin `--ui-primary` to rose-800 in both light and dark contexts
- Replace two hardcoded hex values in `layouts/default.vue` (active nav link) with CSS variables so they invert correctly
- Add a color mode toggle button to the nav bar

## Capabilities

### New Capabilities

- `color-mode-toggle`: A toggle control in the nav bar that switches between light, dark, and system modes, persisted via `@nuxtjs/color-mode`.

### Modified Capabilities

- `design-system`: Extend design tokens to include dark-mode variants for all existing color custom properties; document dark palette in DESIGN.md.

## Impact

- `apps/web/assets/css/main.css` — dark token overrides and `--ui-primary` scoping
- `apps/web/nuxt.config.ts` — remove forced light mode
- `apps/web/layouts/default.vue` — replace hardcoded hex values; add toggle button
- `apps/web/app.config.ts` — no changes needed (Nuxt UI color tokens handled via CSS)
- No backend changes; no API changes; no LLM pipeline impact
