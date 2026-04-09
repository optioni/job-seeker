import { Collection, type Rel } from '@mikro-orm/core';
import {
    Entity, ManyToOne, OneToMany, PrimaryKey, Property,
} from '@mikro-orm/decorators/legacy';

import { JobListing } from './job-listing.entity';
import { JobSourcePreset } from './job-source-preset.entity';
import { User } from './user.entity';

@Entity({ tableName: 'job_sources' })
export class JobSource {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => User)
    user!: Rel<User>;

    @ManyToOne(() => JobSourcePreset)
    preset!: Rel<JobSourcePreset>;

    @Property({ nullable: true })
    label?: string;

    @Property({ type: 'json' })
    filters!: Record<string, string>;

    @Property({ type: 'boolean', default: true })
    active: boolean = true;

    @Property()
    createdAt: Date = new Date();

    @OneToMany(() => JobListing, (listing) => listing.source)
    jobListings = new Collection<JobListing>(this);
}
