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

export interface WorkExperience {
    id: string;
    cvProfileId: string;
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
    highlights?: string[];
}

export interface Education {
    id: string;
    cvProfileId: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
}

export interface Skill {
    id: string;
    cvProfileId: string;
    name: string;
    level?: string;
    category?: string;
}

export interface Language {
    id: string;
    cvProfileId: string;
    language: string;
    proficiency: string;
}

export interface Certification {
    id: string;
    cvProfileId: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
}

export interface Project {
    id: string;
    cvProfileId: string;
    name: string;
    description: string;
    url?: string;
    technologies?: string[];
}

export interface CvProfile {
    id: string;
    userId: string;
    personalInfo: PersonalInfo;
    summary: string;
    workExperiences: WorkExperience[];
    educations: Education[];
    skills: Skill[];
    languages: Language[];
    certifications: Certification[];
    projects: Project[];
}
