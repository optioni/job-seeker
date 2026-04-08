import { type IngestionJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { getQueueToken } from '@nestjs/bull';
import { Test, type TestingModule } from '@nestjs/testing';
import { type Job } from 'bull';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { IngestionProcessor } from './ingestion.processor';

const mockListing = {
    id: 'listing-1',
    externalId: 'ext-1',
    url: 'https://example.com/job/1',
    title: 'Developer',
    company: 'Acme',
    description: 'A developer job',
    scrapedAt: new Date().toISOString(),
};

const mockForkedEm = {
    getReference: vi.fn().mockReturnValue({ id: 'source-1' }),
    create: vi.fn().mockReturnValue({ id: 'listing-1', ...mockListing }),
    persistAndFlush: vi.fn(),
};

const mockEm = {
    fork: vi.fn().mockReturnValue(mockForkedEm),
};

const mockMatchingQueue = {
    add: vi.fn(),
};

describe('IngestionProcessor', () => {
    let processor: IngestionProcessor;

    beforeEach(async () => {
        vi.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IngestionProcessor,
                { provide: EntityManager, useValue: mockEm },
                { provide: getQueueToken('matching'), useValue: mockMatchingQueue },
            ],
        }).compile();

        processor = module.get<IngestionProcessor>(IngestionProcessor);
    });

    it('persists a new JobListing entity', async () => {
        const job = {
            data: {
                sourceId: 'source-1',
                listing: mockListing,
            } as IngestionJobPayload,
        } as Job<IngestionJobPayload>;

        await processor.handle(job);

        expect(mockForkedEm.create).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                externalId: 'ext-1',
                title: 'Developer',
                company: 'Acme',
            }),
        );
        expect(mockForkedEm.persistAndFlush).toHaveBeenCalled();
    });

    it('enqueues the listing ID to the matching queue', async () => {
        const job = {
            data: {
                sourceId: 'source-1',
                listing: mockListing,
            } as IngestionJobPayload,
        } as Job<IngestionJobPayload>;

        await processor.handle(job);

        expect(mockMatchingQueue.add).toHaveBeenCalledWith({ listingId: 'listing-1' });
    });
});
