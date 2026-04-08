<template>
    <div>
        <h1
            class="text-3xl font-semibold italic mb-6"
            style="font-family: var(--font-display); color: var(--color-text-default)"
        >
            CV Editor
        </h1>

        <p v-if="loadError"
            class="text-sm mb-4"
            style="color: var(--color-error)">
            {{ loadError }}
        </p>

        <!-- Personal Info + Summary -->
        <div
            class="border rounded-xl p-6 mb-6"
            style="background-color: var(--color-card); border-color: var(--color-border)"
        >
            <h2 class="text-sm font-semibold uppercase tracking-widest mb-4"
                style="color: var(--color-text-faint)">
                Personal Information
            </h2>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <UFormField label="Full Name"
                    name="fullName">
                    <UInput v-model="profile.personalInfo.fullName"
                        type="text"
                        class="w-full" />
                </UFormField>

                <UFormField label="Email"
                    name="email">
                    <UInput v-model="profile.personalInfo.email"
                        type="email"
                        class="w-full" />
                </UFormField>

                <UFormField label="Phone"
                    name="phone">
                    <UInput v-model="profile.personalInfo.phone"
                        type="tel"
                        class="w-full" />
                </UFormField>

                <UFormField label="Address"
                    name="address">
                    <UInput v-model="profile.personalInfo.address"
                        type="text"
                        class="w-full" />
                </UFormField>

                <UFormField label="LinkedIn"
                    name="linkedIn">
                    <UInput v-model="profile.personalInfo.linkedIn"
                        type="url"
                        class="w-full" />
                </UFormField>

                <UFormField label="GitHub"
                    name="github">
                    <UInput v-model="profile.personalInfo.github"
                        type="url"
                        class="w-full" />
                </UFormField>

                <UFormField label="Website"
                    name="website"
                    class="col-span-2">
                    <UInput v-model="profile.personalInfo.website"
                        type="url"
                        class="w-full" />
                </UFormField>
            </div>

            <UFormField label="Summary"
                name="summary"
                class="mb-4">
                <UTextarea
                    v-model="profile.summary"
                    :rows="5"
                    placeholder="Professional summary..."
                    class="w-full"
                />
            </UFormField>

            <div class="flex items-center gap-4">
                <UButton color="primary"
                    variant="solid"
                    :loading="saving"
                    @click="saveProfile">
                    Save Profile
                </UButton>

                <span
                    v-if="saveMessage"
                    class="text-sm"
                    :style="{ color: saveFailed ? 'var(--color-error)' : 'var(--color-success)' }"
                >{{ saveMessage }}</span>
            </div>
        </div>

        <!-- Accordion sections -->
        <UAccordion :items="accordionItems"
            multiple>
            <!-- Work Experience -->
            <template #work>
                <div class="px-1 pb-4">
                    <!-- Add form -->
                    <div
                        class="border rounded-xl p-4 mb-4"
                        style="background-color: var(--color-background); border-color: var(--color-border)"
                    >
                        <p class="text-xs font-semibold uppercase tracking-widest mb-3"
                            style="color: var(--color-text-faint)">
                            Add Entry
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField label="Company"
                                name="company">
                                <UInput v-model="newWork.company"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Title"
                                name="title">
                                <UInput v-model="newWork.title"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Start Date"
                                name="startDate">
                                <UInput v-model="newWork.startDate"
                                    type="date"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="End Date"
                                name="endDate">
                                <UInput v-model="newWork.endDate"
                                    type="date"
                                    :disabled="newWork.current"
                                    class="w-full" />
                            </UFormField>
                        </div>

                        <div class="flex items-center gap-2 mb-3">
                            <UCheckbox v-model="newWork.current"
                                label="Currently working here" />
                        </div>

                        <UFormField label="Description"
                            name="description"
                            class="mb-3">
                            <UTextarea v-model="newWork.description"
                                :rows="3"
                                class="w-full" />
                        </UFormField>

                        <UButton color="primary"
                            variant="solid"
                            size="sm"
                            @click="addWorkExperience">
                            Add
                        </UButton>
                    </div>

                    <!-- List -->
                    <div class="flex flex-col gap-3">
                        <div
                            v-for="w in profile.workExperiences"
                            :key="w.id"
                            class="flex items-start justify-between border rounded-xl p-4"
                            style="background-color: var(--color-background); border-color: var(--color-border)"
                        >
                            <div>
                                <p class="font-semibold text-sm"
                                    style="color: var(--color-text-default)">
                                    {{ w.title }} at {{ w.company }}
                                </p>

                                <p class="text-xs mt-0.5"
                                    style="color: var(--color-text-faint)">
                                    {{ w.startDate }} – {{ w.current ? 'Present' : w.endDate }}
                                </p>

                                <p v-if="w.description"
                                    class="text-sm mt-1"
                                    style="color: var(--color-text-muted)">
                                    {{ w.description }}
                                </p>
                            </div>

                            <UButton color="error"
                                variant="soft"
                                size="xs"
                                @click="deleteWorkExperience(w.id!)">
                                Delete
                            </UButton>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Education -->
            <template #education>
                <div class="px-1 pb-4">
                    <div
                        class="border rounded-xl p-4 mb-4"
                        style="background-color: var(--color-background); border-color: var(--color-border)"
                    >
                        <p class="text-xs font-semibold uppercase tracking-widest mb-3"
                            style="color: var(--color-text-faint)">
                            Add Entry
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField label="Institution"
                                name="institution">
                                <UInput v-model="newEducation.institution"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Degree"
                                name="degree">
                                <UInput v-model="newEducation.degree"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Field of Study"
                                name="field">
                                <UInput v-model="newEducation.field"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Start Date"
                                name="startDate">
                                <UInput v-model="newEducation.startDate"
                                    type="date"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="End Date"
                                name="endDate">
                                <UInput v-model="newEducation.endDate"
                                    type="date"
                                    class="w-full" />
                            </UFormField>
                        </div>

                        <UFormField label="Description"
                            name="description"
                            class="mb-3">
                            <UTextarea v-model="newEducation.description"
                                :rows="3"
                                class="w-full" />
                        </UFormField>

                        <UButton color="primary"
                            variant="solid"
                            size="sm"
                            @click="addEducation">
                            Add
                        </UButton>
                    </div>

                    <div class="flex flex-col gap-3">
                        <div
                            v-for="e in profile.educations"
                            :key="e.id"
                            class="flex items-start justify-between border rounded-xl p-4"
                            style="background-color: var(--color-background); border-color: var(--color-border)"
                        >
                            <div>
                                <p class="font-semibold text-sm"
                                    style="color: var(--color-text-default)">
                                    {{ e.degree }} in {{ e.field }}, {{ e.institution }}
                                </p>

                                <p class="text-xs mt-0.5"
                                    style="color: var(--color-text-faint)">
                                    {{ e.startDate }} – {{ e.endDate }}
                                </p>
                            </div>

                            <UButton color="error"
                                variant="soft"
                                size="xs"
                                @click="deleteEducation(e.id!)">
                                Delete
                            </UButton>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Skills -->
            <template #skills>
                <div class="px-1 pb-4">
                    <div
                        class="border rounded-xl p-4 mb-4"
                        style="background-color: var(--color-background); border-color: var(--color-border)"
                    >
                        <p class="text-xs font-semibold uppercase tracking-widest mb-3"
                            style="color: var(--color-text-faint)">
                            Add Skill
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField label="Skill"
                                name="skillName">
                                <UInput v-model="newSkill.name"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Level"
                                name="skillLevel">
                                <USelect
                                    v-model="newSkill.level"
                                    :items="skillLevelOptions"
                                    value-key="value"
                                    label-key="label"
                                    class="w-full"
                                />
                            </UFormField>
                        </div>

                        <UButton color="primary"
                            variant="solid"
                            size="sm"
                            @click="addSkill">
                            Add
                        </UButton>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <span
                            v-for="s in profile.skills"
                            :key="s.id"
                            class="flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm"
                            :style="{
                                backgroundColor: 'var(--color-accent-tint)',
                                borderColor: 'var(--color-accent)',
                                color: 'var(--color-accent)',
                            }"
                        >
                            {{ s.name }} <em class="text-xs not-italic opacity-70">({{ s.level }})</em>

                            <button
                                type="button"
                                class="ml-1 text-xs hover:opacity-70 transition-opacity"
                                @click="deleteSkill(s.id!)"
                            >×</button>
                        </span>
                    </div>
                </div>
            </template>

            <!-- Languages -->
            <template #languages>
                <div class="px-1 pb-4">
                    <div
                        class="border rounded-xl p-4 mb-4"
                        style="background-color: var(--color-background); border-color: var(--color-border)"
                    >
                        <p class="text-xs font-semibold uppercase tracking-widest mb-3"
                            style="color: var(--color-text-faint)">
                            Add Language
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField label="Language"
                                name="langName">
                                <UInput v-model="newLanguage.name"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Level"
                                name="langLevel">
                                <USelect
                                    v-model="newLanguage.level"
                                    :items="languageLevelOptions"
                                    value-key="value"
                                    label-key="label"
                                    class="w-full"
                                />
                            </UFormField>
                        </div>

                        <UButton color="primary"
                            variant="solid"
                            size="sm"
                            @click="addLanguage">
                            Add
                        </UButton>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <span
                            v-for="l in profile.languages"
                            :key="l.id"
                            class="flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm"
                            :style="{
                                backgroundColor: 'var(--color-accent-tint)',
                                borderColor: 'var(--color-accent)',
                                color: 'var(--color-accent)',
                            }"
                        >
                            {{ l.name }} <em class="text-xs not-italic opacity-70">({{ l.level }})</em>

                            <button
                                type="button"
                                class="ml-1 text-xs hover:opacity-70 transition-opacity"
                                @click="deleteLanguage(l.id!)"
                            >×</button>
                        </span>
                    </div>
                </div>
            </template>

            <!-- Certifications -->
            <template #certifications>
                <div class="px-1 pb-4">
                    <div
                        class="border rounded-xl p-4 mb-4"
                        style="background-color: var(--color-background); border-color: var(--color-border)"
                    >
                        <p class="text-xs font-semibold uppercase tracking-widest mb-3"
                            style="color: var(--color-text-faint)">
                            Add Certification
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField label="Name"
                                name="certName">
                                <UInput v-model="newCert.name"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Issuer"
                                name="certIssuer">
                                <UInput v-model="newCert.issuer"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Issue Date"
                                name="certIssueDate">
                                <UInput v-model="newCert.issueDate"
                                    type="date"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Expiry Date"
                                name="certExpiryDate">
                                <UInput v-model="newCert.expiryDate"
                                    type="date"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="URL"
                                name="certUrl"
                                class="col-span-2">
                                <UInput v-model="newCert.url"
                                    type="url"
                                    class="w-full" />
                            </UFormField>
                        </div>

                        <UButton color="primary"
                            variant="solid"
                            size="sm"
                            @click="addCertification">
                            Add
                        </UButton>
                    </div>

                    <div class="flex flex-col gap-3">
                        <div
                            v-for="c in profile.certifications"
                            :key="c.id"
                            class="flex items-start justify-between border rounded-xl p-4"
                            style="background-color: var(--color-background); border-color: var(--color-border)"
                        >
                            <div>
                                <p class="font-semibold text-sm"
                                    style="color: var(--color-text-default)">
                                    {{ c.name }} — {{ c.issuer }}
                                </p>

                                <p class="text-xs mt-0.5"
                                    style="color: var(--color-text-faint)">
                                    {{ c.issueDate }}<span v-if="c.expiryDate"> – {{ c.expiryDate }}</span>
                                </p>

                                <a v-if="c.url"
                                    :href="c.url"
                                    target="_blank"
                                    class="text-xs"
                                    style="color: var(--color-accent)">View</a>
                            </div>

                            <UButton color="error"
                                variant="soft"
                                size="xs"
                                @click="deleteCertification(c.id!)">
                                Delete
                            </UButton>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Projects -->
            <template #projects>
                <div class="px-1 pb-4">
                    <div
                        class="border rounded-xl p-4 mb-4"
                        style="background-color: var(--color-background); border-color: var(--color-border)"
                    >
                        <p class="text-xs font-semibold uppercase tracking-widest mb-3"
                            style="color: var(--color-text-faint)">
                            Add Project
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField label="Name"
                                name="projectName">
                                <UInput v-model="newProject.name"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="URL"
                                name="projectUrl">
                                <UInput v-model="newProject.url"
                                    type="url"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="Start Date"
                                name="projectStartDate">
                                <UInput v-model="newProject.startDate"
                                    type="date"
                                    class="w-full" />
                            </UFormField>

                            <UFormField label="End Date"
                                name="projectEndDate">
                                <UInput v-model="newProject.endDate"
                                    type="date"
                                    class="w-full" />
                            </UFormField>
                        </div>

                        <UFormField label="Description"
                            name="projectDescription"
                            class="mb-3">
                            <UTextarea v-model="newProject.description"
                                :rows="3"
                                class="w-full" />
                        </UFormField>

                        <UButton color="primary"
                            variant="solid"
                            size="sm"
                            @click="addProject">
                            Add
                        </UButton>
                    </div>

                    <div class="flex flex-col gap-3">
                        <div
                            v-for="p in profile.projects"
                            :key="p.id"
                            class="flex items-start justify-between border rounded-xl p-4"
                            style="background-color: var(--color-background); border-color: var(--color-border)"
                        >
                            <div>
                                <p class="font-semibold text-sm"
                                    style="color: var(--color-text-default)">
                                    {{ p.name }}
                                </p>

                                <p class="text-xs mt-0.5"
                                    style="color: var(--color-text-faint)">
                                    {{ p.startDate }}<span v-if="p.endDate"> – {{ p.endDate }}</span>
                                </p>

                                <a v-if="p.url"
                                    :href="p.url"
                                    target="_blank"
                                    class="text-xs"
                                    style="color: var(--color-accent)">View</a>

                                <p v-if="p.description"
                                    class="text-sm mt-1"
                                    style="color: var(--color-text-muted)">
                                    {{ p.description }}
                                </p>
                            </div>

                            <UButton color="error"
                                variant="soft"
                                size="xs"
                                @click="deleteProject(p.id!)">
                                Delete
                            </UButton>
                        </div>
                    </div>
                </div>
            </template>
        </UAccordion>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { apiFetch } = useApi()

