import { type DocumentJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { HttpService } from '@nestjs/axios';
import { getQueueToken } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { type Job } from 'bull';
import { of } from 'rxjs';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { DocumentProcessor } from './document.processor';

vi.mock('fs', () => ({
    readFileSync: vi.fn().mockReturnValue('<html>{{firstName}} {{coverLetterText}}</html>'),
}));

vi.mock('path', () => ({
    join: vi.fn((...args: string[]) => args.join('/')),
}));

const pdfBuffer = Buffer.from('fake-pdf-content');

const mockApplication = {
    id: 'app-1',
    tailoredCvSnapshot: {
        personalInfo: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        summary: 'Developer',
        workExperiences: [],
        educations: [],
        skills: [],
        languages: [],
        certifications: [],
        projects: [],
    },
    coverLetterText: 'Dear Hiring Manager...',
    listing: {
        source: { id: 'source-1' },
    },
};

const mockForkedEm = {
    findOneOrFail: vi.fn().mockResolvedValue(mockApplication),
};

const mockEm = {
    fork: vi.fn().mockReturnValue(mockForkedEm),
};

const mockHttpService = {
    post: vi.fn().mockReturnValue(
        of({ data: pdfBuffer.buffer }),
    ),
};

const mockConfigService = {
    get: vi.fn((key: string) => {
        if (key === 'GOTENBERG_URL') {
            return 'http://gotenberg:3000';
        }

        return null;
    }),
};

const mockNotificationQueue = {
    add: vi.fn(),
};

describe('DocumentProcessor', () => {
    let processor: DocumentProcessor;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockForkedEm.findOneOrFail.mockResolvedValue({ ...mockApplication });
        mockHttpService.post.mockReturnValue(of({ data: pdfBuffer.buffer }));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DocumentProcessor,
                { provide: EntityManager, useValue: mockEm },
                { provide: HttpService, useValue: mockHttpService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: getQueueToken('notification'), useValue: mockNotificationQueue },
            ],
        }).compile();

        processor = module.get<DocumentProcessor>(DocumentProcessor);
    });

    it('calls htmlToPdf twice (once for CV, once for cover letter)', async () => {
        const job = { data: { applicationId: 'app-1' } } as Job<DocumentJobPayload>;
        await processor.handle(job);

        // Two POST calls to Gotenberg: CV and cover letter
        expect(mockHttpService.post).toHaveBeenCalledTimes(2);
        expect(mockHttpService.post).toHaveBeenCalledWith(
            'http://gotenberg:3000/forms/chromium/convert/html',
            expect.anything(),
            expect.anything(),
        );
    });

    it('enqueues to notification queue with application ID', async () => {
        const job = { data: { applicationId: 'app-1' } } as Job<DocumentJobPayload>;
        await processor.handle(job);

        expect(mockNotificationQueue.add).toHaveBeenCalledWith(
            { applicationId: 'app-1' },
            expect.objectContaining({ attempts: 3 }),
        );
    });
});
