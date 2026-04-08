import { Controller, Get, Param } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JobApplication } from '../entities/job-application.entity';
import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) {}

    @Get()
    async findAll(
        @CurrentUser() user: { userId: string },
    ): Promise<JobApplication[]> {
        return this.applicationsService.findAll(user.userId);
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: { userId: string },
    ): Promise<JobApplication> {
        return this.applicationsService.findOne(id, user.userId);
    }
}