interface PersonalInfo {
    fullName: string
    email: string
    phone: string
    address: string
    linkedIn: string
    github: string
    website: string
}

interface WorkExperience {
    id?: string
    company: string
    title: string
    startDate: string
    endDate: string
    current: boolean
    description: string
}

interface Education {
    id?: string
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    description: string
}

interface Skill {
    id?: string
    name: string
    level: string
}

interface Language {
    id?: string
    name: string
    level: string
}

interface Certification {
    id?: string
    name: string
    issuer: string
    issueDate: string
    expiryDate: string
    url: string
}

interface Project {
    id?: string
    name: string
    description: string
    url: string
    startDate: string
    endDate: string
}

interface CvProfile {
    id?: string
    personalInfo: PersonalInfo
    summary: string
    workExperiences: WorkExperience[]
    educations: Education[]
    skills: Skill[]
    languages: Language[]
    certifications: Certification[]
    projects: Project[]
}

const profile = ref<CvProfile>({
    personalInfo: {
        fullName: '', email: '', phone: '', address: '', linkedIn: '', github: '', website: '', 
    },
    summary: '',
    workExperiences: [],
    educations: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
})

const profileId = ref<string | null>(null)
const saving = ref(false)
const saveMessage = ref('')
const saveFailed = ref(false)
const loadError = ref('')

