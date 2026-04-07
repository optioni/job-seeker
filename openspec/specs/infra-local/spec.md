## Purpose

Docker Compose configuration for local development, defining all five services with correct networking, environment injection, and data persistence.

## Requirements

### Requirement: Docker Compose local dev services
The `docker-compose.yml` at the repo root SHALL define five services: `api` (NestJS, port 3000), `web` (Nuxt 3, port 3001), `postgres` (PostgreSQL, port 5432), `redis` (Redis, port 6379), and `gotenberg` (Gotenberg v8, internal only — no host port).

#### Scenario: All services start
- **WHEN** `docker compose up` is run
- **THEN** all five services start without errors

#### Scenario: API connects to postgres, redis, and gotenberg
- **WHEN** the api service starts
- **THEN** it connects to postgres and redis using Docker Compose service hostnames, and `GOTENBERG_URL=http://gotenberg:3000` is set in its environment

### Requirement: Gotenberg not exposed to host
The `gotenberg` service SHALL be on the internal Docker network only. Its port SHALL NOT be bound to the host machine.

#### Scenario: Gotenberg reachable from api, not from host
- **WHEN** docker-compose is running
- **THEN** the api container can reach `http://gotenberg:3000` but the port is not accessible from the host

### Requirement: Environment variable injection
The `api` and `web` services SHALL read environment variables from a `.env` file at the repo root (via `env_file: .env`). A `.env.example` file SHALL document all required variables.

#### Scenario: .env.example documents all variables
- **WHEN** a developer copies `.env.example` to `.env` and fills in values
- **THEN** all services start correctly with those values

### Requirement: Persistent data volumes
The `postgres` service SHALL use a named Docker volume for data persistence across `docker compose down` and `up` cycles.

#### Scenario: Data persists across restarts
- **WHEN** `docker compose down` is followed by `docker compose up`
- **THEN** previously seeded/migrated data is still present
