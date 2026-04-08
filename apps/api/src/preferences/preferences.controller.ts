import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
} from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JobPreferences } from '../entities/job-preferences.entity';
import { PreferencesService } from './preferences.service';

@Controller('preferences')
export class PreferencesController {
    constructor(private readonly preferencesService: PreferencesService) {}

    @Get()
    async get(
        @CurrentUser() user: { userId: string },
    ): Promise<JobPreferences | null> {
        return this.preferencesService.get(user.userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @CurrentUser() user: { userId: string },
        @Body() body: Partial<JobPreferences>,
    ): Promise<JobPreferences> {
        return this.preferencesService.upsert(user.userId, body);
    }

    @Patch()
    async update(
        @CurrentUser() user: { userId: string },
        @Body() body: Partial<JobPreferences>,
    ): Promise<JobPreferences> {
        return this.preferencesService.upsert(user.userId, body);
    }
}
