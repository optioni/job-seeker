## ADDED Requirements

### Requirement: i18n plugin registered in Nuxt config
The `nuxt.config.ts` SHALL include `@nuxtjs/i18n` in the `modules` array. The i18n configuration SHALL set `strategy: 'no_prefix'`, `defaultLocale: 'en'`, `locales: ['en', 'fi']`, and `detectBrowserLanguage` with `useCookie: true`. Translation files SHALL be referenced from `i18n/locales/`.

#### Scenario: i18n module active at runtime
- **WHEN** the Nuxt app starts
- **THEN** `useI18n()` is available in all pages and layouts without additional imports

#### Scenario: No URL prefix in routes
- **WHEN** a Finnish user navigates to the applications page
- **THEN** the URL is `/applications` (not `/fi/applications`)

## MODIFIED Requirements

### Requirement: Shared default layout
All authenticated pages SHALL use `layouts/default.vue` which renders the top navigation bar and a `<slot>` for page content. The navigation bar SHALL be 72px tall with a 3px burgundy top border, a stacked brand lockup ("YOUR SEARCH" eyebrow + "Job Seeker" italic serif), nav links for Dashboard / Applications / Sources / Preferences / CV, and a user avatar. The active nav link SHALL render as a dark pill with italic Fraunces text. The nav inner content SHALL be constrained to 1040px centered. Nav link labels SHALL use `$t('nav.*')` translation keys so they render in the active locale.

#### Scenario: Nav renders on authenticated page
- **WHEN** an authenticated user views any page except login/register
- **THEN** the shared nav is present with correct brand and links

#### Scenario: Active link highlighted
- **WHEN** the user is on the Applications page
- **THEN** the Applications nav link renders as the dark active pill

#### Scenario: Nav links in Finnish
- **WHEN** the active locale is Finnish
- **THEN** nav link labels render in Finnish
