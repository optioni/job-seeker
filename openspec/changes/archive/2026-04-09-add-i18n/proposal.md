## Why

The admin UI is English-only and the generated PDF documents (CV, cover letter) and daily digest emails use hardcoded English template labels, making the system awkward for Finnish-speaking users. Adding Finnish/English i18n ensures the UI and generated documents reflect the language preference of the job market context.

## What Changes

- Add `@nuxtjs/i18n` to the Nuxt 3 frontend with browser language auto-detection, no URL prefix strategy, English as fallback, and flat JSON locale files (`en.json`, `fi.json`)
- Replace all hardcoded UI strings in pages, layouts, and composables with `$t()` / `t()` calls
- Add `nestjs-i18n` to the NestJS API for translating Puppeteer PDF template labels and Nodemailer email digest templates
- API translation language is sourced explicitly from `JobPreferences.defaultLanguage` (already exists), not HTTP headers, since translations are applied inside Bull queue jobs

## Capabilities

### New Capabilities

- `web-i18n`: Browser-detected Finnish/English language support for the Nuxt 3 admin UI using `@nuxtjs/i18n`, with flat JSON locale files and no URL prefix
- `api-i18n`: Finnish/English translation of PDF template labels (DocumentModule) and email digest templates (NotificationModule) using `nestjs-i18n`, with explicit language selection from `JobPreferences.defaultLanguage`

### Modified Capabilities

- `api-document`: DocumentModule injects `I18nService` to pass translated section labels into Puppeteer HTML templates
- `api-notification`: NotificationModule injects `I18nService` to render translated email digest content
- `web-app`: All pages and layouts updated to use i18n translation keys instead of hardcoded English strings
- `dashboard`: Dashboard page locale-aware date formatting and translated stat labels

## Impact

- **Frontend**: `apps/web/` — `nuxt.config.ts`, all pages, layouts, new `i18n/locales/en.json` and `fi.json`
- **API**: `apps/api/` — `AppModule`, `DocumentModule`, `NotificationModule`, new `src/i18n/en.json` and `fi.json`
- **New dependencies**: `@nuxtjs/i18n` (web), `nestjs-i18n` (api)
- **No breaking changes** — language detection is automatic; existing behaviour unchanged for English users
