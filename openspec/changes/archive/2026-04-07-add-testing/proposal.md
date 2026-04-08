## Why

The scaffold-apps change creates all application code but includes no test infrastructure. Without tests, correctness of the pipeline stages (ingestion, matching, generation, document, notification) is unverifiable and regressions go undetected. Adding Vitest with SWC-powered compilation gives fast feedback and enables confident iteration on the codebase.

## What Changes

- Add Vitest as the test runner for both `apps/api` and `apps/web`
- Configure NestJS to use `@swc/jest` / `@swc/core` for fast TypeScript compilation in tests
- Add unit tests for all NestJS services and processors (happy path + key error cases)
- Add integration tests for the Bull queue pipeline stages using in-process test queues
- Add unit tests for the Nuxt composables and page logic
- Configure coverage reporting (V8 provider) with per-app thresholds
- Add a `test` script to the root `package.json` that runs all workspaces

## Capabilities

### New Capabilities

- `testing-api`: Vitest + SWC setup for `apps/api`, unit and integration tests for all NestJS modules, coverage thresholds
- `testing-web`: Vitest + `@vue/test-utils` setup for `apps/web`, unit tests for composables and page logic

### Modified Capabilities

_(none — test infrastructure is additive)_

## Impact

- Adds dev dependencies: `vitest`, `@vitest/coverage-v8`, `@swc/core`, `unplugin-swc` (or `@swc/jest`), `@nestjs/testing`, `@vue/test-utils`, `happy-dom`
- Adds `vitest.config.ts` to `apps/api` and `apps/web`
- Adds `test/` directories alongside source in each module
- No runtime code changes; test-only additions
