## Context

The matching processor (`apps/api/src/matching/matching.processor.ts`) currently serializes the full `CvProfile` entity — including all populated relations (workExperiences, educations, skills, languages, certifications, projects) — via `JSON.stringify(cvProfile, null, 2)`. This produces verbose JSON with MikroORM metadata noise and unnecessary nesting, consuming ~800–1,500 input tokens per matching call. Since matching runs for every ingested listing, this is the highest-frequency LLM call in the pipeline.

The LLM only needs to assess relevance for matching — it does not need to reconstruct or transform the CV. A compact plain-text representation communicates the same signal in fewer tokens.

## Goals / Non-Goals

**Goals:**
- Replace JSON CV serialization in the matching prompt with a compact plain-text formatter
- Reduce matching input tokens by ~50–70% per call
- Keep the change isolated to `MatchingModule` — no other modules affected

**Non-Goals:**
- Changing the generation prompt (it uses full JSON to produce structured output and should stay that way)
- Caching or pre-computing the formatted CV (pure code formatting is cheap enough to run per-call)
- Changing the matching LLM model, schema, or output format

## Decisions

### Plain text over JSON

The matching LLM call only needs to determine relevance. Structured JSON provides no benefit here — the model reads the text regardless of format. Plain text is more token-efficient and arguably easier for the model to parse semantically.

Alternatives considered:
- **Compressed JSON** (minified, no whitespace): saves some tokens but retains field name verbosity and MikroORM relation wrappers. Rejected — plain text is simpler and more token-efficient.
- **Pre-computed DB column**: would avoid per-call formatting but adds schema complexity and sync overhead for no real benefit since the formatter is O(n) string concatenation.

### Formatter location

A standalone `formatCvForMatching(cvProfile: CvProfile): string` function in `apps/api/src/matching/format-cv.ts`. Pure function, no dependencies, easy to test.

Alternatives considered:
- Method on `CvProfile` entity: would couple the entity to a matching-specific concern. Rejected.
- Static method on `MatchingProcessor`: unnecessary class coupling. Rejected.

### Format structure

```
{firstName} {lastName} — {title}
{summary}

Experience:
- {role} at {company} ({startDate}–{endDate|present}): {description}
  Highlights: {highlight1}; {highlight2}

Education:
- {degree} in {field}, {institution} ({startDate}–{endDate})

Skills: {name} ({level}); ...  [grouped by category if present]
Languages: {language} ({proficiency}); ...
Certifications: {name} — {issuer} ({date})
Projects: {name}: {description} [{url}]
```

Sections with no data are omitted entirely.

## Risks / Trade-offs

- **Match quality regression**: The plain-text format omits some structured signal (e.g. explicit field names like `highlights`). Mitigation: the format explicitly labels each section and includes all the same data — only the JSON wrapper is removed. Monitor `matchScore` distribution after deployment.
- **Format drift**: If `CvProfile` gains new sub-entities in the future, `formatCvForMatching` must be updated to include them. Mitigation: the formatter is a single, small function — easy to audit when entities change.
