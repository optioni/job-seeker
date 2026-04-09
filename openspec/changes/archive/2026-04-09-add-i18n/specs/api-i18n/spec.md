## ADDED Requirements

### Requirement: nestjs-i18n module registration
The NestJS API SHALL register `I18nModule.forRoot()` globally in `AppModule` with translation files loaded from `apps/api/src/i18n/`. Supported locales SHALL be `en` and `fi`. The fallback language SHALL be `en`. The module SHALL NOT use HTTP header or query-param detection — language is always passed explicitly via `I18nService.translate(key, { lang })`.

#### Scenario: I18nService available in any module
- **WHEN** `I18nModule` is registered globally in `AppModule`
- **THEN** `I18nService` can be injected into `DocumentService` and `NotificationService` without additional module imports

#### Scenario: Unknown language falls back to English
- **WHEN** `I18nService.translate(key, { lang: 'xx' })` is called with an unsupported locale
- **THEN** the English string for that key is returned

### Requirement: Translation JSON files for document and email namespaces
The API SHALL provide translation files `apps/api/src/i18n/en.json` and `apps/api/src/i18n/fi.json`. Each file SHALL contain two top-level namespaces: `cv` (PDF template section labels) and `email` (digest email structural text). The `cv` namespace SHALL include keys for: `summary`, `workExperience`, `education`, `skills`, `languages`, `certifications`, `projects`. The `email` namespace SHALL include keys for: `subject`, `greeting`, `matchScore`, `viewApplication`.

#### Scenario: English CV section labels
- **WHEN** `I18nService.translate('cv.workExperience', { lang: 'en' })` is called
- **THEN** it returns `"Work Experience"`

#### Scenario: Finnish CV section labels
- **WHEN** `I18nService.translate('cv.workExperience', { lang: 'fi' })` is called
- **THEN** it returns the Finnish equivalent (e.g. `"Työkokemus"`)

#### Scenario: Finnish email subject
- **WHEN** `I18nService.translate('email.subject', { lang: 'fi' })` is called
- **THEN** it returns the Finnish digest email subject line