// Add forms
const newWork = ref<WorkExperience>({
    company: '', title: '', startDate: '', endDate: '', current: false, description: '', 
})
const newEducation = ref<Education>({
    institution: '', degree: '', field: '', startDate: '', endDate: '', description: '', 
})
const newSkill = ref<Skill>({ name: '', level: '' })
const newLanguage = ref<Language>({ name: '', level: '' })
const newCert = ref<Certification>({
    name: '', issuer: '', issueDate: '', expiryDate: '', url: '', 
})
const newProject = ref<Project>({
    name: '', description: '', url: '', startDate: '', endDate: '', 
})

onMounted(async () => {
    try {
        const data = await apiFetch<CvProfile>('/cv/profile')
        profileId.value = data.id ?? null
        profile.value = data
    } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status !== 404) loadError.value = 'Failed to load CV profile'
    }
})

async function saveProfile() {
    saving.value = true
    saveMessage.value = ''
    saveFailed.value = false
    try {
        const method = profileId.value ? 'PATCH' : 'POST'
        const path = profileId.value ? `/cv/profile/${profileId.value}` : '/cv/profile'
        const data = await apiFetch<CvProfile>(path, {
            method,
            body: { personalInfo: profile.value.personalInfo, summary: profile.value.summary },
        })
        profileId.value = data.id ?? null
        saveMessage.value = 'Saved!'
    } catch {
        saveMessage.value = 'Save failed'
        saveFailed.value = true
    } finally {
        saving.value = false
    }
}

