import { type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

import { CvProfile } from './cv-profile.entity';

@Entity({ tableName: 'work_experiences' })
export class WorkExperience {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => CvProfile)
    cvProfile!: Rel<CvProfile>;

    @Property()
    company!: string;

    @Property()
    role!: string;

    @Property()
    startDate!: string;

    @Property({ nullable: true })
    endDate?: string;

    @Property({ type: 'boolean', nullable: true })
    current?: boolean;

    @Property({ columnType: 'text' })
    description!: string;

    @Property({ type: 'json', nullable: true })
    highlights?: string[];
}
