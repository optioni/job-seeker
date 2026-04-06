import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './user.entity';
import { WorkExperience } from './work-experience.entity';
import { Education } from './education.entity';
import { Skill } from './skill.entity';
import { Language } from './language.entity';
import { Certification } from './certification.entity';
import { Project } from './project.entity';

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
    website?: string;
}

@Entity({ tableName: 'cv_profiles' })
export class CvProfile {
    @PrimaryKey({ type: 'uuid' })
    id: string = crypto.randomUUID();

    @ManyToOne(() => User)
    user!: User;

    @Property({ type: 'json', nullable: true })
    personalInfo?: PersonalInfo;

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
