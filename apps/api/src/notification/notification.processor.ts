import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { NotificationJobPayload } from '@job-seeker/shared';

@Processor('notification')
export class NotificationProcessor {
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(private readonly em: EntityManager) {}

    @Process()
    async handle(job: Job<NotificationJobPayload>) {
        const em = this.em.fork();
        void em; // fork available for future use
        const { applicationId } = job.data;
        this.logger.log(`Notification queued for application ${applicationId}`);
        // Digest cron handles actual email sending
    }
}
