import type { JobListing } from './entities/jobs';

export interface IngestionJobPayload {
    sourceId: string;
    listing: Omit<JobListing, 'id'>;
}

export interface MatchingJobPayload {
    listingId: string;
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
