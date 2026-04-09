import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    const config = app.get(ConfigService);
    const frontendUrl = config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
    });
    await app.listen(config.get<number>('PORT')!);
}

bootstrap();
