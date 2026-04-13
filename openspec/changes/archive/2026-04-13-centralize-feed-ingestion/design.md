## Context

Currently `IngestionModule` treats each `JobSource` as the unit of polling. The cron job iterates all active `JobSource` records, fetches each one's feed URL, deduplicates against existing `JobListing` records scoped to that source, and enqueues new listings directly into the matching queue for that source's user. This means two users subscribing to the same Duunitori feed cause two separate HTTP fetches and two separate deduplication passes over the same content.

`JobListing` carries a `jobSource` FK, making each listing implicitly user-scoped. The matching queue payload carries a `JobListing` ID, and matching resolves the user via the listing's source relationship.

The change separates two responsibilities that are currently conflated in `JobSource`:
1. **What to fetch** — the feed URL and when to poll it (belongs at the preset level)
2. **What to do with results** — per-user filter criteria (belongs at the subscription level)

## Goals / Non-Goals

**Goals:**
- Each RSS feed is fetched at most once per polling cycle, regardless of subscriber count
- `JobListing` records are shared across all subscribers to a preset — created once, not duplicated
- Deduplication is global per preset, eliminating cross-user duplicate records for the same listing
- Per-user `filterConfig` is evaluated post-ingest as a cheap pre-LLM gate before enqueuing to the matching queue
- `pollingInterval` is removed entirely — polling cadence is hardcoded daily; `lastPolledAt` moves to `JobSourcePreset`; `JobSource` retains only subscription-relevant fields

**Non-Goals:**
- Changing the LLM matching, generation, document, or notification pipeline stages
- Frontend changes — the `JobSource` CRUD UI remains; filter config UX is unchanged
- Scraper-type sources (not yet implemented) — deferred
- Per-user polling interval overrides — daily cadence is fixed for RSS

## Decisions

### Polling unit: JobSourcePreset, not JobSource

The cron now queries `JobSourcePreset` records that have at least one `JobSource` with `active = true`. If a preset has no active subscribers it is skipped entirely.

**Alternative considered**: Keep `JobSource` as the polling unit but deduplicate writes to `JobListing` at the DB level (upsert). Rejected because it still makes N HTTP requests for N subscribers, doesn't eliminate redundant parsing, and makes the dedup logic more complex (concurrent upserts under load).

### Fan-out after ingest, not before

After a new `JobListing` is persisted, the ingestion processor fetches all active `JobSource` subscriptions for that preset and, for each one, evaluates `filterConfig` against the listing's fields. Subscriptions that pass the filter have the listing ID + subscription ID enqueued to the matching queue.

**Alternative considered**: Fan-out at the cron level (fetch feed once, then fan out the raw items to per-user ingestion queue jobs). Rejected because it moves deduplication complexity into each per-user job and requires coordination to avoid race-condition duplicates.

### filterConfig semantics: field-contains, case-insensitive

`filterConfig` on `JobSource` is evaluated as a set of field-level substring filters. Each key maps to a listing field (`title`, `company`, `description`, `location`); the value is a substring that must appear (case-insensitive) in that field. All specified filters must match (AND logic). An empty `filterConfig` passes all listings.

**Alternative considered**: Regex patterns. More expressive but adds maintenance burden (invalid regex errors, escaping) and is harder to expose safely in the UI. Substring match covers the practical use cases (keyword, city name, company name).

**Alternative considered**: Structured filter DSL (include/exclude lists, OR logic). Deferred — the simple AND-contains model is sufficient for initial implementation and can be extended later without a breaking schema change.

### Matching queue payload: include JobSource ID

The matching queue payload changes from `{ listingId }` to `{ listingId, jobSourceId }`. The matching processor uses `jobSourceId` to resolve the subscribing user and their `JobPreferences`. This preserves the existing pattern of resolving user context within the queue processor.

**Why not resolve user at fan-out time**: Keeping the user ID out of the queue payload means the matching processor remains the authority on "which user's preferences apply", consistent with the rest of the pipeline.

### JobListing ownership: JobSourcePreset FK replaces JobSource FK

`JobListing.jobSource` (FK to `job_sources`) is replaced by `JobListing.preset` (FK to `job_source_presets`). This reflects that a listing is a shared artefact of a preset's feed, not a per-user resource.

`JobApplication` references `JobListing` directly and is already user-scoped via `user` FK — no change needed there.

### Polling cadence: hardcoded daily, no stored interval

The cron fires daily and processes all presets with active subscribers. There is no configurable `pollingInterval` field — the interval is a server-side constant. `lastPolledAt` moves from `JobSource` to `JobSourcePreset` to track the last successful fetch at the preset level.

**Alternative considered**: Store `pollingInterval` on `JobSourcePreset` for future flexibility (hourly presets, etc.). Rejected — YAGNI; adding the field later is a trivial migration, but storing it now adds dead config with no enforcement.

## Risks / Trade-offs

- **Fan-out volume under many subscribers** — if a preset has many active subscribers, one ingestion cycle creates N matching queue jobs (one per subscriber per new listing). At current scale (single-user app) this is negligible. If multi-user, Bull handles queue depth gracefully; no mitigation needed now.
- **filterConfig validation gap** — the existing filter key validation (reject unknown keys against preset's filterConfig schema) remains in the `JobSource` CRUD service. The semantics shift (from URL param builder to post-ingest matcher) but the validation surface is the same. Risk: stale filter keys that were valid URL params may not be meaningful as field matchers — mitigation: update seed `filterConfig` definitions on presets to reflect post-ingest field names.
- **JobListing scope change is a breaking query** — any code joining `job_listings → job_sources → users` to find listings for a user must be updated to join through `job_applications` or the matching fan-out. Affected: `ApplicationsModule` queries (should already join via `job_applications.listing_id`), admin UI listing views.

## Migration Plan

1. **DB migration**: Add `last_polled_at` to `job_source_presets`. Drop `polling_interval` and `last_polled_at` from `job_sources`. Add `preset_id` FK column to `job_listings`. Backfill `preset_id` from `job_listings → job_sources → preset_id`. Drop `job_source_id` FK from `job_listings`.
2. **Shared types**: Update `JobSource`, `JobSourcePreset`, `JobListing` interfaces in `packages/shared`.
3. **JobSourcesModule**: Remove polling fields from `JobSource` entity; add to `JobSourcePreset` entity. Update seeder to set `pollingInterval` on presets. Update filter validation to document post-ingest semantics.
4. **IngestionModule**: Rewrite cron to iterate presets; rewrite processor to fan-out per subscription; add filterConfig evaluation before enqueue.
5. **MatchingModule**: Update processor to accept `{ listingId, jobSourceId }` payload; resolve user via `jobSourceId`.
6. **Rollback**: The DB migration is destructive (dropping columns). Rollback requires a down migration restoring `job_source_id` on `job_listings` and polling fields on `job_sources`. Data loss risk is low — `pollingInterval` values are re-seeded; `lastPolledAt` values are operational state, not user data.

## Open Questions

- Should `filterConfig` on `JobSourcePreset` (the schema of available fields) be updated to reflect post-ingest field names (`title`, `company`, `description`, `location`) rather than URL param names? Currently it doubles as both a validation schema and a URL builder config.
- Should a `JobListing` that fails all subscribers' filters still be persisted to the shared pool? (Proposed: yes — ingest unconditionally; the shared pool is the authoritative record of what was available.)
