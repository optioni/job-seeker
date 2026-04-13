import { type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, OneToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

import { JobListing } from './job-listing.entity';
import { User } from './user.entity';

@Entity({ tableName: 'job_applications' })
export class JobApplication {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @OneToOne(() => JobListing, (listing) => listing.application, { owner: true })
    listing!: Rel<JobListing>;

    @ManyToOne(() => User, { nullable: true })
    user?: Rel<User>;

    @Property({ type: 'boolean' })
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
