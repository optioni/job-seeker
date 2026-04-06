import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CvProfile } from './cv-profile.entity';

@Entity({ tableName: 'languages' })
export class Language {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => CvProfile)
    cvProfile!: CvProfile;

    @Property()
    language!: string;

    @Property()
    proficiency!: string;
}
