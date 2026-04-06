## ADDED Requirements

### Requirement: JobSourcePreset seed data
The system SHALL seed the database with built-in `JobSourcePreset` records on first run: TE-palvelut, Duunitori, Oikotie Työpaikat, Indeed Finland, Kuntarekry, and Valtiolle.fi. Each preset includes `baseUrl`, `filterConfig`, `defaultLanguage`, and `defaultPollingInterval`.

#### Scenario: Presets available after migration
- **WHEN** the database migrations and seed run
- **THEN** exactly 6 JobSourcePreset records exist

### Requirement: JobSourcePreset listing
The system SHALL expose a `GET /job-source-presets` endpoint returning all available presets with their `filterConfig` (available filter fields and URL param mappings).

#### Scenario: List presets
- **WHEN** a GET request is made to `/job-source-presets`
- **THEN** all 6 built-in presets are returned

### Requirement: JobSource CRUD scoped to authenticated user
The system SHALL expose JSON:API endpoints for creating, reading, updating, and deleting `JobSource` instances. Each JobSource is linked to a `JobSourcePreset`. All operations SHALL be scoped to the authenticated user — a user SHALL only see and manage their own sources.

#### Scenario: Create a job source
- **WHEN** a POST request is made to `/job-sources` with a preset reference, label, and filters
- **THEN** a new active JobSource is created linked to the authenticated user

#### Scenario: User sees only their own sources
- **WHEN** a GET request is made to `/job-sources`
- **THEN** only JobSource records belonging to the authenticated user are returned

#### Scenario: Cross-user source access rejected
- **WHEN** a user makes a PATCH or DELETE request on a JobSource belonging to another user
- **THEN** HTTP 404 is returned

#### Scenario: Toggle active state
- **WHEN** a PATCH request sets `active: false` on a JobSource
- **THEN** the cron job skips that source on the next polling cycle

#### Scenario: Multiple sources from same preset
- **WHEN** two JobSources are created from the same preset with different filter values
- **THEN** both sources are polled independently

### Requirement: Filter config enforcement
The system SHALL validate that filter keys provided on a `JobSource` match the `filterConfig` defined on its preset. Unknown filter keys SHALL be rejected with HTTP 422.

#### Scenario: Invalid filter key
- **WHEN** a POST to `/job-sources` includes a filter key not defined in the preset's filterConfig
- **THEN** the response returns HTTP 422 with a validation error
