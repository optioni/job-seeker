## Purpose

Provides internationalisation support for the Nuxt 3 web app via `@nuxtjs/i18n`, enabling browser language auto-detection, locale cookie persistence, and full translation coverage across all pages and layouts.

## Requirements

### Requirement: Browser language auto-detection
The Nuxt 3 app SHALL use `@nuxtjs/i18n` registered in `nuxt.config.ts` with `strategy: 'no_prefix'` and `detectBrowserLanguage` enabled. The detected locale SHALL be persisted in a cookie (`useCookie: true`). Supported locales SHALL be `['en', 'fi']` with `defaultLocale: 'en'` as the fallback for unsupported or undetectable browser languages.

#### Scenario: Finnish browser auto-detected
- **WHEN** a user with a Finnish browser locale (`fi` or `fi-FI`) visits the app for the first time
- **THEN** the UI is rendered in Finnish and the locale is stored in a cookie

#### Scenario: Unsupported browser language falls back to English
- **WHEN** a user with a browser locale not in `['en', 'fi']` (e.g. `de`) visits the app
- **THEN** the UI is rendered in English

#### Scenario: Cookie persists locale across sessions
- **WHEN** a user's locale has been detected and stored in a cookie
- **THEN** subsequent visits use the stored locale without re-detecting from the browser

### Requirement: Flat JSON locale files
The app SHALL store all UI translation strings in `apps/web/i18n/locales/en.json` and `apps/web/i18n/locales/fi.json`. Keys SHALL be organized as nested objects with top-level namespaces matching page and shared concerns: `nav`, `login`, `register`, `dashboard`, `applications`, `sources`, `preferences`, `cv`, `common`.

#### Scenario: English locale file covers all namespaces
- **WHEN** the English locale file is loaded
- **THEN** every translation key used in any page or layout has a corresponding entry

#### Scenario: Finnish locale file covers all namespaces
- **WHEN** the Finnish locale file is loaded
- **THEN** every translation key used in any page or layout has a corresponding Finnish entry

### Requirement: All UI strings use translation keys
Every hardcoded English string in pages (`pages/`) and layouts (`layouts/`) SHALL be replaced with `$t('namespace.key')` in templates and `const { t } = useI18n(); t('namespace.key')` in `<script setup>` blocks. Error strings set in reactive refs inside `<script setup>` SHALL also use `t()`.

#### Scenario: Page renders translated strings
- **WHEN** the active locale is Finnish
- **THEN** all visible UI text on every page is in Finnish with no hardcoded English strings remaining

#### Scenario: Script-side error message translated
- **WHEN** a login attempt fails and the active locale is Finnish
- **THEN** the error message displayed is the Finnish translation of the login error key
