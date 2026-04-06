import { Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CvProfile } from './cv-profile.entity';
import { JobPreferences } from './job-preferences.entity';
import { JobSource } from './job-source.entity';

@Entity({ tableName: 'users' })
export class User {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @Property({ unique: true })
    email!: string;

    @Property({ hidden: true })
    passwordHash!: string;

    @Property()
    createdAt: Date = new Date();

    @OneToMany(() => CvProfile, (cvProfile) => cvProfile.user)
    cvProfiles = new Collection<CvProfile>(this);

    @OneToOne(() => JobPreferences, (jobPreferences) => jobPreferences.user, { nullable: true })
    jobPreferences?: JobPreferences;

    @OneToMany(() => JobSource, (jobSource) => jobSource.user)
    jobSources = new Collection<JobSource>(this);
}
