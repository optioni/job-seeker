import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import { JobApplication } from '../entities/job-application.entity';
import { DashboardResponse } from './dashboard.types';

@Injectable()
export class DashboardService {
    constructor(private readonly em: EntityManager) {}

    async getData(userId: string): Promise<DashboardResponse> {
        const now = new Date();
        const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Week boundaries (calendar weeks, Monday start)
        // Mon=0, Sun=6
        const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - dayOfWeek);
        thisWeekStart.setHours(0, 0, 0, 0);

        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(thisWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);

        // New matched applications in last 24h
        const newMatches = await this.em.find(
            JobApplication,
            {
                matched: true,
                createdAt: { $gte: since24h },
                listing: { source: { user: userId } },
            },
            {
                populate: ['listing', 'listing.source'] as const,
                orderBy: { matchScore: 'DESC' },
            },
        );

        const bestMatchApp = newMatches[0] ?? null;
        const otherMatches = newMatches.slice(1, 4);

        // This week stats
        const thisWeekApps = await this.em.find(
            JobApplication,
            {
                createdAt: { $gte: thisWeekStart },
                listing: { source: { user: userId } },
            },
            { populate: ['listing', 'listing.source'] as const },
        );

        const thisWeekMatched = thisWeekApps.filter((a) => a.matched);
        const thisWeekAvgScore
            = thisWeekMatched.length > 0
                ? thisWeekMatched.reduce((sum, a) => sum + (a.matchScore ?? 0), 0) / thisWeekMatched.length
                : 0;
        const thisWeekDigests = thisWeekApps.filter((a) => a.emailedAt !== undefined && a.emailedAt !== null).length;

        // Last week stats
        const lastWeekApps = await this.em.find(
            JobApplication,
            {
                createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd },
                listing: { source: { user: userId } },
            },
            { populate: ['listing', 'listing.source'] as const },
        );

        const lastWeekMatched = lastWeekApps.filter((a) => a.matched);
        const lastWeekAvgScore
            = lastWeekMatched.length > 0
                ? lastWeekMatched.reduce((sum, a) => sum + (a.matchScore ?? 0), 0) / lastWeekMatched.length
                : 0;

        return {
            newMatchesToday: newMatches.length,
            bestMatch: bestMatchApp
                ? {
                    id: bestMatchApp.id,
                    jobTitle: bestMatchApp.listing.title,
                    company: bestMatchApp.listing.company,
                    location: '',
                    matchScore: bestMatchApp.matchScore ?? 0,
                    matchRationale: bestMatchApp.matchRationale ?? '',
                    jobUrl: bestMatchApp.listing.url,
                }
                : null,
            otherNewMatches: otherMatches.map((a) => ({
                id: a.id,
                jobTitle: a.listing.title,
                company: a.listing.company,
                matchScore: a.matchScore ?? 0,
            })),
            thisWeek: {
                evaluated: thisWeekApps.length,
                matched: thisWeekMatched.length,
                avgScore: Math.round(thisWeekAvgScore),
                digestsSent: thisWeekDigests,
            },
            lastWeek: {
                evaluated: lastWeekApps.length,
                matched: lastWeekMatched.length,
                avgScore: Math.round(lastWeekAvgScore),
            },
        };
    }
}
