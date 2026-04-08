import { EntityManager } from '@mikro-orm/core';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { of } from 'rxjs';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { JobApplication } from '../entities/job-application.entity';
import { DigestCron } from './digest.cron';

vi.mock('fs', () => ({
    readFileSync: vi.fn().mockReturnValue('<html>{{coverLetterText}} {{firstName}}</html>'),
}));

vi.mock('path', () => ({
    join: vi.fn((...args: string[]) => args.join('/')),
}));

vi.mock('nodemailer', () => ({
    createTransport: vi.fn().mockReturnValue({
        sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
    }),
}));

const pdfBuffer = Buffer.from('pdf-data');

const mockApp1 = {
    id: 'app-1',
    matched: true,
    emailedAt: null as Date | null,
    matchScore: 85,
    matchRationale: 'Great fit',
    tailoredCvSnapshot: {
        personalInfo: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        summary: 'Dev',
        workExperiences: [],
        educations: [],
        skills: [],
        languages: [],
        certifications: [],
        projects: [],
    },
    coverLetterText: 'Dear Hiring Manager...',
    listing: {
        title: 'Senior Developer',
        company: 'Acme Corp',
        url: 'https://example.com/job/1',
        source: {
            user: { id: 'user-1', email: 'user@example.com' },
        },
    },
};

const mockForkedEm = {
    find: vi.fn(),
    flush: vi.fn(),
};

const mockEm = {
    fork: vi.fn().mockReturnValue(mockForkedEm),
};

const mockHttpService = {
    post: vi.fn().mockReturnValue(of({ data: pdfBuffer.buffer })),
};

const mockConfigService = {
    get: vi.fn((key: string) => {
        const config: Record<string, unknown> = {
            GOTENBERG_URL: 'http://gotenberg:3000',
            SMTP_HOST: 'smtp.example.com',
            SMTP_PORT: 587,
            SMTP_USER: 'user',
            SMTP_PASS: 'pass',
            SMTP_FROM: 'noreply@example.com',
        };
        return config[key];
    }),
};

describe('DigestCron', () => {
    let digestCron: DigestCron;
    let sendMailMock: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        vi.clearAllMocks();
        sendMailMock = vi.fn().mockResolvedValue({ messageId: 'test-id' });
        vi.mocked(nodemailer.createTransport).mockReturnValue({
            sendMail: sendMailMock,
        } as unknown as nodemailer.Transporter);
        mockHttpService.post.mockReturnValue(of({ data: pdfBuffer.buffer }));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DigestCron,
                { provide: EntityManager, useValue: mockEm },
                { provide: HttpService, useValue: mockHttpService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        digestCron = module.get<DigestCron>(DigestCron);
    });

    it('sends email with all pending matched applications as attachments', async () => {
        const app = { ...mockApp1, emailedAt: null };
        mockForkedEm.find.mockResolvedValue([app]);

        await digestCron.sendDigest();

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        expect(sendMailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'user@example.com',
                attachments: expect.arrayContaining([
                    expect.objectContaining({ filename: expect.stringContaining('cv-') }),
                    expect.objectContaining({ filename: expect.stringContaining('cover-letter-') }),
                ]),
            }),
        );
    });

    it('sets emailedAt on applications after sending', async () => {
        const app = { ...mockApp1, emailedAt: null };
        mockForkedEm.find.mockResolvedValue([app]);

        await digestCron.sendDigest();

        expect(app.emailedAt).toBeInstanceOf(Date);
        expect(mockForkedEm.flush).toHaveBeenCalled();
    });

    it('does not send email when no pending applications', async () => {
        mockForkedEm.find.mockResolvedValue([]);

        await digestCron.sendDigest();

        expect(sendMailMock).not.toHaveBeenCalled();
    });

    it('queries for matched applications with null emailedAt', async () => {
        mockForkedEm.find.mockResolvedValue([]);

        await digestCron.sendDigest();

        expect(mockForkedEm.find).toHaveBeenCalledWith(
            JobApplication,
            { matched: true, emailedAt: null },
            expect.anything(),
        );
    });
});
