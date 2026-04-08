## 1. CV Formatter

- [x] 1.1 Create `apps/api/src/matching/format-cv.ts` with `formatCvForMatching(cvProfile: CvProfile): string`
- [x] 1.2 Implement all CV sections: name/title, summary, work experience (with highlights), education, skills (grouped by category if present), languages, certifications, projects
- [x] 1.3 Ensure sections with no data are omitted from output

## 2. Matching Prompt Update

- [x] 2.1 Replace `JSON.stringify(cvProfile, null, 2)` in `matching.processor.ts` with `formatCvForMatching(cvProfile)`
- [x] 2.2 Update the prompt label from `## Candidate CV` to reflect it's a summary (e.g. `## Candidate Profile`)
