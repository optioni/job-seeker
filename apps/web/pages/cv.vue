<template>
    <div>
        <h1
            class="text-3xl font-semibold italic mb-6"
            style="font-family: var(--font-display); color: var(--color-text-default)"
        >
            {{ $t('cv.title') }}
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
                {{ $t('cv.personalInfo') }}
            </h2>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <UFormField :label="$t('cv.firstNameLabel')"
                    name="firstName">
                    <UInput v-model="profile.personalInfo.firstName"
                        type="text"
                        class="w-full" />
                </UFormField>

                <UFormField :label="$t('cv.lastNameLabel')"
                    name="lastName">
                    <UInput v-model="profile.personalInfo.lastName"
                        type="text"
                        class="w-full" />
                </UFormField>

                <UFormField :label="$t('cv.emailLabel')"
                    name="email">
                    <UInput v-model="profile.personalInfo.email"
                        type="email"
                        class="w-full" />
                </UFormField>

                <UFormField :label="$t('cv.phoneLabel')"
                    name="phone">
                    <UInput v-model="profile.personalInfo.phone"
                        type="tel"
                        class="w-full" />
                </UFormField>

                <UFormField :label="$t('cv.locationLabel')"
                    name="location">
                    <UInput v-model="profile.personalInfo.location"
                        type="text"
                        class="w-full" />
                </UFormField>

                <UFormField :label="$t('cv.linkedInLabel')"
                    name="linkedIn">
                    <UInput v-model="profile.personalInfo.linkedIn"
                        type="url"
                        class="w-full" />
                </UFormField>

                <UFormField :label="$t('cv.gitHubLabel')"
                    name="github">
                    <UInput v-model="profile.personalInfo.github"
                        type="url"
                        class="w-full" />
                </UFormField>

                <UFormField :label="$t('cv.websiteLabel')"
                    name="website"
                    class="col-span-2">
                    <UInput v-model="profile.personalInfo.website"
                        type="url"
                        class="w-full" />
                </UFormField>
            </div>

            <UFormField :label="$t('cv.summaryLabel')"
                name="summary"
                class="mb-4">
                <UTextarea
                    v-model="profile.summary"
                    :rows="5"
                    :placeholder="$t('cv.summaryPlaceholder')"
                    class="w-full"
                />
            </UFormField>

            <div class="flex items-center gap-4">
                <UButton color="primary"
                    variant="solid"
                    :loading="saving"
                    @click="saveProfile">
                    {{ $t('cv.saveProfile') }}
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
                            {{ $t('cv.addEntry') }}
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField :label="$t('cv.companyLabel')"
                                name="company">
                                <UInput v-model="newWork.company"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.roleLabel')"
                                name="role">
                                <UInput v-model="newWork.role"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.startDateLabel')"
                                name="startDate">
                                <UInput v-model="newWork.startDate"
                                    type="date"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.endDateLabel')"
                                name="endDate">
                                <UInput v-model="newWork.endDate"
                                    type="date"
                                    :disabled="newWork.current"
                                    class="w-full" />
                            </UFormField>
                        </div>

                        <div class="flex items-center gap-2 mb-3">
                            <UCheckbox v-model="newWork.current"
                                :label="$t('cv.currentlyWorkingHere')" />
                        </div>

                        <UFormField :label="$t('cv.descriptionLabel')"
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
                            {{ $t('common.add') }}
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
                                    {{ w.role }} at {{ w.company }}
                                </p>

                                <p class="text-xs mt-0.5"
                                    style="color: var(--color-text-faint)">
                                    {{ w.startDate }} – {{ w.current ? $t('cv.present') : w.endDate }}
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
                                {{ $t('common.delete') }}
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
                            {{ $t('cv.addEntry') }}
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField :label="$t('cv.institutionLabel')"
                                name="institution">
                                <UInput v-model="newEducation.institution"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.degreeLabel')"
                                name="degree">
                                <UInput v-model="newEducation.degree"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.fieldOfStudyLabel')"
                                name="field">
                                <UInput v-model="newEducation.field"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.startDateLabel')"
                                name="startDate">
                                <UInput v-model="newEducation.startDate"
                                    type="date"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.endDateLabel')"
                                name="endDate">
                                <UInput v-model="newEducation.endDate"
                                    type="date"
                                    class="w-full" />
                            </UFormField>
                        </div>

                        <UButton color="primary"
                            variant="solid"
                            size="sm"
                            @click="addEducation">
                            {{ $t('common.add') }}
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
                                {{ $t('common.delete') }}
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
                            {{ $t('cv.addSkill') }}
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField :label="$t('cv.skillLabel')"
                                name="skillName">
                                <UInput v-model="newSkill.name"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.levelLabel')"
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
                            {{ $t('common.add') }}
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
                            {{ $t('cv.addLanguage') }}
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField :label="$t('cv.skillLabel')"
                                name="langName">
                                <UInput v-model="newLanguage.language"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.proficiencyLabel')"
                                name="langProficiency">
                                <USelect
                                    v-model="newLanguage.proficiency"
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
                            {{ $t('common.add') }}
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
                            {{ l.language }} <em class="text-xs not-italic opacity-70">({{ l.proficiency }})</em>

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
                            {{ $t('cv.addCertification') }}
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField :label="$t('cv.nameLabel')"
                                name="certName">
                                <UInput v-model="newCert.name"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.issuerLabel')"
                                name="certIssuer">
                                <UInput v-model="newCert.issuer"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.dateLabel')"
                                name="certDate">
                                <UInput v-model="newCert.date"
                                    type="date"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.urlLabel')"
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
                            {{ $t('common.add') }}
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
                                    {{ c.date }}
                                </p>

                                <a v-if="c.url"
                                    :href="c.url"
                                    target="_blank"
                                    class="text-xs"
                                    style="color: var(--color-accent)">{{ $t('cv.view') }}</a>
                            </div>

                            <UButton color="error"
                                variant="soft"
                                size="xs"
                                @click="deleteCertification(c.id!)">
                                {{ $t('common.delete') }}
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
                            {{ $t('cv.addProject') }}
                        </p>

                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <UFormField :label="$t('cv.nameLabel')"
                                name="projectName">
                                <UInput v-model="newProject.name"
                                    type="text"
                                    class="w-full" />
                            </UFormField>

                            <UFormField :label="$t('cv.urlLabel')"
                                name="projectUrl">
                                <UInput v-model="newProject.url"
                                    type="url"
                                    class="w-full" />
                            </UFormField>
                        </div>

                        <UFormField :label="$t('cv.descriptionLabel')"
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
                            {{ $t('common.add') }}
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

                                <a v-if="p.url"
                                    :href="p.url"
                                    target="_blank"
                                    class="text-xs"
                                    style="color: var(--color-accent)">{{ $t('cv.view') }}</a>

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
                                {{ $t('common.delete') }}
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
const { t } = useI18n()

