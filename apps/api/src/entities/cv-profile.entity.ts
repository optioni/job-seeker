import { Collection, type Rel } from '@mikro-orm/core';
import {
    Entity, ManyToOne, OneToMany, PrimaryKey, Property,
} from '@mikro-orm/decorators/legacy';

import { Certification } from './certification.entity';
import { Education } from './education.entity';
import { Language } from './language.entity';
import { Project } from './project.entity';
import { Skill } from './skill.entity';
import { User } from './user.entity';
import { WorkExperience } from './work-experience.entity';

export interface PersonalInfo {
    firstName: string
    lastName: string
    email: string
    phone?: string
    location?: string
    linkedIn?: string
    github?: string
    website?: string
}

@Entity({ tableName: 'cv_profiles' })
export class CvProfile {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => User)
    user!: Rel<User>;

    @Property({ type: 'json', nullable: true })
    personalInfo?: Rel<PersonalInfo>;

    @Property({ columnType: 'text', nullable: true })
    summary?: string;

    @OneToMany(() => WorkExperience, (we) => we.cvProfile)
    workExperiences = new Collection<WorkExperience>(this);

    @OneToMany(() => Education, (edu) => edu.cvProfile)
    educations = new Collection<Education>(this);

    @OneToMany(() => Skill, (skill) => skill.cvProfile)
    skills = new Collection<Skill>(this);

    @OneToMany(() => Language, (lang) => lang.cvProfile)
    languages = new Collection<Language>(this);

    @OneToMany(() => Certification, (cert) => cert.cvProfile)
    certifications = new Collection<Certification>(this);

    @OneToMany(() => Project, (proj) => proj.cvProfile)
    projects = new Collection<Project>(this);
}
