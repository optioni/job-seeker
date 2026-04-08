import { type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

import { CvProfile } from './cv-profile.entity';

@Entity({ tableName: 'skills' })
export class Skill {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => CvProfile)
    cvProfile!: Rel<CvProfile>;

    @Property()
    name!: string;

    @Property({ nullable: true })
    level?: string;

    @Property({ nullable: true })
    category?: string;
}
