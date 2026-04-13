## MODIFIED Requirements

### Requirement: Shared entity interfaces
The `packages/shared` package SHALL export TypeScript interfaces for all core entities: `CvProfile`, `WorkExperience`, `Education`, `Skill`, `Language`, `Certification`, `Project`, `JobPreferences`, `JobSourcePreset`, `JobSource`, `JobListing`, `JobApplication`.

The `JobSourcePreset` interface SHALL include `lastPolledAt: Date | null`. No `pollingInterval` field is stored — polling cadence is a hardcoded server constant.

The `JobSource` interface SHALL NOT include `pollingInterval` or `lastPolledAt`. The `filterConfig` field SHALL be typed as `Record<string, string>` representing post-ingest listing field filters.

The `JobListing` interface SHALL reference `preset: JobSourcePreset` (or `presetId: string`) instead of `jobSource: JobSource`.

#### Scenario: Types importable in both apps
- **WHEN** `apps/api` or `apps/web` imports from `@job-seeker/shared`
- **THEN** all entity interfaces are available with correct field types

#### Scenario: JobSourcePreset has lastPolledAt
- **WHEN** a `JobSourcePreset` interface is used
- **THEN** `lastPolledAt: Date | null` is present and `pollingInterval` is absent

#### Scenario: JobSource has no polling fields
- **WHEN** a `JobSource` interface is used
- **THEN** `pollingInterval` and `lastPolledAt` are not present

#### Scenario: JobListing references preset not source
- **WHEN** a `JobListing` interface is used
- **THEN** it has a `preset` or `presetId` field referencing `JobSourcePreset`, not a `jobSource` field

### Requirement: Queue payload types
The package SHALL export TypeScript interfaces for Bull queue job payloads: `IngestionJobPayload`, `MatchingJobPayload`, `GenerationJobPayload`, `DocumentJobPayload`, `NotificationJobPayload`.

`MatchingJobPayload` SHALL include both `listingId: string` and `jobSourceId: string`.

#### Scenario: Queue payload types used in processors
- **WHEN** a Bull processor receives a job
- **THEN** the job data is typed with the corresponding payload interface

#### Scenario: Matching payload carries subscription context
- **WHEN** a matching queue job is created during fan-out
- **THEN** the payload includes both `listingId` and `jobSourceId`
