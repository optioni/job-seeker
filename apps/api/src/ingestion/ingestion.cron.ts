import { type IngestionJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Queue } from 'bull';

import { JobListing } from '../entities/job-listing.entity';
import { JobSourcePreset } from '../entities/job-source-preset.entity';
import { RssAdapter } from './rss.adapter';

@Injectable()
export class IngestionCron {
    private readonly logger = new Logger(IngestionCron.name);

    constructor(
        @InjectQueue('ingestion') private readonly ingestionQueue: Queue,
        private readonly em: EntityManager,
        private readonly rssAdapter: RssAdapter,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async pollAllSources() {
        const presets = await this.em.fork().find(
            JobSourcePreset,
            { jobSources: { active: true } },
        );

        for (const preset of presets) {
            try {
                await this.pollPreset(preset);
            } catch (error) {
                this.logger.error(`Failed to poll preset ${preset.id}: ${String(error)}`);
            }
        }
    }

    private async pollPreset(preset: JobSourcePreset) {
        const em = this.em.fork();
        const candidates = await this.rssAdapter.fetchListings(preset.baseUrl, {});

        const existing = await em.find(JobListing, { preset });
        const existingIds = new Set(existing.map((listing) => listing.externalId));

        const newCandidates = candidates.filter(
            (candidate) => !existingIds.has(candidate.externalId),
        );

        for (const candidate of newCandidates) {
            const payload: IngestionJobPayload = {
                presetId: preset.id,
                listing: {
                    ...candidate,
                    scrapedAt: candidate.scrapedAt.toISOString(),
                    publishedAt: candidate.publishedAt?.toISOString(),
                },
            };
            await this.ingestionQueue.add(payload);
        }

        preset.lastPolledAt = new Date();
        await em.flush();

        this.logger.log(`Preset ${preset.id}: ${newCandidates.length}/${candidates.length} new listings enqueued`);
    }
}
