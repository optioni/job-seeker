import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './user.entity';

@Entity({ tableName: 'job_preferences' })
export class JobPreferences {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @OneToOne(() => User, (user) => user.jobPreferences)
    user!: User;

    @Property({ type: 'json' })
    locations!: string[];

    @Property({ type: 'string', nullable: true })
    jobType?: 'full-time' | 'part-time' | 'contract';

    @Property({ nullable: true })
    targetRole?: string;

    @Property({ nullable: true })
    seniority?: string;

    @Property({ nullable: true, columnType: 'int' })
    salaryMin?: number;

    @Property({ nullable: true, columnType: 'int' })
    salaryMax?: number;

    @Property({ type: 'json', nullable: true })
    desiredIndustries?: string[];

    @Property({ type: 'json', nullable: true })
    excludedIndustries?: string[];

    @Property({ type: 'string', default: 'fi' })
    defaultLanguage: 'fi' | 'en' = 'fi';
}
