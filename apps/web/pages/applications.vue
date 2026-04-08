<template>
    <div>
        <h1
            class="text-3xl font-semibold italic mb-6"
            style="font-family: var(--font-display); color: var(--color-text-default)"
        >
            Applications
        </h1>

        <p v-if="loadError"
            class="text-sm mb-4"
            style="color: var(--color-error)">
            {{ loadError }}
        </p>

        <div
            class="border rounded-xl overflow-hidden"
            style="background-color: var(--color-card); border-color: var(--color-border)"
        >
            <p
                v-if="applications.length === 0 && !loadError"
                class="text-sm p-6"
                style="color: var(--color-text-faint)"
            >
                No applications yet.
            </p>

            <UTable
                v-else
                :data="applications"
                :columns="columns"
                class="w-full"
                @select="openDetail"
            >
                <template #jobTitle-cell="{ row }">
                    <a
                        v-if="row.jobUrl"
                        :href="row.jobUrl"
                        target="_blank"
                        class="font-medium hover:underline"
                        style="color: var(--color-accent)"
                        @click.stop
                    >{{ row.jobTitle }}</a>

                    <span v-else
                        style="color: var(--color-text-default)">{{ row.jobTitle }}</span>
                </template>

                <template #matchScore-cell="{ row }">
                    <span
                        class="font-semibold"
                        :class="scoreColorClass(Math.round(row.matchScore * 100))"
                        style="font-family: var(--font-display)"
                    >{{ Math.round(row.matchScore * 100) }}%</span>
                </template>

                <template #matched-cell="{ row }">
                    <UBadge
                        :color="row.matched ? 'success' : 'neutral'"
                        variant="soft"
                        size="xs"
                    >
                        {{ row.matched ? 'Yes' : 'No' }}
                    </UBadge>
                </template>

                <template #emailedAt-cell="{ row }">
                    <span style="color: var(--color-text-muted)">{{ formatDate(row.emailedAt) }}</span>
                </template>

                <template #createdAt-cell="{ row }">
                    <span style="color: var(--color-text-muted)">{{ formatDate(row.createdAt) }}</span>
                </template>

                <template #actions-cell="{ row }">
                    <UButton
                        variant="ghost"
                        size="xs"
                        trailing-icon="i-lucide-chevron-right"
                        @click="openDetail(row)"
                    >
                        Details
                    </UButton>
                </template>
            </UTable>
        </div>

        <!-- Application Detail Drawer -->
        <USlideover
            v-model:open="isDrawerOpen"
            side="right"
            :ui="{ width: 'w-[560px]' }"
            :title="selectedApp?.jobTitle ?? ''"
        >
            <template #description>
                <span v-if="selectedApp"
                    style="color: var(--color-text-muted)">
                    {{ selectedApp.company }} ·
                    <span :class="scoreColorClass(Math.round(selectedApp.matchScore * 100))">
                        {{ Math.round(selectedApp.matchScore * 100) }}%
                    </span>
                </span>
            </template>

            <template v-if="selectedApp"
                #body>
                <!-- Rationale -->
                <div
                    class="border rounded-xl p-4 mb-4"
                    style="background-color: var(--color-background); border-color: var(--color-border)"
                >
                    <p class="text-xs font-semibold uppercase tracking-widest mb-2"
                        style="color: var(--color-text-faint)">
                        Match Rationale
                    </p>

                    <p class="text-sm leading-relaxed"
                        style="color: var(--color-text-default)">
                        {{ selectedApp.matchRationale }}
                    </p>
                </div>

                <!-- Tabs -->
                <div v-if="tabItems.length > 0">
                    <UTabs v-model="activeTab"
                        :items="tabItems"
                        class="mb-4" />

                    <div v-if="activeTab === 'cv' && selectedApp.tailoredCvSnapshot">
                        <pre
                            class="text-xs font-mono whitespace-pre-wrap break-all rounded-xl p-4"
                            style="background-color: var(--color-background); color: var(--color-text-default)"
                        >{{ JSON.stringify(selectedApp.tailoredCvSnapshot, null, 2) }}</pre>
                    </div>

                    <div v-else-if="activeTab === 'letter' && selectedApp.coverLetterText">
                        <pre
                            class="text-sm whitespace-pre-wrap leading-relaxed"
                            style="font-family: var(--font-sans); color: var(--color-text-default)"
                        >{{ selectedApp.coverLetterText }}</pre>
                    </div>
                </div>

                <p v-else
                    class="text-sm"
                    style="color: var(--color-text-faint)">
                    No content available.
                </p>
            </template>
        </USlideover>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { apiFetch } = useApi()

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
const isDrawerOpen = ref(false)
const activeTab = ref('cv')

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
    isDrawerOpen.value = true
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function scoreColorClass(score: number) {
    if (score >= 80) return 'text-[var(--color-success)]'
    if (score >= 50) return 'text-[var(--color-warning)]'
    return 'text-[var(--color-error)]'
}

const tabItems = computed(() => {
    const tabs = []
    if (selectedApp.value?.tailoredCvSnapshot) tabs.push({ label: 'Tailored CV', value: 'cv' })
    if (selectedApp.value?.coverLetterText) tabs.push({ label: 'Cover Letter', value: 'letter' })
    return tabs
})

const columns = [
    { key: 'jobTitle', label: 'Job' },
    { key: 'company', label: 'Company' },
    { key: 'matchScore', label: 'Score' },
    { key: 'matched', label: 'Matched' },
    { key: 'emailedAt', label: 'Emailed' },
    { key: 'createdAt', label: 'Date' },
    { key: 'actions', label: '' },
]
</script>
