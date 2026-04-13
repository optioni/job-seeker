## MODIFIED Requirements

### Requirement: JobSourcePreset seed data
The system SHALL seed the database with built-in `JobSourcePreset` records on first run: TE-palvelut, Duunitori, Oikotie Työpaikat, Indeed Finland, Kuntarekry, and Valtiolle.fi. Each preset SHALL include `baseUrl`, `filterConfig` (available filter fields and URL param mappings for feed construction), and `defaultLanguage`. `lastPolledAt` SHALL be null on initial seed. Polling cadence is hardcoded on the server — no `pollingInterval` field is stored on the preset.

#### Scenario: Presets available after migration
- **WHEN** the database migrations and seed run
- **THEN** exactly 6 JobSourcePreset records exist

### Requirement: JobSource CRUD scoped to authenticated user
The system SHALL expose JSON:API endpoints for creating, reading, updating, and deleting `JobSource` instances. Each JobSource is a subscription linking an authenticated user to a `JobSourcePreset`, with a user-supplied `filterConfig` used as a post-ingest listing filter. All operations SHALL be scoped to the authenticated user — a user SHALL only see and manage their own sources.

#### Scenario: Create a job source
- **WHEN** a POST request is made to `/job-sources` with a preset reference, label, and filters
- **THEN** a new active JobSource subscription is created linked to the authenticated user

#### Scenario: User sees only their own sources
- **WHEN** a GET request is made to `/job-sources`
- **THEN** only JobSource records belonging to the authenticated user are returned

#### Scenario: Cross-user source access rejected
- **WHEN** a user makes a PATCH or DELETE request on a JobSource belonging to another user
- **THEN** HTTP 404 is returned

#### Scenario: Toggle active state
- **WHEN** a PATCH request sets `active: false` on a JobSource
- **THEN** the subscription is excluded from fan-out when new listings are ingested for its preset

#### Scenario: Multiple subscriptions from same preset
- **WHEN** two JobSources are created from the same preset with different filterConfig values
- **THEN** the preset feed is fetched once and both subscriptions independently evaluate their filterConfig against each new listing

### Requirement: Filter config enforcement
The system SHALL validate that filter keys provided on a `JobSource` match the post-ingest listing fields defined in the preset's `filterConfig` schema. Valid filter keys are `title`, `company`, `description`, and `location`. Unknown filter keys SHALL be rejected with HTTP 422.

#### Scenario: Invalid filter key
- **WHEN** a POST to `/job-sources` includes a filter key not in `{ title, company, description, location }`
- **THEN** the response returns HTTP 422 with a validation error

#### Scenario: Valid filter key accepted
- **WHEN** a POST to `/job-sources` includes `filterConfig: { title: "engineer" }`
- **THEN** the JobSource is created successfully

## REMOVED Requirements

### Requirement: JobSource pollingInterval and lastPolledAt
**Reason**: Polling cadence is now a hardcoded server constant (daily). State tracking (`lastPolledAt`) moves to the preset level. A `JobSource` is a subscription, not a polling agent.
**Migration**: `JobSource.pollingInterval` and `JobSource.lastPolledAt` columns are dropped. `lastPolledAt` is added to `JobSourcePreset`. No `pollingInterval` column is added — polling interval is not stored.
