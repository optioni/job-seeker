import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { JobApplication } from '../entities/job-application.entity';
import { DocumentProcessor } from './document.processor';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobApplication]),
        BullModule.registerQueue({ name: 'document' }),
        BullModule.registerQueue({ name: 'notification' }),
        HttpModule,
    ],
    providers: [DocumentProcessor],
})
export class DocumentModule {}
