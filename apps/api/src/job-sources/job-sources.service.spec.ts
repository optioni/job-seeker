import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { JobSourcePreset } from '../entities/job-source-preset.entity';
import { JobSource } from '../entities/job-source.entity';
import { JobSourcesService } from './job-sources.service';

const mockPreset = {
    id: 'preset-1',
    name: 'TE-palvelut',
    baseUrl: 'https://feeds.te-palvelut.fi/rss',
    filterConfig: { keyword: 'q', location: 'location' },
    defaultLanguage: 'fi',
    defaultPollingInterval: 60,
};

const mockSource = {
    id: 'source-1',
    user: { id: 'user-1' },
    preset: mockPreset,
    label: 'My TE Source',
    active: true,
    filters: { keyword: 'developer' },
};

const mockPresetRepo = {
    findAll: vi.fn(),
    findOne: vi.fn(),
};

const mockSourceRepo = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    assign: vi.fn(),
};

const mockEm = {
    persistAndFlush: vi.fn(),
    flush: vi.fn(),
    removeAndFlush: vi.fn(),
};

describe('JobSourcesService', () => {
    let service: JobSourcesService;

    beforeEach(async () => {
        vi.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobSourcesService,
                { provide: getRepositoryToken(JobSourcePreset), useValue: mockPresetRepo },
                { provide: getRepositoryToken(JobSource), useValue: mockSourceRepo },
                { provide: EntityManager, useValue: mockEm },
            ],
        }).compile();

        service = module.get<JobSourcesService>(JobSourcesService);
    });

    describe('listPresets', () => {
        it('returns all presets', async () => {
            mockPresetRepo.findAll.mockResolvedValue([mockPreset]);

            const result = await service.listPresets();

            expect(result).toEqual([mockPreset]);
        });
    });

    describe('createSource', () => {
        it('creates source with valid filters', async () => {
            mockPresetRepo.findOne.mockResolvedValue(mockPreset);
            mockSourceRepo.create.mockReturnValue(mockSource);

            const result = await service.createSource('user-1', {
                presetId: 'preset-1',
                label: 'My TE Source',
                filters: { keyword: 'developer' },
                pollingInterval: 60,
            });

            expect(mockSourceRepo.create).toHaveBeenCalled();
            expect(mockEm.persistAndFlush).toHaveBeenCalled();
            expect(result).toBe(mockSource);
        });

        it('throws NotFoundException when preset not found', async () => {
            mockPresetRepo.findOne.mockResolvedValue(null);

            await expect(
                service.createSource('user-1', {
                    presetId: 'nonexistent',
                    label: 'Test',
                    filters: {},
                    pollingInterval: 60,
                }),
            ).rejects.toThrow(NotFoundException);
        });

        it('throws UnprocessableEntityException for invalid filter key', async () => {
            mockPresetRepo.findOne.mockResolvedValue(mockPreset);

            await expect(
                service.createSource('user-1', {
                    presetId: 'preset-1',
                    label: 'Test',
                    filters: { invalidKey: 'value' },
                    pollingInterval: 60,
                }),
            ).rejects.toThrow(UnprocessableEntityException);
        });
    });

    describe('updateSource', () => {
        it('toggles active to false', async () => {
            mockSourceRepo.findOne.mockResolvedValue(mockSource);

            await service.updateSource('user-1', 'source-1', { active: false });

            expect(mockSourceRepo.assign).toHaveBeenCalledWith(mockSource, { active: false });
            expect(mockEm.flush).toHaveBeenCalled();
        });

        it('throws NotFoundException when source not found', async () => {
            mockSourceRepo.findOne.mockResolvedValue(null);

            await expect(service.updateSource('user-1', 'source-x', { active: false })).rejects.toThrow(NotFoundException);
        });

        it('throws NotFoundException when user does not own source', async () => {
            mockSourceRepo.findOne.mockResolvedValue({ ...mockSource, user: { id: 'other-user' } });

            await expect(service.updateSource('user-1', 'source-1', { active: false })).rejects.toThrow(NotFoundException);
        });
    });
});
