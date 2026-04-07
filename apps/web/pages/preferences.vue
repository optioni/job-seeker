<script setup lang="ts">
const { apiFetch } = useApi()
const { logout } = useAuth()

interface JobPreferences {
    id?: string
    locations: string[]
    role: string
    seniority: string
    salaryMin: number | null
    salaryMax: number | null
    industries: string[]
    defaultLanguage: string
}

const prefs = ref<JobPreferences>({
    locations: [],
    role: '',
    seniority: '',
    salaryMin: null,
    salaryMax: null,
    industries: [],
    defaultLanguage: 'fi',
})

const prefsId = ref<string | null>(null)
const saving = ref(false)
const saveMessage = ref('')
const locationsInput = ref('')
const industriesInput = ref('')

onMounted(async () => {
    try {
        const data = await apiFetch<JobPreferences>('/preferences')
        prefsId.value = data.id ?? null
        prefs.value = data
        locationsInput.value = (data.locations ?? []).join(', ')
        industriesInput.value = (data.industries ?? []).join(', ')
    } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status !== 404) console.error('Failed to load preferences')
    }
})

async function save() {
    saving.value = true
    saveMessage.value = ''
    prefs.value.locations = locationsInput.value.split(',').map((s) => s.trim()).filter(Boolean)
    prefs.value.industries = industriesInput.value.split(',').map((s) => s.trim()).filter(Boolean)
    try {
        const method = prefsId.value ? 'PATCH' : 'POST'
        const path = prefsId.value ? `/preferences/${prefsId.value}` : '/preferences'
        const data = await apiFetch<JobPreferences>(path, { method, body: prefs.value })
        prefsId.value = data.id ?? null
        saveMessage.value = 'Saved!'
    } catch {
        saveMessage.value = 'Save failed'
    } finally {
        saving.value = false
    }
}

async function handleLogout() {
    logout()
    await navigateTo('/login')
}
</script>

<template>
    <div class="page">
        <header class="page-header">
            <h1>Job Preferences</h1>
            <nav>
                <NuxtLink to="/cv">CV</NuxtLink>
                <NuxtLink to="/sources">Sources</NuxtLink>
                <NuxtLink to="/applications">Applications</NuxtLink>
                <button class="btn-link" @click="handleLogout">Logout</button>
            </nav>
        </header>

        <div class="card">
            <div class="grid-2">
                <div class="field">
                    <label>Target Role</label>
                    <input v-model="prefs.role" type="text" placeholder="e.g. Software Engineer" />
                </div>
                <div class="field">
                    <label>Seniority</label>
                    <select v-model="prefs.seniority">
                        <option value="">Any</option>
                        <option value="junior">Junior</option>
                        <option value="mid">Mid-level</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead</option>
                        <option value="principal">Principal</option>
                    </select>
                </div>
                <div class="field">
                    <label>Locations (comma-separated)</label>
                    <input v-model="locationsInput" type="text" placeholder="e.g. Helsinki, Espoo, Remote" />
                </div>
                <div class="field">
                    <label>Industries (comma-separated)</label>
                    <input v-model="industriesInput" type="text" placeholder="e.g. Technology, Finance" />
                </div>
                <div class="field">
                    <label>Minimum Salary (€/year)</label>
                    <input v-model.number="prefs.salaryMin" type="number" min="0" step="1000" />
                </div>
                <div class="field">
                    <label>Maximum Salary (€/year)</label>
                    <input v-model.number="prefs.salaryMax" type="number" min="0" step="1000" />
                </div>
                <div class="field">
                    <label>Default Language</label>
                    <select v-model="prefs.defaultLanguage">
                        <option value="fi">Finnish</option>
                        <option value="en">English</option>
                        <option value="sv">Swedish</option>
                    </select>
                </div>
            </div>

            <div class="save-bar">
                <button class="btn-primary" :disabled="saving" @click="save">
                    {{ saving ? 'Saving...' : 'Save Preferences' }}
                </button>
                <span v-if="saveMessage" :class="saveMessage === 'Saved!' ? 'success' : 'error'">{{ saveMessage }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header nav { display: flex; gap: 1rem; align-items: center; }
.page-header nav a { color: #2563eb; text-decoration: none; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.5rem; }
label { font-size: 0.875rem; font-weight: 500; color: #374151; }
input, select { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; }
.save-bar { display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; }
.btn-primary { padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-link { background: none; border: none; color: #2563eb; cursor: pointer; font-size: 1rem; padding: 0; }
.success { color: #16a34a; font-size: 0.875rem; }
.error { color: #dc2626; font-size: 0.875rem; }
</style>
