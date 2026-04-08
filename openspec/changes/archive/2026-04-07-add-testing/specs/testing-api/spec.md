## ADDED Requirements

### Requirement: Vitest configuration for API
The `apps/api` project SHALL have a `vitest.config.ts` that uses `unplugin-swc` for TypeScript + decorator compilation, sets `environment: 'node'`, configures `@vitest/coverage-v8`, and specifies coverage thresholds of ≥80% lines and ≥75% branches.

#### Scenario: Tests run with vitest
- **WHEN** `yarn workspace @job-seeker/api test` is executed
- **THEN** Vitest discovers and runs all `*.spec.ts` files under `apps/api/src/`

#### Scenario: Coverage thresholds enforced
- **WHEN** `yarn workspace @job-seeker/api test:coverage` is executed and line coverage drops below 80%
- **THEN** the command exits with a non-zero code

### Requirement: AuthService unit tests
`AuthService` SHALL have unit tests covering: valid credential validation returns a signed JWT, invalid credentials throw `UnauthorizedException`.

#### Scenario: Valid credentials
- **WHEN** `validateUser` is called with the correct username and password
- **THEN** a JWT string is returned

#### Scenario: Invalid credentials
- **WHEN** `validateUser` is called with wrong credentials
- **THEN** `UnauthorizedException` is thrown

### Requirement: CvModule service unit tests
`CvService` (or equivalent per-entity services) SHALL have unit tests covering: creating a CvProfile linked to a user, fetching a profile with all sub-entity relationships, updating individual sub-entities (WorkExperience, Education, Skill, etc.), deleting sub-entities.

#### Scenario: Create CvProfile
- **WHEN** `createProfile` is called with valid data
- **THEN** the MikroORM repository `persist` and `flush` methods are called with the correct entity

#### Scenario: Delete WorkExperience
- **WHEN** `deleteWorkExperience` is called with a valid ID
- **THEN** the entity is removed and the repository flushes

### Requirement: PreferencesService unit tests
`PreferencesService` SHALL have unit tests covering: fetching preferences for a user, updating preferences fields.

#### Scenario: Update preferences
- **WHEN** `updatePreferences` is called with new salary range values
- **THEN** the repository is called with the updated entity

### Requirement: JobSourcesService unit tests
`JobSourcesService` SHALL have unit tests covering: listing presets, creating a JobSource with valid filters, rejecting a JobSource with invalid filter keys (returns validation error), toggling active state.

#### Scenario: Invalid filter key rejected
- **WHEN** `createJobSource` is called with a filter key not in the preset's filterConfig
- **THEN** a `BadRequestException` or `UnprocessableEntityException` is thrown

#### Scenario: Toggle active
- **WHEN** `updateJobSource` sets `active: false`
- **THEN** the repository is called with `active: false` on the entity

### Requirement: RssAdapter unit tests
`RssAdapter` SHALL have unit tests covering: constructing the feed URL from baseUrl and filter params, parsing feed items into JobListing candidates, handling a malformed/empty feed gracefully.

#### Scenario: URL construction
- **WHEN** `buildFeedUrl` is called with a baseUrl and filter values
- **THEN** the returned URL contains the expected query parameters

#### Scenario: Feed item mapping
- **WHEN** `parseItems` is called with a valid rss-parser result
- **THEN** each item is mapped to a candidate object with externalId, url, title, company, description

#### Scenario: Empty feed
- **WHEN** the feed contains zero items
- **THEN** an empty array is returned without throwing

### Requirement: Deduplication unit tests
The deduplication logic SHALL have unit tests covering: a listing that matches an existing record is filtered out, a listing with no match passes through, cross-board duplicates are detected.

#### Scenario: Duplicate filtered
- **WHEN** a candidate matches an existing JobListing by company + title + source date
- **THEN** it is excluded from the result set

#### Scenario: New listing passes through
- **WHEN** no existing JobListing matches the candidate
- **THEN** the candidate is included in the result set

### Requirement: IngestionProcessor unit tests
`IngestionProcessor` SHALL have unit tests covering: a new listing is persisted as a JobListing entity, the listing ID is enqueued to the matching queue after persistence.

#### Scenario: JobListing persisted and matching enqueued
- **WHEN** the ingestion processor handles a job
- **THEN** the JobListing repository is called to save the entity and the matching queue's `add` method is called with the listing ID

### Requirement: MatchingProcessor unit tests
`MatchingProcessor` SHALL have unit tests covering: `generateObject` is called with the correct prompt structure, a matched result creates a JobApplication with `matched: true` and enqueues to generation, an unmatched result creates a JobApplication with `matched: false` and does NOT enqueue to generation.

#### Scenario: Match creates application and enqueues generation
- **WHEN** the mocked `generateObject` returns `{ match: true, score: 85, rationale: '...' }`
- **THEN** a JobApplication is saved with `matched: true` and the generation queue's `add` is called

#### Scenario: No match skips generation queue
- **WHEN** the mocked `generateObject` returns `{ match: false, score: 20, rationale: '...' }`
- **THEN** a JobApplication is saved with `matched: false` and the generation queue's `add` is NOT called

### Requirement: GenerationProcessor unit tests
`GenerationProcessor` SHALL have unit tests covering: CV tailoring call produces structured JSON saved to `tailoredCvSnapshot`, cover letter call produces text saved to `coverLetterText`, document queue is enqueued after both saves.

#### Scenario: CV tailoring saved
- **WHEN** the generation processor handles a matched application
- **THEN** `tailoredCvSnapshot` is set on the JobApplication entity

#### Scenario: Document queue enqueued
- **WHEN** both tailoring and cover letter generation succeed
- **THEN** the document queue's `add` is called

### Requirement: DocumentProcessor unit tests
`DocumentProcessor` SHALL have unit tests covering: Puppeteer `page.pdf` is called for CV and cover letter templates, the notification queue receives the application ID and PDF buffers.

#### Scenario: PDFs generated and notification enqueued
- **WHEN** the document processor handles a job
- **THEN** Puppeteer is invoked twice (once per template) and the notification queue's `add` is called with PDF buffers

### Requirement: DigestCron unit tests
`DigestCron` (or `NotificationService`) SHALL have unit tests covering: unemailed matched applications are fetched, Nodemailer `sendMail` is called once with all matches, `emailedAt` is set on all included applications, no email is sent when there are no pending matches.

#### Scenario: Digest sent for pending matches
- **WHEN** there are unemailed matched applications
- **THEN** `sendMail` is called exactly once with attachments

#### Scenario: No email when nothing pending
- **WHEN** all matched applications already have `emailedAt` set
- **THEN** `sendMail` is NOT called

### Requirement: ApplicationsService unit tests
`ApplicationsService` SHALL have unit tests covering: listing all applications ordered by scrapedAt descending, fetching a single application by ID, verifying no create method is exposed.

#### Scenario: List ordered by scrapedAt
- **WHEN** `findAll` is called
- **THEN** the repository is queried with `orderBy: { listing: { scrapedAt: 'DESC' } }`

### Requirement: Pipeline integration tests
The ingestion → matching queue handoff SHALL have an integration test using `@nestjs/testing` with `ioredis-mock` confirming that a job added to the ingestion queue results in a job appearing in the matching queue after the processor runs.

#### Scenario: Ingestion triggers matching enqueue
- **WHEN** a job is added to the ingestion queue and the processor runs
- **THEN** a job appears in the matching queue with the saved JobListing ID
