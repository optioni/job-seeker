import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CvProfile } from './cv-profile.entity';

@Entity({ tableName: 'projects' })
export class Project {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => CvProfile)
    cvProfile!: CvProfile;

    @Property()
    name!: string;

    @Property({ columnType: 'text' })
    description!: string;

    @Property({ nullable: true })
    url?: string;

    @Property({ type: 'json', nullable: true })
    technologies?: string[];
}
