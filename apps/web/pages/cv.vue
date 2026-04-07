<script setup lang="ts">
const { apiFetch } = useApi()
const { logout } = useAuth()

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
    personalInfo: { fullName: '', email: '', phone: '', address: '', linkedIn: '', github: '', website: '' },
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
const loadError = ref('')

// Section toggles
const showAddWork = ref(false)
const showAddEducation = ref(false)
const showAddSkill = ref(false)
const showAddLanguage = ref(false)
const showAddCert = ref(false)
const showAddProject = ref(false)

// Add forms
const newWork = ref<WorkExperience>({ company: '', title: '', startDate: '', endDate: '', current: false, description: '' })
const newEducation = ref<Education>({ institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' })
const newSkill = ref<Skill>({ name: '', level: '' })
const newLanguage = ref<Language>({ name: '', level: '' })
const newCert = ref<Certification>({ name: '', issuer: '', issueDate: '', expiryDate: '', url: '' })
const newProject = ref<Project>({ name: '', description: '', url: '', startDate: '', endDate: '' })

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
    } finally {
        saving.value = false
    }
}

async function addWorkExperience() {
    const data = await apiFetch<WorkExperience>('/cv/work-experiences', { method: 'POST', body: newWork.value })
    profile.value.workExperiences.push(data)
    newWork.value = { company: '', title: '', startDate: '', endDate: '', current: false, description: '' }
    showAddWork.value = false
}

async function deleteWorkExperience(id: string) {
    await apiFetch(`/cv/work-experiences/${id}`, { method: 'DELETE' })
    profile.value.workExperiences = profile.value.workExperiences.filter((w) => w.id !== id)
}

