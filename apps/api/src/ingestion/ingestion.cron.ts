import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EntityManager } from '@mikro-orm/core';
import { JobSource } from '../entities/job-source.entity';
import { JobListing } from '../entities/job-listing.entity';
import { RssAdapter } from './rss.adapter';
import type { IngestionJobPayload } from '@job-seeker/shared';

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
        const sources = await this.em.find(JobSource, { active: true }, { populate: ['preset'] });

        for (const source of sources) {
            try {
                await this.pollSource(source);
            } catch (err) {
                this.logger.error(`Failed to poll source ${source.id}: ${String(err)}`);
            }
        }
    }

    private async pollSource(source: JobSource) {
        const urlParams: Record<string, string> = {};
        for (const [key, value] of Object.entries(source.filters)) {
            const urlKey = source.preset.filterConfig[key];
            if (urlKey) urlParams[urlKey] = value;
        }

        const candidates = await this.rssAdapter.fetchListings(source.preset.baseUrl, urlParams);

        const existing = await this.em.find(JobListing, { source });
        const existingSet = new Set(existing.map(l => `${l.company}|${l.title}`));

        const newCandidates = candidates.filter(
            c => !existingSet.has(`${c.company}|${c.title}`),
        );

        for (const candidate of newCandidates) {
            const payload: IngestionJobPayload = { sourceId: source.id, listing: candidate };
            await this.ingestionQueue.add(payload);
        }

        this.logger.log(`Source ${source.id}: ${newCandidates.length}/${candidates.length} new listings enqueued`);
    }
}
