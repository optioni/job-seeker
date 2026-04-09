import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';

import { JobSourcePreset } from '../entities/job-source-preset.entity';
import { JobSource } from '../entities/job-source.entity';

export interface CreateJobSourceDto {
    presetId: string
    label?: string
    filters: Record<string, string>
    active?: boolean
}

export interface UpdateJobSourceDto {
    label?: string
    filters?: Record<string, string>
    active?: boolean
}

export interface JobSourceResponse {
    id: string
    presetId: string
    presetName: string
    label: string | undefined
    active: boolean
    filters: Record<string, string>
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

    async listSources(userId: string): Promise<JobSourceResponse[]> {
        const sources = await this.sourceRepo.find({ user: userId }, { populate: ['preset'] });
        return sources.map((s) => this.toResponse(s));
    }

    async createSource(userId: string, data: CreateJobSourceDto): Promise<JobSourceResponse> {
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
            active: data.active ?? true,
        } as unknown as JobSource);
        this.em.persist(source);
        await this.em.flush();
        return this.toResponse(source);
    }

    async updateSource(userId: string, id: string, data: UpdateJobSourceDto): Promise<JobSourceResponse> {
        const source = await this.sourceRepo.findOne({ id }, { populate: ['user', 'preset'] });
        if (!source || source.user.id !== userId) {
            throw new NotFoundException('Job source not found');
        }

        if (data.filters !== undefined) {
            this.validateFilterKeys(source.preset, data.filters);
        }

        this.sourceRepo.assign(source, data);
        await this.em.flush();
        return this.toResponse(source);
    }

    async removeSource(userId: string, id: string): Promise<void> {
        const source = await this.sourceRepo.findOne({ id }, { populate: ['user'] });
        if (!source || source.user.id !== userId) {
            throw new NotFoundException('Job source not found');
        }

        this.em.remove(source);
        await this.em.flush();
    }

    private toResponse(source: JobSource): JobSourceResponse {
        return {
            id: source.id,
            presetId: source.preset.id,
            presetName: source.preset.name,
            label: source.label,
            active: source.active,
            filters: source.filters,
        };
    }

    private validateFilterKeys(preset: JobSourcePreset, filters: Record<string, string>): void {
        const validKeys = preset.filterConfig.map((f) => f.key);
        const invalidKeys = Object.keys(filters).filter((key) => !validKeys.includes(key));
        if (invalidKeys.length > 0) {
            throw new UnprocessableEntityException(`Invalid filter keys: ${invalidKeys.join(', ')}`);
        }
    }
}
