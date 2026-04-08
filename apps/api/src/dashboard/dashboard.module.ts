import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { JobApplication } from '../entities/job-application.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobApplication]),
    ],
    providers: [DashboardService],
    controllers: [DashboardController],
})
export class DashboardModule {}
