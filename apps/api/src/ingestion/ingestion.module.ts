import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JobListing } from '../entities/job-listing.entity';
import { JobSource } from '../entities/job-source.entity';
import { JobSourcePreset } from '../entities/job-source-preset.entity';
import { RssAdapter } from './rss.adapter';
import { IngestionCron } from './ingestion.cron';
import { IngestionProcessor } from './ingestion.processor';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobListing, JobSource, JobSourcePreset]),
        BullModule.registerQueue({ name: 'ingestion' }),
        BullModule.registerQueue({ name: 'matching' }),
    ],
    providers: [RssAdapter, IngestionCron, IngestionProcessor],
})
export class IngestionModule {}
