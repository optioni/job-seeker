## 1. API: Install and configure nestjs-i18n

- [x] 1.1 Add `nestjs-i18n` to `apps/api/package.json` dependencies
- [x] 1.2 Create `apps/api/src/i18n/en.json` with `cv` and `email` namespace keys
- [x] 1.3 Create `apps/api/src/i18n/fi.json` with Finnish translations for all keys in `en.json`
- [x] 1.4 Register `I18nModule.forRoot()` globally in `AppModule` pointing to `src/i18n/` with `fallbackLanguage: 'en'`

## 2. API: DocumentModule i18n integration

- [x] 2.1 Inject `I18nService` into `DocumentService`
- [x] 2.2 Update CV HTML template to accept translated section labels as template variables
- [x] 2.3 Call `I18nService.translate('cv.*', { lang })` for each section label, using `JobPreferences.defaultLanguage` as `lang`
- [x] 2.4 Pass translated labels when rendering the CV template to HTML string

## 3. API: NotificationModule i18n integration

- [x] 3.1 Inject `I18nService` into `NotificationService`
- [x] 3.2 Replace hardcoded email subject, greeting, and label strings with `I18nService.translate('email.*', { lang })` calls using `JobPreferences.defaultLanguage`

## 4. Frontend: Install and configure @nuxtjs/i18n

- [x] 4.1 Add `@nuxtjs/i18n` to `apps/web/package.json` dependencies
- [x] 4.2 Add `@nuxtjs/i18n` to `modules` in `nuxt.config.ts` with `strategy: 'no_prefix'`, `defaultLocale: 'en'`, `locales: ['en', 'fi']`, and `detectBrowserLanguage: { useCookie: true }`
- [x] 4.3 Create `apps/web/i18n/locales/en.json` with all namespace keys: `nav`, `login`, `register`, `dashboard`, `applications`, `sources`, `preferences`, `cv`, `common`
- [x] 4.4 Create `apps/web/i18n/locales/fi.json` with Finnish translations for all keys in `en.json`

## 5. Frontend: Translate layouts

- [x] 5.1 Replace hardcoded nav link labels in `layouts/default.vue` with `$t('nav.*')` keys

## 6. Frontend: Translate pages

- [x] 6.1 Replace all hardcoded strings in `pages/login.vue` with `$t('login.*')` and `t()` for script-side error messages
- [x] 6.2 Replace all hardcoded strings in `pages/register.vue` with `$t('register.*')` and `t()` for error messages
- [x] 6.3 Replace all hardcoded strings in `pages/index.vue` with `$t('dashboard.*')`; switch date formatting to `toLocaleDateString(locale.value)`
- [x] 6.4 Replace all hardcoded strings in `pages/applications.vue` with `$t('applications.*')`; move `columns` array into a `computed` so labels react to locale changes; update `formatDate` to use `locale.value`
- [x] 6.5 Replace all hardcoded strings in `pages/sources.vue` with `$t('sources.*')`
- [x] 6.6 Replace all hardcoded strings in `pages/preferences.vue` with `$t('preferences.*')`
- [x] 6.7 Replace all hardcoded strings in `pages/cv.vue` with `$t('cv.*')`

## 7. Frontend: Translate common strings

- [x] 7.1 Replace shared loading, error, and empty-state strings across all pages with `$t('common.*')` keys
