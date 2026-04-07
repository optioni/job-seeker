## ADDED Requirements

### Requirement: Application history listing scoped to authenticated user
The system SHALL expose a JSON:API endpoint `GET /job-applications` that returns `JobApplication` records belonging to the authenticated user (via `JobListing → JobSource → user`), including the related `JobListing` and `JobSource`. Results SHALL be orderable by `scrapedAt` descending by default.

#### Scenario: User sees only their own applications
- **WHEN** a GET request is made to `/job-applications`
- **THEN** only JobApplication records associated with the authenticated user's sources are returned

#### Scenario: Filter matched applications
- **WHEN** a GET request includes a filter for `matched: true`
- **THEN** only matched JobApplication records for the authenticated user are returned

### Requirement: Application detail scoped to authenticated user
The system SHALL expose `GET /job-applications/:id` returning a single `JobApplication` with full detail, including `tailoredCvSnapshot` and `coverLetterText` if available. Cross-user access SHALL return HTTP 404.

#### Scenario: Get application detail
- **WHEN** a GET request is made to `/job-applications/:id` for the authenticated user's application
- **THEN** the full JobApplication record is returned including CV snapshot and cover letter

#### Scenario: Cross-user application access rejected
- **WHEN** a user requests `/job-applications/:id` belonging to another user
- **THEN** HTTP 404 is returned

### Requirement: No manual application creation
The system SHALL NOT expose a POST endpoint for creating `JobApplication` records. Applications are created only by the matching queue processor.

#### Scenario: POST rejected
- **WHEN** a POST request is made to `/job-applications`
- **THEN** the response returns HTTP 405 Method Not Allowed
