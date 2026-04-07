<script setup lang="ts">
const { apiFetch } = useApi()
const { logout } = useAuth()

interface JobApplication {
    id: string
    jobTitle: string
    company: string
    matchScore: number
    matched: boolean
    matchRationale: string
    tailoredCvSnapshot: Record<string, unknown> | null
    coverLetterText: string | null
    emailedAt: string | null
    createdAt: string
    jobUrl: string
}

const applications = ref<JobApplication[]>([])
const loadError = ref('')
const selectedApp = ref<JobApplication | null>(null)
const activeTab = ref<'cv' | 'letter'>('cv')

onMounted(async () => {
    try {
        const data = await apiFetch<JobApplication[]>('/applications')
        applications.value = data
    } catch {
        loadError.value = 'Failed to load applications'
    }
})

function openDetail(app: JobApplication) {
    selectedApp.value = app
    activeTab.value = 'cv'
}

function closeDetail() {
    selectedApp.value = null
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function scoreColor(score: number) {
    if (score >= 0.8) return '#16a34a'
    if (score >= 0.5) return '#d97706'
    return '#dc2626'
}

async function handleLogout() {
    logout()
    await navigateTo('/login')
}
</script>

<template>
    <div class="page">
        <header class="page-header">
            <h1>Applications</h1>
            <nav>
                <NuxtLink to="/cv">CV</NuxtLink>
                <NuxtLink to="/preferences">Preferences</NuxtLink>
                <NuxtLink to="/sources">Sources</NuxtLink>
                <button class="btn-link" @click="handleLogout">Logout</button>
            </nav>
        </header>

        <p v-if="loadError" class="error">{{ loadError }}</p>

        <div class="card">
            <p v-if="applications.length === 0 && !loadError" class="empty">No applications yet.</p>
            <table v-else class="table">
                <thead>
                    <tr>
                        <th>Job</th>
                        <th>Company</th>
                        <th>Score</th>
                        <th>Matched</th>
                        <th>Emailed</th>
                        <th>Date</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="app in applications"
                        :key="app.id"
                        class="row"
                        @click="openDetail(app)"
                    >
                        <td>
                            <a v-if="app.jobUrl" :href="app.jobUrl" target="_blank" class="job-link" @click.stop>{{ app.jobTitle }}</a>
                            <span v-else>{{ app.jobTitle }}</span>
                        </td>
                        <td>{{ app.company }}</td>
                        <td>
                            <span class="score" :style="{ color: scoreColor(app.matchScore) }">
                                {{ Math.round(app.matchScore * 100) }}%
                            </span>
                        </td>
                        <td>
                            <span :class="['badge', app.matched ? 'badge-success' : 'badge-muted']">
                                {{ app.matched ? 'Yes' : 'No' }}
                            </span>
                        </td>
                        <td>{{ formatDate(app.emailedAt) }}</td>
                        <td>{{ formatDate(app.createdAt) }}</td>
                        <td><button class="btn-text">Details →</button></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Detail Drawer -->
        <div v-if="selectedApp" class="drawer-overlay" @click.self="closeDetail">
            <div class="drawer">
                <div class="drawer-header">
                    <div>
                        <h2>{{ selectedApp.jobTitle }}</h2>
                        <p class="drawer-sub">{{ selectedApp.company }} · Score: {{ Math.round(selectedApp.matchScore * 100) }}%</p>
                    </div>
                    <button class="btn-close" @click="closeDetail">×</button>
                </div>

                <div class="rationale">
                    <strong>Match Rationale</strong>
                    <p>{{ selectedApp.matchRationale }}</p>
                </div>

                <div v-if="selectedApp.tailoredCvSnapshot || selectedApp.coverLetterText" class="tabs">
                    <button
                        v-if="selectedApp.tailoredCvSnapshot"
                        :class="['tab', activeTab === 'cv' ? 'active' : '']"
                        @click="activeTab = 'cv'"
                    >
                        Tailored CV
                    </button>
                    <button
                        v-if="selectedApp.coverLetterText"
                        :class="['tab', activeTab === 'letter' ? 'active' : '']"
                        @click="activeTab = 'letter'"
                    >
                        Cover Letter
                    </button>
                </div>

                <div class="drawer-body">
                    <div v-if="activeTab === 'cv' && selectedApp.tailoredCvSnapshot">
                        <pre class="json-view">{{ JSON.stringify(selectedApp.tailoredCvSnapshot, null, 2) }}</pre>
                    </div>
                    <div v-else-if="activeTab === 'letter' && selectedApp.coverLetterText">
                        <pre class="letter-view">{{ selectedApp.coverLetterText }}</pre>
                    </div>
                    <p v-else class="empty">No content available.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header nav { display: flex; gap: 1rem; align-items: center; }
.page-header nav a { color: #2563eb; text-decoration: none; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.table th { padding: 0.75rem 1rem; text-align: left; background: #f9fafb; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; }
.table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f3f4f6; }
.row { cursor: pointer; transition: background 0.1s; }
.row:hover { background: #f9fafb; }
.job-link { color: #2563eb; text-decoration: none; }
.job-link:hover { text-decoration: underline; }
.score { font-weight: 600; }
.badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 500; }
.badge-success { background: #dcfce7; color: #16a34a; }
.badge-muted { background: #f3f4f6; color: #6b7280; }
.btn-text { background: none; border: none; color: #2563eb; cursor: pointer; font-size: 0.875rem; }
.empty { color: #6b7280; font-size: 0.875rem; padding: 1rem; }
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; justify-content: flex-end; }
.drawer { width: 560px; max-width: 90vw; background: white; height: 100%; display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.1); }
.drawer-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
.drawer-header h2 { margin: 0; font-size: 1rem; font-weight: 600; }
.drawer-sub { margin: 0.25rem 0 0; font-size: 0.875rem; color: #6b7280; }
.btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; }
.rationale { padding: 1rem 1.5rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; }
.rationale strong { display: block; margin-bottom: 0.25rem; }
.rationale p { margin: 0; color: #374151; }
.tabs { display: flex; gap: 0; border-bottom: 1px solid #e5e7eb; padding: 0 1.5rem; }
.tab { padding: 0.75rem 1rem; background: none; border: none; border-bottom: 2px solid transparent; font-size: 0.875rem; cursor: pointer; color: #6b7280; }
.tab.active { border-bottom-color: #2563eb; color: #2563eb; font-weight: 500; }
.drawer-body { flex: 1; overflow-y: auto; padding: 1.5rem; }
.json-view { font-size: 0.75rem; font-family: monospace; white-space: pre-wrap; word-break: break-all; background: #f9fafb; padding: 1rem; border-radius: 6px; margin: 0; }
.letter-view { font-size: 0.875rem; font-family: inherit; white-space: pre-wrap; margin: 0; line-height: 1.6; }
.btn-link { background: none; border: none; color: #2563eb; cursor: pointer; font-size: 1rem; padding: 0; }
.error { color: #dc2626; font-size: 0.875rem; }
</style>
