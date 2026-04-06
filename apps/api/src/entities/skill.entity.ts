import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CvProfile } from './cv-profile.entity';

@Entity({ tableName: 'skills' })
export class Skill {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => CvProfile)
    cvProfile!: CvProfile;

    @Property()
    name!: string;

    @Property({ nullable: true })
    level?: string;

    @Property({ nullable: true })
    category?: string;
}
