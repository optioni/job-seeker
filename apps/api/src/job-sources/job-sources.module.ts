import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JobSourcePreset } from '../entities/job-source-preset.entity';
import { JobSource } from '../entities/job-source.entity';
import { JobSourcesService } from './job-sources.service';
import { JobSourcesController } from './job-sources.controller';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobSourcePreset, JobSource]),
    ],
    providers: [JobSourcesService],
    controllers: [JobSourcesController],
})
export class JobSourcesModule {}
