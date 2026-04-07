## Purpose

LLM-based CV tailoring and cover letter generation for matched job applications, using Claude Haiku via the Vercel AI SDK.

## Requirements

### Requirement: CV tailoring
The system SHALL process matched `JobApplication` IDs from the `generation` queue by calling `generateObject` with Claude Haiku to produce a tailored CV. The result SHALL be structured JSON matching the `CvProfile` schema (not freeform), with reordered/emphasized sections relevant to the job. The result SHALL be saved to `JobApplication.tailoredCvSnapshot`.

#### Scenario: Tailored CV generated
- **WHEN** a matched JobApplication is processed from the generation queue
- **THEN** `tailoredCvSnapshot` is set on the JobApplication with structured JSON matching the CV schema

### Requirement: Cover letter generation
The system SHALL make a second sequential `generateObject` call to generate a cover letter based on the tailored CV, the job listing, and the `JobPreferences`. The result SHALL be plain text saved to `JobApplication.coverLetterText`.

#### Scenario: Cover letter generated
- **WHEN** CV tailoring completes for a matched application
- **THEN** a cover letter is generated and saved to `JobApplication.coverLetterText`

### Requirement: Language instruction in generation prompts
Both CV tailoring and cover letter prompts SHALL include a language instruction derived from `JobSource.language`, falling back to `JobPreferences.defaultLanguage`. Output SHALL be in the specified language.

#### Scenario: English cover letter for English source
- **WHEN** `JobSource.language` is `en`
- **THEN** the cover letter text is written in English

### Requirement: Enqueue to document queue after generation
Upon successful completion of both CV tailoring and cover letter generation, the system SHALL enqueue the `JobApplication` ID to the `document` queue.

#### Scenario: Document queue enqueued after generation
- **WHEN** both tailoredCvSnapshot and coverLetterText are saved
- **THEN** the JobApplication ID is added to the document queue
