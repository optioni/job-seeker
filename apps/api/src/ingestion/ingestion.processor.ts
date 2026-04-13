import { type IngestionJobPayload, type MatchingJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job, Queue } from 'bull';

import { JobListing } from '../entities/job-listing.entity';
import { JobSource } from '../entities/job-source.entity';
import { JobSourcePreset } from '../entities/job-source-preset.entity';

function evaluateFilterConfig(listing: JobListing, filterConfig: Record<string, string>): boolean {
    if (Object.keys(filterConfig).length === 0) {
        return true;
    }

    const fields: Record<string, string> = {
        title: listing.title,
        company: listing.company,
        description: listing.description,
    };

    for (const [key, value] of Object.entries(filterConfig)) {
        const fieldValue = fields[key] ?? '';
        if (!fieldValue.toLowerCase().includes(value.toLowerCase())) {
            return false;
        }
    }

    return true;
}

@Processor('ingestion')
export class IngestionProcessor {
    private readonly logger = new Logger(IngestionProcessor.name);

    constructor(
        private readonly em: EntityManager,
        @InjectQueue('matching') private readonly matchingQueue: Queue,
    ) {}

    @Process()
    async handle(job: Job<IngestionJobPayload>) {
        const em = this.em.fork();
        const { presetId, listing } = job.data;

        const preset = em.getReference(JobSourcePreset, presetId);

        const jobListing = em.create(JobListing, {
            preset,
            externalId: listing.externalId,
            url: listing.url,
            title: listing.title,
            company: listing.company,
            description: listing.description,
            scrapedAt: new Date(listing.scrapedAt),
            publishedAt: listing.publishedAt ? new Date(listing.publishedAt) : undefined,
        });

        em.persist(jobListing);
        await em.flush();

        const activeSubscriptions = await em.find(JobSource, { preset, active: true });

        for (const subscription of activeSubscriptions) {
            if (evaluateFilterConfig(jobListing, subscription.filters)) {
                const payload: MatchingJobPayload = {
                    listingId: jobListing.id,
                    jobSourceId: subscription.id,
                };
                await this.matchingQueue.add(payload);
            }
        }

        this.logger.log(`Ingested listing ${jobListing.id}: ${jobListing.title} (fanned out to ${activeSubscriptions.length} subscriptions)`);
    }
}