interface PersonalInfo {
    firstName: string
    lastName: string
    email: string
    phone: string
    location: string
    linkedIn: string
    github: string
    website: string
}

interface WorkExperience {
    id?: string
    company: string
    role: string
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
}

interface Skill {
    id?: string
    name: string
    level: string
}

interface Language {
    id?: string
    language: string
    proficiency: string
}

interface Certification {
    id?: string
    name: string
    issuer: string
    date: string
    url: string
}

interface Project {
    id?: string
    name: string
    description: string
    url: string
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
        firstName: '', lastName: '', email: '', phone: '', location: '', linkedIn: '', github: '', website: '',
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
    company: '', role: '', startDate: '', endDate: '', current: false, description: '',
})
const newEducation = ref<Education>({
    institution: '', degree: '', field: '', startDate: '', endDate: '',
})
const newSkill = ref<Skill>({ name: '', level: 'beginner' })
const newLanguage = ref<Language>({ language: '', proficiency: 'A1' })
const newCert = ref<Certification>({
    name: '', issuer: '', date: '', url: '',
})
const newProject = ref<Project>({
    name: '', description: '', url: '',
})

onMounted(async () => {
    try {
        const data = await apiFetch<CvProfile | null>('/cv/profile')
        if (data) {
            profileId.value = data.id ?? null
            profile.value = data
        }
    } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status !== 404) loadError.value = t('cv.failedToLoad')
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
        saveMessage.value = t('common.saved')
    } catch {
        saveMessage.value = t('common.saveFailed')
        saveFailed.value = true
    } finally {
        saving.value = false
    }
}

