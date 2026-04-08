import { type NotificationJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

@Processor('notification')
export class NotificationProcessor {
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(private readonly em: EntityManager) {}

    @Process()
    async handle(job: Job<NotificationJobPayload>) {
        const em = this.em.fork();
        // fork available for future use
        void em;
        const { applicationId } = job.data;
        this.logger.log(`Notification queued for application ${applicationId}`);
        // Digest cron handles actual email sending
    }
}
