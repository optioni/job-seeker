## MODIFIED Requirements

### Requirement: RSS polling cron
The system SHALL poll each `JobSourcePreset` that has at least one `JobSource` with `active = true`, once per day, using a NestJS `@Cron` scheduler. For each qualifying preset, the RSS adapter fetches the feed URL constructed from `baseUrl` + resolved filter params (preset-level defaults). Presets with no active subscribers SHALL be skipped.

#### Scenario: Active preset polled
- **WHEN** the cron fires
- **THEN** all JobSourcePresets that have at least one JobSource with `active = true` are fetched

#### Scenario: Preset with no active subscribers skipped
- **WHEN** all JobSources for a preset have `active = false`
- **THEN** the preset is not fetched during the cron cycle

#### Scenario: Inactive subscriber does not prevent preset fetch
- **WHEN** a preset has one active and one inactive JobSource subscriber
- **THEN** the preset feed is still fetched once

### Requirement: Ingestion queue
The system SHALL enqueue new (non-duplicate) listings to the `ingestion` Bull queue. The processor SHALL persist each listing as a `JobListing` entity linked to its `JobSourcePreset`. After persisting, the processor SHALL fan out to all active `JobSource` subscriptions for that preset, evaluate each subscription's `filterConfig` against the listing's fields, and enqueue passing subscriptions to the `matching` queue with payload `{ listingId, jobSourceId }`.

#### Scenario: New listing saved and fanned out
- **WHEN** a non-duplicate listing is processed from the ingestion queue
- **THEN** a JobListing record is created linked to the preset, and for each active subscription that passes filterConfig evaluation, `{ listingId, jobSourceId }` is added to the matching queue

#### Scenario: Listing filtered out for one subscription
- **WHEN** a new listing fails a subscription's filterConfig check
- **THEN** that subscription does not receive a matching queue entry for the listing, but the JobListing record is still persisted

#### Scenario: Listing passes all subscriptions
- **WHEN** a new listing passes all active subscriptions' filterConfig checks
- **THEN** one matching queue entry per subscription is created

#### Scenario: No active subscriptions pass filter
- **WHEN** a new listing fails all active subscriptions' filterConfig checks
- **THEN** no matching queue entries are created but the JobListing record is still persisted

## ADDED Requirements

### Requirement: Subscription filterConfig evaluation
The system SHALL evaluate a `JobSource` subscription's `filterConfig` against a `JobListing`'s fields before enqueuing to the matching queue. Each key in `filterConfig` SHALL map to a listing field (`title`, `company`, `description`, `location`). A listing passes the filter when every specified field contains the corresponding value as a case-insensitive substring. An empty `filterConfig` SHALL pass all listings.

#### Scenario: Listing passes non-empty filter
- **WHEN** a JobSource has `filterConfig: { title: "developer" }` and the listing title contains "developer" (case-insensitive)
- **THEN** the listing passes the filter and is enqueued to matching

#### Scenario: Listing fails filter
- **WHEN** a JobSource has `filterConfig: { title: "developer" }` and the listing title does not contain "developer"
- **THEN** the listing is not enqueued to matching for that subscription

#### Scenario: Empty filterConfig passes all listings
- **WHEN** a JobSource has an empty `filterConfig: {}`
- **THEN** all listings for the preset are enqueued to matching for that subscription

#### Scenario: Multiple filter keys require all to match
- **WHEN** a JobSource has `filterConfig: { title: "engineer", location: "helsinki" }` and the listing matches both fields
- **THEN** the listing passes the filter

#### Scenario: Partial filter key match fails
- **WHEN** a JobSource has `filterConfig: { title: "engineer", location: "helsinki" }` and the listing matches title but not location
- **THEN** the listing does not pass the filter

## REMOVED Requirements

### Requirement: Per-source polling interval
**Reason**: Polling has moved to the preset level. Individual `JobSource` records no longer control when their feed is fetched — all RSS presets are fetched daily when they have active subscribers.
**Migration**: `JobSource.pollingInterval` and `JobSource.lastPolledAt` are removed. Polling cadence is now set on `JobSourcePreset.pollingInterval` and tracked in `JobSourcePreset.lastPolledAt`.
