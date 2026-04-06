import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CvProfile } from './cv-profile.entity';

@Entity({ tableName: 'educations' })
export class Education {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => CvProfile)
    cvProfile!: CvProfile;

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

    @Property({ nullable: true })
    current?: boolean;
}
