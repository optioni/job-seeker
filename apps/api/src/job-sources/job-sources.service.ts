import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { JobSourcePreset } from '../entities/job-source-preset.entity';
import { JobSource } from '../entities/job-source.entity';

export interface CreateJobSourceDto {
    presetId: string;
    label: string;
    filters: Record<string, string>;
    language?: 'fi' | 'en';
    pollingInterval: number;
    active?: boolean;
}

export interface UpdateJobSourceDto {
    label?: string;
    filters?: Record<string, string>;
    language?: 'fi' | 'en';
    pollingInterval?: number;
    active?: boolean;
}

@Injectable()
export class JobSourcesService {
    constructor(
        @InjectRepository(JobSourcePreset)
        private readonly presetRepo: EntityRepository<JobSourcePreset>,
        @InjectRepository(JobSource)
        private readonly sourceRepo: EntityRepository<JobSource>,
        private readonly em: EntityManager,
    ) {}

    async listPresets(): Promise<JobSourcePreset[]> {
        return this.presetRepo.findAll();
    }

    async getPreset(id: string): Promise<JobSourcePreset> {
        const preset = await this.presetRepo.findOne({ id });
        if (!preset) {
            throw new NotFoundException('Job source preset not found');
        }
        return preset;
    }

    async listSources(userId: string): Promise<JobSource[]> {
        return this.sourceRepo.find({ user: userId }, { populate: ['preset'] });
    }

    async createSource(userId: string, data: CreateJobSourceDto): Promise<JobSource> {
        const preset = await this.presetRepo.findOne({ id: data.presetId });
        if (!preset) {
            throw new NotFoundException('Job source preset not found');
        }
        this.validateFilterKeys(preset, data.filters);
        const source = this.sourceRepo.create({
            user: userId,
            preset,
            label: data.label,
            filters: data.filters,
            language: data.language,
            pollingInterval: data.pollingInterval,
            active: data.active ?? true,
        } as unknown as JobSource);
        await this.em.persistAndFlush(source);
        return source;
    }

    async updateSource(userId: string, id: string, data: UpdateJobSourceDto): Promise<JobSource> {
        const source = await this.sourceRepo.findOne({ id }, { populate: ['user', 'preset'] });
        if (!source || source.user.id !== userId) {
            throw new NotFoundException('Job source not found');
        }
        if (data.filters !== undefined) {
            this.validateFilterKeys(source.preset, data.filters);
        }
        this.sourceRepo.assign(source, data);
        await this.em.flush();
        return source;
    }

    async removeSource(userId: string, id: string): Promise<void> {
        const source = await this.sourceRepo.findOne({ id }, { populate: ['user'] });
        if (!source || source.user.id !== userId) {
            throw new NotFoundException('Job source not found');
        }
        await this.em.removeAndFlush(source);
    }

    private validateFilterKeys(preset: JobSourcePreset, filters: Record<string, string>): void {
        const validKeys = Object.keys(preset.filterConfig);
        const invalidKeys = Object.keys(filters).filter((k) => !validKeys.includes(k));
        if (invalidKeys.length > 0) {
            throw new UnprocessableEntityException(`Invalid filter keys: ${invalidKeys.join(', ')}`);
        }
    }
}
