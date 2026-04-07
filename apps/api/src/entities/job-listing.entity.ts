import { Entity, ManyToOne, OneToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { JobSource } from './job-source.entity';
import { JobApplication } from './job-application.entity';

@Entity({ tableName: 'job_listings' })
@Unique({ properties: ['source', 'externalId'] })
export class JobListing {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => JobSource)
    source!: JobSource;

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
    application?: JobApplication;
}
