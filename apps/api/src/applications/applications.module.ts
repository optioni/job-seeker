import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JobApplication } from '../entities/job-application.entity';
import { JobListing } from '../entities/job-listing.entity';
import { JobSource } from '../entities/job-source.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobApplication, JobListing, JobSource]),
    ],
    providers: [ApplicationsService],
    controllers: [ApplicationsController],
})
export class ApplicationsModule {}
