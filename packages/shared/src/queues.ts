import type { JobListing } from './entities/jobs';

export interface IngestionJobPayload {
    presetId: string;
    listing: Omit<JobListing, 'id' | 'presetId'>;
}

export interface MatchingJobPayload {
    listingId: string;
    jobSourceId: string;
}

export interface GenerationJobPayload {
    applicationId: string;
}

export interface DocumentJobPayload {
    applicationId: string;
}

export interface NotificationJobPayload {
    applicationId: string;
}
