## Context

The admin UI uses Nuxt UI v4 with `@nuxtjs/color-mode` already installed as a dependency. All brand colors are defined as CSS custom properties in `assets/css/main.css` via Tailwind v4's `@theme` block. Color mode was forcibly locked to `light` to prevent Nuxt UI components from going dark while manually-styled elements stayed light (they were using different variable systems). That lock is now the blocker.

Current token set (light only): `--color-background`, `--color-card`, `--color-border`, `--color-border-strong`, `--color-text-default/muted/faint`, `--color-accent`, `--color-accent-tint`, `--color-success/success-tint`, `--color-error/error-tint`, `--color-warning/warning-tint`.

Nuxt UI v4 sets dark mode via a `.dark` class on `<html>` (managed by `@nuxtjs/color-mode`). Its internal `--ui-*` tokens switch automatically when the class changes.

## Goals / Non-Goals

**Goals:**
- Dark palette for all 12+ brand tokens via `.dark` CSS class overrides
- `--ui-primary` pinned to rose-800 in both modes
- Color mode toggle in nav (light / dark / system)
- Preference persisted across page loads
- Hardcoded hex values in `default.vue` replaced with CSS variables

**Non-Goals:**
- Per-page or per-component color mode switching
- High-contrast / accessibility mode
- Dark mode in generated PDF CVs or email digests

## Decisions

### Decision: `.dark` class override via CSS, not JS computed styles

**Choice:** Add a `.dark` selector block in `main.css` that redefines all CSS custom properties.

**Rationale:** Nuxt UI already uses `.dark` on `<html>` — piggy-backing on the same mechanism means our brand tokens and Nuxt UI tokens switch in sync with a single class toggle. No JavaScript involved in the actual color switch. Alternative (media query `prefers-color-scheme`) was rejected because it can't be overridden by a toggle — the user's manual preference would be ignored.

### Decision: Dark palette direction — warm dark, not cold dark

**Choice:** Dark backgrounds use warm charcoal (`#1c1917` stone-900 family) rather than neutral grays. Accent stays burgundy, elevated slightly to rose-700 for better contrast on dark surfaces.

**Rationale:** Matches the editorial parchment identity — a warm dark feels like aged paper at night rather than a generic dev-tool dark theme. Cold grays would break the brand continuity.

### Decision: `--ui-primary` override stays in `:root`, no `.dark` variant needed

**Choice:** `--ui-primary: var(--ui-color-primary-800)` remains in `:root` only.

**Rationale:** Rose-800 (`#9f1239`) has sufficient contrast on both light (cream) and dark (charcoal) backgrounds. Nuxt UI's hover/focus states use opacity modifiers (`bg-primary/75`) which work correctly at this shade on dark surfaces.

### Decision: Toggle in nav — icon-only, three states

**Choice:** Sun / moon / monitor icon cycles through `light → dark → system`. Placed at the right of the nav bar alongside the logout button.

**Rationale:** Minimal footprint; system mode respects OS preference without forcing a choice. `useColorMode()` from `@nuxtjs/color-mode` handles persistence to `localStorage` automatically.

## Risks / Trade-offs

- **Dot grid texture contrast** — the body `::before` dot color (`#c8c0b4`) is hardcoded. On dark backgrounds it will be invisible or harsh. → Mitigation: redefine as a CSS variable `--color-dot-grid` with a dark override (`oklch(30% 0.01 60)` approx).
- **Inline `style=` attributes** — several card/border styles use `var(--color-*)` already, so they'll pick up the dark overrides for free. The two hardcoded hex values in `default.vue` are the only exceptions.
- **Flash of incorrect theme (FOIT)** — `@nuxtjs/color-mode` injects a small script in `<head>` to apply the `.dark` class before paint, preventing flash. This is enabled by default; no extra config needed.
