## MODIFIED Requirements

### Requirement: New matches headline
The dashboard SHALL display the count of new matched `JobApplication` records created in the last 24 hours as the primary page heading. If zero new matches exist the heading SHALL read the translated equivalent of "No new matches today." The date displayed above the heading SHALL be formatted using `toLocaleDateString(locale.value)` where `locale` is the active i18n locale, so it renders in the correct language and regional format.

#### Scenario: New matches exist
- **WHEN** the dashboard loads and matches were created in the last 24 hours
- **THEN** the heading reads the locale-appropriate equivalent of "{n} new matches since yesterday."

#### Scenario: No new matches
- **WHEN** the dashboard loads and no matches were created in the last 24 hours
- **THEN** the heading reads the locale-appropriate equivalent of "No new matches today."

#### Scenario: Date renders in Finnish format
- **WHEN** the active locale is Finnish
- **THEN** the date above the heading is formatted in Finnish (e.g. "tiistai 8. huhtikuuta 2026")

### Requirement: Week-on-week stats
The dashboard SHALL display comparison stats for the current calendar week vs the previous calendar week: total listings evaluated, total matched, average match score, and total digest emails sent. Each stat SHALL show the absolute change vs the prior week with a directional indicator. Stat labels (Evaluated, Matched, Avg Score, Digests) SHALL use `$t('dashboard.*')` translation keys.

#### Scenario: Stats with improvement
- **WHEN** the current week has more matches than the previous week
- **THEN** the matched stat shows an upward indicator and the positive delta

#### Scenario: Stats on first week
- **WHEN** no prior week data exists
- **THEN** stats display current week values with no comparison indicators

#### Scenario: Stat labels in Finnish
- **WHEN** the active locale is Finnish
- **THEN** stat labels render in Finnish
