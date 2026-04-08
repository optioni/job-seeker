## Why

The matching queue sends the full `CvProfile` entity serialized as raw JSON (~800–1,500 tokens) to the LLM on every job listing evaluation, including listings that don't match. Replacing this with a compact plain-text formatter reduces matching input tokens by ~50–70% at no quality cost, since the LLM only needs to assess relevance — not reconstruct the CV.

## What Changes

- Add a `formatCvForMatching(cvProfile: CvProfile): string` utility function in `MatchingModule` that serializes the populated `CvProfile` entity into compact, human-readable plain text
- Update the matching prompt to use this formatted string instead of `JSON.stringify(cvProfile, null, 2)`
- No changes to the generation prompt — it continues to use the full JSON for structured CV tailoring

## Capabilities

### New Capabilities

_(none — this is an internal implementation optimization with no new user-facing behavior)_

### Modified Capabilities

- `api-matching`: The matching prompt requirement changes — the CV input MUST be a compact plain-text summary rather than raw JSON serialization of the entity

## Impact

- `apps/api/src/matching/matching.processor.ts` — prompt construction updated
- New helper (e.g. `apps/api/src/matching/format-cv.ts`) containing `formatCvForMatching()`
- No database changes, no entity changes, no API changes
- No impact on generation, document, or notification pipeline stages
