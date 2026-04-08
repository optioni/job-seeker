import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardResponse } from './dashboard.types';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get()
    async getData(
        @CurrentUser() user: { userId: string },
    ): Promise<DashboardResponse> {
        return this.dashboardService.getData(user.userId);
    }
}
