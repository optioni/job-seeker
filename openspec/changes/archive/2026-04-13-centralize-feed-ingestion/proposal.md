## Why

Currently each `JobSource` owns its own polling cycle — if two users subscribe to the same Duunitori feed, that feed is fetched twice. Polling is tightly coupled to per-user configuration, which makes rate limiting, deduplication, and scheduling harder as the number of users or subscriptions grows. Separating feed fetching (preset-level, shared) from match filtering (user-level, per-subscription) removes redundant HTTP requests, centralises dedup, and makes the pipeline easier to reason about.

## What Changes

- Move RSS polling ownership from `JobSource` to `JobSourcePreset` — each preset is fetched once per day if it has at least one active subscriber
- Remove `pollingInterval` and `lastPolledAt` from `JobSource`; add `lastPolledAt` to `JobSourcePreset` — polling cadence is hardcoded daily on the server, no configurable interval needed
- `JobSource` becomes a subscription record: it links a user to a preset and holds a `filterConfig` used as a post-ingest, pre-LLM filter
- After ingestion, new `JobListing` records are fanned out to all active `JobSource` subscriptions for that preset; each subscription's `filterConfig` is evaluated against listing fields (title, company, description, location) before enqueuing for LLM matching
- `JobListing` is no longer scoped to a `JobSource` — it belongs to a `JobSourcePreset` (shared)
- Deduplication becomes global per preset rather than per user-source

## Capabilities

### Modified Capabilities

- `api-ingestion`: Cron now iterates `JobSourcePreset` records with ≥1 active subscriber instead of individual `JobSource` records. After saving a new `JobListing`, a fan-out step dispatches to each subscribed `JobSource`, applying `filterConfig` before enqueuing to the matching queue.
- `api-job-sources`: `JobSource` loses `pollingInterval` and `lastPolledAt`; `JobSourcePreset` gains `lastPolledAt`. Polling cadence is hardcoded daily — no `pollingInterval` field needed. `filterConfig` on `JobSource` is now a post-ingest filter spec, not a feed URL parameter builder.
- `shared-types`: Update `JobSource` and `JobSourcePreset` entity definitions to reflect the new field distribution.

### No New Capabilities

This change is a structural refactor. No new user-facing features are added.

## Impact

- **API**: `apps/api/` — `IngestionModule` (cron, processor), `JobSourcesModule` (entity, service, seeder), `MikroORM` migrations for field moves
- **Shared**: `packages/shared/src/entities/` — `JobSource`, `JobSourcePreset`, `JobListing` entity types
- **Database**: migration to drop `pollingInterval`/`lastPolledAt` from `job_sources`, add `lastPolledAt` to `job_source_presets`; `JobListing.jobSource` FK updated to point at `JobSourcePreset`
- **No frontend changes** — `JobSource` CRUD endpoints remain; the UI filter config UX is unchanged in behaviour
- **Breaking**: `JobListing` is no longer user-scoped via `jobSource`; any query joining through `jobSource → user` must be updated

## Open Questions

- Should `filterConfig` matching be exact keyword match, regex, or a simple field-contains check? (Proposal: field-contains / case-insensitive substring for simplicity)
- If a `JobListing` passes filter for one subscription but not another, should it still be saved to the shared pool? (Proposal: yes — ingest always saves; filtering only controls what enters the matching queue per subscription)
- Should scraper-type sources (not yet implemented) follow this same fan-out model, or remain per-user? (Proposal: out of scope — defer until scrapers are implemented)
