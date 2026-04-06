## 1. Test Infrastructure Setup

- [ ] 1.1 Add dev dependencies to `apps/api`: `vitest`, `@vitest/coverage-v8`, `@swc/core`, `unplugin-swc`, `@nestjs/testing`, `ioredis-mock`
- [ ] 1.2 Create `apps/api/vitest.config.ts` — `unplugin-swc` plugin, `environment: 'node'`, coverage provider `v8`, thresholds `lines: 80, branches: 75`, include `src/**/*.spec.ts`
- [ ] 1.3 Add `"test": "vitest run"` and `"test:coverage": "vitest run --coverage"` scripts to `apps/api/package.json`
- [ ] 1.4 Add dev dependencies to `apps/web`: `vitest`, `@vitest/coverage-v8`, `@vue/test-utils`, `happy-dom`
- [ ] 1.5 Create `apps/web/vitest.config.ts` — `environment: 'happy-dom'`, coverage provider `v8`, threshold `lines: 70`
- [ ] 1.6 Add `"test"` and `"test:coverage"` scripts to `apps/web/package.json`
- [ ] 1.7 Add `"test": "yarn workspaces foreach --all run test"` and `"test:coverage": "yarn workspaces foreach --all run test:coverage"` to root `package.json`

## 2. AuthModule Tests

- [ ] 2.1 Write `src/auth/auth.service.spec.ts` — mock JWT service; test valid credentials return token, invalid credentials throw `UnauthorizedException`

## 3. CvModule Tests

- [ ] 3.1 Write `src/cv/cv.service.spec.ts` — mock MikroORM repositories; test `createProfile`, `updateProfile`, CRUD for WorkExperience, Education, Skill, Language, Certification, Project

## 4. PreferencesModule Tests

- [ ] 4.1 Write `src/preferences/preferences.service.spec.ts` — mock repository; test `findByUser`, `update` with partial fields

## 5. JobSourcesModule Tests

- [ ] 5.1 Write `src/job-sources/job-sources.service.spec.ts` — mock preset + source repositories; test list presets, create source with valid filters, reject invalid filter key, toggle active

## 6. IngestionModule Tests

- [ ] 6.1 Write `src/ingestion/rss.adapter.spec.ts` — mock `rss-parser`; test URL construction, item mapping, empty feed handling
- [ ] 6.2 Write `src/ingestion/deduplication.spec.ts` — test duplicate detection by company+title+date, cross-board dedup, pass-through for new listings
- [ ] 6.3 Write `src/ingestion/ingestion.processor.spec.ts` — mock JobListing repository and matching Bull queue; test entity persisted and matching queue `add` called

## 7. MatchingModule Tests

- [ ] 7.1 Write `src/matching/matching.processor.spec.ts` — mock `generateObject` and repositories; test matched result creates JobApplication with `matched: true` and enqueues to generation, unmatched result saves with `matched: false` and skips generation queue
- [ ] 7.2 Test language instruction is included in prompt when `JobSource.language` is set

## 8. GenerationModule Tests

- [ ] 8.1 Write `src/generation/generation.processor.spec.ts` — mock `generateObject` (two calls); test `tailoredCvSnapshot` set, `coverLetterText` set, document queue `add` called after both

## 9. DocumentModule Tests

- [ ] 9.1 Write `src/document/document.processor.spec.ts` — mock Puppeteer browser/page; test `page.pdf` called twice, notification queue `add` called with buffers and application ID

## 10. NotificationModule Tests

- [ ] 10.1 Write `src/notification/digest.cron.spec.ts` — mock JobApplication repository and Nodemailer transport; test `sendMail` called with all pending matches and their attachments, `emailedAt` set, no email when nothing pending

## 11. ApplicationsModule Tests

- [ ] 11.1 Write `src/applications/applications.service.spec.ts` — mock repository; test `findAll` queries with descending order, `findOne` returns full detail

## 12. Pipeline Integration Test

- [ ] 12.1 Write `src/ingestion/ingestion-pipeline.integration.spec.ts` — use `@nestjs/testing` + `ioredis-mock`; wire `IngestionModule` and `MatchingModule` with mocked repositories; assert ingestion queue job results in matching queue job

## 13. Web Composable Tests

- [ ] 13.1 Write `composables/useAuth.spec.ts` — mock `useFetch` and `useCookie`; test login sets cookie + navigates, failed login surfaces error, logout clears cookie
- [ ] 13.2 Write `composables/useApplications.spec.ts` — mock `useFetch`; test returns list, handles empty, handles error
- [ ] 13.3 Write `composables/useJobSources.spec.ts` — mock `useFetch`; test list fetch, toggle active calls PATCH, create calls POST
