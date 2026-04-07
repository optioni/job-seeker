<script setup lang="ts">
const { apiFetch } = useApi()
const { logout } = useAuth()

interface FilterConfigField {
    key: string
    label: string
    type: string
    required?: boolean
}

interface JobSourcePreset {
    id: string
    name: string
    baseUrl: string
    defaultLanguage: string
    defaultPollingInterval: number
    filterConfig: FilterConfigField[]
}

interface JobSource {
    id: string
    presetId: string
    presetName: string
    active: boolean
    language: string
    pollingInterval: number
    filters: Record<string, string>
}

const presets = ref<JobSourcePreset[]>([])
const sources = ref<JobSource[]>([])
const loadError = ref('')

// Modal state
const showAddModal = ref(false)
const selectedPreset = ref<JobSourcePreset | null>(null)
const addForm = ref<{ language: string; pollingInterval: number; filters: Record<string, string> }>({
    language: '',
    pollingInterval: 60,
    filters: {},
})
const addError = ref('')
const adding = ref(false)

onMounted(async () => {
    try {
        const [presetsData, sourcesData] = await Promise.all([
            apiFetch<JobSourcePreset[]>('/job-source-presets'),
            apiFetch<JobSource[]>('/job-sources'),
        ])
        presets.value = presetsData
        sources.value = sourcesData
    } catch {
        loadError.value = 'Failed to load data'
    }
})

function openAddModal(preset: JobSourcePreset) {
    selectedPreset.value = preset
    addForm.value = {
        language: preset.defaultLanguage,
        pollingInterval: preset.defaultPollingInterval,
        filters: {},
    }
    addError.value = ''
    showAddModal.value = true
}

function closeModal() {
    showAddModal.value = false
    selectedPreset.value = null
}

async function addSource() {
    if (!selectedPreset.value) return
    adding.value = true
    addError.value = ''
    try {
        const data = await apiFetch<JobSource>('/job-sources', {
            method: 'POST',
            body: {
                presetId: selectedPreset.value.id,
                language: addForm.value.language,
                pollingInterval: addForm.value.pollingInterval,
                filters: addForm.value.filters,
            },
        })
        sources.value.push(data)
        closeModal()
    } catch {
        addError.value = 'Failed to add source'
    } finally {
        adding.value = false
    }
}

async function toggleActive(source: JobSource) {
    try {
        const data = await apiFetch<JobSource>(`/job-sources/${source.id}`, {
            method: 'PATCH',
            body: { active: !source.active },
        })
        const index = sources.value.findIndex((s) => s.id === source.id)
        if (index !== -1) sources.value[index] = data
    } catch {
        // revert optimistic update not needed since we didn't mutate yet
    }
}

