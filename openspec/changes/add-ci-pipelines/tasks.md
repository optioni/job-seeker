## 1. Repository Setup

- [ ] 1.1 Create `.github/workflows/` directory
- [ ] 1.2 Document required GitHub repository secrets in `README.md` or `.github/SECRETS.md`: `STAGING_DEPLOY_*`, `PRODUCTION_DEPLOY_*` (exact names depend on chosen deploy mechanism)

## 2. PR Checks Workflow

- [ ] 2.1 Create `.github/workflows/pr-checks.yml` with trigger: `pull_request` targeting `main` (types: opened, synchronize, reopened)
- [ ] 2.2 Add `lint` job: runs on `ubuntu-latest`, checks out repo, sets up Node.js + Yarn cache (keyed on `yarn.lock`), runs `yarn install --immutable`, runs `yarn lint` (ESLint across monorepo)
- [ ] 2.3 Add `typecheck` job: runs on `ubuntu-latest`, same setup steps as lint, runs `yarn typecheck` (`tsc --noEmit` across all workspaces)
- [ ] 2.4 Add `test` job: runs on `ubuntu-latest`, same setup steps as lint, runs `yarn test` (Vitest across all workspaces)
- [ ] 2.5 Verify lint, typecheck, and test jobs have no `needs` dependency — they run in parallel

## 3. Staging Workflow

- [ ] 3.1 Create `.github/workflows/staging.yml` with trigger: `push` to `main`
- [ ] 3.2 Add `build-and-push` job: runs on `group: arm-runners`, checks out repo
- [ ] 3.3 Add Yarn cache step (cache `~/.yarn/cache`, key: `yarn-${{ hashFiles('yarn.lock') }}`)
- [ ] 3.4 Add Docker login step using `docker/login-action` with `registry: ghcr.io`, `username: ${{ github.actor }}`, `password: ${{ secrets.GITHUB_TOKEN }}`
- [ ] 3.5 Add build + push step for API image: `docker/build-push-action`, context `.`, file `docker/api.Dockerfile`, tag `ghcr.io/${{ github.repository_owner }}/job-seeker-api:staging`, push: true
- [ ] 3.6 Add build + push step for web image: same pattern, file `docker/web.Dockerfile`, tag `ghcr.io/${{ github.repository_owner }}/job-seeker-web:staging`
- [ ] 3.7 Add `deploy` job with `needs: build-and-push`: add TODO-marked deploy step (SSH or kubectl) using staging secrets

## 4. Production Workflow

- [ ] 4.1 Create `.github/workflows/production.yml` with trigger: `workflow_dispatch` only
- [ ] 4.2 Add `compute-version` job: runs on `ubuntu-latest`, checks out repo with full tag history (`fetch-depth: 0`), runs bash script to compute next CalVer (`YYYY.MM.MICRO`) and set as step output
- [ ] 4.3 Implement CalVer bash logic: `git tag --list 'YYYY.MM.*'` for current UTC month, extract highest MICRO, increment; output as `version` step output
- [ ] 4.4 Add `build-and-push` job with `needs: compute-version`: runs on `group: arm-runners`
- [ ] 4.5 Add Yarn cache step (same as staging)
- [ ] 4.6 Add Docker login step (same as staging, using `GITHUB_TOKEN`)
- [ ] 4.7 Add build + push step for API image: tags `ghcr.io/.../job-seeker-api:${{ needs.compute-version.outputs.version }}` AND `ghcr.io/.../job-seeker-api:latest`
- [ ] 4.8 Add build + push step for web image: same dual-tag pattern
- [ ] 4.9 Add `create-release` job with `needs: build-and-push`: use `actions/create-release` or `gh release create` with tag = computed version, title = computed version, target branch `main`, mark as latest
- [ ] 4.10 Add `deploy` job with `needs: create-release`: TODO-marked deploy step using production secrets and CalVer-tagged images