async function addWorkExperience() {
    const data = await apiFetch<WorkExperience>('/cv/work-experiences', { method: 'POST', body: newWork.value })
    profile.value.workExperiences.push(data)
    newWork.value = {
        company: '', title: '', startDate: '', endDate: '', current: false, description: '', 
    }
}

async function deleteWorkExperience(id: string) {
    await apiFetch(`/cv/work-experiences/${id}`, { method: 'DELETE' })
    profile.value.workExperiences = profile.value.workExperiences.filter((w) => w.id !== id)
}

async function addEducation() {
    const data = await apiFetch<Education>('/cv/educations', { method: 'POST', body: newEducation.value })
    profile.value.educations.push(data)
    newEducation.value = {
        institution: '', degree: '', field: '', startDate: '', endDate: '', description: '', 
    }
}

async function deleteEducation(id: string) {
    await apiFetch(`/cv/educations/${id}`, { method: 'DELETE' })
    profile.value.educations = profile.value.educations.filter((e) => e.id !== id)
}

async function addSkill() {
    const data = await apiFetch<Skill>('/cv/skills', { method: 'POST', body: newSkill.value })
    profile.value.skills.push(data)
    newSkill.value = { name: '', level: '' }
}

async function deleteSkill(id: string) {
    await apiFetch(`/cv/skills/${id}`, { method: 'DELETE' })
    profile.value.skills = profile.value.skills.filter((s) => s.id !== id)
}

