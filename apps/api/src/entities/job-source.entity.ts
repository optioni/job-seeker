import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './user.entity';
import { JobSourcePreset } from './job-source-preset.entity';
import { JobListing } from './job-listing.entity';

@Entity({ tableName: 'job_sources' })
export class JobSource {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => JobSourcePreset)
    preset!: JobSourcePreset;

    @Property()
    label!: string;

    @Property({ type: 'json' })
    filters!: Record<string, string>;

    @Property({ type: 'string', nullable: true })
    language?: 'fi' | 'en';

    @Property({ columnType: 'int' })
    pollingInterval!: number;

    @Property({ default: true })
    active: boolean = true;

    @Property()
    createdAt: Date = new Date();

    @OneToMany(() => JobListing, (listing) => listing.source)
    jobListings = new Collection<JobListing>(this);
}
