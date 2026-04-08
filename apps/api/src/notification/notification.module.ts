import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { JobApplication } from '../entities/job-application.entity';
import { DigestCron } from './digest.cron';
import { NotificationProcessor } from './notification.processor';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobApplication]),
        BullModule.registerQueue({ name: 'notification' }),
        HttpModule,
    ],
    providers: [NotificationProcessor, DigestCron],
})
export class NotificationModule {}
