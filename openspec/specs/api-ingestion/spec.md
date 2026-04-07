## Purpose

RSS feed polling, parsing, deduplication, and ingestion of new job listings into the pipeline.

## Requirements

### Requirement: RSS polling cron
The system SHALL poll each active `JobSource` on its configured `pollingInterval` using a NestJS `@Cron` scheduler. For each source, the RSS adapter fetches the feed URL constructed from `baseUrl` + resolved filter params.

#### Scenario: Active sources polled
- **WHEN** the cron fires
- **THEN** all JobSources where `active = true` are fetched

#### Scenario: Inactive sources skipped
- **WHEN** a JobSource has `active = false`
- **THEN** it is not fetched during the cron cycle

### Requirement: RSS adapter
The system SHALL parse RSS/Atom feeds using `rss-parser`. Each feed item SHALL be mapped to a candidate `JobListing` with: `externalId`, `url`, `title`, `company`, `description`, `scrapedAt`.

#### Scenario: Parse feed items
- **WHEN** the RSS adapter fetches a valid feed
- **THEN** each item is mapped to a JobListing candidate object

### Requirement: Deduplication before enqueue
The system SHALL deduplicate candidate listings against existing `JobListing` records by matching company name + title + source date. Duplicates SHALL be discarded before enqueuing.

#### Scenario: Skip duplicate listing
- **WHEN** a fetched item matches an existing JobListing by company + title + source date
- **THEN** the item is discarded and not added to the ingestion queue

#### Scenario: Cross-board deduplication
- **WHEN** the same job appears on two different boards with matching company + title
- **THEN** only the first-seen listing is enqueued; the duplicate is discarded

### Requirement: Ingestion queue
The system SHALL enqueue new (non-duplicate) listings to the `ingestion` Bull queue. The processor SHALL persist each listing as a `JobListing` entity and then enqueue the listing ID to the `matching` queue.

#### Scenario: New listing saved
- **WHEN** a non-duplicate listing is processed from the ingestion queue
- **THEN** a JobListing record is created and its ID is added to the matching queue
