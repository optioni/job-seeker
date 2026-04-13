import { Collection } from '@mikro-orm/core';
import { Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

import { JobSource } from './job-source.entity';

export interface FilterConfigField {
    key: string
    label: string
    type: 'text' | 'number'
    required?: boolean
    urlParam: string
}

@Entity({ tableName: 'job_source_presets' })
export class JobSourcePreset {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @Property({ unique: true })
    name!: string;

    @Property()
    baseUrl!: string;

    @Property({ type: 'json' })
    filterConfig!: FilterConfigField[];

    @Property({ type: 'string' })
    defaultLanguage!: 'fi' | 'en';

    @Property({ type: 'timestamptz', nullable: true })
    lastPolledAt?: Date | null;

    @OneToMany(() => JobSource, (jobSource) => jobSource.preset)
    jobSources = new Collection<JobSource>(this);
}