async function addLanguage() {
    const data = await apiFetch<Language>('/cv/languages', { method: 'POST', body: newLanguage.value })
    profile.value.languages.push(data)
    newLanguage.value = { name: '', level: '' }
}

async function deleteLanguage(id: string) {
    await apiFetch(`/cv/languages/${id}`, { method: 'DELETE' })
    profile.value.languages = profile.value.languages.filter((l) => l.id !== id)
}

async function addCertification() {
    const data = await apiFetch<Certification>('/cv/certifications', { method: 'POST', body: newCert.value })
    profile.value.certifications.push(data)
    newCert.value = {
        name: '', issuer: '', issueDate: '', expiryDate: '', url: '', 
    }
}

async function deleteCertification(id: string) {
    await apiFetch(`/cv/certifications/${id}`, { method: 'DELETE' })
    profile.value.certifications = profile.value.certifications.filter((c) => c.id !== id)
}

async function addProject() {
    const data = await apiFetch<Project>('/cv/projects', { method: 'POST', body: newProject.value })
    profile.value.projects.push(data)
    newProject.value = {
        name: '', description: '', url: '', startDate: '', endDate: '', 
    }
}

async function deleteProject(id: string) {
    await apiFetch(`/cv/projects/${id}`, { method: 'DELETE' })
    profile.value.projects = profile.value.projects.filter((p) => p.id !== id)
}

const skillLevelOptions = [
    { label: 'Select level', value: '' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
    { label: 'Expert', value: 'expert' },
]

const languageLevelOptions = [
    { label: 'Select level', value: '' },
    { label: 'A1 – Beginner', value: 'A1' },
    { label: 'A2 – Elementary', value: 'A2' },
    { label: 'B1 – Intermediate', value: 'B1' },
    { label: 'B2 – Upper Intermediate', value: 'B2' },
    { label: 'C1 – Advanced', value: 'C1' },
    { label: 'C2 – Proficient', value: 'C2' },
    { label: 'Native', value: 'native' },
]

const accordionItems = [
    { label: 'Work Experience', value: 'work' },
    { label: 'Education', value: 'education' },
    { label: 'Skills', value: 'skills' },
    { label: 'Languages', value: 'languages' },
    { label: 'Certifications', value: 'certifications' },
    { label: 'Projects', value: 'projects' },
]
</script>
