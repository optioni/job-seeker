import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { CvProfile } from '../entities/cv-profile.entity';
import { WorkExperience } from '../entities/work-experience.entity';
import { Education } from '../entities/education.entity';
import { Skill } from '../entities/skill.entity';
import { Language } from '../entities/language.entity';
import { Certification } from '../entities/certification.entity';
import { Project } from '../entities/project.entity';

@Injectable()
export class CvService {
    constructor(
        @InjectRepository(CvProfile)
        private readonly cvProfileRepo: EntityRepository<CvProfile>,
        @InjectRepository(WorkExperience)
        private readonly workExperienceRepo: EntityRepository<WorkExperience>,
        @InjectRepository(Education)
        private readonly educationRepo: EntityRepository<Education>,
        @InjectRepository(Skill)
        private readonly skillRepo: EntityRepository<Skill>,
        @InjectRepository(Language)
        private readonly languageRepo: EntityRepository<Language>,
        @InjectRepository(Certification)
        private readonly certificationRepo: EntityRepository<Certification>,
        @InjectRepository(Project)
        private readonly projectRepo: EntityRepository<Project>,
        private readonly em: EntityManager,
    ) {}

    async getProfile(userId: string): Promise<CvProfile | null> {
        return this.cvProfileRepo.findOne(
            { user: userId },
            { populate: ['workExperiences', 'educations', 'skills', 'languages', 'certifications', 'projects'] },
        );
    }

    async createProfile(userId: string, data: Partial<CvProfile>): Promise<CvProfile> {
        const profile = this.cvProfileRepo.create({ ...data, user: userId } as CvProfile);
        await this.em.persistAndFlush(profile);
        return profile;
    }

    async updateProfile(userId: string, profileId: string, data: Partial<CvProfile>): Promise<CvProfile> {
        const profile = await this.cvProfileRepo.findOne({ id: profileId });
        if (!profile || profile.user.id !== userId) {
            throw new NotFoundException('CV profile not found');
        }
        this.cvProfileRepo.assign(profile, data);
        await this.em.flush();
        return profile;
    }

    // WorkExperience

    async findAllWorkExperiences(userId: string, profileId: string): Promise<WorkExperience[]> {
        await this.requireProfileOwnership(userId, profileId);
        return this.workExperienceRepo.find({ cvProfile: profileId });
    }

    async createWorkExperience(userId: string, profileId: string, data: Partial<WorkExperience>): Promise<WorkExperience> {
        await this.requireProfileOwnership(userId, profileId);
        const entity = this.workExperienceRepo.create({ ...data, cvProfile: profileId } as WorkExperience);
        await this.em.persistAndFlush(entity);
        return entity;
    }

