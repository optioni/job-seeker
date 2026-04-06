## ADDED Requirements

### Requirement: Shared entity interfaces
The `packages/shared` package SHALL export TypeScript interfaces for all core entities: `CvProfile`, `WorkExperience`, `Education`, `Skill`, `Language`, `Certification`, `Project`, `JobPreferences`, `JobSourcePreset`, `JobSource`, `JobListing`, `JobApplication`.

#### Scenario: Types importable in both apps
- **WHEN** `apps/api` or `apps/web` imports from `@job-seeker/shared`
- **THEN** all entity interfaces are available with correct field types

### Requirement: Queue payload types
The package SHALL export TypeScript interfaces for Bull queue job payloads: `IngestionJobPayload`, `MatchingJobPayload`, `GenerationJobPayload`, `DocumentJobPayload`, `NotificationJobPayload`.

#### Scenario: Queue payload types used in processors
- **WHEN** a Bull processor receives a job
- **THEN** the job data is typed with the corresponding payload interface

### Requirement: Package metadata
The package SHALL have `name: "@job-seeker/shared"`, `main: "dist/index.js"`, and `types: "dist/index.d.ts"`. It SHALL be a TypeScript project that compiles to `dist/`.

#### Scenario: Package resolves as workspace dependency
- **WHEN** `apps/api` declares `"@job-seeker/shared": "*"` as a dependency
- **THEN** Yarn resolves it to the local `packages/shared` workspace
