import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        MikroOrmModule.forRoot(),
        BullModule.forRootAsync({
            useFactory: () => ({
                url: process.env.REDIS_URL ?? 'redis://localhost:6379',
            }),
        }),
        ScheduleModule.forRoot(),
        // Feature modules will be added here:
        // AuthModule,
        // CvModule,
        // PreferencesModule,
        // JobSourcesModule,
        // IngestionModule,
        // MatchingModule,
        // GenerationModule,
        // DocumentModule,
        // NotificationModule,
        // ApplicationsModule,
    ],
})
export class AppModule {}
