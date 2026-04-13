import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';

import { JobApplication } from '../entities/job-application.entity';

export interface ApplicationResponseDto {
    id: string
    jobTitle: string
    company: string
    jobUrl: string
    matched: boolean
    matchScore: number | undefined
    matchRationale: string | undefined
    tailoredCvSnapshot: Record<string, unknown> | undefined
    coverLetterText: string | undefined
    emailedAt: Date | undefined
    createdAt: Date
}

@Injectable()
export class ApplicationsService {
    constructor(private readonly em: EntityManager) {}

    async findAll(userId: string): Promise<ApplicationResponseDto[]> {
        const applications = await this.em.find(
            JobApplication,
            { user: userId },
            {
                populate: ['listing'] as const,
                orderBy: { listing: { scrapedAt: 'DESC' } },
            },
        );
        return applications.map((a) => this.toDto(a));
    }

    async findOne(id: string, userId: string): Promise<ApplicationResponseDto> {
        const application = await this.em.findOne(
            JobApplication,
            { id, user: userId },
            {
                populate: ['listing'] as const,
            },
        );

        if (!application) {
            throw new NotFoundException(`Application ${id} not found`);
        }

        return this.toDto(application);
    }

    private toDto(application: JobApplication): ApplicationResponseDto {
        return {
            id: application.id,
            jobTitle: application.listing.title,
            company: application.listing.company,
            jobUrl: application.listing.url,
            matched: application.matched,
            matchScore: application.matchScore,
            matchRationale: application.matchRationale,
            tailoredCvSnapshot: application.tailoredCvSnapshot,
            coverLetterText: application.coverLetterText,
            emailedAt: application.emailedAt,
            createdAt: application.createdAt,
        };
    }
}
