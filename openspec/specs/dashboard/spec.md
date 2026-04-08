## Purpose

Authenticated landing page providing an at-a-glance summary of new job matches, best match highlight, and week-on-week pipeline statistics.

## Requirements

### Requirement: Dashboard landing page
The app SHALL provide a `/` (index) page as the authenticated landing page. The auth middleware SHALL redirect unauthenticated users to `/login` and authenticated users without a destination to `/` (replacing the previous redirect to `/applications`).

#### Scenario: Authenticated user lands on root
- **WHEN** an authenticated user navigates to `/`
- **THEN** the dashboard page is displayed

#### Scenario: Auth middleware redirects to dashboard
- **WHEN** an authenticated user navigates to a non-existent route or the app root
- **THEN** they are redirected to `/`

### Requirement: New matches headline
The dashboard SHALL display the count of new matched `JobApplication` records created in the last 24 hours as the primary page heading. If zero new matches exist the heading SHALL read "No new matches today."

#### Scenario: New matches exist
- **WHEN** the dashboard loads and matches were created in the last 24 hours
- **THEN** the heading reads "{n} new matches since yesterday."

#### Scenario: No new matches
- **WHEN** the dashboard loads and no matches were created in the last 24 hours
- **THEN** the heading reads "No new matches today."

### Requirement: Best new match card
The dashboard SHALL display the highest-scoring new matched `JobApplication` from the last 24 hours as a hero card. The card SHALL include: job title, company, location, match score, the full `matchRationale` text, a "View full application" button linking to the application detail, and an "Open listing" link to the original job URL.

#### Scenario: Best match displayed
- **WHEN** at least one new matched application exists
- **THEN** the hero card shows the highest-scoring one with its rationale

#### Scenario: No best match
- **WHEN** no new matched applications exist in the last 24 hours
- **THEN** the hero card section is not rendered

### Requirement: Other new matches grid
The dashboard SHALL display up to 3 additional new matched applications from the last 24 hours (excluding the best match) in a card grid. Each card SHALL show: job title, company, match score, and a "New" badge.

#### Scenario: Other matches displayed
- **WHEN** more than one new matched application exists
- **THEN** up to 3 additional matches are shown in the grid below the hero card

#### Scenario: Fewer than 2 new matches
- **WHEN** only one new matched application exists
- **THEN** the "Also new today" grid is not rendered

### Requirement: Week-on-week stats
The dashboard SHALL display comparison stats for the current calendar week vs the previous calendar week: total listings evaluated, total matched, average match score, and total digest emails sent. Each stat SHALL show the absolute change vs the prior week with a directional indicator.

#### Scenario: Stats with improvement
- **WHEN** the current week has more matches than the previous week
- **THEN** the matched stat shows an upward indicator and the positive delta

#### Scenario: Stats on first week
- **WHEN** no prior week data exists
- **THEN** stats display current week values with no comparison indicators

### Requirement: Dashboard API endpoint
The API SHALL provide a `GET /dashboard` endpoint (JWT-protected) returning aggregated data: `newMatchesToday`, `bestMatch`, `otherNewMatches`, and `thisWeek` / `lastWeek` stats. "New" is defined as `matched = true` and `createdAt >= now - 24h`.

#### Scenario: Authenticated request
- **WHEN** a valid JWT is provided
- **THEN** the endpoint returns the aggregated dashboard payload

#### Scenario: Unauthenticated request
- **WHEN** no JWT is provided
- **THEN** the endpoint returns 401
