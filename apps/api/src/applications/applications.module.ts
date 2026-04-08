import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { JobApplication } from '../entities/job-application.entity';
import { JobListing } from '../entities/job-listing.entity';
import { JobSource } from '../entities/job-source.entity';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobApplication, JobListing, JobSource]),
    ],
    providers: [ApplicationsService],
    controllers: [ApplicationsController],
})
export class ApplicationsModule {}
