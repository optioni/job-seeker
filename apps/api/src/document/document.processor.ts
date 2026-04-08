import { type DocumentJobPayload, type NotificationJobPayload } from '@job-seeker/shared';
import { EntityManager } from '@mikro-orm/core';
import { HttpService } from '@nestjs/axios';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Job, Queue } from 'bull';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';

import { JobApplication } from '../entities/job-application.entity';

@Processor('document')
export class DocumentProcessor {
    private readonly logger = new Logger(DocumentProcessor.name);

    private readonly cvTemplate: string;

    private readonly coverLetterTemplate: string;

    private readonly gotenbergUrl: string;

    constructor(
        private readonly em: EntityManager,
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
        @InjectQueue('notification') private readonly notificationQueue: Queue,
    ) {
        this.gotenbergUrl = this.config.get<string>('GOTENBERG_URL')!;
        const templatesDirectory = path.join(__dirname, 'templates');
        this.cvTemplate = fs.readFileSync(path.join(templatesDirectory, 'cv.html'), 'utf8');
        this.coverLetterTemplate = fs.readFileSync(path.join(templatesDirectory, 'cover-letter.html'), 'utf8');
    }

    @Process()
    async handle(job: Job<DocumentJobPayload>): Promise<void> {
        const em = this.em.fork();
        const { applicationId } = job.data;

        const application = await em.findOneOrFail(JobApplication, applicationId, {
            populate: ['listing', 'listing.source'] as const,
        });

        const cv = application.tailoredCvSnapshot ?? null;
        const coverLetterText = application.coverLetterText ?? '';

        const cvHtml = this.renderCvTemplate(cv);
        const coverLetterHtml = this.coverLetterTemplate.replace(
            '{{coverLetterText}}',
            coverLetterText,
        );

        const cvPdf = await this.htmlToPdf(this.gotenbergUrl, cvHtml);
        const coverLetterPdf = await this.htmlToPdf(this.gotenbergUrl, coverLetterHtml);

        const payload: NotificationJobPayload = { applicationId: application.id };
        await this.notificationQueue.add(payload, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });

        this.logger.log(
            `Generated PDFs for application ${applicationId}, ${cvPdf.length + coverLetterPdf.length} bytes total`,
        );
    }

    private renderCvTemplate(cv: Record<string, unknown> | null): string {
        if (!cv) {
            return '<html><body><p>No CV data available.</p></body></html>';
        }

        const personal = (cv['personalInfo'] as Record<string, string>) ?? {};
        const workExperiences = (cv['workExperiences'] as Array<Record<string, unknown>>) ?? [];
        const educations = (cv['educations'] as Array<Record<string, string>>) ?? [];
        const skills = (cv['skills'] as Array<Record<string, string>>) ?? [];
        const languages = (cv['languages'] as Array<Record<string, string>>) ?? [];
        const certifications = (cv['certifications'] as Array<Record<string, string>>) ?? [];
        const projects = (cv['projects'] as Array<Record<string, unknown>>) ?? [];

        const workHtml = workExperiences
            .map(
                (workEntry) => `
            <div class="entry">
                <div class="entry-header">
                    <span class="title-company">${String(workEntry['role'] ?? '')} at ${String(workEntry['company'] ?? '')}</span>
                    <span class="dates">${String(workEntry['startDate'] ?? '')} – ${workEntry['current'] ? 'Present' : String(workEntry['endDate'] ?? '')}</span>
                </div>
                <p>${String(workEntry['description'] ?? '')}</p>
                ${workEntry['highlights'] ? `<ul>${(workEntry['highlights'] as string[]).map((highlight) => `<li>${highlight}</li>`).join('')}</ul>` : ''}
            </div>
        `,
            )
            .join('');

        const educationHtml = educations
            .map(
                (education) => `
            <div class="education-entry">
                <div class="degree">${education['degree'] ?? ''} in ${education['field'] ?? ''}</div>
                <div class="institution">${education['institution'] ?? ''}</div>
                <div class="dates">${education['startDate'] ?? ''} – ${education['endDate'] ?? ''}</div>
            </div>
        `,
            )
            .join('');

        const skillsHtml = skills
            .map((skill) => `<span class="skill">${skill['name'] ?? ''}${skill['level'] ? ` (${skill['level']})` : ''}</span>`)
            .join('');

        const languagesHtml = languages
            .map((lang) => `<span class="skill">${lang['language'] ?? ''} — ${lang['proficiency'] ?? ''}</span>`)
            .join('');

        const certsHtml = certifications
            .map(
                (cert) => `<div class="cert-entry"><strong>${cert['name'] ?? ''}</strong> — ${cert['issuer'] ?? ''} (${cert['date'] ?? ''})</div>`,
            )
            .join('');

        const projectsHtml = projects
            .map(
                (project) => `
            <div class="project-entry">
                <span class="project-name">${String(project['name'] ?? '')}</span>${project['url'] ? ` — <a href="${String(project['url'])}">${String(project['url'])}</a>` : ''}
                <p>${String(project['description'] ?? '')}</p>
                ${project['technologies'] ? `<p class="tech">Technologies: ${(project['technologies'] as string[]).join(', ')}</p>` : ''}
            </div>
        `,
            )
            .join('');

        return this.cvTemplate
            .replace('{{firstName}}', personal['firstName'] ?? '')
            .replace('{{lastName}}', personal['lastName'] ?? '')
            .replace('{{email}}', personal['email'] ?? '')
            .replace('{{phone}}', personal['phone'] ?? '')
            .replace('{{location}}', personal['location'] ?? '')
            .replace('{{linkedIn}}', personal['linkedIn'] ?? '')
            .replace('{{github}}', personal['github'] ?? '')
            .replace('{{summary}}', String(cv['summary'] ?? ''))
            .replace('{{workExperiencesHtml}}', workHtml)
            .replace('{{educationsHtml}}', educationHtml)
            .replace('{{skillsHtml}}', skillsHtml)
            .replace('{{languagesHtml}}', languagesHtml)
            .replace('{{certificationsHtml}}', certsHtml)
            .replace('{{projectsHtml}}', projectsHtml);
    }

    private async htmlToPdf(gotenbergUrl: string, html: string): Promise<Buffer> {
        const formData = new FormData();
        formData.append('files', Buffer.from(html, 'utf8'), {
            filename: 'index.html',
            contentType: 'text/html',
        });

        const response = await firstValueFrom(
            this.httpService.post(
                `${gotenbergUrl}/forms/chromium/convert/html`,
                formData,
                {
                    headers: formData.getHeaders(),
                    responseType: 'arraybuffer',
                },
            ),
        );

        return Buffer.from(response.data as ArrayBuffer);
    }
}