async function addWorkExperience() {
    const data = await apiFetch<WorkExperience>(`/cv/profile/${profileId.value}/work-experiences`, { method: 'POST', body: newWork.value })
    profile.value.workExperiences.push(data)
    newWork.value = {
        company: '', role: '', startDate: '', endDate: '', current: false, description: '',
    }
}

async function deleteWorkExperience(id: string) {
    await apiFetch(`/cv/profile/${profileId.value}/work-experiences/${id}`, { method: 'DELETE' })
    profile.value.workExperiences = profile.value.workExperiences.filter((w) => w.id !== id)
}

async function addEducation() {
    const data = await apiFetch<Education>(`/cv/profile/${profileId.value}/educations`, { method: 'POST', body: newEducation.value })
    profile.value.educations.push(data)
    newEducation.value = {
        institution: '', degree: '', field: '', startDate: '', endDate: '',
    }
}

async function deleteEducation(id: string) {
    await apiFetch(`/cv/profile/${profileId.value}/educations/${id}`, { method: 'DELETE' })
    profile.value.educations = profile.value.educations.filter((e) => e.id !== id)
}

async function addSkill() {
    const data = await apiFetch<Skill>(`/cv/profile/${profileId.value}/skills`, { method: 'POST', body: newSkill.value })
    profile.value.skills.push(data)
    newSkill.value = { name: '', level: 'beginner' }
}

async function deleteSkill(id: string) {
    await apiFetch(`/cv/profile/${profileId.value}/skills/${id}`, { method: 'DELETE' })
    profile.value.skills = profile.value.skills.filter((s) => s.id !== id)
}

async function addLanguage() {
    const data = await apiFetch<Language>(`/cv/profile/${profileId.value}/languages`, { method: 'POST', body: newLanguage.value })
    profile.value.languages.push(data)
    newLanguage.value = { language: '', proficiency: 'A1' }
}

async function deleteLanguage(id: string) {
    await apiFetch(`/cv/profile/${profileId.value}/languages/${id}`, { method: 'DELETE' })
    profile.value.languages = profile.value.languages.filter((l) => l.id !== id)
}

async function addCertification() {
    const data = await apiFetch<Certification>(`/cv/profile/${profileId.value}/certifications`, { method: 'POST', body: newCert.value })
    profile.value.certifications.push(data)
    newCert.value = {
        name: '', issuer: '', date: '', url: '',
    }
}

async function deleteCertification(id: string) {
    await apiFetch(`/cv/profile/${profileId.value}/certifications/${id}`, { method: 'DELETE' })
    profile.value.certifications = profile.value.certifications.filter((c) => c.id !== id)
}

async function addProject() {
    const data = await apiFetch<Project>(`/cv/profile/${profileId.value}/projects`, { method: 'POST', body: newProject.value })
    profile.value.projects.push(data)
    newProject.value = {
        name: '', description: '', url: '',
    }
}

async function deleteProject(id: string) {
    await apiFetch(`/cv/profile/${profileId.value}/projects/${id}`, { method: 'DELETE' })
    profile.value.projects = profile.value.projects.filter((p) => p.id !== id)
}

const skillLevelOptions = computed(() => [
    { label: t('cv.skillBeginner'), value: 'beginner' },
    { label: t('cv.skillIntermediate'), value: 'intermediate' },
    { label: t('cv.skillAdvanced'), value: 'advanced' },
    { label: t('cv.skillExpert'), value: 'expert' },
])

const languageLevelOptions = computed(() => [
    { label: t('cv.langA1'), value: 'A1' },
    { label: t('cv.langA2'), value: 'A2' },
    { label: t('cv.langB1'), value: 'B1' },
    { label: t('cv.langB2'), value: 'B2' },
    { label: t('cv.langC1'), value: 'C1' },
    { label: t('cv.langC2'), value: 'C2' },
    { label: t('cv.langNative'), value: 'native' },
])

const accordionItems = computed(() => [
    { label: t('cv.workExperience'), value: 'work', slot: 'work' },
    { label: t('cv.education'), value: 'education', slot: 'education' },
    { label: t('cv.skills'), value: 'skills', slot: 'skills' },
    { label: t('cv.languages'), value: 'languages', slot: 'languages' },
    { label: t('cv.certifications'), value: 'certifications', slot: 'certifications' },
    { label: t('cv.projects'), value: 'projects', slot: 'projects' },
])
</script>
