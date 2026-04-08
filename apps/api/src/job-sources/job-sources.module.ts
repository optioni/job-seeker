import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { JobSourcePreset } from '../entities/job-source-preset.entity';
import { JobSource } from '../entities/job-source.entity';
import { JobSourcesController } from './job-sources.controller';
import { JobSourcesService } from './job-sources.service';

@Module({
    imports: [
        MikroOrmModule.forFeature([JobSourcePreset, JobSource]),
    ],
    providers: [JobSourcesService],
    controllers: [JobSourcesController],
})
export class JobSourcesModule {}
