## ADDED Requirements

### Requirement: Vitest configuration for web
The `apps/web` project SHALL have a `vitest.config.ts` that uses `happy-dom` as the test environment, configures `@vitest/coverage-v8`, and specifies a coverage threshold of ≥70% lines.

#### Scenario: Tests run with vitest
- **WHEN** `yarn workspace @job-seeker/web test` is executed
- **THEN** Vitest discovers and runs all `*.spec.ts` files under `apps/web/`

### Requirement: Auth composable unit tests
The auth composable (login, logout, token storage via `useCookie`) SHALL have unit tests covering: successful login sets the JWT cookie and redirects, failed login surfaces an error, logout clears the cookie.

#### Scenario: Successful login
- **WHEN** `login` is called with correct credentials and the mocked API returns a token
- **THEN** the JWT cookie is set and `navigateTo` is called with the dashboard path

#### Scenario: Failed login
- **WHEN** `login` is called and the mocked API returns 401
- **THEN** an error message is set and the cookie is not modified

### Requirement: useApplications composable unit tests
The composable fetching application history SHALL have unit tests covering: returns the list from the API, handles empty list, handles API error state.

#### Scenario: Fetches and returns applications
- **WHEN** the composable is used and the mocked `useFetch` resolves with a list
- **THEN** the returned `applications` ref contains the expected items

### Requirement: useJobSources composable unit tests
The composable managing job sources SHALL have unit tests covering: fetching sources list, toggling active state calls PATCH, creating a new source calls POST.

#### Scenario: Toggle active calls PATCH
- **WHEN** `toggleActive(source)` is called
- **THEN** a PATCH request is made to `/job-sources/:id` with `{ active: !source.active }`

### Requirement: Root test script
The monorepo root `package.json` SHALL have a `test` script that runs `yarn workspaces foreach --all run test` and a `test:coverage` script that runs coverage for all workspaces.

#### Scenario: Root test runs all workspaces
- **WHEN** `yarn test` is run from the repo root
- **THEN** tests in both `apps/api` and `apps/web` are executed
