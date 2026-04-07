import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JobListing } from '../entities/job-listing.entity';
import { JobApplication } from '../entities/job-application.entity';
import { CvProfile } from '../entities/cv-profile.entity';
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
