import type { CvProfile } from './cv';

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
    lastPolledAt: Date | null;
}

export interface JobSource {
    id: string;
    userId: string;
    presetId: string;
    label: string;
    /** Post-ingest listing filter: keys map to listing fields (title, company, description, location).
     *  AND-logic, case-insensitive substring match. Empty object passes all listings. */
    filters: Record<string, string>;
    active: boolean;
    createdAt: string;
}

export interface JobListing {
    id: string;
    presetId: string;
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
    userId?: string;
    matched: boolean;
    matchScore?: number;
    matchRationale?: string;
    tailoredCvSnapshot?: CvProfile;
    coverLetterText?: string;
    emailedAt?: string;
    createdAt: string;
}
