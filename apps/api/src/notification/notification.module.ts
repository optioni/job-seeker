import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { JobApplication } from '../entities/job-application.entity';
import { NotificationProcessor } from './notification.processor';
import { DigestCron } from './digest.cron';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobApplication]),
        BullModule.registerQueue({ name: 'notification' }),
        HttpModule,
    ],
    providers: [NotificationProcessor, DigestCron],
})
export class NotificationModule {}
