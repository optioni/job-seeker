## MODIFIED Requirements

### Requirement: HTML templates
The system SHALL use HTML/CSS templates located at `apps/api/src/document/templates/`. Templates SHALL produce clean, professional output. The `DocumentService` SHALL render each template to an HTML string (interpolating CV/cover letter data) before POSTing to Gotenberg. Section heading labels (e.g. Work Experience, Education, Skills) SHALL be sourced from `I18nService.translate(key, { lang })` using the language from `JobPreferences.defaultLanguage`, so that PDF output is rendered in the correct language.

#### Scenario: Templates rendered to string and posted
- **WHEN** the document processor runs
- **THEN** the CV template is rendered to HTML and POSTed to Gotenberg, and the cover letter template is rendered and POSTed separately

#### Scenario: Finnish PDF section labels
- **WHEN** `JobPreferences.defaultLanguage` is `fi`
- **THEN** the rendered CV HTML contains Finnish section headings (e.g. "Työkokemus" instead of "Work Experience")

#### Scenario: English PDF section labels
- **WHEN** `JobPreferences.defaultLanguage` is `en`
- **THEN** the rendered CV HTML contains English section headings
