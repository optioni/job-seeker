## 1. Database Migrations

- [x] 1.1 Create migration: add `last_polled_at` (timestamptz, nullable) to `job_source_presets`
- [x] 1.2 Create migration: drop `polling_interval` and `last_polled_at` columns from `job_sources`
- [x] 1.3 Create migration: add `preset_id` (FK → `job_source_presets.id`) column to `job_listings`; backfill from `job_listings → job_sources → preset_id`; drop `job_source_id` FK from `job_listings` [⚠ Bull queue restart required after this step — matching processor payload shape changes]

## 2. Shared Types (packages/shared)

- [x] 2.1 Add `lastPolledAt: Date | null` to `JobSourcePreset` interface (no `pollingInterval` — cadence is hardcoded)
- [x] 2.2 Remove `pollingInterval` and `lastPolledAt` from `JobSource` interface; update `filterConfig` type to `Record<string, string>` with JSDoc noting post-ingest field-contains semantics
- [x] 2.3 Replace `jobSource: JobSource` (or `jobSourceId`) with `preset: JobSourcePreset` (or `presetId: string`) on `JobListing` interface
- [x] 2.4 Add `jobSourceId: string` to `MatchingJobPayload` interface [⚠ Bull queue schema change — requires worker restart]

## 3. JobSourcesModule

- [x] 3.1 Update `JobSourcePreset` MikroORM entity: add `lastPolledAt` property (no `pollingInterval` column)
- [x] 3.2 Update `JobSource` MikroORM entity: remove `pollingInterval` and `lastPolledAt` properties
- [x] 3.3 Update seeder (`job-source-preset.seeder.ts`): remove any `pollingInterval` / `lastPolledAt` values if present (no longer stored on preset seed data)
- [x] 3.4 Update filter key validation in `JobSourcesService`: restrict valid keys to `title`, `company`, `description`, `location`

## 4. IngestionModule — Cron

- [x] 4.1 Rewrite the ingestion cron job to query `JobSourcePreset` records that have at least one `JobSource` with `active = true`, instead of querying `JobSource` records directly
- [x] 4.2 Update `lastPolledAt` write target from `JobSource` to `JobSourcePreset` after each successful fetch

## 5. IngestionModule — JobListing Entity

- [x] 5.1 Update `JobListing` MikroORM entity: replace `@ManyToOne(() => JobSource)` with `@ManyToOne(() => JobSourcePreset)` for the source FK
- [x] 5.2 Update deduplication query to scope by `preset` FK instead of `jobSource` FK

## 6. IngestionModule — Processor and Fan-out

- [x] 6.1 Update ingestion processor: persist `JobListing` with `preset` FK set to the ingested preset (not a JobSource)
- [x] 6.2 Add fan-out step: after persisting a new listing, query all `JobSource` records where `preset = ingestedPreset` and `active = true`
- [x] 6.3 Implement `evaluateFilterConfig(listing: JobListing, filterConfig: Record<string, string>): boolean` — AND-logic, case-insensitive substring match against listing fields (`title`, `company`, `description`, `location`); empty config returns `true`
- [x] 6.4 For each active subscription that passes `evaluateFilterConfig`, enqueue `{ listingId, jobSourceId }` to the `matching` Bull queue

## 7. MatchingModule

- [x] 7.1 Update matching queue processor to accept `{ listingId, jobSourceId }` payload (add `jobSourceId` to the existing payload type)
- [x] 7.2 Update user resolution in the matching processor: load `JobSource` by `jobSourceId`, then load the associated user and their `JobPreferences`, replacing any existing resolution path through `JobListing.jobSource`

## 8. ApplicationsModule — Audit

- [x] 8.1 Audit `ApplicationsService` and any related queries for joins through `job_listings → job_sources → user`; update to resolve user via `job_applications → user` if any are found
