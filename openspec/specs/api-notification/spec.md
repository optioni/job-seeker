## Purpose

Daily digest email sending matched job applications with PDF attachments via Nodemailer SMTP.

## Requirements

### Requirement: Daily digest email
The system SHALL send a single daily digest email containing all matched `JobApplication` records where `emailedAt IS NULL`. The email SHALL include for each match: job title, company, URL, match score, rationale, and attached CV and cover letter PDFs.

#### Scenario: Daily digest sent
- **WHEN** the digest cron fires and there are unemailed matched applications
- **THEN** one email is sent with all pending matches listed and PDFs attached

#### Scenario: No matches, no email
- **WHEN** the digest cron fires and there are no unemailed matched applications
- **THEN** no email is sent

### Requirement: Digest cron schedule
The digest cron SHALL run on a configurable schedule via the `DIGEST_CRON` environment variable, defaulting to `0 8 * * *` (08:00 daily).

#### Scenario: Default schedule
- **WHEN** `DIGEST_CRON` is not set
- **THEN** the digest runs at 08:00 daily

### Requirement: Mark applications as emailed
After sending the digest, the system SHALL update `emailedAt` on all included `JobApplication` records to the current timestamp.

#### Scenario: emailedAt set after send
- **WHEN** a digest email is sent successfully
- **THEN** all included JobApplication records have `emailedAt` set to the send time

### Requirement: SMTP configuration
The system SHALL send email via Nodemailer using SMTP settings from environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `DIGEST_RECIPIENT`.

#### Scenario: SMTP credentials used
- **WHEN** the digest email is sent
- **THEN** Nodemailer uses the SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS from environment

### Requirement: Email language
The email body language SHALL follow the `JobSource.language` of each match, falling back to `JobPreferences.defaultLanguage`. If matches span multiple languages, the email SHALL group or label sections by language.

#### Scenario: Finnish email body for Finnish source
- **WHEN** a matched application comes from a JobSource with `language: fi`
- **THEN** the email text for that match is written in Finnish
