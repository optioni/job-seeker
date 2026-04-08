# CI – Production Deployment

## Purpose

GitHub Actions workflow for manually triggered production releases. Computes a CalVer version, builds ARM Docker images, creates a GitHub Release, and deploys to the production environment.

---

## Requirements

### Requirement: Manual trigger via workflow_dispatch
The production workflow SHALL only be triggered manually via `workflow_dispatch`. No automatic trigger on push or tag. The trigger SHALL require no additional inputs — the CalVer version is computed automatically.

#### Scenario: Workflow triggered manually
- **WHEN** a user clicks "Run workflow" in the GitHub Actions UI
- **THEN** the production workflow is queued

#### Scenario: Workflow does not trigger automatically
- **WHEN** a commit is pushed to `main`
- **THEN** the production workflow is NOT triggered

---

### Requirement: CalVer version computation
The workflow SHALL compute the next CalVer version in the format `YYYY.MM.MICRO` by:
1. Fetching all git tags
2. Listing tags matching the pattern `YYYY.MM.*` for the current UTC year and month
3. Finding the highest MICRO value among existing tags for that month
4. Incrementing MICRO by 1; if no tag exists for the current month, MICRO starts at `0`

The computed version SHALL be available as a step output for subsequent steps.

#### Scenario: First release in a month
- **WHEN** no tags matching the current `YYYY.MM.*` pattern exist
- **THEN** the computed version is `YYYY.MM.0`

#### Scenario: Subsequent release in a month
- **WHEN** tags `2026.04.0` and `2026.04.1` exist and the current month is 2026-04
- **THEN** the computed version is `2026.04.2`

---

### Requirement: ARM image build on arm-runners
The production workflow SHALL build Docker images for `apps/api` and `apps/web` on the `arm-runners` runner group, identically to the staging workflow.

#### Scenario: Build runs on arm-runners
- **WHEN** the build job executes
- **THEN** it is assigned to a runner in the `arm-runners` group

---

### Requirement: Image tagging for production
Built images SHALL be tagged with the computed CalVer version AND as `latest`, then pushed to `ghcr.io`.

#### Scenario: Production images pushed with CalVer and latest tags
- **WHEN** the build completes for version `2026.04.1`
- **THEN** `ghcr.io/<owner>/job-seeker-api:2026.04.1`, `ghcr.io/<owner>/job-seeker-api:latest`, `ghcr.io/<owner>/job-seeker-web:2026.04.1`, and `ghcr.io/<owner>/job-seeker-web:latest` are available

---

### Requirement: GitHub Release creation
After a successful image build and push, the workflow SHALL create a GitHub Release using the CalVer version as both the tag name and release title. The release SHALL be marked as the latest release.

#### Scenario: Release created
- **WHEN** images are pushed successfully
- **THEN** a GitHub Release with tag `2026.04.1` and title `2026.04.1` is created on the `main` branch

---

### Requirement: Deploy to production environment
After the GitHub Release is created, the workflow SHALL execute a deploy step that updates the production environment with the CalVer-tagged images. The mechanism SHALL be configurable via repository secrets.

#### Scenario: Deploy runs after release creation
- **WHEN** the GitHub Release is created
- **THEN** the production deploy step executes

---

### Requirement: Yarn cache on arm-runners
The production build job SHALL cache the Yarn cache directory keyed on `yarn.lock` hash, same as staging.

#### Scenario: Cache restored
- **WHEN** `yarn.lock` is unchanged since the last production build
- **THEN** the Yarn cache is restored before install
