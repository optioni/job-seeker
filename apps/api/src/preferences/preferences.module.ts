import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { JobPreferences } from '../entities/job-preferences.entity';
import { PreferencesController } from './preferences.controller';
import { PreferencesService } from './preferences.service';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobPreferences]),
    ],
    providers: [PreferencesService],
    controllers: [PreferencesController],
})
export class PreferencesModule {}
