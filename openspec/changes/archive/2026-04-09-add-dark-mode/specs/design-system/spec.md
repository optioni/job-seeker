## MODIFIED Requirements

### Requirement: Design token CSS custom properties
The app SHALL define all design tokens as CSS custom properties in `assets/css/main.css` using Tailwind v4's `@theme` block for light mode values, and a `.dark` selector block for dark mode overrides. Tokens SHALL cover: background, card surface, border (two strengths), text (primary, muted, faint), accent (burgundy), accent tint, dot grid, success (forest green), success tint, error (terracotta), error tint, and warning colors.

Dark mode token values SHALL use warm charcoal tones (stone-900 family) for backgrounds and surfaces, maintaining the editorial brand character. Accent SHALL remain rose-800 (`#9f1239`) in both modes.

#### Scenario: Token available as utility class
- **WHEN** a component uses `bg-accent` or `text-muted`
- **THEN** the Tailwind-generated class applies the correct CSS custom property value

#### Scenario: Token available as CSS variable
- **WHEN** a component uses `var(--color-accent)` in an inline style or custom CSS
- **THEN** the correct hex value is applied

#### Scenario: Dark mode tokens active
- **WHEN** the `.dark` class is present on `<html>`
- **THEN** all `--color-*` custom properties resolve to their dark-mode values

#### Scenario: Light mode tokens active
- **WHEN** the `.dark` class is absent from `<html>`
- **THEN** all `--color-*` custom properties resolve to their light-mode values

### Requirement: Nuxt UI component theme
The app SHALL configure Nuxt UI v4 to use the design tokens as its color palette. The `primary` color SHALL map to rose and `--ui-primary` SHALL be pinned to rose-800 (`#9f1239`) via a `:root` override in `main.css`. The color mode SHALL NOT be forced to `light` in `nuxt.config.ts` — Nuxt UI components SHALL respond to the active color mode class.

#### Scenario: Primary button uses accent color
- **WHEN** a `UButton` with `color="primary"` renders in either light or dark mode
- **THEN** it uses the burgundy rose-800 background

#### Scenario: Inputs respond to color mode
- **WHEN** dark mode is active
- **THEN** `UInput`, `USelect`, and `UTextarea` components render with dark backgrounds and appropriate contrast

## ADDED Requirements

### Requirement: Dot grid texture adapts to color mode
The dot grid `::before` pseudo-element on `body` SHALL use a CSS custom property `--color-dot-grid` for its dot color. The light-mode value SHALL be `#c8c0b4` (warm stone). The dark-mode value SHALL be a darker warm tone that remains subtle against dark backgrounds.

#### Scenario: Dot grid visible in light mode
- **WHEN** light mode is active
- **THEN** the dot grid is visible as warm stone dots on the parchment background

#### Scenario: Dot grid visible in dark mode
- **WHEN** dark mode is active
- **THEN** the dot grid is visible as subtle warm dots on the dark background without being harsh
