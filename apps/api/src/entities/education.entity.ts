import { type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

import { CvProfile } from './cv-profile.entity';

@Entity({ tableName: 'educations' })
export class Education {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => CvProfile)
    cvProfile!: Rel<CvProfile>;

    @Property()
    institution!: string;

    @Property()
    degree!: string;

    @Property()
    field!: string;

    @Property()
    startDate!: string;

    @Property({ nullable: true })
    endDate?: string;

    @Property({ type: 'boolean', nullable: true })
    current?: boolean;
}
