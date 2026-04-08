import { type GenerationJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { getQueueToken } from '@nestjs/bull';
import { Test, type TestingModule } from '@nestjs/testing';
import { type Job } from 'bull';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { GenerationProcessor } from './generation.processor';

vi.mock('ai', () => ({
    generateObject: vi.fn(),
    generateText: vi.fn(),
}));

vi.mock('@ai-sdk/anthropic', () => ({
    anthropic: vi.fn().mockReturnValue('mock-model'),
}));

const tailoredCvObject = {
    personalInfo: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    summary: 'Experienced developer',
    workExperiences: [],
    educations: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
};

const mockApplication = {
    id: 'app-1',
    listing: {
        title: 'Senior Developer',
        company: 'Acme Corp',
        description: 'A great job',
        source: {
            user: { id: 'user-1' },
            language: null,
        },
    },
    tailoredCvSnapshot: null as Record<string, unknown> | null,
    coverLetterText: null as string | null,
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

const mockForkedEm = {
    findOneOrFail: vi.fn(),
    findOne: vi.fn().mockResolvedValue(null),
    flush: vi.fn(),
};

const mockEm = {
    fork: vi.fn().mockReturnValue(mockForkedEm),
};

const mockDocumentQueue = {
    add: vi.fn(),
};

describe('GenerationProcessor', () => {
    let processor: GenerationProcessor;
    let currentApplication: typeof mockApplication;

    beforeEach(async () => {
        vi.clearAllMocks();
        currentApplication = { ...mockApplication, tailoredCvSnapshot: null, coverLetterText: null };

        mockForkedEm.findOneOrFail.mockImplementation(async () => {
            if (mockForkedEm.findOneOrFail.mock.calls.length === 1) {
                return currentApplication;
            }

            return mockCvProfile;
        });

        // First call returns application, second call returns CV profile
        let callCount = 0;
        mockForkedEm.findOneOrFail.mockImplementation(async () => {
            callCount++;
            return callCount === 1 ? currentApplication : mockCvProfile;
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GenerationProcessor,
                { provide: EntityManager, useValue: mockEm },
                { provide: getQueueToken('document'), useValue: mockDocumentQueue },
            ],
        }).compile();

        processor = module.get<GenerationProcessor>(GenerationProcessor);
    });

    it('sets tailoredCvSnapshot on the application', async () => {
        const { generateObject, generateText } = await import('ai');
        vi.mocked(generateObject).mockResolvedValue({
            object: tailoredCvObject,
        } as Awaited<ReturnType<typeof generateObject>>);
        vi.mocked(generateText).mockResolvedValue({
            text: 'Dear Hiring Manager...',
        } as Awaited<ReturnType<typeof generateText>>);

        const job = { data: { applicationId: 'app-1' } } as Job<GenerationJobPayload>;
        await processor.handle(job);

        expect(currentApplication.tailoredCvSnapshot).toEqual(tailoredCvObject);
    });

    it('sets coverLetterText on the application', async () => {
        const { generateObject, generateText } = await import('ai');
        vi.mocked(generateObject).mockResolvedValue({
            object: tailoredCvObject,
        } as Awaited<ReturnType<typeof generateObject>>);
        vi.mocked(generateText).mockResolvedValue({
            text: 'Dear Hiring Manager, I am writing to apply...',
        } as Awaited<ReturnType<typeof generateText>>);

        const job = { data: { applicationId: 'app-1' } } as Job<GenerationJobPayload>;
        await processor.handle(job);

        expect(currentApplication.coverLetterText).toBe('Dear Hiring Manager, I am writing to apply...');
    });

    it('enqueues to document queue after both LLM calls succeed', async () => {
        const { generateObject, generateText } = await import('ai');
        vi.mocked(generateObject).mockResolvedValue({
            object: tailoredCvObject,
        } as Awaited<ReturnType<typeof generateObject>>);
        vi.mocked(generateText).mockResolvedValue({
            text: 'Cover letter text',
        } as Awaited<ReturnType<typeof generateText>>);

        const job = { data: { applicationId: 'app-1' } } as Job<GenerationJobPayload>;
        await processor.handle(job);

        expect(mockDocumentQueue.add).toHaveBeenCalledWith({ applicationId: 'app-1' });
    });

    it('calls generateObject and generateText', async () => {
        const { generateObject, generateText } = await import('ai');
        vi.mocked(generateObject).mockResolvedValue({
            object: tailoredCvObject,
        } as Awaited<ReturnType<typeof generateObject>>);
        vi.mocked(generateText).mockResolvedValue({
            text: 'Letter',
        } as Awaited<ReturnType<typeof generateText>>);

        const job = { data: { applicationId: 'app-1' } } as Job<GenerationJobPayload>;
        await processor.handle(job);

        expect(generateObject).toHaveBeenCalledTimes(1);
        expect(generateText).toHaveBeenCalledTimes(1);
    });
});
