import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JobPreferences } from '../entities/job-preferences.entity';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobPreferences]),
    ],
    providers: [PreferencesService],
    controllers: [PreferencesController],
})
export class PreferencesModule {}