async function addEducation() {
    const data = await apiFetch<Education>('/cv/educations', { method: 'POST', body: newEducation.value })
    profile.value.educations.push(data)
    newEducation.value = { institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' }
    showAddEducation.value = false
}

async function deleteEducation(id: string) {
    await apiFetch(`/cv/educations/${id}`, { method: 'DELETE' })
    profile.value.educations = profile.value.educations.filter((e) => e.id !== id)
}

async function addSkill() {
    const data = await apiFetch<Skill>('/cv/skills', { method: 'POST', body: newSkill.value })
    profile.value.skills.push(data)
    newSkill.value = { name: '', level: '' }
    showAddSkill.value = false
}

async function deleteSkill(id: string) {
    await apiFetch(`/cv/skills/${id}`, { method: 'DELETE' })
    profile.value.skills = profile.value.skills.filter((s) => s.id !== id)
}

async function addLanguage() {
    const data = await apiFetch<Language>('/cv/languages', { method: 'POST', body: newLanguage.value })
    profile.value.languages.push(data)
    newLanguage.value = { name: '', level: '' }
    showAddLanguage.value = false
}

async function deleteLanguage(id: string) {
    await apiFetch(`/cv/languages/${id}`, { method: 'DELETE' })
    profile.value.languages = profile.value.languages.filter((l) => l.id !== id)
}

async function addCertification() {
    const data = await apiFetch<Certification>('/cv/certifications', { method: 'POST', body: newCert.value })
    profile.value.certifications.push(data)
    newCert.value = { name: '', issuer: '', issueDate: '', expiryDate: '', url: '' }
    showAddCert.value = false
}

async function deleteCertification(id: string) {
    await apiFetch(`/cv/certifications/${id}`, { method: 'DELETE' })
    profile.value.certifications = profile.value.certifications.filter((c) => c.id !== id)
}

async function addProject() {
    const data = await apiFetch<Project>('/cv/projects', { method: 'POST', body: newProject.value })
    profile.value.projects.push(data)
    newProject.value = { name: '', description: '', url: '', startDate: '', endDate: '' }
    showAddProject.value = false
}

async function deleteProject(id: string) {
    await apiFetch(`/cv/projects/${id}`, { method: 'DELETE' })
    profile.value.projects = profile.value.projects.filter((p) => p.id !== id)
}

async function handleLogout() {
    logout()
    await navigateTo('/login')
}
</script>

<template>
    <div class="page">
        <header class="page-header">
            <h1>CV Editor</h1>
            <nav>
                <NuxtLink to="/preferences">Preferences</NuxtLink>
                <NuxtLink to="/sources">Sources</NuxtLink>
                <NuxtLink to="/applications">Applications</NuxtLink>
                <button class="btn-link" @click="handleLogout">Logout</button>
            </nav>
        </header>

        <p v-if="loadError" class="error">{{ loadError }}</p>

        <section class="card">
            <h2>Personal Information</h2>
            <div class="grid-2">
                <div class="field">
                    <label>Full Name</label>
                    <input v-model="profile.personalInfo.fullName" type="text" />
                </div>
                <div class="field">
                    <label>Email</label>
                    <input v-model="profile.personalInfo.email" type="email" />
                </div>
                <div class="field">
                    <label>Phone</label>
                    <input v-model="profile.personalInfo.phone" type="tel" />
                </div>
                <div class="field">
                    <label>Address</label>
                    <input v-model="profile.personalInfo.address" type="text" />
                </div>
                <div class="field">
                    <label>LinkedIn</label>
                    <input v-model="profile.personalInfo.linkedIn" type="url" />
                </div>
                <div class="field">
                    <label>GitHub</label>
                    <input v-model="profile.personalInfo.github" type="url" />
                </div>
                <div class="field">
                    <label>Website</label>
                    <input v-model="profile.personalInfo.website" type="url" />
                </div>
            </div>
        </section>

        <section class="card">
            <h2>Summary</h2>
            <div class="field">
                <textarea v-model="profile.summary" rows="5" placeholder="Professional summary..." />
            </div>
        </section>

        <div class="save-bar">
            <button class="btn-primary" :disabled="saving" @click="saveProfile">
                {{ saving ? 'Saving...' : 'Save Profile' }}
            </button>
            <span v-if="saveMessage" :class="saveMessage === 'Saved!' ? 'success' : 'error'">{{ saveMessage }}</span>
        </div>

        <!-- Work Experience -->
        <section class="card">
            <div class="section-header">
                <h2>Work Experience</h2>
                <button class="btn-secondary" @click="showAddWork = !showAddWork">
                    {{ showAddWork ? 'Cancel' : '+ Add' }}
                </button>
            </div>
            <div v-if="showAddWork" class="add-form">
                <div class="grid-2">
                    <div class="field"><label>Company</label><input v-model="newWork.company" type="text" /></div>
                    <div class="field"><label>Title</label><input v-model="newWork.title" type="text" /></div>
                    <div class="field"><label>Start Date</label><input v-model="newWork.startDate" type="date" /></div>
                    <div class="field"><label>End Date</label><input v-model="newWork.endDate" type="date" :disabled="newWork.current" /></div>
                </div>
                <div class="field">
                    <label><input v-model="newWork.current" type="checkbox" /> Currently working here</label>
                </div>
                <div class="field"><label>Description</label><textarea v-model="newWork.description" rows="3" /></div>
                <button class="btn-primary" @click="addWorkExperience">Add</button>
            </div>
            <ul class="item-list">
                <li v-for="w in profile.workExperiences" :key="w.id" class="item">
                    <div>
                        <strong>{{ w.title }}</strong> at {{ w.company }}
                        <span class="meta">{{ w.startDate }} – {{ w.current ? 'Present' : w.endDate }}</span>
                        <p class="desc">{{ w.description }}</p>
                    </div>
                    <button class="btn-danger" @click="deleteWorkExperience(w.id!)">Delete</button>
                </li>
            </ul>
        </section>

        <!-- Education -->
        <section class="card">
            <div class="section-header">
                <h2>Education</h2>
                <button class="btn-secondary" @click="showAddEducation = !showAddEducation">
                    {{ showAddEducation ? 'Cancel' : '+ Add' }}
                </button>
            </div>
            <div v-if="showAddEducation" class="add-form">
                <div class="grid-2">
                    <div class="field"><label>Institution</label><input v-model="newEducation.institution" type="text" /></div>
                    <div class="field"><label>Degree</label><input v-model="newEducation.degree" type="text" /></div>
                    <div class="field"><label>Field of Study</label><input v-model="newEducation.field" type="text" /></div>
                    <div class="field"><label>Start Date</label><input v-model="newEducation.startDate" type="date" /></div>
                    <div class="field"><label>End Date</label><input v-model="newEducation.endDate" type="date" /></div>
                </div>
                <div class="field"><label>Description</label><textarea v-model="newEducation.description" rows="3" /></div>
                <button class="btn-primary" @click="addEducation">Add</button>
            </div>
            <ul class="item-list">
                <li v-for="e in profile.educations" :key="e.id" class="item">
                    <div>
                        <strong>{{ e.degree }}</strong> in {{ e.field }}, {{ e.institution }}
                        <span class="meta">{{ e.startDate }} – {{ e.endDate }}</span>
                    </div>
                    <button class="btn-danger" @click="deleteEducation(e.id!)">Delete</button>
                </li>
            </ul>
        </section>

        <!-- Skills -->
        <section class="card">
            <div class="section-header">
                <h2>Skills</h2>
                <button class="btn-secondary" @click="showAddSkill = !showAddSkill">
                    {{ showAddSkill ? 'Cancel' : '+ Add' }}
                </button>
            </div>
            <div v-if="showAddSkill" class="add-form">
                <div class="grid-2">
                    <div class="field"><label>Skill</label><input v-model="newSkill.name" type="text" /></div>
                    <div class="field">
                        <label>Level</label>
                        <select v-model="newSkill.level">
                            <option value="">Select level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                </div>
                <button class="btn-primary" @click="addSkill">Add</button>
            </div>
            <ul class="tag-list">
                <li v-for="s in profile.skills" :key="s.id" class="tag">
                    {{ s.name }} <em>({{ s.level }})</em>
                    <button class="btn-inline-danger" @click="deleteSkill(s.id!)">×</button>
                </li>
            </ul>
        </section>

        <!-- Languages -->
        <section class="card">
            <div class="section-header">
                <h2>Languages</h2>
                <button class="btn-secondary" @click="showAddLanguage = !showAddLanguage">
                    {{ showAddLanguage ? 'Cancel' : '+ Add' }}
                </button>
            </div>
            <div v-if="showAddLanguage" class="add-form">
                <div class="grid-2">
                    <div class="field"><label>Language</label><input v-model="newLanguage.name" type="text" /></div>
                    <div class="field">
                        <label>Level</label>
                        <select v-model="newLanguage.level">
                            <option value="">Select level</option>
                            <option value="A1">A1 – Beginner</option>
                            <option value="A2">A2 – Elementary</option>
                            <option value="B1">B1 – Intermediate</option>
                            <option value="B2">B2 – Upper Intermediate</option>
                            <option value="C1">C1 – Advanced</option>
                            <option value="C2">C2 – Proficient</option>
                            <option value="native">Native</option>
                        </select>
                    </div>
                </div>
                <button class="btn-primary" @click="addLanguage">Add</button>
            </div>
            <ul class="tag-list">
                <li v-for="l in profile.languages" :key="l.id" class="tag">
                    {{ l.name }} <em>({{ l.level }})</em>
                    <button class="btn-inline-danger" @click="deleteLanguage(l.id!)">×</button>
                </li>
            </ul>
        </section>

        <!-- Certifications -->
        <section class="card">
            <div class="section-header">
                <h2>Certifications</h2>
                <button class="btn-secondary" @click="showAddCert = !showAddCert">
                    {{ showAddCert ? 'Cancel' : '+ Add' }}
                </button>
            </div>
            <div v-if="showAddCert" class="add-form">
                <div class="grid-2">
                    <div class="field"><label>Name</label><input v-model="newCert.name" type="text" /></div>
                    <div class="field"><label>Issuer</label><input v-model="newCert.issuer" type="text" /></div>
                    <div class="field"><label>Issue Date</label><input v-model="newCert.issueDate" type="date" /></div>
                    <div class="field"><label>Expiry Date</label><input v-model="newCert.expiryDate" type="date" /></div>
                    <div class="field"><label>URL</label><input v-model="newCert.url" type="url" /></div>
                </div>
                <button class="btn-primary" @click="addCertification">Add</button>
            </div>
            <ul class="item-list">
                <li v-for="c in profile.certifications" :key="c.id" class="item">
                    <div>
                        <strong>{{ c.name }}</strong> — {{ c.issuer }}
                        <span class="meta">{{ c.issueDate }}<span v-if="c.expiryDate"> – {{ c.expiryDate }}</span></span>
                        <a v-if="c.url" :href="c.url" target="_blank" class="link">View</a>
                    </div>
                    <button class="btn-danger" @click="deleteCertification(c.id!)">Delete</button>
                </li>
            </ul>
        </section>

        <!-- Projects -->
        <section class="card">
            <div class="section-header">
                <h2>Projects</h2>
                <button class="btn-secondary" @click="showAddProject = !showAddProject">
                    {{ showAddProject ? 'Cancel' : '+ Add' }}
                </button>
            </div>
            <div v-if="showAddProject" class="add-form">
                <div class="grid-2">
                    <div class="field"><label>Name</label><input v-model="newProject.name" type="text" /></div>
                    <div class="field"><label>URL</label><input v-model="newProject.url" type="url" /></div>
                    <div class="field"><label>Start Date</label><input v-model="newProject.startDate" type="date" /></div>
                    <div class="field"><label>End Date</label><input v-model="newProject.endDate" type="date" /></div>
                </div>
                <div class="field"><label>Description</label><textarea v-model="newProject.description" rows="3" /></div>
                <button class="btn-primary" @click="addProject">Add</button>
            </div>
            <ul class="item-list">
                <li v-for="p in profile.projects" :key="p.id" class="item">
                    <div>
                        <strong>{{ p.name }}</strong>
                        <span class="meta">{{ p.startDate }}<span v-if="p.endDate"> – {{ p.endDate }}</span></span>
                        <a v-if="p.url" :href="p.url" target="_blank" class="link">View</a>
                        <p class="desc">{{ p.description }}</p>
                    </div>
                    <button class="btn-danger" @click="deleteProject(p.id!)">Delete</button>
                </li>
            </ul>
        </section>
    </div>
</template>

<style scoped>
.page { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header nav { display: flex; gap: 1rem; align-items: center; }
.page-header nav a { color: #2563eb; text-decoration: none; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section-header h2 { margin: 0; }
h2 { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; }
label { font-size: 0.875rem; font-weight: 500; color: #374151; }
input, select, textarea { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; font-family: inherit; }
textarea { resize: vertical; }
.add-form { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem; margin-bottom: 1rem; }
.save-bar { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.item-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.item { display: flex; justify-content: space-between; align-items: flex-start; padding: 0.75rem; background: #f9fafb; border-radius: 6px; }
.meta { display: block; font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; }
.desc { font-size: 0.875rem; color: #374151; margin-top: 0.25rem; }
.link { font-size: 0.75rem; color: #2563eb; margin-left: 0.5rem; }
.tag-list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag { display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 999px; font-size: 0.875rem; }
.btn-primary { padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { padding: 0.375rem 0.75rem; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
.btn-danger { padding: 0.25rem 0.5rem; background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer; white-space: nowrap; }
.btn-inline-danger { background: none; border: none; color: #dc2626; cursor: pointer; font-size: 1rem; padding: 0 0.125rem; }
.btn-link { background: none; border: none; color: #2563eb; cursor: pointer; font-size: 1rem; padding: 0; }
.success { color: #16a34a; font-size: 0.875rem; }
.error { color: #dc2626; font-size: 0.875rem; }
</style>
