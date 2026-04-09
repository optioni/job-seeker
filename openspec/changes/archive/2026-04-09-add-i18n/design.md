## Context

The app currently has all UI strings hardcoded in English across 7 Nuxt 3 pages and 2 layouts, and the PDF/email templates in the NestJS pipeline have no translation support. The Finnish job market context makes Finnish a first-class language requirement. Language for generated documents is already tracked per-job via `JobPreferences.defaultLanguage` and `JobSource.language` — the API translation layer can use this directly without any new data model changes.

## Goals / Non-Goals

**Goals:**
- Finnish/English support in the Nuxt 3 admin UI, auto-detected from browser language
- Finnish/English translation of Puppeteer PDF template labels (section headings, field labels)
- Finnish/English translation of Nodemailer daily digest email templates
- English as fallback for unsupported or undetectable browser languages

**Non-Goals:**
- A manual language switcher UI — browser detection is sufficient
- Translating LLM-generated content (CV text, cover letter prose, match rationale) — the LLM already handles this via `JobSource.language`
- URL-based locale routing (no `/fi/`, `/en/` prefixes)
- More than two locales

## Decisions

### Frontend: `@nuxtjs/i18n` with `no_prefix` strategy

`@nuxtjs/i18n` is the standard Nuxt 3 i18n module and integrates natively with Nuxt's plugin system, SSR, and auto-imports. The `no_prefix` strategy keeps URLs unchanged, which is appropriate for an internal admin tool with no SEO requirements.

`detectBrowserLanguage` with `useCookie: true` persists the detected locale across sessions without requiring any user action. `fallbackLocale: 'en'` ensures unknown browser languages default to English.

Alternative considered: manual `useI18n` setup without the module — rejected because `@nuxtjs/i18n` handles SSR hydration, locale persistence, and Nuxt plugin wiring automatically.

### Frontend: Flat JSON locale files

All translation strings in `apps/web/i18n/locales/en.json` and `fi.json`, organized as nested objects by page/section (`nav`, `login`, `dashboard`, `applications`, `sources`, `preferences`, `cv`, `common`).

At ~80-100 strings across 7 pages, a single file per locale is trivially maintainable. Per-page lazy-loaded chunks would add build complexity with no meaningful performance benefit for an app this size.

### API: `nestjs-i18n` with explicit language injection

`nestjs-i18n` is the standard NestJS i18n library, providing `I18nService` as an injectable. Since translations are consumed inside Bull queue job processors — not HTTP request handlers — language cannot be inferred from `Accept-Language` headers. Instead, `I18nService.translate(key, { lang })` is called explicitly with the language sourced from `JobPreferences.defaultLanguage`.

Alternative considered: passing pre-translated strings from the queue producer — rejected because it would scatter translation concerns across the codebase and break the single-responsibility of each module.

### API: Translation file structure

Two namespaces in `apps/api/src/i18n/en.json` and `fi.json`:
- `cv` — section headings for the Puppeteer PDF template (Work Experience, Education, Skills, Languages, Certifications, Projects, Summary)
- `email` — digest email strings (subject line, greeting, match score label, view link text)

The API translation scope is intentionally narrow. LLM-generated prose (CV content, cover letter) is already language-directed by the `JobSource.language` field passed to the LLM prompt.

## Risks / Trade-offs

- **Incomplete Finnish translations at launch** → Mitigation: English fallback keys are always present; missing Finnish strings fall back to English gracefully via `nestjs-i18n` and `@nuxtjs/i18n` fallback config.
- **Cookie-based locale persistence may conflict with browser language changes** → Mitigation: Acceptable for an internal admin tool; the cookie can be cleared to re-trigger detection.
- **`nestjs-i18n` adds a module-level dependency to `AppModule`** → Mitigation: `I18nModule.forRoot()` is a single registration; `I18nService` is available globally without per-module imports.

## Migration Plan

1. Install dependencies (`@nuxtjs/i18n`, `nestjs-i18n`) — no breaking changes to existing runtime behaviour
2. Add locale JSON files with all English strings extracted first; Finnish translations added in the same pass
3. Update frontend pages/layouts to use `$t()` — purely additive, no API or data changes
4. Register `I18nModule` in `AppModule` and update `DocumentModule` and `NotificationModule` — existing PDF/email output unchanged for English, improved for Finnish
5. No rollback complexity — reverting is a dependency removal and string revert with no data migration

## Open Questions

- Should the PDF template language follow `JobPreferences.defaultLanguage` exclusively, or also consider `JobSource.language` as an override? (Current proposal uses `JobPreferences.defaultLanguage` as the authoritative source.)
