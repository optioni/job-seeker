## ADDED Requirements

### Requirement: Design token CSS custom properties
The app SHALL define all design tokens as CSS custom properties in `assets/css/main.css` using Tailwind v4's `@theme` block. Tokens SHALL cover: background, card surface, border (two strengths), text (primary, muted, faint), accent (burgundy), accent tint, success (forest green), success tint, error (terracotta), error tint, and warning colors.

#### Scenario: Token available as utility class
- **WHEN** a component uses `bg-accent` or `text-muted`
- **THEN** the Tailwind-generated class applies the correct CSS custom property value

#### Scenario: Token available as CSS variable
- **WHEN** a component uses `var(--color-accent)` in an inline style or custom CSS
- **THEN** the correct hex value is applied

### Requirement: Typography configuration
The app SHALL load Fraunces (variable, optical size + weight axes) and Bricolage Grotesque (variable, optical size + weight axes) via `@nuxtjs/google-fonts`. Fraunces SHALL be used for display headings, large numbers, and job titles. Bricolage Grotesque SHALL be used for all UI text, labels, and body copy.

#### Scenario: Fonts loaded on page
- **WHEN** any page renders
- **THEN** Fraunces and Bricolage Grotesque are available without FOUT (preloaded via the Google Fonts module)

### Requirement: Background texture
The app body SHALL render a subtle dot grid pattern as a fixed `::before` pseudo-element. The grid SHALL use warm stone dots (`#c8c0b4`) at 28px spacing with 0.35 opacity, pointer-events disabled.

#### Scenario: Texture visible
- **WHEN** any authenticated page renders
- **THEN** the dot grid is visible in the background behind all content

#### Scenario: Texture does not intercept clicks
- **WHEN** the user clicks any interactive element
- **THEN** the dot grid pseudo-element does not block the event

### Requirement: Nuxt UI component theme
The app SHALL configure Nuxt UI v3 to use the design tokens as its color palette in `nuxt.config.ts`. The `primary` color SHALL map to the burgundy accent (`#9f1239`). Form inputs, buttons, badges, modals, drawers, tables, tabs, and accordions provided by Nuxt UI SHALL inherit the token values.

#### Scenario: Primary button uses accent color
- **WHEN** a `UButton` with `color="primary"` renders
- **THEN** it uses the burgundy accent background

### Requirement: DESIGN.md brand reference
A `DESIGN.md` file SHALL exist at the repository root documenting: all color token hex values with semantic descriptions, typography pairing and usage guidelines, component patterns (buttons, badges, cards, nav), and explicit do/don't rules (e.g. do not use Inter, do not use violet/purple).

#### Scenario: DESIGN.md exists
- **WHEN** a developer checks the repository root
- **THEN** `DESIGN.md` is present and covers all token values and component guidelines
