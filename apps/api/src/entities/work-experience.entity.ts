import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CvProfile } from './cv-profile.entity';

@Entity({ tableName: 'work_experiences' })
export class WorkExperience {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => CvProfile)
    cvProfile!: CvProfile;

    @Property()
    company!: string;

    @Property()
    role!: string;

    @Property()
    startDate!: string;

    @Property({ nullable: true })
    endDate?: string;

    @Property({ nullable: true })
    current?: boolean;

    @Property({ columnType: 'text' })
    description!: string;

    @Property({ type: 'json', nullable: true })
    highlights?: string[];
}
