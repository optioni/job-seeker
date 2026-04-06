## ADDED Requirements

### Requirement: Staging trigger
The staging workflow SHALL trigger on `push` to the `main` branch only.

#### Scenario: Workflow triggers on merge to main
- **WHEN** a commit is pushed (or a PR is merged) to `main`
- **THEN** the staging workflow is queued

### Requirement: ARM image build on arm-runners
The staging workflow SHALL build Docker images for `apps/api` and `apps/web` using a job that runs on the `arm-runners` runner group. Images SHALL be built natively on ARM hardware (no QEMU emulation).

#### Scenario: Build runs on arm-runners
- **WHEN** the build job executes
- **THEN** it is assigned to a runner in the `arm-runners` group

### Requirement: Image tagging for staging
Built images SHALL be tagged as `staging` and pushed to GitHub Container Registry (`ghcr.io`). Authentication SHALL use `GITHUB_TOKEN` (no additional secret required).

#### Scenario: Staging images pushed
- **WHEN** the build job completes successfully
- **THEN** `ghcr.io/<owner>/job-seeker-api:staging` and `ghcr.io/<owner>/job-seeker-web:staging` are available in the registry

### Requirement: Yarn cache on arm-runners
The build job SHALL cache the Yarn cache directory (`~/.yarn/cache`) keyed on `yarn.lock` hash to avoid re-downloading packages on every build.

#### Scenario: Cache restored on unchanged lockfile
- **WHEN** `yarn.lock` has not changed since the last staging build
- **THEN** the Yarn cache is restored before `yarn install`

### Requirement: Deploy to staging environment
After a successful image build and push, the workflow SHALL execute a deploy step that triggers a staging environment update using the `staging`-tagged images. The exact mechanism (SSH remote command, `kubectl rollout restart`, etc.) SHALL be configurable via repository secrets.

#### Scenario: Deploy step runs after successful build
- **WHEN** both images are pushed to the registry
- **THEN** the deploy step executes and updates the staging environment

#### Scenario: Deploy skipped on build failure
- **WHEN** the image build or push fails
- **THEN** the deploy step does not execute
