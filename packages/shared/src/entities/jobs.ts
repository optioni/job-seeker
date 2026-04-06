import type { CvProfile } from './cv.js';

export interface JobPreferences {
    id: string;
    userId: string;
    locations: string[];
    jobType?: 'full-time' | 'part-time' | 'contract';
    targetRole?: string;
    seniority?: string;
    salaryMin?: number;
    salaryMax?: number;
    desiredIndustries?: string[];
    excludedIndustries?: string[];
    defaultLanguage: 'fi' | 'en';
}

export interface JobSourcePreset {
    id: string;
    name: string;
    baseUrl: string;
    filterConfig: Record<string, string>;
    defaultLanguage: 'fi' | 'en';
    defaultPollingInterval: number;
}

export interface JobSource {
    id: string;
    userId: string;
    presetId: string;
    label: string;
    filters: Record<string, string>;
    language?: 'fi' | 'en';
    pollingInterval: number;
    active: boolean;
    createdAt: string;
}

export interface JobListing {
    id: string;
    sourceId: string;
    externalId: string;
    url: string;
    title: string;
    company: string;
    description: string;
    scrapedAt: string;
    publishedAt?: string;
}

export interface JobApplication {
    id: string;
    listingId: string;
    matched: boolean;
    matchScore?: number;
    matchRationale?: string;
    tailoredCvSnapshot?: CvProfile;
    coverLetterText?: string;
    emailedAt?: string;
    createdAt: string;
}
