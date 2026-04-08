## Why

The repository has no GitHub Actions workflows. Without CI, PRs can merge broken code and there is no automated path to deploy tested builds to staging or production. Three workflows cover the full lifecycle: PR validation, staging deploy on merge, and a manual production release with CalVer tagging.

## What Changes

- Add `.github/workflows/pr-checks.yml` — lint and test jobs for every PR targeting `main`
- Add `.github/workflows/staging.yml` — build ARM Docker images and deploy to staging on every push to `main`
- Add `.github/workflows/production.yml` — manually triggered workflow that computes the next CalVer tag (`YYYY.MM.MICRO`), builds ARM Docker images, creates a GitHub release, and deploys to production

## Capabilities

### New Capabilities

- `ci-pr-checks`: GitHub Actions workflow that runs ESLint (lint job), TypeScript type checking (typecheck job), and Vitest (test job) as separate parallel jobs on every PR to `main`
- `ci-staging`: GitHub Actions workflow triggered on push to `main`; builds multi-platform ARM Docker images via the `arm-runners` runner group and deploys to staging
- `ci-production`: Manually triggered (`workflow_dispatch`) GitHub Actions workflow; computes next CalVer version, builds ARM images, creates a GitHub release with the tag, deploys to production

### Modified Capabilities

_(none)_

## Impact

- Adds `.github/workflows/` directory with three workflow files
- Requires GitHub repository secrets: `REGISTRY_USERNAME`, `REGISTRY_PASSWORD` (container registry credentials), plus any deploy secrets (`STAGING_DEPLOY_HOST`, `PRODUCTION_DEPLOY_HOST`, etc.)
- ARM image builds use the `arm-runners` self-hosted runner group
- No application code changes
