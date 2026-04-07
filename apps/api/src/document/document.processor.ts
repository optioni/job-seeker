import { Process, Processor, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { JobApplication } from '../entities/job-application.entity';
import type { DocumentJobPayload, NotificationJobPayload } from '@job-seeker/shared';

@Processor('document')
export class DocumentProcessor {
    private readonly logger = new Logger(DocumentProcessor.name);
    private readonly cvTemplate: string;
    private readonly coverLetterTemplate: string;

    constructor(
        private readonly em: EntityManager,
        private readonly httpService: HttpService,
        @InjectQueue('notification') private readonly notificationQueue: Queue,
    ) {
        const templatesDir = path.join(__dirname, 'templates');
        this.cvTemplate = fs.readFileSync(path.join(templatesDir, 'cv.html'), 'utf-8');
        this.coverLetterTemplate = fs.readFileSync(path.join(templatesDir, 'cover-letter.html'), 'utf-8');
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

        const gotenbergUrl = process.env.GOTENBERG_URL ?? 'http://gotenberg:3000';

        const cvPdf = await this.htmlToPdf(gotenbergUrl, cvHtml);
        const coverLetterPdf = await this.htmlToPdf(gotenbergUrl, coverLetterHtml);

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
        if (!cv) return '<html><body><p>No CV data available.</p></body></html>';

        const personal = (cv['personalInfo'] as Record<string, string>) ?? {};
        const workExperiences = (cv['workExperiences'] as Array<Record<string, unknown>>) ?? [];
        const educations = (cv['educations'] as Array<Record<string, string>>) ?? [];
        const skills = (cv['skills'] as Array<Record<string, string>>) ?? [];
        const languages = (cv['languages'] as Array<Record<string, string>>) ?? [];
        const certifications = (cv['certifications'] as Array<Record<string, string>>) ?? [];
        const projects = (cv['projects'] as Array<Record<string, unknown>>) ?? [];

        const workHtml = workExperiences
            .map(
                (w) => `
            <div class="entry">
                <div class="entry-header">
                    <span class="title-company">${String(w['role'] ?? '')} at ${String(w['company'] ?? '')}</span>
                    <span class="dates">${String(w['startDate'] ?? '')} – ${w['current'] ? 'Present' : String(w['endDate'] ?? '')}</span>
                </div>
                <p>${String(w['description'] ?? '')}</p>
                ${w['highlights'] ? `<ul>${(w['highlights'] as string[]).map((h) => `<li>${h}</li>`).join('')}</ul>` : ''}
            </div>
        `,
            )
            .join('');

        const educationHtml = educations
            .map(
                (e) => `
            <div class="education-entry">
                <div class="degree">${e['degree'] ?? ''} in ${e['field'] ?? ''}</div>
                <div class="institution">${e['institution'] ?? ''}</div>
                <div class="dates">${e['startDate'] ?? ''} – ${e['endDate'] ?? ''}</div>
            </div>
        `,
            )
            .join('');

        const skillsHtml = skills
            .map((s) => `<span class="skill">${s['name'] ?? ''}${s['level'] ? ` (${s['level']})` : ''}</span>`)
            .join('');

        const languagesHtml = languages
            .map((l) => `<span class="skill">${l['language'] ?? ''} — ${l['proficiency'] ?? ''}</span>`)
            .join('');

        const certsHtml = certifications
            .map(
                (c) => `<div class="cert-entry"><strong>${c['name'] ?? ''}</strong> — ${c['issuer'] ?? ''} (${c['date'] ?? ''})</div>`,
            )
            .join('');

        const projectsHtml = projects
            .map(
                (p) => `
            <div class="project-entry">
                <span class="project-name">${String(p['name'] ?? '')}</span>${p['url'] ? ` — <a href="${String(p['url'])}">${String(p['url'])}</a>` : ''}
                <p>${String(p['description'] ?? '')}</p>
                ${p['technologies'] ? `<p class="tech">Technologies: ${(p['technologies'] as string[]).join(', ')}</p>` : ''}
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
        formData.append('files', Buffer.from(html, 'utf-8'), {
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
