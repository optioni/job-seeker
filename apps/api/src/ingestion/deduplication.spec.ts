import { describe, expect, it } from 'vitest';

/**
 * Tests for the deduplication logic used in IngestionCron.pollSource.
 * The dedup set is keyed by `${company}|${title}` (see ingestion.cron.ts).
 */

interface Candidate {
    company: string
    title: string
    externalId: string
}

interface ExistingListing {
    company: string
    title: string
}

function deduplicate(candidates: Candidate[], existing: ExistingListing[]): Candidate[] {
    const existingSet = new Set(existing.map((listing) => `${listing.company}|${listing.title}`));
    return candidates.filter((candidate) => !existingSet.has(`${candidate.company}|${candidate.title}`));
}

describe('Deduplication logic', () => {
    it('filters out a candidate that matches an existing listing by company + title', () => {
        const candidates: Candidate[] = [
            { company: 'Acme Corp', title: 'Senior Developer', externalId: 'id-1' },
        ];
        const existing: ExistingListing[] = [
            { company: 'Acme Corp', title: 'Senior Developer' },
        ];

        const result = deduplicate(candidates, existing);

        expect(result).toHaveLength(0);
    });

    it('passes through a candidate with no matching existing listing', () => {
        const candidates: Candidate[] = [
            { company: 'Acme Corp', title: 'Junior Developer', externalId: 'id-2' },
        ];
        const existing: ExistingListing[] = [
            { company: 'Acme Corp', title: 'Senior Developer' },
        ];

        const result = deduplicate(candidates, existing);

        expect(result).toHaveLength(1);
        expect(result[0].externalId).toBe('id-2');
    });

    it('detects cross-board duplicates with same company + title', () => {
        const candidates: Candidate[] = [
            { company: 'TechFirm', title: 'Backend Engineer', externalId: 'board-b-1' },
            { company: 'TechFirm', title: 'Frontend Engineer', externalId: 'board-b-2' },
        ];
        const existing: ExistingListing[] = [
            // Previously ingested from a different board
            { company: 'TechFirm', title: 'Backend Engineer' },
        ];

        const result = deduplicate(candidates, existing);

        expect(result).toHaveLength(1);
        expect(result[0].externalId).toBe('board-b-2');
    });

    it('passes through all candidates when existing list is empty', () => {
        const candidates: Candidate[] = [
            { company: 'A', title: 'Job 1', externalId: 'id-1' },
            { company: 'B', title: 'Job 2', externalId: 'id-2' },
        ];

        const result = deduplicate(candidates, []);

        expect(result).toHaveLength(2);
    });

    it('only matches exact company+title combination', () => {
        const candidates: Candidate[] = [
            { company: 'Acme Corp', title: 'Developer', externalId: 'id-1' },
        ];
        const existing: ExistingListing[] = [
            // different title
            { company: 'Acme Corp', title: 'Senior Developer' },
            // different company
            { company: 'Other Corp', title: 'Developer' },
        ];

        const result = deduplicate(candidates, existing);

        expect(result).toHaveLength(1);
    });
});
