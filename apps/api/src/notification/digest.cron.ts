import { EntityManager } from '@mikro-orm/core';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import FormData from 'form-data';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';

import { JobApplication } from '../entities/job-application.entity';

@Injectable()
export class DigestCron {
    private readonly logger = new Logger(DigestCron.name);

    private readonly cvTemplate: string;

    private readonly coverLetterTemplate: string;

    constructor(
        private readonly em: EntityManager,
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {
        const templatesDirectory = path.join(__dirname, '..', 'document', 'templates');
        this.cvTemplate = fs.readFileSync(path.join(templatesDirectory, 'cv.html'), 'utf8');
        this.coverLetterTemplate = fs.readFileSync(path.join(templatesDirectory, 'cover-letter.html'), 'utf8');
    }

    @Cron('0 8 * * *')
    async sendDigest() {
        const em = this.em.fork();
        const applications = await em.find(
            JobApplication,
            { matched: true, emailedAt: null },
            { populate: ['listing', 'listing.source', 'listing.source.user'] as const },
        );

        if (applications.length === 0) {
            this.logger.log('No pending matched applications for digest');
            return;
        }

        // Group by user so each user gets their own email
        const byUser = new Map<string, typeof applications>();
        for (const app of applications) {
            const userId = app.listing.source.user.id;
            if (!byUser.has(userId)) {
                byUser.set(userId, []);
            }

            byUser.get(userId)!.push(app);
        }

        const gotenbergUrl = this.config.get<string>('GOTENBERG_URL')!;
        const transporter = nodemailer.createTransport({
            host: this.config.get<string>('SMTP_HOST'),
            port: this.config.get<number>('SMTP_PORT'),
            auth: {
                user: this.config.get<string>('SMTP_USER'),
                pass: this.config.get<string>('SMTP_PASS'),
            },
        });

        for (const [, userApps] of byUser) {
            const recipient = userApps[0].listing.source.user.email;
            const attachments: Array<{ filename: string; content: Buffer }> = [];
            const bodyLines: string[] = [`<h2>Job Application Digest — ${new Date().toDateString()}</h2>`];

            for (const app of userApps) {
                const listing = app.listing;
                bodyLines.push(`
                    <h3>${listing.title} at ${listing.company}</h3>
                    <p>Match score: ${app.matchScore ?? 'N/A'}</p>
                    <p>Rationale: ${app.matchRationale ?? 'N/A'}</p>
                    <p><a href="${listing.url}">View listing</a></p>
                `);

                if (app.tailoredCvSnapshot) {
                    const cvHtml = this.renderCvHtml(app.tailoredCvSnapshot, this.cvTemplate);
                    const cvPdf = await this.htmlToPdf(gotenbergUrl, cvHtml);
                    attachments.push({ filename: `cv-${app.id}.pdf`, content: cvPdf });
                }

                if (app.coverLetterText) {
                    const coverHtml = this.coverLetterTemplate.replace(
                        '{{coverLetterText}}',
                        app.coverLetterText.replaceAll('\n', '<br>'),
                    );
                    const coverPdf = await this.htmlToPdf(gotenbergUrl, coverHtml);
                    attachments.push({ filename: `cover-letter-${app.id}.pdf`, content: coverPdf });
                }
            }

            await transporter.sendMail({
                from: this.config.get<string>('SMTP_FROM'),
                to: recipient,
                subject: `Job Application Digest — ${userApps.length} match(es)`,
                html: bodyLines.join(''),
                attachments,
            });

            for (const app of userApps) {
                app.emailedAt = new Date();
            }

            this.logger.log(`Digest sent: ${userApps.length} applications to ${recipient}`);
        }

        await em.flush();
    }

    private renderCvHtml(cv: Record<string, unknown>, template: string): string {
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

        return template
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
