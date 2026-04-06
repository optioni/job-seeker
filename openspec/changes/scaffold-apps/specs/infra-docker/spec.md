## ADDED Requirements

### Requirement: API Dockerfile — no Chromium
`docker/api.Dockerfile` SHALL produce a production image for the NestJS API using a multi-stage build (build → production). It SHALL NOT install Chromium or any browser system packages. It SHALL expose port 3000 and run as a non-root user. `GOTENBERG_URL` SHALL be documented as a required runtime environment variable.

#### Scenario: API image builds without Chromium
- **WHEN** `docker build -f docker/api.Dockerfile .` is run
- **THEN** the image builds successfully with no Chromium-related apt packages

#### Scenario: Non-root process
- **WHEN** the API container starts
- **THEN** the Node.js process runs as a non-root user

### Requirement: Web Dockerfile
`docker/web.Dockerfile` SHALL produce a production image for the Nuxt 3 app using a multi-stage build (build → production). It SHALL expose port 3001 and run as a non-root user.

#### Scenario: Web image builds
- **WHEN** `docker build -f docker/web.Dockerfile .` is run
- **THEN** the image builds successfully

#### Scenario: Non-root process
- **WHEN** the web container starts
- **THEN** the Node.js process runs as a non-root user
