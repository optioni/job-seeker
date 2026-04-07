## Purpose

Nuxt 3 admin UI providing pages for authentication, CV editing, job preferences, job source management, and application history review.

## Requirements

### Requirement: JWT authentication flow
The Nuxt 3 app SHALL authenticate via the `POST /auth/login` API endpoint accepting `{ email, password }`. The JWT token SHALL be stored in an httpOnly cookie. A Nuxt route middleware SHALL redirect unauthenticated users to the `/login` page.

#### Scenario: Successful login
- **WHEN** the user submits valid email and password on the login page
- **THEN** the JWT is stored in a cookie and the user is redirected to the dashboard

#### Scenario: Unauthenticated access to protected page
- **WHEN** an unauthenticated user navigates to any page other than `/login` or `/register`
- **THEN** they are redirected to `/login`

### Requirement: User registration page
The app SHALL provide a `/register` page with an email + password form calling `POST /auth/register`. On success the user is redirected to the dashboard. If the API returns 409, an "Email already registered" error is shown. If the API returns 403, a "Registration is not available" message is shown.

#### Scenario: Successful registration
- **WHEN** a user submits a unique email and password on `/register`
- **THEN** the JWT cookie is set and the user is redirected to the dashboard

#### Scenario: Duplicate email error
- **WHEN** the API returns 409
- **THEN** "Email already registered" is displayed

### Requirement: CV editor page
The app SHALL provide a `/cv` page with structured forms for each section of the CvProfile: personal info, summary, work experience list, education list, skills, languages, certifications, and projects. Each sub-entity SHALL support add, edit, and delete operations.

#### Scenario: Edit personal info
- **WHEN** the user updates a field in the personal info form and saves
- **THEN** a PATCH request is made to the API and the updated value is reflected in the UI

#### Scenario: Add work experience
- **WHEN** the user fills in the work experience form and submits
- **THEN** a POST request is made and the new entry appears in the list

### Requirement: Job preferences page
The app SHALL provide a `/preferences` page with a form for all `JobPreferences` fields: locations, job type, target role, seniority, salary range, desired/excluded industries, and default language.

#### Scenario: Save preferences
- **WHEN** the user updates preferences and saves
- **THEN** a PATCH request is made and the updated preferences are persisted

### Requirement: Job sources page
The app SHALL provide a `/sources` page listing available `JobSourcePresets` and the user's configured `JobSource` instances. The user SHALL be able to create new sources from a preset, configure filter values, set polling interval, and toggle active state.

#### Scenario: Create source from preset
- **WHEN** the user selects a preset and fills in filter values
- **THEN** a new JobSource is created via POST

#### Scenario: Toggle source active state
- **WHEN** the user toggles the active switch on a JobSource
- **THEN** a PATCH request updates the active field

### Requirement: Application history page
The app SHALL provide a `/applications` page listing all `JobApplication` records for the authenticated user with columns for: job title, company, match outcome, score, rationale, and scraped timestamp. The user SHALL be able to view the full detail (CV snapshot, cover letter) for any application.

#### Scenario: View application list
- **WHEN** the user navigates to `/applications`
- **THEN** all applications for the authenticated user are displayed in descending order of scrapedAt

#### Scenario: View application detail
- **WHEN** the user clicks on an application
- **THEN** the full CV snapshot and cover letter text are displayed

### Requirement: API base URL configuration
The Nuxt app SHALL read the API base URL from `NUXT_PUBLIC_API_BASE_URL` runtime config, defaulting to `http://localhost:3000`.

#### Scenario: API base URL from env
- **WHEN** `NUXT_PUBLIC_API_BASE_URL` is set
- **THEN** all API calls use that base URL
