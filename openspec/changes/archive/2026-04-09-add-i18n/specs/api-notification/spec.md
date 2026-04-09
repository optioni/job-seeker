## MODIFIED Requirements

### Requirement: Email language
The email structural text (subject line, greeting, labels such as match score and view link) SHALL be translated using `I18nService.translate(key, { lang })` with the language sourced from `JobPreferences.defaultLanguage`. LLM-generated content within each match entry (rationale, CV prose, cover letter) retains its language as directed by `JobSource.language` passed to the LLM — this is unchanged. If matches span multiple `JobSource.language` values, the structural email text language follows `JobPreferences.defaultLanguage` exclusively.

#### Scenario: Finnish email structural text
- **WHEN** `JobPreferences.defaultLanguage` is `fi`
- **THEN** the digest email subject, greeting, and label text are in Finnish

#### Scenario: English email structural text
- **WHEN** `JobPreferences.defaultLanguage` is `en`
- **THEN** the digest email subject, greeting, and label text are in English

#### Scenario: Finnish source body language for Finnish source
- **WHEN** a matched application comes from a JobSource with `language: fi`
- **THEN** the LLM-generated content for that match (rationale, cover letter excerpt) is in Finnish
