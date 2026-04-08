import { EntityManager } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';

import { JobApplication } from '../entities/job-application.entity';

@Injectable()
export class ApplicationsService {
    constructor(private readonly em: EntityManager) {}

    async findAll(userId: string): Promise<JobApplication[]> {
        return this.em.find(
            JobApplication,
            { listing: { source: { user: userId } } },
            {
                populate: ['listing', 'listing.source'] as const,
                orderBy: { listing: { scrapedAt: 'DESC' } },
            },
        );
    }

    async findOne(id: string, userId: string): Promise<JobApplication> {
        const application = await this.em.findOne(
            JobApplication,
            { id },
            {
                populate: ['listing', 'listing.source', 'listing.source.user'] as const,
            },
        );

        if (!application) {
            throw new NotFoundException(`Application ${id} not found`);
        }

        if (application.listing.source.user.id !== userId) {
            throw new NotFoundException(`Application ${id} not found`);
        }

        return application;
    }
}
