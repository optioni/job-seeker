import { type IngestionJobPayload, type MatchingJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job, Queue } from 'bull';

import { JobListing } from '../entities/job-listing.entity';
import { JobSource } from '../entities/job-source.entity';

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
        const { sourceId, listing } = job.data;

        const source = em.getReference(JobSource, sourceId);

        const jobListing = em.create(JobListing, {
            source,
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

        const payload: MatchingJobPayload = { listingId: jobListing.id };
        await this.matchingQueue.add(payload);

        this.logger.log(`Ingested listing ${jobListing.id}: ${jobListing.title}`);
    }
}
