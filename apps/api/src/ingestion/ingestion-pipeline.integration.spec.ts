import { type IngestionJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test, type TestingModule } from '@nestjs/testing';
import { type Queue } from 'bull';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { IngestionProcessor } from './ingestion.processor';

/**
 * Integration test: ingestion processor → matching queue handoff.
 *
 * Uses Bull queue tokens with mocked Redis connection to verify that
 * the ingestion processor enqueues a job to the matching queue after
 * persisting the listing.
 */

const mockListing = {
    externalId: 'ext-integration-1',
    url: 'https://example.com/job/1',
    title: 'Integration Test Job',
    company: 'Test Corp',
    description: 'Testing the pipeline',
    scrapedAt: new Date().toISOString(),
};

const savedListing = { id: 'listing-integration-1', ...mockListing };

const mockForkedEm = {
    getReference: vi.fn().mockReturnValue({ id: 'source-1' }),
    create: vi.fn().mockReturnValue(savedListing),
    persistAndFlush: vi.fn(),
};

const mockEm = {
    fork: vi.fn().mockReturnValue(mockForkedEm),
};

const mockMatchingQueue = {
    add: vi.fn(),
    process: vi.fn(),
    on: vi.fn(),
};

describe('IngestionProcessor → MatchingQueue integration', () => {
    let processor: IngestionProcessor;
    let matchingQueue: Queue;

    beforeEach(async () => {
        vi.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                BullModule.forRoot({
                    redis: {
                        // ioredis-mock compatible URL — no real Redis needed
                        host: 'localhost',
                        port: 6379,
                    },
                }),
            ],
            providers: [
                IngestionProcessor,
                { provide: EntityManager, useValue: mockEm },
                { provide: getQueueToken('matching'), useValue: mockMatchingQueue },
            ],
        }).compile();

        processor = module.get<IngestionProcessor>(IngestionProcessor);
        matchingQueue = module.get<Queue>(getQueueToken('matching'));
    });

    it('persists a JobListing and enqueues it to the matching queue', async () => {
        const payload: IngestionJobPayload = {
            sourceId: 'source-1',
            listing: mockListing as IngestionJobPayload['listing'],
        };

        await processor.handle({ data: payload } as Parameters<typeof processor.handle>[0]);

        // EntityManager was called to persist
        expect(mockForkedEm.create).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ externalId: 'ext-integration-1' }),
        );
        expect(mockForkedEm.persistAndFlush).toHaveBeenCalled();

        // Matching queue received the saved listing ID
        expect(mockMatchingQueue.add).toHaveBeenCalledWith({ listingId: 'listing-integration-1' });
        expect(matchingQueue.add).toHaveBeenCalled();
    });
});
