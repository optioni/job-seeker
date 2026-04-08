import { EntityManager } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';

import { Certification } from '../entities/certification.entity';
import { CvProfile } from '../entities/cv-profile.entity';
import { Education } from '../entities/education.entity';
import { Language } from '../entities/language.entity';
import { Project } from '../entities/project.entity';
import { Skill } from '../entities/skill.entity';
import { WorkExperience } from '../entities/work-experience.entity';
import { CvService } from './cv.service';

const mockProfile = {
    id: 'profile-1',
    user: { id: 'user-1' },
};

const makeRepo = () => ({
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    assign: vi.fn(),
});

const mockEm = {
    persistAndFlush: vi.fn(),
    flush: vi.fn(),
    removeAndFlush: vi.fn(),
};

describe('CvService', () => {
    let service: CvService;
    let cvProfileRepo: ReturnType<typeof makeRepo>;
    let workExperienceRepo: ReturnType<typeof makeRepo>;
    let educationRepo: ReturnType<typeof makeRepo>;
    let skillRepo: ReturnType<typeof makeRepo>;
    let languageRepo: ReturnType<typeof makeRepo>;
    let certificationRepo: ReturnType<typeof makeRepo>;
    let projectRepo: ReturnType<typeof makeRepo>;

    beforeEach(async () => {
        vi.clearAllMocks();
        cvProfileRepo = makeRepo();
        workExperienceRepo = makeRepo();
        educationRepo = makeRepo();
        skillRepo = makeRepo();
        languageRepo = makeRepo();
        certificationRepo = makeRepo();
        projectRepo = makeRepo();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CvService,
                { provide: getRepositoryToken(CvProfile), useValue: cvProfileRepo },
                { provide: getRepositoryToken(WorkExperience), useValue: workExperienceRepo },
                { provide: getRepositoryToken(Education), useValue: educationRepo },
                { provide: getRepositoryToken(Skill), useValue: skillRepo },
                { provide: getRepositoryToken(Language), useValue: languageRepo },
                { provide: getRepositoryToken(Certification), useValue: certificationRepo },
                { provide: getRepositoryToken(Project), useValue: projectRepo },
                { provide: EntityManager, useValue: mockEm },
            ],
        }).compile();

        service = module.get<CvService>(CvService);
    });

    describe('createProfile', () => {
        it('persists and returns a new profile', async () => {
            const newProfile = { id: 'profile-new', user: { id: 'user-1' } };
            cvProfileRepo.create.mockReturnValue(newProfile);

            const result = await service.createProfile('user-1', {});

            expect(cvProfileRepo.create).toHaveBeenCalledWith(expect.objectContaining({ user: 'user-1' }));
            expect(mockEm.persistAndFlush).toHaveBeenCalledWith(newProfile);
            expect(result).toBe(newProfile);
        });
    });

    describe('updateProfile', () => {
        it('updates and returns the profile', async () => {
            cvProfileRepo.findOne.mockResolvedValue(mockProfile);

            const result = await service.updateProfile('user-1', 'profile-1', { summary: 'Updated' } as Partial<CvProfile>);

            expect(cvProfileRepo.assign).toHaveBeenCalledWith(mockProfile, { summary: 'Updated' });
            expect(mockEm.flush).toHaveBeenCalled();
            expect(result).toBe(mockProfile);
        });

        it('throws NotFoundException when profile not found', async () => {
            cvProfileRepo.findOne.mockResolvedValue(null);

            await expect(service.updateProfile('user-1', 'profile-x', {})).rejects.toThrow(NotFoundException);
        });

        it('throws NotFoundException when user does not own profile', async () => {
            cvProfileRepo.findOne.mockResolvedValue({ id: 'profile-1', user: { id: 'other-user' } });

            await expect(service.updateProfile('user-1', 'profile-1', {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('WorkExperience CRUD', () => {
        const mockWe = { id: 'we-1', cvProfile: { user: { id: 'user-1' } } };

        beforeEach(() => {
            cvProfileRepo.findOne.mockResolvedValue(mockProfile);
        });

        it('creates work experience', async () => {
            workExperienceRepo.create.mockReturnValue(mockWe);

            await service.createWorkExperience('user-1', 'profile-1', { role: 'Dev' } as Partial<WorkExperience>);

            expect(workExperienceRepo.create).toHaveBeenCalled();
            expect(mockEm.persistAndFlush).toHaveBeenCalled();
        });

        it('removes work experience', async () => {
            workExperienceRepo.findOne.mockResolvedValue(mockWe);

            await service.removeWorkExperience('user-1', 'we-1');

            expect(mockEm.removeAndFlush).toHaveBeenCalledWith(mockWe);
        });

        it('throws NotFoundException when removing non-existent work experience', async () => {
            workExperienceRepo.findOne.mockResolvedValue(null);

            await expect(service.removeWorkExperience('user-1', 'we-x')).rejects.toThrow(NotFoundException);
        });
    });

    describe('Education CRUD', () => {
        const mockEdu = { id: 'edu-1', cvProfile: { user: { id: 'user-1' } } };

        beforeEach(() => {
            cvProfileRepo.findOne.mockResolvedValue(mockProfile);
        });

        it('creates education', async () => {
            educationRepo.create.mockReturnValue(mockEdu);

            await service.createEducation('user-1', 'profile-1', { degree: 'BSc' } as Partial<Education>);

            expect(educationRepo.create).toHaveBeenCalled();
            expect(mockEm.persistAndFlush).toHaveBeenCalled();
        });

        it('removes education', async () => {
            educationRepo.findOne.mockResolvedValue(mockEdu);

            await service.removeEducation('user-1', 'edu-1');

            expect(mockEm.removeAndFlush).toHaveBeenCalledWith(mockEdu);
        });
    });

    describe('Skill CRUD', () => {
        const mockSkill = { id: 'skill-1', cvProfile: { user: { id: 'user-1' } } };

        beforeEach(() => {
            cvProfileRepo.findOne.mockResolvedValue(mockProfile);
        });

        it('creates skill', async () => {
            skillRepo.create.mockReturnValue(mockSkill);

            await service.createSkill('user-1', 'profile-1', { name: 'TypeScript' } as Partial<Skill>);

            expect(skillRepo.create).toHaveBeenCalled();
            expect(mockEm.persistAndFlush).toHaveBeenCalled();
        });

        it('removes skill', async () => {
            skillRepo.findOne.mockResolvedValue(mockSkill);

            await service.removeSkill('user-1', 'skill-1');

            expect(mockEm.removeAndFlush).toHaveBeenCalledWith(mockSkill);
        });
    });

    describe('Language CRUD', () => {
        const mockLang = { id: 'lang-1', cvProfile: { user: { id: 'user-1' } } };

        beforeEach(() => {
            cvProfileRepo.findOne.mockResolvedValue(mockProfile);
        });

        it('creates language', async () => {
            languageRepo.create.mockReturnValue(mockLang);

            await service.createLanguage('user-1', 'profile-1', { language: 'Finnish' } as Partial<Language>);

            expect(languageRepo.create).toHaveBeenCalled();
            expect(mockEm.persistAndFlush).toHaveBeenCalled();
        });

        it('removes language', async () => {
            languageRepo.findOne.mockResolvedValue(mockLang);

            await service.removeLanguage('user-1', 'lang-1');

            expect(mockEm.removeAndFlush).toHaveBeenCalledWith(mockLang);
        });
    });

    describe('Certification CRUD', () => {
        const mockCert = { id: 'cert-1', cvProfile: { user: { id: 'user-1' } } };

        beforeEach(() => {
            cvProfileRepo.findOne.mockResolvedValue(mockProfile);
        });

        it('creates certification', async () => {
            certificationRepo.create.mockReturnValue(mockCert);

            await service.createCertification('user-1', 'profile-1', { name: 'AWS' } as Partial<Certification>);

            expect(certificationRepo.create).toHaveBeenCalled();
            expect(mockEm.persistAndFlush).toHaveBeenCalled();
        });

        it('removes certification', async () => {
            certificationRepo.findOne.mockResolvedValue(mockCert);

            await service.removeCertification('user-1', 'cert-1');

            expect(mockEm.removeAndFlush).toHaveBeenCalledWith(mockCert);
        });
    });

    describe('Project CRUD', () => {
        const mockProject = { id: 'proj-1', cvProfile: { user: { id: 'user-1' } } };

        beforeEach(() => {
            cvProfileRepo.findOne.mockResolvedValue(mockProfile);
        });

        it('creates project', async () => {
            projectRepo.create.mockReturnValue(mockProject);

            await service.createProject('user-1', 'profile-1', { name: 'My App' } as Partial<Project>);

            expect(projectRepo.create).toHaveBeenCalled();
            expect(mockEm.persistAndFlush).toHaveBeenCalled();
        });

        it('removes project', async () => {
            projectRepo.findOne.mockResolvedValue(mockProject);

            await service.removeProject('user-1', 'proj-1');

            expect(mockEm.removeAndFlush).toHaveBeenCalledWith(mockProject);
        });
    });
});
