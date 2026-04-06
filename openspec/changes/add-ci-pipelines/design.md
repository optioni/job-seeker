## Context

Three GitHub Actions workflows covering PR validation, staging, and production. All Docker image builds target ARM via a self-hosted `arm-runners` runner group. Production uses CalVer `YYYY.MM.MICRO` where MICRO auto-increments within the same month by scanning existing tags.

## Goals / Non-Goals

**Goals:**
- Fast PR feedback: lint and test run in parallel, fail independently
- Every merge to `main` automatically produces a staging deployment
- Production deploys are gated behind a manual `workflow_dispatch` trigger
- ARM images only (no multi-arch manifest needed unless explicitly added later)
- CalVer tags are computed automatically — no manual version bumping

**Non-Goals:**
- Multi-arch (AMD64 + ARM) manifests — ARM only for now
- Rollback automation (manual re-deploy of previous image)
- Slack/notification hooks (out of scope)
- Helm chart or Kubernetes manifest management in CI (deploy step is a placeholder hook)

## Decisions

### Runner strategy: mixed (ubuntu-latest for lint/test, arm-runners for builds)
Lint and test jobs run on `ubuntu-latest` (fast, cheap GitHub-hosted). Docker image builds run on `arm-runners` (self-hosted, ARM hardware) so the produced images are native ARM — no QEMU emulation overhead.

**Alternative considered:** QEMU cross-compilation on GitHub-hosted runners — rejected; slow build times and occasional build failures with Puppeteer's Chromium binary under emulation.

### CalVer computation: tag scan in-workflow
The production workflow lists existing git tags matching `YYYY.MM.*`, finds the highest MICRO for the current `YYYY.MM`, and increments by 1. If no tags exist for the current month, MICRO starts at 0. Implemented as a short bash step using `git tag --list`.

**Alternative considered:** A separate versioning action — rejected; the bash logic is trivial and avoids an external dependency.

### Image tagging: CalVer tag + `latest` for production, `staging` for staging
- Production: `ghcr.io/<owner>/job-seeker-api:<calver>`, `ghcr.io/<owner>/job-seeker-api:latest`
- Staging: `ghcr.io/<owner>/job-seeker-api:staging`
- Same scheme for the web image

### Registry: GitHub Container Registry (ghcr.io)
Already available for GitHub repos, no extra billing. Uses `GITHUB_TOKEN` for auth — no separate registry secret needed.

### PR checks: separate lint, typecheck, and test jobs, no dependency between them
All three jobs check out code and install deps independently. This means a lint failure doesn't block seeing test or typecheck results. Jobs use `yarn workspace` commands targeting each app. The typecheck job runs `tsc --noEmit` across all workspaces.

### Staging deploy step: placeholder SSH/kubectl step
The actual deploy mechanism (kubectl rollout, SSH remote command, etc.) depends on the target environment. The workflow includes a clearly marked `Deploy` step with a TODO comment. The image tag `staging` is always the deploy target.

### Production deploy: same pattern, triggered after GitHub Release creation
The release is created first (so the tag exists), then the deploy step runs against the CalVer-tagged image.

## Risks / Trade-offs

- **arm-runners availability** — if self-hosted runners are offline, builds block. Mitigation: add a timeout on the build jobs; surface failure quickly.
- **CalVer MICRO collision** — two simultaneous production deploys in the same minute could compute the same MICRO. Mitigation: production dispatch is manual and single-operator; acceptable risk.
- **`yarn install` cache** — without caching, `yarn install` on arm-runners re-downloads packages each build. Mitigation: cache `~/.yarn/cache` keyed on `yarn.lock` hash.
