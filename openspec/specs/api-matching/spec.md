## Purpose

LLM-based job listing matching against the candidate's CV and preferences, creating a JobApplication record for every evaluated listing.

## Requirements

### Requirement: LLM match decision
The system SHALL process each `JobListing` ID from the `matching` queue by calling `generateObject` with Claude Haiku. The prompt SHALL include the full `CvProfile`, `JobPreferences`, and job listing details. The result schema is `{ match: boolean, score: number (0–100), rationale: string }`.

#### Scenario: Matched listing
- **WHEN** the LLM returns `match: true` for a listing
- **THEN** a `JobApplication` is created with `matched: true`, the score, and rationale; and the listing ID is enqueued to the `generation` queue

#### Scenario: Unmatched listing
- **WHEN** the LLM returns `match: false` for a listing
- **THEN** a `JobApplication` is created with `matched: false`, the score, and rationale; and nothing is enqueued to generation

### Requirement: Language instruction in prompt
The matching prompt SHALL include a language instruction derived from `JobSource.language`, falling back to `JobPreferences.defaultLanguage`. The LLM SHALL produce the rationale in the specified language.

#### Scenario: Finnish language instruction
- **WHEN** `JobSource.language` is `fi`
- **THEN** the prompt instructs the LLM to respond in Finnish

### Requirement: JobApplication created for every evaluated listing
The system SHALL create a `JobApplication` record for every listing processed by the matching queue, regardless of match outcome. This enables reviewing and tuning matching criteria over time.

#### Scenario: All listings have an application record
- **WHEN** 10 listings are processed from the matching queue
- **THEN** 10 JobApplication records exist, some with `matched: true` and some with `matched: false`
