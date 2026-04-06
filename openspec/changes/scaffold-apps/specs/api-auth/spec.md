## ADDED Requirements

### Requirement: User registration
The system SHALL expose a `POST /auth/register` endpoint that accepts `{ email, password }`, validates uniqueness of email, hashes the password with bcrypt, persists the User entity, and returns a signed JWT.

#### Scenario: Successful registration
- **WHEN** a POST request is made to `/auth/register` with a unique email and password
- **THEN** a new User is created, a JWT is returned, and HTTP 201 is sent

#### Scenario: Duplicate email rejected
- **WHEN** a POST request uses an email already registered
- **THEN** HTTP 409 Conflict is returned

### Requirement: User login
The system SHALL expose a `POST /auth/login` endpoint that accepts `{ email, password }`, validates credentials against the stored password hash, and returns a signed JWT on success.

#### Scenario: Valid credentials
- **WHEN** a POST request is made to `/auth/login` with correct email and password
- **THEN** a JWT is returned with HTTP 200

#### Scenario: Invalid credentials
- **WHEN** a POST request is made with wrong email or password
- **THEN** HTTP 401 Unauthorized is returned

### Requirement: JWT guard on protected routes
The system SHALL protect all non-auth API endpoints with a JWT bearer token guard. The JWT payload SHALL include `sub: userId`. Requests without a valid token SHALL be rejected with HTTP 401.

#### Scenario: Authenticated request
- **WHEN** a request includes a valid `Authorization: Bearer <token>`
- **THEN** the request proceeds and `userId` is available via `@CurrentUser()`

#### Scenario: Unauthenticated request
- **WHEN** a request is made without a valid token
- **THEN** HTTP 401 is returned

### Requirement: Registration toggleable via environment
The system SHALL check a `REGISTRATION_ENABLED` environment variable (default `true`). When set to `false`, the `POST /auth/register` endpoint SHALL return HTTP 403 Forbidden.

#### Scenario: Registration disabled
- **WHEN** `REGISTRATION_ENABLED=false` and a POST is made to `/auth/register`
- **THEN** HTTP 403 Forbidden is returned
