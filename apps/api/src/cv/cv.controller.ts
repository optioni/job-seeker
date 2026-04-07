import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { CvProfile } from '../entities/cv-profile.entity';
import { WorkExperience } from '../entities/work-experience.entity';
import { Education } from '../entities/education.entity';
import { Skill } from '../entities/skill.entity';
import { Language } from '../entities/language.entity';
import { Certification } from '../entities/certification.entity';
import { Project } from '../entities/project.entity';

@Controller()
export class CvController {
    constructor(private readonly cvService: CvService) {}

    // Profile

    @Get('cv/profile')
    async getProfile(
        @CurrentUser() user: { userId: string },
    ): Promise<CvProfile | null> {
        return this.cvService.getProfile(user.userId);
    }

    @Post('cv/profile')
    @HttpCode(HttpStatus.CREATED)
    async createProfile(
        @CurrentUser() user: { userId: string },
        @Body() body: Partial<CvProfile>,
    ): Promise<CvProfile> {
        return this.cvService.createProfile(user.userId, body);
    }

    @Patch('cv/profile/:id')
    async updateProfile(
        @CurrentUser() user: { userId: string },
        @Param('id') id: string,
        @Body() body: Partial<CvProfile>,
    ): Promise<CvProfile> {
        return this.cvService.updateProfile(user.userId, id, body);
    }

    // Work Experiences

    @Get('cv/profile/:profileId/work-experiences')
    async listWorkExperiences(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
    ): Promise<WorkExperience[]> {
        return this.cvService.findAllWorkExperiences(user.userId, profileId);
    }

    @Post('cv/profile/:profileId/work-experiences')
    @HttpCode(HttpStatus.CREATED)
    async createWorkExperience(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
        @Body() body: Partial<WorkExperience>,
    ): Promise<WorkExperience> {
        return this.cvService.createWorkExperience(user.userId, profileId, body);
    }

    @Patch('cv/profile/:profileId/work-experiences/:id')
    async updateWorkExperience(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
        @Body() body: Partial<WorkExperience>,
    ): Promise<WorkExperience> {
        return this.cvService.updateWorkExperience(user.userId, id, body);
    }

    @Delete('cv/profile/:profileId/work-experiences/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeWorkExperience(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.cvService.removeWorkExperience(user.userId, id);
    }

    // Educations

    @Get('cv/profile/:profileId/educations')
    async listEducations(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
    ): Promise<Education[]> {
        return this.cvService.findAllEducations(user.userId, profileId);
    }

    @Post('cv/profile/:profileId/educations')
    @HttpCode(HttpStatus.CREATED)
    async createEducation(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
        @Body() body: Partial<Education>,
    ): Promise<Education> {
        return this.cvService.createEducation(user.userId, profileId, body);
    }

    @Patch('cv/profile/:profileId/educations/:id')
    async updateEducation(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
        @Body() body: Partial<Education>,
    ): Promise<Education> {
        return this.cvService.updateEducation(user.userId, id, body);
    }

    @Delete('cv/profile/:profileId/educations/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeEducation(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.cvService.removeEducation(user.userId, id);
    }

    // Skills

    @Get('cv/profile/:profileId/skills')
    async listSkills(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
    ): Promise<Skill[]> {
        return this.cvService.findAllSkills(user.userId, profileId);
    }

    @Post('cv/profile/:profileId/skills')
    @HttpCode(HttpStatus.CREATED)
    async createSkill(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
        @Body() body: Partial<Skill>,
    ): Promise<Skill> {
        return this.cvService.createSkill(user.userId, profileId, body);
    }

    @Patch('cv/profile/:profileId/skills/:id')
    async updateSkill(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
        @Body() body: Partial<Skill>,
    ): Promise<Skill> {
        return this.cvService.updateSkill(user.userId, id, body);
    }

    @Delete('cv/profile/:profileId/skills/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeSkill(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.cvService.removeSkill(user.userId, id);
    }

    // Languages

    @Get('cv/profile/:profileId/languages')
    async listLanguages(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
    ): Promise<Language[]> {
        return this.cvService.findAllLanguages(user.userId, profileId);
    }

    @Post('cv/profile/:profileId/languages')
    @HttpCode(HttpStatus.CREATED)
    async createLanguage(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
        @Body() body: Partial<Language>,
    ): Promise<Language> {
        return this.cvService.createLanguage(user.userId, profileId, body);
    }

    @Patch('cv/profile/:profileId/languages/:id')
    async updateLanguage(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
        @Body() body: Partial<Language>,
    ): Promise<Language> {
        return this.cvService.updateLanguage(user.userId, id, body);
    }

    @Delete('cv/profile/:profileId/languages/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeLanguage(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.cvService.removeLanguage(user.userId, id);
    }

    // Certifications

    @Get('cv/profile/:profileId/certifications')
    async listCertifications(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
    ): Promise<Certification[]> {
        return this.cvService.findAllCertifications(user.userId, profileId);
    }

    @Post('cv/profile/:profileId/certifications')
    @HttpCode(HttpStatus.CREATED)
    async createCertification(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
        @Body() body: Partial<Certification>,
    ): Promise<Certification> {
        return this.cvService.createCertification(user.userId, profileId, body);
    }

    @Patch('cv/profile/:profileId/certifications/:id')
    async updateCertification(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
        @Body() body: Partial<Certification>,
    ): Promise<Certification> {
        return this.cvService.updateCertification(user.userId, id, body);
    }

    @Delete('cv/profile/:profileId/certifications/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeCertification(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.cvService.removeCertification(user.userId, id);
    }

    // Projects

    @Get('cv/profile/:profileId/projects')
    async listProjects(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
    ): Promise<Project[]> {
        return this.cvService.findAllProjects(user.userId, profileId);
    }

    @Post('cv/profile/:profileId/projects')
    @HttpCode(HttpStatus.CREATED)
    async createProject(
        @CurrentUser() user: { userId: string },
        @Param('profileId') profileId: string,
        @Body() body: Partial<Project>,
    ): Promise<Project> {
        return this.cvService.createProject(user.userId, profileId, body);
    }

    @Patch('cv/profile/:profileId/projects/:id')
    async updateProject(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
        @Body() body: Partial<Project>,
    ): Promise<Project> {
        return this.cvService.updateProject(user.userId, id, body);
    }

    @Delete('cv/profile/:profileId/projects/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeProject(
        @CurrentUser() user: { userId: string },
        @Param('profileId') _profileId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.cvService.removeProject(user.userId, id);
    }
}
