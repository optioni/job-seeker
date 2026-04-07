import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { JobListing } from './job-listing.entity';

@Entity({ tableName: 'job_applications' })
export class JobApplication {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @OneToOne(() => JobListing, (listing) => listing.application, { owner: true })
    listing!: JobListing;

    @Property()
    matched!: boolean;

    @Property({ nullable: true, columnType: 'int' })
    matchScore?: number;

    @Property({ columnType: 'text', nullable: true })
    matchRationale?: string;

    @Property({ type: 'json', nullable: true })
    tailoredCvSnapshot?: Record<string, unknown>;

    @Property({ columnType: 'text', nullable: true })
    coverLetterText?: string;

    @Property({ nullable: true })
    emailedAt?: Date;

    @Property()
    createdAt: Date = new Date();
}
