import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { CvProfile } from '../entities/cv-profile.entity';
import { JobApplication } from '../entities/job-application.entity';
import { JobListing } from '../entities/job-listing.entity';
import { JobPreferences } from '../entities/job-preferences.entity';
import { MatchingProcessor } from './matching.processor';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobListing, JobApplication, CvProfile, JobPreferences]),
        BullModule.registerQueue({ name: 'matching' }),
        BullModule.registerQueue({ name: 'generation' }),
    ],
    providers: [MatchingProcessor],
})
export class MatchingModule {}
