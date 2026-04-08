import { type MatchingJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { getQueueToken } from '@nestjs/bull';
import { Test, type TestingModule } from '@nestjs/testing';
import { type Job } from 'bull';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { MatchingProcessor } from './matching.processor';

vi.mock('ai', () => ({
    generateObject: vi.fn(),
}));

vi.mock('@ai-sdk/anthropic', () => ({
    anthropic: vi.fn().mockReturnValue('mock-model'),
}));

const mockListing = {
    id: 'listing-1',
    title: 'Senior Developer',
    company: 'Acme Corp',
    description: 'Develop great software',
    source: {
        user: { id: 'user-1' },
        language: null,
    },
};

const mockCvProfile = {
    id: 'cv-1',
    workExperiences: [],
    educations: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
};

const mockPreferences = {
    id: 'prefs-1',
    defaultLanguage: 'fi',
};

const mockApplication = { id: 'app-1' };

const mockForkedEm = {
    findOneOrFail: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn().mockReturnValue(mockApplication),
    persistAndFlush: vi.fn(),
};

const mockEm = {
    fork: vi.fn().mockReturnValue(mockForkedEm),
};

const mockGenerationQueue = {
    add: vi.fn(),
};

describe('MatchingProcessor', () => {
    let processor: MatchingProcessor;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockForkedEm.findOneOrFail.mockResolvedValue(mockListing);
        mockForkedEm.findOne.mockImplementation(async (entity: unknown) => {
            if (entity === (await import('../entities/cv-profile.entity')).CvProfile) {
                return mockCvProfile;
            }

            return mockPreferences;
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchingProcessor,
                { provide: EntityManager, useValue: mockEm },
                { provide: getQueueToken('generation'), useValue: mockGenerationQueue },
            ],
        }).compile();

        processor = module.get<MatchingProcessor>(MatchingProcessor);
    });

    it('creates JobApplication with matched=true and enqueues to generation', async () => {
        const { generateObject } = await import('ai');
        vi.mocked(generateObject).mockResolvedValue({
            object: { match: true, score: 85, rationale: 'Great fit' },
        } as Awaited<ReturnType<typeof generateObject>>);

        const job = { data: { listingId: 'listing-1' } } as Job<MatchingJobPayload>;
        await processor.handle(job);

        expect(mockForkedEm.create).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ matched: true, matchScore: 85 }),
        );
        expect(mockForkedEm.persistAndFlush).toHaveBeenCalled();
        expect(mockGenerationQueue.add).toHaveBeenCalledWith({ applicationId: 'app-1' });
    });

    it('creates JobApplication with matched=false and skips generation queue', async () => {
        const { generateObject } = await import('ai');
        vi.mocked(generateObject).mockResolvedValue({
            object: { match: false, score: 20, rationale: 'Not a good fit' },
        } as Awaited<ReturnType<typeof generateObject>>);

        const job = { data: { listingId: 'listing-1' } } as Job<MatchingJobPayload>;
        await processor.handle(job);

        expect(mockForkedEm.create).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ matched: false, matchScore: 20 }),
        );
        expect(mockGenerationQueue.add).not.toHaveBeenCalled();
    });

    it('includes Finnish language instruction when source.language is fi', async () => {
        const { generateObject } = await import('ai');
        vi.mocked(generateObject).mockResolvedValue({
            object: { match: true, score: 90, rationale: 'Perfect' },
        } as Awaited<ReturnType<typeof generateObject>>);

        mockForkedEm.findOneOrFail.mockResolvedValue({
            ...mockListing,
            source: { user: { id: 'user-1' }, language: 'fi' },
        });

        const job = { data: { listingId: 'listing-1' } } as Job<MatchingJobPayload>;
        await processor.handle(job);

        const callArgs = vi.mocked(generateObject).mock.calls[0][0] as { prompt: string };
        expect(callArgs.prompt).toContain('Respond in Finnish.');
    });

    it('includes English language instruction when source.language is en', async () => {
        const { generateObject } = await import('ai');
        vi.mocked(generateObject).mockResolvedValue({
            object: { match: true, score: 80, rationale: 'Good' },
        } as Awaited<ReturnType<typeof generateObject>>);

        mockForkedEm.findOneOrFail.mockResolvedValue({
            ...mockListing,
            source: { user: { id: 'user-1' }, language: 'en' },
        });

        const job = { data: { listingId: 'listing-1' } } as Job<MatchingJobPayload>;
        await processor.handle(job);

        const callArgs = vi.mocked(generateObject).mock.calls[0][0] as { prompt: string };
        expect(callArgs.prompt).toContain('Respond in English.');
    });
});
