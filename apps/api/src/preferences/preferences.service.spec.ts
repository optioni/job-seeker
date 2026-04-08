import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test, type TestingModule } from '@nestjs/testing';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { JobPreferences } from '../entities/job-preferences.entity';
import { PreferencesService } from './preferences.service';

const mockEm = {
    persist: vi.fn(),
    flush: vi.fn(),
};

const mockRepo = {
    findOne: vi.fn(),
    create: vi.fn(),
    assign: vi.fn(),
};

describe('PreferencesService', () => {
    let service: PreferencesService;

    beforeEach(async () => {
        vi.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PreferencesService,
                { provide: getRepositoryToken(JobPreferences), useValue: mockRepo },
                { provide: EntityManager, useValue: mockEm },
            ],
        }).compile();

        service = module.get<PreferencesService>(PreferencesService);
    });

    describe('get', () => {
        it('returns preferences for a user', async () => {
            const prefs = { id: 'pref-1', user: { id: 'user-1' } };
            mockRepo.findOne.mockResolvedValue(prefs);

            const result = await service.get('user-1');

            expect(mockRepo.findOne).toHaveBeenCalledWith({ user: 'user-1' });
            expect(result).toBe(prefs);
        });

        it('returns null when preferences not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);

            const result = await service.get('user-1');

            expect(result).toBeNull();
        });
    });

    describe('upsert', () => {
        it('updates existing preferences with partial fields', async () => {
            const existing = {
                id: 'pref-1',
                user: { id: 'user-1' },
                minSalary: 3000,
            };
            mockRepo.findOne.mockResolvedValue(existing);

            const result = await service.upsert('user-1', { minSalary: 5000 } as Partial<JobPreferences>);

            expect(mockRepo.assign).toHaveBeenCalledWith(existing, { minSalary: 5000 });
            expect(mockEm.flush).toHaveBeenCalled();
            expect(result).toBe(existing);
        });

        it('creates preferences when none exist', async () => {
            const newPrefs = { id: 'pref-new', user: { id: 'user-1' } };
            mockRepo.findOne.mockResolvedValue(null);
            mockRepo.create.mockReturnValue(newPrefs);

            const result = await service.upsert('user-1', { minSalary: 4000 } as Partial<JobPreferences>);

            expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ user: 'user-1', minSalary: 4000 }));
            expect(mockEm.persist).toHaveBeenCalledWith(newPrefs);
            expect(mockEm.flush).toHaveBeenCalled();
            expect(result).toBe(newPrefs);
        });
    });
});
