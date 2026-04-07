import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CvProfile } from '../entities/cv-profile.entity';
import { WorkExperience } from '../entities/work-experience.entity';
import { Education } from '../entities/education.entity';
import { Skill } from '../entities/skill.entity';
import { Language } from '../entities/language.entity';
import { Certification } from '../entities/certification.entity';
import { Project } from '../entities/project.entity';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';

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
