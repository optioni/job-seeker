# DESIGN.md — Job Seeker Brand Reference

This document is the single source of truth for the visual design system. Reference it before adding components, colors, or typography.

---

## Color Tokens

All tokens are defined in `apps/web/assets/css/main.css` as CSS custom properties in the `@theme` block.

| Token | Hex | Description |
|-------|-----|-------------|
| `--color-background` | `#f5f1eb` | Page background — warm parchment |
| `--color-card` | `#faf8f4` | Card / surface background — lighter parchment |
| `--color-border` | `#e2dbd0` | Default border — warm stone |
| `--color-border-strong` | `#c8c0b4` | Strong border, dot-grid dots |
| `--color-text-default` | `#1c1917` | Primary text — near black |
| `--color-text-muted` | `#6b6359` | Secondary / label text |
| `--color-text-faint` | `#a09589` | Placeholder, hint text |
| `--color-accent` | `#9f1239` | Burgundy — primary accent, nav stripe, headings |
| `--color-accent-tint` | `#ffe4e6` | Burgundy tint — hover surfaces, tags |
| `--color-success` | `#166534` | Forest green — high match scores (≥ 80%) |
| `--color-success-tint` | `#dcfce7` | Success background tint |
| `--color-error` | `#c2410c` | Terracotta — low scores (< 50%), errors |
| `--color-error-tint` | `#ffedd5` | Error background tint |
| `--color-warning` | `#b45309` | Amber — medium scores (50–79%), warnings |
| `--color-warning-tint` | `#fef3c7` | Warning background tint |

### Score color coding

| Score range | Color | Token |
|-------------|-------|-------|
| ≥ 80% | Forest green | `--color-success` |
| 50–79% | Amber | `--color-warning` |
| < 50% | Terracotta | `--color-error` |

---

## Typography

### Font families

| Role | Font | CSS variable |
|------|------|--------------|
| Display / headings | Fraunces (variable serif) | `--font-display` |
| UI / body | Bricolage Grotesque (variable sans) | `--font-sans` |

### Usage rules

- **Fraunces** — use for: page-level headings (`h1`), large numbers, job titles in hero cards, brand lockup, nav active pill, any italic display text
- **Bricolage Grotesque** — use for: all other text — labels, body copy, nav links, form inputs, badges, table content, metadata

### Typography pairing example

```html
<h1 class="font-display italic">3 new matches since yesterday.</h1>
<p class="font-sans text-muted">Pipeline statistics for this week</p>
```

---

## Component Patterns

### Buttons

Use Nuxt UI `UButton` for all buttons. Never use raw `<button>` elements.

| Variant | Usage |
|---------|-------|
| `color="primary" variant="solid"` | Primary action (Save, Submit, Add) |
| `color="neutral" variant="outline"` | Secondary action (Cancel, Edit) |
| `color="error" variant="soft"` | Destructive action (Delete) |
| `variant="ghost"` | Tertiary / icon-only actions |

### Badges

Use Nuxt UI `UBadge` for all status indicators and tags.

```vue
<UBadge color="success" variant="soft">Active</UBadge>
<UBadge color="error" variant="soft">Paused</UBadge>
<UBadge color="neutral" variant="soft">No</UBadge>
<UBadge color="primary" variant="soft">New</UBadge>
```

### Cards

```vue
<div class="bg-card border border-[var(--color-border)] rounded-xl p-6">
  <!-- content -->
</div>
```

### Nav (default layout)

- 72px tall, parchment background, 3px burgundy top border
- Brand lockup: "YOUR SEARCH" (small caps, muted) / "Job Seeker" (italic Fraunces)
- Active link: dark pill, italic Fraunces text
- Inner content constrained to `max-w-[1040px] mx-auto`

---

## Do / Don't

### Colors
- **DO** use the `--color-*` tokens or Tailwind utilities generated from them
- **DO** use `rose` (Tailwind palette) for primary Nuxt UI component colors
- **DON'T** use raw Tailwind color values like `text-blue-600` or `bg-indigo-*`
- **DON'T** use violet, purple, or cool-toned palettes — this is a warm system
- **DON'T** use pure `#ffffff` white — use `--color-card` (`#faf8f4`) for surfaces

### Typography
- **DO** use Fraunces for display headings and brand moments
- **DO** use italic Fraunces for emphasis in headings and nav active states
- **DON'T** use Inter, system-ui directly, or any other typeface
- **DON'T** use Fraunces for body copy or UI labels — that is Bricolage Grotesque's role

### Layout
- **DO** constrain page content to `max-w-[1040px] mx-auto px-6`
- **DON'T** add per-page `<style scoped>` blocks — use Tailwind utilities instead
- **DON'T** duplicate the nav — it lives in `layouts/default.vue`

### Components
- **DO** use Nuxt UI components (UButton, UModal, UDrawer, UTable, UAccordion, UBadge)
- **DON'T** build raw overlays, modals, or drawers from scratch
