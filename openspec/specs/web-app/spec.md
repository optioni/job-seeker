## Purpose

Nuxt 3 admin UI providing pages for authentication, CV editing, job preferences, job source management, and application history review.

## Requirements

### Requirement: JWT authentication flow
The Nuxt 3 app SHALL authenticate via the `POST /auth/login` API endpoint accepting `{ email, password }`. The JWT token SHALL be stored in an httpOnly cookie. A Nuxt route middleware SHALL redirect unauthenticated users to the `/login` page. Authenticated users accessing `/` SHALL be served the dashboard page.

#### Scenario: Successful login
- **WHEN** the user submits valid email and password on the login page
- **THEN** the JWT is stored in a cookie and the user is redirected to `/`

#### Scenario: Unauthenticated access to protected page
- **WHEN** an unauthenticated user navigates to any page other than `/login` or `/register`
- **THEN** they are redirected to `/login`

### Requirement: Shared default layout
All authenticated pages SHALL use `layouts/default.vue` which renders the top navigation bar and a `<slot>` for page content. The navigation bar SHALL be 72px tall with a 3px burgundy top border, a stacked brand lockup ("YOUR SEARCH" eyebrow + "Job Seeker" italic serif), nav links for Dashboard / Applications / Sources / Preferences / CV, and a user avatar. The active nav link SHALL render as a dark pill with italic Fraunces text. The nav inner content SHALL be constrained to 1040px centered.

#### Scenario: Nav renders on authenticated page
- **WHEN** an authenticated user views any page except login/register
- **THEN** the shared nav is present with correct brand and links

#### Scenario: Active link highlighted
- **WHEN** the user is on the Applications page
- **THEN** the Applications nav link renders as the dark active pill

### Requirement: Auth layout for login and register
The `/login` and `/register` pages SHALL use `layouts/auth.vue` — a centered card layout with parchment background and dot grid texture, no navigation bar.

#### Scenario: Login page has no nav
- **WHEN** an unauthenticated user views `/login`
- **THEN** no navigation bar is rendered

### Requirement: User registration page
The app SHALL provide a `/register` page with an email + password form calling `POST /auth/register`. On success the user is redirected to `/`. If the API returns 409, an "Email already registered" error is shown. If the API returns 403, a "Registration is not available" message is shown.

#### Scenario: Successful registration
- **WHEN** a user submits a unique email and password on `/register`
- **THEN** the JWT cookie is set and the user is redirected to `/`

#### Scenario: Duplicate email error
- **WHEN** the API returns 409
- **THEN** "Email already registered" is displayed inline in the form

### Requirement: CV editor page
The app SHALL provide a `/cv` page with structured forms for each section of the CvProfile: personal info, summary, work experience list, education list, skills, languages, certifications, and projects. Each sub-entity section SHALL be rendered as a Nuxt UI Accordion item. Add forms SHALL appear inline within each accordion panel. Each sub-entity SHALL support add and delete operations.

#### Scenario: Edit personal info
- **WHEN** the user updates a field in the personal info form and saves
- **THEN** a PATCH request is made to the API and the updated value is reflected in the UI

#### Scenario: Add work experience
- **WHEN** the user expands the Work Experience accordion and fills in the add form
- **THEN** a POST request is made and the new entry appears in the section list

#### Scenario: Delete sub-entity
- **WHEN** the user clicks delete on a work experience, education, skill, language, certification, or project
- **THEN** a DELETE request is made and the item is removed from the list

### Requirement: Job preferences page
The app SHALL provide a `/preferences` page with a form for all `JobPreferences` fields: locations, target role, seniority, salary range, industries, and default language. Form inputs SHALL use Nuxt UI form components.

#### Scenario: Save preferences
- **WHEN** the user updates preferences and saves
- **THEN** a PATCH request is made and a success indicator is shown inline

### Requirement: Job sources page
The app SHALL provide a `/sources` page listing available `JobSourcePresets` as cards and the user's configured `JobSource` instances as a list. The user SHALL be able to add sources via a Nuxt UI Modal, toggle active state, and delete sources.

#### Scenario: Create source from preset
- **WHEN** the user clicks "Add Source" on a preset card and fills in the modal form
- **THEN** a new JobSource is created via POST and appears in the My Sources list

#### Scenario: Toggle source active state
- **WHEN** the user toggles the active state on a JobSource
- **THEN** a PATCH request updates the active field and the status badge updates

#### Scenario: Delete source
- **WHEN** the user clicks delete on a JobSource
- **THEN** a DELETE request is made and the source is removed from the list

### Requirement: Application history page
The app SHALL provide a `/applications` page using a Nuxt UI Table listing all `JobApplication` records with columns for: job title (linked), company, match score (colored by value), matched badge, emailed date, and created date. Clicking a row SHALL open a Nuxt UI Drawer (right side, 560px) showing the match rationale, and tabs for the tailored CV snapshot and cover letter text.

#### Scenario: View application list
- **WHEN** the user navigates to `/applications`
- **THEN** all applications are displayed in the table sorted by createdAt descending

#### Scenario: Score color coding
- **WHEN** a match score is ≥ 80%
- **THEN** the score renders in forest green; 50–79% in amber; below 50% in terracotta

#### Scenario: View application detail
- **WHEN** the user clicks a table row
- **THEN** a drawer slides in from the right showing the rationale, CV snapshot, and cover letter

### Requirement: API base URL configuration
The Nuxt app SHALL read the API base URL from `NUXT_PUBLIC_API_BASE_URL` runtime config, defaulting to `http://localhost:3000`.

#### Scenario: API base URL from env
- **WHEN** `NUXT_PUBLIC_API_BASE_URL` is set
- **THEN** all API calls use that base URL
