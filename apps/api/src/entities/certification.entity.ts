import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CvProfile } from './cv-profile.entity';

@Entity({ tableName: 'certifications' })
export class Certification {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => CvProfile)
    cvProfile!: CvProfile;

    @Property()
    name!: string;

    @Property()
    issuer!: string;

    @Property()
    date!: string;

    @Property({ nullable: true })
    url?: string;
}
