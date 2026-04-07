import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JobApplication } from '../entities/job-application.entity';
import { CvProfile } from '../entities/cv-profile.entity';
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
