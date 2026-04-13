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

const mockSubscription = { id: 'source-1', filters: {} };

const mockForkedEm = {
    getReference: vi.fn().mockReturnValue({ id: 'preset-1' }),
    create: vi.fn().mockReturnValue({ id: 'listing-1', ...mockListing }),
    persist: vi.fn(),
    flush: vi.fn(),
    find: vi.fn().mockResolvedValue([mockSubscription]),
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
        mockForkedEm.find.mockResolvedValue([mockSubscription]);
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
                presetId: 'preset-1',
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
        expect(mockForkedEm.persist).toHaveBeenCalled();
        expect(mockForkedEm.flush).toHaveBeenCalled();
    });

    it('fans out to active subscriptions and enqueues to matching queue', async () => {
        const job = {
            data: {
                presetId: 'preset-1',
                listing: mockListing,
            } as IngestionJobPayload,
        } as Job<IngestionJobPayload>;

        await processor.handle(job);

        expect(mockMatchingQueue.add).toHaveBeenCalledWith({
            listingId: 'listing-1',
            jobSourceId: 'source-1',
        });
    });

    it('does not enqueue to matching queue when subscription filter does not match', async () => {
        mockForkedEm.find.mockResolvedValue([
            { id: 'source-1', filters: { title: 'nonexistent' } },
        ]);

        const job = {
            data: {
                presetId: 'preset-1',
                listing: mockListing,
            } as IngestionJobPayload,
        } as Job<IngestionJobPayload>;

        await processor.handle(job);

        expect(mockMatchingQueue.add).not.toHaveBeenCalled();
    });

    it('enqueues once per passing subscription when multiple active subscriptions exist', async () => {
        mockForkedEm.find.mockResolvedValue([
            { id: 'source-1', filters: {} },
            { id: 'source-2', filters: { title: 'Developer' } },
            { id: 'source-3', filters: { title: 'nonexistent' } },
        ]);

        const job = {
            data: {
                presetId: 'preset-1',
                listing: mockListing,
            } as IngestionJobPayload,
        } as Job<IngestionJobPayload>;

        await processor.handle(job);

        expect(mockMatchingQueue.add).toHaveBeenCalledTimes(2);
        expect(mockMatchingQueue.add).toHaveBeenCalledWith({ listingId: 'listing-1', jobSourceId: 'source-1' });
        expect(mockMatchingQueue.add).toHaveBeenCalledWith({ listingId: 'listing-1', jobSourceId: 'source-2' });
    });
});
