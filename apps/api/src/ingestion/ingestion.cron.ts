import { type IngestionJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Queue } from 'bull';

import { JobListing } from '../entities/job-listing.entity';
import { JobSource } from '../entities/job-source.entity';
import { RssAdapter } from './rss.adapter';

@Injectable()
export class IngestionCron {
    private readonly logger = new Logger(IngestionCron.name);

    constructor(
        @InjectQueue('ingestion') private readonly ingestionQueue: Queue,
        private readonly em: EntityManager,
        private readonly rssAdapter: RssAdapter,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async pollAllSources() {
        const em = this.em.fork();
        const sources = await em.find(JobSource, { active: true }, { populate: ['preset'] });

        for (const source of sources) {
            try {
                await this.pollSource(source, em);
            } catch (error) {
                this.logger.error(`Failed to poll source ${source.id}: ${String(error)}`);
            }
        }
    }

    private async pollSource(source: JobSource, em: EntityManager) {
        const urlParameters: Record<string, string> = {};
        for (const [key, value] of Object.entries(source.filters ?? {})) {
            const field = source.preset.filterConfig.find((f) => f.key === key);
            if (field) {
                urlParameters[field.urlParam] = value;
            }
        }

        const candidates = await this.rssAdapter.fetchListings(source.preset.baseUrl, urlParameters);

        // eslint-disable-next-line unicorn/no-array-method-this-argument
        const existing = await em.find(JobListing, { source });
        const existingSet = new Set(existing.map((listing) => `${listing.company}|${listing.title}`));

        const newCandidates = candidates.filter(
            (candidate) => !existingSet.has(`${candidate.company}|${candidate.title}`),
        );

        for (const candidate of newCandidates) {
            const payload: IngestionJobPayload = {
                sourceId: source.id,
                listing: {
                    ...candidate,
                    scrapedAt: candidate.scrapedAt.toISOString(),
                    publishedAt: candidate.publishedAt?.toISOString(),
                },
            };
            await this.ingestionQueue.add(payload);
        }

        this.logger.log(`Source ${source.id}: ${newCandidates.length}/${candidates.length} new listings enqueued`);
    }
}