async function deleteSource(id: string) {
    try {
        await apiFetch(`/job-sources/${id}`, { method: 'DELETE' })
        sources.value = sources.value.filter((s) => s.id !== id)
    } catch {
        // ignore
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
            <h1>Job Sources</h1>
            <nav>
                <NuxtLink to="/cv">CV</NuxtLink>
                <NuxtLink to="/preferences">Preferences</NuxtLink>
                <NuxtLink to="/applications">Applications</NuxtLink>
                <button class="btn-link" @click="handleLogout">Logout</button>
            </nav>
        </header>

        <p v-if="loadError" class="error">{{ loadError }}</p>

        <!-- Available Presets -->
        <section class="card">
            <h2>Available Job Boards</h2>
            <ul class="preset-list">
                <li v-for="preset in presets" :key="preset.id" class="preset-item">
                    <div>
                        <strong>{{ preset.name }}</strong>
                        <span class="meta">{{ preset.baseUrl }}</span>
                        <span class="badge">{{ preset.defaultLanguage.toUpperCase() }}</span>
                    </div>
                    <button class="btn-secondary" @click="openAddModal(preset)">Add Source</button>
                </li>
            </ul>
        </section>

        <!-- My Sources -->
        <section class="card">
            <h2>My Sources</h2>
            <p v-if="sources.length === 0" class="empty">No sources configured yet. Add one from the list above.</p>
            <ul v-else class="item-list">
                <li v-for="source in sources" :key="source.id" class="item">
                    <div>
                        <strong>{{ source.presetName }}</strong>
                        <span class="meta">Every {{ source.pollingInterval }} min · {{ source.language.toUpperCase() }}</span>
                        <span :class="['status', source.active ? 'active' : 'inactive']">
                            {{ source.active ? 'Active' : 'Paused' }}
                        </span>
                    </div>
                    <div class="actions">
                        <button class="btn-secondary" @click="toggleActive(source)">
                            {{ source.active ? 'Pause' : 'Activate' }}
                        </button>
                        <button class="btn-danger" @click="deleteSource(source.id)">Delete</button>
                    </div>
                </li>
            </ul>
        </section>

        <!-- Add Source Modal -->
        <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Add Source: {{ selectedPreset?.name }}</h3>
                    <button class="btn-close" @click="closeModal">×</button>
                </div>
                <div class="modal-body">
                    <div class="field">
                        <label>Language</label>
                        <select v-model="addForm.language">
                            <option value="fi">Finnish</option>
                            <option value="en">English</option>
                            <option value="sv">Swedish</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Polling Interval (minutes)</label>
                        <input v-model.number="addForm.pollingInterval" type="number" min="5" max="1440" />
                    </div>
                    <template v-if="selectedPreset?.filterConfig?.length">
                        <h4>Filters</h4>
                        <div v-for="field in selectedPreset.filterConfig" :key="field.key" class="field">
                            <label>{{ field.label }}<span v-if="field.required" class="required">*</span></label>
                            <input v-model="addForm.filters[field.key]" :type="field.type === 'number' ? 'number' : 'text'" />
                        </div>
                    </template>
                    <p v-if="addError" class="error">{{ addError }}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="closeModal">Cancel</button>
                    <button class="btn-primary" :disabled="adding" @click="addSource">
                        {{ adding ? 'Adding...' : 'Add Source' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header nav { display: flex; gap: 1rem; align-items: center; }
.page-header nav a { color: #2563eb; text-decoration: none; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
h2 { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }
h4 { font-size: 0.875rem; font-weight: 600; margin: 1rem 0 0.5rem; }
.preset-list, .item-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.preset-item, .item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f9fafb; border-radius: 6px; }
.meta { display: block; font-size: 0.75rem; color: #6b7280; margin-top: 0.125rem; }
.badge { display: inline-block; padding: 0.125rem 0.375rem; background: #eff6ff; color: #1d4ed8; border-radius: 999px; font-size: 0.75rem; margin-left: 0.5rem; }
.status { display: inline-block; padding: 0.125rem 0.375rem; border-radius: 999px; font-size: 0.75rem; margin-left: 0.5rem; }
.status.active { background: #dcfce7; color: #16a34a; }
.status.inactive { background: #fee2e2; color: #dc2626; }
.actions { display: flex; gap: 0.5rem; }
.empty { color: #6b7280; font-size: 0.875rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; }
label { font-size: 0.875rem; font-weight: 500; color: #374151; }
input, select { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; }
.required { color: #dc2626; margin-left: 0.125rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 8px; width: 480px; max-width: 90vw; max-height: 80vh; display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
.modal-header h3 { margin: 0; font-size: 1rem; font-weight: 600; }
.modal-body { padding: 1.5rem; overflow-y: auto; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 0.5rem; }
.btn-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #6b7280; }
.btn-primary { padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { padding: 0.375rem 0.75rem; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
.btn-danger { padding: 0.375rem 0.75rem; background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
.btn-link { background: none; border: none; color: #2563eb; cursor: pointer; font-size: 1rem; padding: 0; }
.error { color: #dc2626; font-size: 0.875rem; }
</style>
