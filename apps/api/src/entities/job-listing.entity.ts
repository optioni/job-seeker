import { type Rel } from '@mikro-orm/core';
import {
    Entity, ManyToOne, OneToOne, PrimaryKey, Property, Unique,
} from '@mikro-orm/decorators/legacy';

import { JobApplication } from './job-application.entity';
import { JobSourcePreset } from './job-source-preset.entity';

@Entity({ tableName: 'job_listings' })
@Unique({ properties: ['preset', 'externalId'] })
export class JobListing {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => JobSourcePreset)
    preset!: Rel<JobSourcePreset>;

    @Property()
    externalId!: string;

    @Property({ columnType: 'text' })
    url!: string;

    @Property()
    title!: string;

    @Property()
    company!: string;

    @Property({ columnType: 'text' })
    description!: string;

    @Property()
    scrapedAt!: Date;

    @Property({ nullable: true })
    publishedAt?: Date;

    @OneToOne(() => JobApplication, (application) => application.listing, { nullable: true })
    application?: Rel<JobApplication>;
}
