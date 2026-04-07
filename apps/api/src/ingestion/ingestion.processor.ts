import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JobListing } from '../entities/job-listing.entity';
import { JobSource } from '../entities/job-source.entity';
import type { IngestionJobPayload, MatchingJobPayload } from '@job-seeker/shared';

@Processor('ingestion')
export class IngestionProcessor {
    private readonly logger = new Logger(IngestionProcessor.name);

    constructor(
        private readonly em: EntityManager,
        @InjectQueue('matching') private readonly matchingQueue: Queue,
    ) {}

    @Process()
    async handle(job: Job<IngestionJobPayload>) {
        const { sourceId, listing } = job.data;

        const source = this.em.getReference(JobSource, sourceId);

        const jobListing = this.em.create(JobListing, {
            source,
            externalId: listing.externalId,
            url: listing.url,
            title: listing.title,
            company: listing.company,
            description: listing.description,
            scrapedAt: new Date(listing.scrapedAt),
            publishedAt: listing.publishedAt ? new Date(listing.publishedAt) : undefined,
        });

        await this.em.persistAndFlush(jobListing);

        const payload: MatchingJobPayload = { listingId: jobListing.id };
        await this.matchingQueue.add(payload);

        this.logger.log(`Ingested listing ${jobListing.id}: ${jobListing.title}`);
    }
}
