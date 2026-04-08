## MODIFIED Requirements

### Requirement: LLM match decision
The system SHALL process each `JobListing` ID from the `matching` queue by calling `generateObject` with Claude Haiku. The prompt SHALL include a compact plain-text CV summary (produced by `formatCvForMatching(cvProfile)`), `JobPreferences`, and job listing details. The result schema is `{ match: boolean, score: number (0–100), rationale: string }`. The prompt MUST NOT use raw JSON serialization of the `CvProfile` entity.

#### Scenario: Matched listing
- **WHEN** the LLM returns `match: true` for a listing
- **THEN** a `JobApplication` is created with `matched: true`, the score, and rationale; and the listing ID is enqueued to the `generation` queue

#### Scenario: Unmatched listing
- **WHEN** the LLM returns `match: false` for a listing
- **THEN** a `JobApplication` is created with `matched: false`, the score, and rationale; and nothing is enqueued to generation

## ADDED Requirements

### Requirement: CV plain-text formatter
The system SHALL provide a `formatCvForMatching(cvProfile: CvProfile): string` pure function that serializes a populated `CvProfile` entity into compact plain text. The output SHALL include: name and title, summary, work experience (role, company, dates, description, highlights), education, skills, languages, certifications, and projects. Sections with no data SHALL be omitted.

#### Scenario: Full CV formatted
- **WHEN** `formatCvForMatching` is called with a fully populated `CvProfile`
- **THEN** the returned string contains all sections in plain text with no JSON syntax

#### Scenario: Empty sections omitted
- **WHEN** `formatCvForMatching` is called with a `CvProfile` that has no certifications or projects
- **THEN** the returned string does not contain a Certifications or Projects section

#### Scenario: Token efficiency
- **WHEN** `formatCvForMatching` is called with a typical CV
- **THEN** the output is shorter than the equivalent `JSON.stringify(cvProfile, null, 2)` representation
