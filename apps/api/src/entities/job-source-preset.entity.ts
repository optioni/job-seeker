import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { JobSource } from './job-source.entity';

@Entity({ tableName: 'job_source_presets' })
export class JobSourcePreset {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @Property({ unique: true })
    name!: string;

    @Property()
    baseUrl!: string;

    @Property({ type: 'json' })
    filterConfig!: Record<string, string>;

    @Property({ type: 'string' })
    defaultLanguage!: 'fi' | 'en';

    @Property({ columnType: 'int' })
    defaultPollingInterval!: number;

    @OneToMany(() => JobSource, (jobSource) => jobSource.preset)
    jobSources = new Collection<JobSource>(this);
}
