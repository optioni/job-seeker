import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JobSourcePreset } from '../entities/job-source-preset.entity';
import { JobSource } from '../entities/job-source.entity';
import type { CreateJobSourceDto, UpdateJobSourceDto } from './job-sources.service';
import { JobSourcesService } from './job-sources.service';

@Controller()
export class JobSourcesController {
    constructor(private readonly jobSourcesService: JobSourcesService) {}

    // Presets (read-only)

    @Get('job-source-presets')
    async listPresets(): Promise<JobSourcePreset[]> {
        return this.jobSourcesService.listPresets();
    }

    @Get('job-source-presets/:id')
    async getPreset(@Param('id') id: string): Promise<JobSourcePreset> {
        return this.jobSourcesService.getPreset(id);
    }

    // Sources

    @Get('job-sources')
    async listSources(
        @CurrentUser() user: { userId: string },
    ): Promise<JobSource[]> {
        return this.jobSourcesService.listSources(user.userId);
    }

    @Post('job-sources')
    @HttpCode(HttpStatus.CREATED)
    async createSource(
        @CurrentUser() user: { userId: string },
        @Body() body: CreateJobSourceDto,
    ): Promise<JobSource> {
        return this.jobSourcesService.createSource(user.userId, body);
    }

    @Patch('job-sources/:id')
    async updateSource(
        @CurrentUser() user: { userId: string },
        @Param('id') id: string,
        @Body() body: UpdateJobSourceDto,
    ): Promise<JobSource> {
        return this.jobSourcesService.updateSource(user.userId, id, body);
    }

    @Delete('job-sources/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeSource(
        @CurrentUser() user: { userId: string },
        @Param('id') id: string,
    ): Promise<void> {
        return this.jobSourcesService.removeSource(user.userId, id);
    }
}
