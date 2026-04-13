import { EntityManager } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { JobApplication } from '../entities/job-application.entity';
import { ApplicationsService } from './applications.service';

const mockApplication = {
    id: 'app-1',
    matched: true,
    matchScore: 90,
    matchRationale: 'Good fit',
    tailoredCvSnapshot: undefined,
    coverLetterText: undefined,
    emailedAt: undefined,
    createdAt: new Date(),
    listing: {
        title: 'Developer',
        company: 'Acme',
        url: 'https://example.com/job/1',
        scrapedAt: new Date(),
    },
};

const mockEm = {
    find: vi.fn(),
    findOne: vi.fn(),
};

describe('ApplicationsService', () => {
    let service: ApplicationsService;

    beforeEach(async () => {
        vi.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationsService,
                { provide: EntityManager, useValue: mockEm },
            ],
        }).compile();

        service = module.get<ApplicationsService>(ApplicationsService);
    });

    describe('findAll', () => {
        it('queries applications by user and ordered by scrapedAt descending', async () => {
            mockEm.find.mockResolvedValue([mockApplication]);

            const result = await service.findAll('user-1');

            expect(mockEm.find).toHaveBeenCalledWith(
                JobApplication,
                { user: 'user-1' },
                expect.objectContaining({
                    orderBy: { listing: { scrapedAt: 'DESC' } },
                }),
            );
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('app-1');
        });

        it('returns empty array when no applications found', async () => {
            mockEm.find.mockResolvedValue([]);

            const result = await service.findAll('user-1');

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('returns full application detail for the owning user', async () => {
            mockEm.findOne.mockResolvedValue(mockApplication);

            const result = await service.findOne('app-1', 'user-1');

            expect(mockEm.findOne).toHaveBeenCalledWith(
                JobApplication,
                { id: 'app-1', user: 'user-1' },
                expect.anything(),
            );
            expect(result.id).toBe('app-1');
            expect(result.jobTitle).toBe('Developer');
        });

        it('throws NotFoundException when application not found', async () => {
            mockEm.findOne.mockResolvedValue(null);

            await expect(service.findOne('app-x', 'user-1')).rejects.toThrow(NotFoundException);
        });

        it('throws NotFoundException when user does not own the application', async () => {
            // Ownership is enforced by scoping the query to { id, user: userId }.
            // A mis-owned application is indistinguishable from not-found at the query level.
            mockEm.findOne.mockResolvedValue(null);

            await expect(service.findOne('app-1', 'other-user')).rejects.toThrow(NotFoundException);
        });
    });
});
