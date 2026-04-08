import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { configValidationSchema } from './config';
import { CvModule } from './cv/cv.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DocumentModule } from './document/document.module';
import { GenerationModule } from './generation/generation.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { JobSourcesModule } from './job-sources/job-sources.module';
import { MatchingModule } from './matching/matching.module';
import { NotificationModule } from './notification/notification.module';
import { PreferencesModule } from './preferences/preferences.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: configValidationSchema,
            envFilePath: ['.env', '../../.env'],
        }),
        MikroOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                driver: PostgreSqlDriver,
                host: config.get<string>('DATABASE_HOST'),
                port: config.get<number>('DATABASE_PORT') ?? 5432,
                user: config.get<string>('DATABASE_USER'),
                password: config.get<string>('DATABASE_PASSWORD'),
                dbName: config.get<string>('DATABASE_NAME'),
                autoLoadEntities: true,
                metadataProvider: ReflectMetadataProvider,
            }),
        }),
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                url: config.get<string>('REDIS_URL'),
            }),
        }),
        ScheduleModule.forRoot(),
        AuthModule,
        CvModule,
        PreferencesModule,
        JobSourcesModule,
        IngestionModule,
        MatchingModule,
        GenerationModule,
        DocumentModule,
        NotificationModule,
        ApplicationsModule,
    ],
    providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
})
export class AppModule {}
