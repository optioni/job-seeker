import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { CvProfile } from '../entities/cv-profile.entity';
import { JobApplication } from '../entities/job-application.entity';
import { JobPreferences } from '../entities/job-preferences.entity';
import { GenerationProcessor } from './generation.processor';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobApplication, CvProfile, JobPreferences]),
        BullModule.registerQueue({ name: 'generation' }),
        BullModule.registerQueue({ name: 'document' }),
    ],
    providers: [GenerationProcessor],
})
export class GenerationModule {}
