import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { JobListing } from '../entities/job-listing.entity';
import { JobSourcePreset } from '../entities/job-source-preset.entity';
import { JobSource } from '../entities/job-source.entity';
import { IngestionCron } from './ingestion.cron';
import { IngestionProcessor } from './ingestion.processor';
import { RssAdapter } from './rss.adapter';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobListing, JobSource, JobSourcePreset]),
        BullModule.registerQueue({ name: 'ingestion' }),
        BullModule.registerQueue({ name: 'matching' }),
    ],
    providers: [RssAdapter, IngestionCron, IngestionProcessor],
})
export class IngestionModule {}
