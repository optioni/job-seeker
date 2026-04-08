import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { Certification } from '../entities/certification.entity';
import { CvProfile } from '../entities/cv-profile.entity';
import { Education } from '../entities/education.entity';
import { Language } from '../entities/language.entity';
import { Project } from '../entities/project.entity';
import { Skill } from '../entities/skill.entity';
import { WorkExperience } from '../entities/work-experience.entity';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';

@Module({
    imports: [
        MikroOrmModule.forFeature([
            CvProfile,
            WorkExperience,
            Education,
            Skill,
            Language,
            Certification,
            Project,
        ]),
    ],
    providers: [CvService],
    controllers: [CvController],
})
export class CvModule {}
