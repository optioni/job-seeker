import { anthropic } from '@ai-sdk/anthropic';
import { type GenerationJobPayload, type MatchingJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { generateObject } from 'ai';
import type { Job, Queue } from 'bull';
import { z } from 'zod';

import { CvProfile } from '../entities/cv-profile.entity';
import { JobApplication } from '../entities/job-application.entity';
import { JobListing } from '../entities/job-listing.entity';
import { JobPreferences } from '../entities/job-preferences.entity';
import { formatCvForMatching } from './format-cv';

const matchSchema = z.object({
    match: z.boolean(),
    score: z.number().min(0).max(100),
    rationale: z.string(),
});

@Processor('matching')
export class MatchingProcessor {
    private readonly logger = new Logger(MatchingProcessor.name);

    constructor(
        private readonly em: EntityManager,
        @InjectQueue('generation') private readonly generationQueue: Queue,
    ) {}

    @Process()
    async handle(job: Job<MatchingJobPayload>) {
        const em = this.em.fork();
        const { listingId } = job.data;

        const listing = await em.findOneOrFail(JobListing, listingId, {
            populate: ['source', 'source.user', 'source.preset'] as const,
        });

        const userId = listing.source.user.id;

        const cvProfile = await em.findOne(
            CvProfile,
            { user: userId },
            { populate: ['workExperiences', 'educations', 'skills', 'languages', 'certifications', 'projects'] as const },
        );

        const preferences = await em.findOne(JobPreferences, { user: userId });

        const language = preferences?.defaultLanguage ?? 'fi';
        const languageInstruction = language === 'fi'
            ? 'Respond in Finnish.'
            : 'Respond in English.';

        const prompt = `
You are evaluating whether a job listing matches a candidate profile.

${languageInstruction}

## Candidate Profile
${cvProfile ? formatCvForMatching(cvProfile) : '(no CV on file)'}

## Job Preferences
${JSON.stringify(preferences, null, 2)}

## Job Listing
Title: ${listing.title}
Company: ${listing.company}
Description: ${listing.description}

Evaluate whether this listing matches the candidate's profile and preferences.
Provide a match decision (true/false), a score from 0-100, and a rationale.
`.trim();

        const { object: result } = await generateObject({
            model: anthropic('claude-haiku-4-5-20251001'),
            schema: matchSchema,
            prompt,
        });

        const application = em.create(JobApplication, {
            listing,
            matched: result.match,
            matchScore: result.score,
            matchRationale: result.rationale,
            createdAt: new Date(),
        });

        em.persist(application);
        await em.flush();

        if (result.match) {
            const payload: GenerationJobPayload = { applicationId: application.id };
            await this.generationQueue.add(payload);
        }

        this.logger.log(`Processed listing ${listingId}: matched=${result.match}, score=${result.score}`);
    }
}
