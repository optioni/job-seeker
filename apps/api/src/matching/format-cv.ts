import { type CvProfile } from '../entities/cv-profile.entity';

export function formatCvForMatching(cvProfile: CvProfile): string {
    const lines: string[] = [];

    // Name / title
    if (cvProfile.personalInfo) {
        const { firstName, lastName } = cvProfile.personalInfo;
        const name = [firstName, lastName].filter(Boolean).join(' ');
        if (name) {
            lines.push(name);
        }
    }

    // Summary
    if (cvProfile.summary) {
        lines.push('');
        lines.push(cvProfile.summary);
    }

    // Work experience
    const workExperiences = cvProfile.workExperiences?.getItems() ?? [];
    if (workExperiences.length > 0) {
        lines.push('');
        lines.push('Experience:');
        for (const we of workExperiences) {
            const end = we.current ? 'present' : (we.endDate ?? 'present');
            let entry = `- ${we.role} at ${we.company} (${we.startDate}–${end}): ${we.description}`;
            if (we.highlights && we.highlights.length > 0) {
                entry += `\n  Highlights: ${we.highlights.join('; ')}`;
            }

            lines.push(entry);
        }
    }

    // Education
    const educations = cvProfile.educations?.getItems() ?? [];
    if (educations.length > 0) {
        lines.push('');
        lines.push('Education:');
        for (const edu of educations) {
            const end = edu.current ? 'present' : (edu.endDate ?? '');
            const range = end ? `${edu.startDate}–${end}` : edu.startDate;
            lines.push(`- ${edu.degree} in ${edu.field}, ${edu.institution} (${range})`);
        }
    }

    // Skills (grouped by category if present)
    const skills = cvProfile.skills?.getItems() ?? [];
    if (skills.length > 0) {
        const withCategory = skills.filter((skill) => skill.category);
        if (withCategory.length > 0) {
            const grouped = new Map<string, typeof skills>();
            for (const skill of skills) {
                const cat = skill.category ?? 'Other';
                if (!grouped.has(cat)) {
                    grouped.set(cat, []);
                }

                grouped.get(cat)!.push(skill);
            }

            lines.push('');
            lines.push('Skills:');
            for (const [cat, catSkills] of grouped) {
                const formatted = catSkills.map((skill) => (skill.level ? `${skill.name} (${skill.level})` : skill.name)).join('; ');
                lines.push(`  ${cat}: ${formatted}`);
            }
        } else {
            const formatted = skills.map((skill) => (skill.level ? `${skill.name} (${skill.level})` : skill.name)).join('; ');
            lines.push('');
            lines.push(`Skills: ${formatted}`);
        }
    }

    // Languages
    const languages = cvProfile.languages?.getItems() ?? [];
    if (languages.length > 0) {
        const formatted = languages.map((lang) => `${lang.language} (${lang.proficiency})`).join('; ');
        lines.push('');
        lines.push(`Languages: ${formatted}`);
    }

    // Certifications
    const certifications = cvProfile.certifications?.getItems() ?? [];
    if (certifications.length > 0) {
        lines.push('');
        lines.push('Certifications:');
        for (const cert of certifications) {
            lines.push(`- ${cert.name} — ${cert.issuer} (${cert.date})`);
        }
    }

    // Projects
    const projects = cvProfile.projects?.getItems() ?? [];
    if (projects.length > 0) {
        lines.push('');
        lines.push('Projects:');
        for (const proj of projects) {
            let entry = `- ${proj.name}: ${proj.description}`;
            if (proj.url) {
                entry += ` [${proj.url}]`;
            }

            lines.push(entry);
        }
    }

    return lines.join('\n').trim();
}
