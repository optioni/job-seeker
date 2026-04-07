## ADDED Requirements

### Requirement: JobPreferences CRUD scoped to authenticated user
The system SHALL expose JSON:API endpoints for creating, reading, and updating the `JobPreferences` record linked to the authenticated user. All reads and writes SHALL be scoped to the authenticated user's `userId`. A user SHALL NOT access another user's preferences.

#### Scenario: Get preferences
- **WHEN** a GET request is made to `/job-preferences`
- **THEN** only the JobPreferences record for the authenticated user is returned

#### Scenario: Update preferences
- **WHEN** a PATCH request is made to `/job-preferences/:id` with updated fields
- **THEN** the JobPreferences record is updated and the response reflects the change

#### Scenario: Cross-user update rejected
- **WHEN** a user PATCHes a `/job-preferences/:id` belonging to a different user
- **THEN** HTTP 404 is returned

### Requirement: Preference fields
The `JobPreferences` record SHALL store: desired locations (array), job type (`full-time` | `part-time` | `contract`), target role (string), seniority level (string), salary range (min/max integers), desired industries (array), excluded industries (array), and `defaultLanguage` (`fi` | `en`).

#### Scenario: Set salary range
- **WHEN** a PATCH request sets `salaryMin` and `salaryMax`
- **THEN** both values are persisted and returned in subsequent GET requests

#### Scenario: Set default language
- **WHEN** a PATCH request sets `defaultLanguage` to `fi` or `en`
- **THEN** the value is persisted and used as fallback language for LLM prompts
