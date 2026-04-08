# CI – PR Checks

## Purpose

GitHub Actions workflow that runs on every pull request targeting `main`. Validates code quality (lint) and correctness (tests) before merge is allowed.

---

## Requirements

### Requirement: PR trigger
The PR checks workflow SHALL trigger on `pull_request` events targeting the `main` branch (opened, synchronize, reopened).

#### Scenario: Workflow triggers on new PR
- **WHEN** a pull request is opened against `main`
- **THEN** the pr-checks workflow is queued

---

### Requirement: Lint job
The workflow SHALL have a `lint` job that runs on `ubuntu-latest`, installs dependencies, and runs ESLint across the monorepo. The job SHALL fail if any ESLint error is reported.

#### Scenario: Lint passes clean code
- **WHEN** no ESLint errors exist
- **THEN** the lint job exits with code 0

#### Scenario: Lint fails on ESLint errors
- **WHEN** a file contains an ESLint violation
- **THEN** the lint job exits with a non-zero code and the PR check is marked as failed

---

### Requirement: Test job
The workflow SHALL have a `test` job that runs on `ubuntu-latest`, installs dependencies, and runs `yarn test` (Vitest across all workspaces). The job SHALL fail if any test fails.

#### Scenario: Tests pass
- **WHEN** all Vitest tests pass
- **THEN** the test job exits with code 0

#### Scenario: Tests fail
- **WHEN** one or more Vitest tests fail
- **THEN** the test job exits with a non-zero code and the PR check is marked as failed

---

### Requirement: Lint and test jobs run in parallel
The `lint` and `test` jobs SHALL have no dependency on each other (`needs` is not set between them). Both SHALL run concurrently.

#### Scenario: Independent failure
- **WHEN** the lint job fails
- **THEN** the test job continues to run independently

---

### Requirement: Dependency caching
Both jobs SHALL cache Yarn dependencies keyed on the hash of `yarn.lock` to reduce install time.

#### Scenario: Cache hit on subsequent runs
- **WHEN** `yarn.lock` has not changed since the last run
- **THEN** the cache is restored and `yarn install` completes faster
