import { Process, Processor, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { generateObject, generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { JobApplication } from '../entities/job-application.entity';
import { CvProfile } from '../entities/cv-profile.entity';
import { JobPreferences } from '../entities/job-preferences.entity';
import type { GenerationJobPayload, DocumentJobPayload } from '@job-seeker/shared';

const cvSchema = z.object({
    personalInfo: z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        phone: z.string().optional(),
        location: z.string().optional(),
        linkedIn: z.string().optional(),
        github: z.string().optional(),
        website: z.string().optional(),
    }),
    summary: z.string(),
    workExperiences: z.array(z.object({
        company: z.string(),
        role: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        description: z.string(),
        highlights: z.array(z.string()).optional(),
    })),
    educations: z.array(z.object({
        institution: z.string(),
        degree: z.string(),
        field: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
    })),
    skills: z.array(z.object({ name: z.string(), level: z.string().optional(), category: z.string().optional() })),
    languages: z.array(z.object({ language: z.string(), proficiency: z.string() })),
    certifications: z.array(z.object({ name: z.string(), issuer: z.string(), date: z.string(), url: z.string().optional() })),
    projects: z.array(z.object({ name: z.string(), description: z.string(), url: z.string().optional(), technologies: z.array(z.string()).optional() })),
});

@Processor('generation')
export class GenerationProcessor {
    private readonly logger = new Logger(GenerationProcessor.name);

    constructor(
        private readonly em: EntityManager,
        @InjectQueue('document') private readonly documentQueue: Queue,
    ) {}

    @Process()
    async handle(job: Job<GenerationJobPayload>) {
        const em = this.em.fork();
        const { applicationId } = job.data;

        const application = await em.findOneOrFail(JobApplication, applicationId, {
            populate: ['listing', 'listing.source', 'listing.source.user'] as const,
        });

        const userId = application.listing.source.user.id;

        const cvProfile = await em.findOneOrFail(
            CvProfile,
            { user: userId },
            { populate: ['workExperiences', 'educations', 'skills', 'languages', 'certifications', 'projects'] as const },
        );

        const preferences = await em.findOne(JobPreferences, { user: userId });

        const language = application.listing.source.language ?? preferences?.defaultLanguage ?? 'fi';
        const languageInstruction = language === 'fi'
            ? 'Write your response in Finnish.'
            : 'Write your response in English.';

        // Call 1: Tailored CV
        const { object: tailoredCv } = await generateObject({
            model: anthropic('claude-haiku-4-5-20251001'),
            schema: cvSchema,
            prompt: `
${languageInstruction}

You are tailoring a CV for a specific job application. Reorder and emphasize the most relevant
experience, skills, and projects for this job.

## Original CV
${JSON.stringify(cvProfile, null, 2)}

## Job Listing
Title: ${application.listing.title}
Company: ${application.listing.company}
Description: ${application.listing.description}

Return a tailored version of the CV as structured JSON.
`.trim(),
        });

        // Call 2: Cover letter (plain text)
        const { text: coverLetterText } = await generateText({
            model: anthropic('claude-haiku-4-5-20251001'),
            prompt: `
${languageInstruction}

Write a professional cover letter for the following job application.

## Tailored CV Summary
${tailoredCv.summary}

## Job Listing
Title: ${application.listing.title}
Company: ${application.listing.company}
Description: ${application.listing.description}

Write only the cover letter text, no subject line or metadata.
`.trim(),
        });

        application.tailoredCvSnapshot = tailoredCv as Record<string, unknown>;
        application.coverLetterText = coverLetterText;
        await em.flush();

        const payload: DocumentJobPayload = { applicationId: application.id };
        await this.documentQueue.add(payload);

        this.logger.log(`Generated CV and cover letter for application ${applicationId}`);
    }
}