    async updateWorkExperience(userId: string, id: string, data: Partial<WorkExperience>): Promise<WorkExperience> {
        const entity = await this.workExperienceRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Work experience not found');
        }
        this.workExperienceRepo.assign(entity, data);
        await this.em.flush();
        return entity;
    }

    async removeWorkExperience(userId: string, id: string): Promise<void> {
        const entity = await this.workExperienceRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Work experience not found');
        }
        await this.em.removeAndFlush(entity);
    }

    // Education

    async findAllEducations(userId: string, profileId: string): Promise<Education[]> {
        await this.requireProfileOwnership(userId, profileId);
        return this.educationRepo.find({ cvProfile: profileId });
    }

    async createEducation(userId: string, profileId: string, data: Partial<Education>): Promise<Education> {
        await this.requireProfileOwnership(userId, profileId);
        const entity = this.educationRepo.create({ ...data, cvProfile: profileId } as Education);
        await this.em.persistAndFlush(entity);
        return entity;
    }

    async updateEducation(userId: string, id: string, data: Partial<Education>): Promise<Education> {
        const entity = await this.educationRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Education not found');
        }
        this.educationRepo.assign(entity, data);
        await this.em.flush();
        return entity;
    }

    async removeEducation(userId: string, id: string): Promise<void> {
        const entity = await this.educationRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Education not found');
        }
        await this.em.removeAndFlush(entity);
    }

    // Skill

    async findAllSkills(userId: string, profileId: string): Promise<Skill[]> {
        await this.requireProfileOwnership(userId, profileId);
        return this.skillRepo.find({ cvProfile: profileId });
    }

    async createSkill(userId: string, profileId: string, data: Partial<Skill>): Promise<Skill> {
        await this.requireProfileOwnership(userId, profileId);
        const entity = this.skillRepo.create({ ...data, cvProfile: profileId } as Skill);
        await this.em.persistAndFlush(entity);
        return entity;
    }

    async updateSkill(userId: string, id: string, data: Partial<Skill>): Promise<Skill> {
        const entity = await this.skillRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Skill not found');
        }
        this.skillRepo.assign(entity, data);
        await this.em.flush();
        return entity;
    }

    async removeSkill(userId: string, id: string): Promise<void> {
        const entity = await this.skillRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Skill not found');
        }
        await this.em.removeAndFlush(entity);
    }

    // Language

    async findAllLanguages(userId: string, profileId: string): Promise<Language[]> {
        await this.requireProfileOwnership(userId, profileId);
        return this.languageRepo.find({ cvProfile: profileId });
    }

    async createLanguage(userId: string, profileId: string, data: Partial<Language>): Promise<Language> {
        await this.requireProfileOwnership(userId, profileId);
        const entity = this.languageRepo.create({ ...data, cvProfile: profileId } as Language);
        await this.em.persistAndFlush(entity);
        return entity;
    }

    async updateLanguage(userId: string, id: string, data: Partial<Language>): Promise<Language> {
        const entity = await this.languageRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Language not found');
        }
        this.languageRepo.assign(entity, data);
        await this.em.flush();
        return entity;
    }

    async removeLanguage(userId: string, id: string): Promise<void> {
        const entity = await this.languageRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Language not found');
        }
        await this.em.removeAndFlush(entity);
    }

    // Certification

    async findAllCertifications(userId: string, profileId: string): Promise<Certification[]> {
        await this.requireProfileOwnership(userId, profileId);
        return this.certificationRepo.find({ cvProfile: profileId });
    }

    async createCertification(userId: string, profileId: string, data: Partial<Certification>): Promise<Certification> {
        await this.requireProfileOwnership(userId, profileId);
        const entity = this.certificationRepo.create({ ...data, cvProfile: profileId } as Certification);
        await this.em.persistAndFlush(entity);
        return entity;
    }

    async updateCertification(userId: string, id: string, data: Partial<Certification>): Promise<Certification> {
        const entity = await this.certificationRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Certification not found');
        }
        this.certificationRepo.assign(entity, data);
        await this.em.flush();
        return entity;
    }

    async removeCertification(userId: string, id: string): Promise<void> {
        const entity = await this.certificationRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Certification not found');
        }
        await this.em.removeAndFlush(entity);
    }

    // Project

    async findAllProjects(userId: string, profileId: string): Promise<Project[]> {
        await this.requireProfileOwnership(userId, profileId);
        return this.projectRepo.find({ cvProfile: profileId });
    }

    async createProject(userId: string, profileId: string, data: Partial<Project>): Promise<Project> {
        await this.requireProfileOwnership(userId, profileId);
        const entity = this.projectRepo.create({ ...data, cvProfile: profileId } as Project);
        await this.em.persistAndFlush(entity);
        return entity;
    }

    async updateProject(userId: string, id: string, data: Partial<Project>): Promise<Project> {
        const entity = await this.projectRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Project not found');
        }
        this.projectRepo.assign(entity, data);
        await this.em.flush();
        return entity;
    }

    async removeProject(userId: string, id: string): Promise<void> {
        const entity = await this.projectRepo.findOne({ id }, { populate: ['cvProfile.user'] });
        if (!entity || entity.cvProfile.user.id !== userId) {
            throw new NotFoundException('Project not found');
        }
        await this.em.removeAndFlush(entity);
    }

    // Helpers

    private async requireProfileOwnership(userId: string, profileId: string): Promise<CvProfile> {
        const profile = await this.cvProfileRepo.findOne({ id: profileId }, { populate: ['user'] });
        if (!profile || profile.user.id !== userId) {
            throw new NotFoundException('CV profile not found');
        }
        return profile;
    }
}
