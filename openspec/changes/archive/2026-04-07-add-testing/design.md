## Context

The `scaffold-apps` change establishes the full application structure. This change layers in test infrastructure without modifying runtime code. The primary constraint is that NestJS's DI container and decorators are TypeScript-heavy and slow to compile — SWC eliminates that bottleneck. The Nuxt app is Vue 3 + Composition API, which pairs well with `@vue/test-utils` + `happy-dom`.

## Goals / Non-Goals

**Goals:**
- Fast test runs via SWC (no `ts-jest`, no `tsc` in test path)
- Unit tests for every NestJS service and Bull processor (happy path + key failure cases)
- Integration tests for the queue pipeline using `@nestjs/testing` + in-memory Bull queues
- Unit tests for Nuxt composables and page-level logic
- Coverage thresholds enforced in CI: ≥80% lines/branches for `apps/api`
- Single `yarn test` command at the monorepo root

**Non-Goals:**
- E2E tests against a running server (no Playwright/Supertest for full HTTP stack)
- Database integration tests against a real PostgreSQL instance (repositories are mocked)
- Visual regression tests for the Nuxt UI

## Decisions

### Test runner: Vitest for both apps
Vitest runs natively in ESM, has a Jest-compatible API, and integrates cleanly with SWC via `unplugin-swc`. No need for separate Jest configs. `@nestjs/testing` works with Vitest without modification.

**Alternative considered:** Jest — rejected; slower compilation even with SWC transformer, and the team is already using the Vite ecosystem (Nuxt 3 uses Vite).

### NestJS compilation: SWC via `unplugin-swc`
`unplugin-swc` hooks into Vite's transform pipeline so Vitest uses SWC to compile TypeScript + decorators. Configure `@swc/core` with `experimentalDecorators: true` and `emitDecoratorMetadata: true` to satisfy NestJS DI.

**Alternative considered:** `ts-jest` with SWC backend — rejected; `unplugin-swc` is cleaner for the Vitest pipeline and avoids Jest compat shims.

### NestJS testing strategy: unit + queue integration
- **Unit tests**: Use `@nestjs/testing` `Test.createTestingModule()`. Mock all external dependencies (repositories via `getRepositoryToken`, Bull queues via `getQueueToken`, LLM client, Nodemailer). Test service logic in isolation.
- **Integration tests** (pipeline): Use `@nestjs/testing` with real Bull queues backed by `ioredis-mock` (in-memory Redis). Wire the actual processors and assert side effects on mocked repositories.

### Coverage provider: V8
V8 coverage is built into Node.js — no Istanbul instrumentation overhead. `@vitest/coverage-v8` reports lines, branches, functions, statements.

### Nuxt testing: `@vue/test-utils` + `happy-dom`
`happy-dom` is faster than jsdom and sufficient for Composition API + `useFetch` mock testing. Mount pages/components with `@vue/test-utils`, mock `useFetch` and `useCookie` via `vi.mock`.

### Coverage thresholds
`apps/api`: ≥80% lines, ≥75% branches (lower branch threshold accounts for error paths in LLM/Puppeteer processors that are hard to trigger without real external deps).
`apps/web`: ≥70% lines (UI logic is thinner; composables are the primary target).

## Risks / Trade-offs

- **Decorator metadata with SWC** — SWC's `emitDecoratorMetadata` support is mature but occasionally lags NestJS updates. Risk: DI token resolution failures in tests. Mitigation: pin `@swc/core` version; test on upgrade.
- **ioredis-mock completeness** — some Bull features (delayed jobs, rate limiting) may not be fully supported. Mitigation: avoid testing delayed-job timing; focus on processor logic.
- **LLM calls in tests** — `generateObject` must be fully mocked. Risk: tests accidentally calling the Anthropic API. Mitigation: set `ANTHROPIC_API_KEY=test` in vitest env and assert the mock was called instead of the real client.
