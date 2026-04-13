import { describe, expect, it } from 'vitest';

/**
 * Tests for the deduplication logic used in IngestionCron.pollPreset.
 * The dedup set is keyed by `externalId` (see ingestion.cron.ts), matching
 * the DB unique constraint on (preset_id, external_id).
 */

interface Candidate {
    company: string
    title: string
    externalId: string
}

interface ExistingListing {
    externalId: string
}

function deduplicate(candidates: Candidate[], existing: ExistingListing[]): Candidate[] {
    const existingIds = new Set(existing.map((listing) => listing.externalId));
    return candidates.filter((candidate) => !existingIds.has(candidate.externalId));
}

describe('Deduplication logic', () => {
    it('filters out a candidate whose externalId already exists', () => {
        const candidates: Candidate[] = [
            { company: 'Acme Corp', title: 'Senior Developer', externalId: 'id-1' },
        ];
        const existing: ExistingListing[] = [{ externalId: 'id-1' }];

        const result = deduplicate(candidates, existing);

        expect(result).toHaveLength(0);
    });

    it('passes through a candidate with a new externalId', () => {
        const candidates: Candidate[] = [
            { company: 'Acme Corp', title: 'Junior Developer', externalId: 'id-2' },
        ];
        const existing: ExistingListing[] = [{ externalId: 'id-1' }];

        const result = deduplicate(candidates, existing);

        expect(result).toHaveLength(1);
        expect(result[0].externalId).toBe('id-2');
    });

    it('allows same company+title if externalId differs (re-post scenario)', () => {
        const candidates: Candidate[] = [
            { company: 'Acme Corp', title: 'Senior Developer', externalId: 'id-new' },
        ];
        const existing: ExistingListing[] = [{ externalId: 'id-old' }];

        const result = deduplicate(candidates, existing);

        expect(result).toHaveLength(1);
        expect(result[0].externalId).toBe('id-new');
    });

    it('filters duplicate externalId regardless of different title', () => {
        const candidates: Candidate[] = [
            { company: 'TechFirm', title: 'Backend Engineer', externalId: 'shared-id' },
        ];
        const existing: ExistingListing[] = [{ externalId: 'shared-id' }];

        const result = deduplicate(candidates, existing);

        expect(result).toHaveLength(0);
    });

    it('passes through all candidates when existing list is empty', () => {
        const candidates: Candidate[] = [
            { company: 'A', title: 'Job 1', externalId: 'id-1' },
            { company: 'B', title: 'Job 2', externalId: 'id-2' },
        ];

        const result = deduplicate(candidates, []);

        expect(result).toHaveLength(2);
    });

    it('handles mixed new and existing externalIds correctly', () => {
        const candidates: Candidate[] = [
            { company: 'TechFirm', title: 'Backend Engineer', externalId: 'board-b-1' },
            { company: 'TechFirm', title: 'Frontend Engineer', externalId: 'board-b-2' },
        ];
        const existing: ExistingListing[] = [{ externalId: 'board-b-1' }];

        const result = deduplicate(candidates, existing);

        expect(result).toHaveLength(1);
        expect(result[0].externalId).toBe('board-b-2');
    });
});
