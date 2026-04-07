import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CvModule } from './cv/cv.module';
import { PreferencesModule } from './preferences/preferences.module';
import { JobSourcesModule } from './job-sources/job-sources.module';

@Module({
    imports: [
        MikroOrmModule.forRoot(),
        BullModule.forRootAsync({
            useFactory: () => ({
                url: process.env.REDIS_URL ?? 'redis://localhost:6379',
            }),
        }),
        ScheduleModule.forRoot(),
        AuthModule,
        CvModule,
        PreferencesModule,
        JobSourcesModule,
        // Feature modules will be added here:
        // IngestionModule,
        // MatchingModule,
        // GenerationModule,
        // DocumentModule,
        // NotificationModule,
        // ApplicationsModule,
    ],
    providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
})
export class AppModule {}
