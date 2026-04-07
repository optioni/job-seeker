import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EntityManager } from '@mikro-orm/core';
import { HttpService } from '@nestjs/axios';
import { JobApplication } from '../entities/job-application.entity';
import * as nodemailer from 'nodemailer';
import * as FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DigestCron {
    private readonly logger = new Logger(DigestCron.name);
    private readonly cvTemplate: string;
    private readonly coverLetterTemplate: string;

    constructor(
        private readonly em: EntityManager,
        private readonly httpService: HttpService,
    ) {
        const templatesDir = path.join(__dirname, '..', 'document', 'templates');
        this.cvTemplate = fs.readFileSync(path.join(templatesDir, 'cv.html'), 'utf-8');
        this.coverLetterTemplate = fs.readFileSync(path.join(templatesDir, 'cover-letter.html'), 'utf-8');
    }

    @Cron(process.env.DIGEST_CRON ?? '0 8 * * *')
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
            if (!byUser.has(userId)) byUser.set(userId, []);
            byUser.get(userId)!.push(app);
        }

        const gotenbergUrl = process.env.GOTENBERG_URL ?? 'http://gotenberg:3000';
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT ?? '587'),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
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
                        app.coverLetterText.replace(/\n/g, '<br>'),
                    );
                    const coverPdf = await this.htmlToPdf(gotenbergUrl, coverHtml);
                    attachments.push({ filename: `cover-letter-${app.id}.pdf`, content: coverPdf });
                }
            }

            await transporter.sendMail({
                from: process.env.SMTP_FROM,
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
