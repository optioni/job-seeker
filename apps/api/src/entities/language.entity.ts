import { type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

import { CvProfile } from './cv-profile.entity';

@Entity({ tableName: 'languages' })
export class Language {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => CvProfile)
    cvProfile!: Rel<CvProfile>;

    @Property()
    language!: string;

    @Property()
    proficiency!: string;
}
