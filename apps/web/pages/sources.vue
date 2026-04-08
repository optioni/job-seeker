<template>
    <div>
        <h1
            class="text-3xl font-semibold italic mb-6"
            style="font-family: var(--font-display); color: var(--color-text-default)"
        >
            Job Sources
        </h1>

        <p v-if="loadError"
            class="text-sm mb-4"
            style="color: var(--color-error)">
            {{ loadError }}
        </p>

        <!-- Available Presets -->
        <div
            class="border rounded-xl p-6 mb-6"
            style="background-color: var(--color-card); border-color: var(--color-border)"
        >
            <h2 class="text-sm font-semibold uppercase tracking-widest mb-4"
                style="color: var(--color-text-faint)">
                Available Job Boards
            </h2>

            <div class="grid grid-cols-3 gap-4">
                <div
                    v-for="preset in presets"
                    :key="preset.id"
                    class="border rounded-xl p-4 flex flex-col justify-between gap-3"
                    style="background-color: var(--color-background); border-color: var(--color-border)"
                >
                    <div>
                        <p class="font-semibold text-sm mb-1"
                            style="color: var(--color-text-default)">
                            {{ preset.name }}
                        </p>

                        <p class="text-xs mb-2"
                            style="color: var(--color-text-faint)">
                            {{ preset.baseUrl }}
                        </p>

                        <UBadge color="neutral"
                            variant="soft"
                            size="xs">
                            {{ preset.defaultLanguage.toUpperCase() }}
                        </UBadge>
                    </div>

                    <UButton
                        color="neutral"
                        variant="outline"
                        size="sm"
                        @click="openAddModal(preset)"
                    >
                        Add Source
                    </UButton>
                </div>
            </div>
        </div>

        <!-- My Sources -->
        <div
            class="border rounded-xl p-6"
            style="background-color: var(--color-card); border-color: var(--color-border)"
        >
            <h2 class="text-sm font-semibold uppercase tracking-widest mb-4"
                style="color: var(--color-text-faint)">
                My Sources
            </h2>

            <p
                v-if="sources.length === 0"
                class="text-sm"
                style="color: var(--color-text-faint)"
            >
                No sources configured yet. Add one from the list above.
            </p>

            <div v-else
                class="flex flex-col gap-3">
                <div
                    v-for="source in sources"
                    :key="source.id"
                    class="flex items-center justify-between border rounded-xl px-4 py-3"
                    style="background-color: var(--color-background); border-color: var(--color-border)"
                >
                    <div>
                        <p class="font-semibold text-sm"
                            style="color: var(--color-text-default)">
                            {{ source.presetName }}
                        </p>

                        <p class="text-xs mt-0.5"
                            style="color: var(--color-text-faint)">
                            Every {{ source.pollingInterval }} min · {{ source.language.toUpperCase() }}
                        </p>
                    </div>

                    <div class="flex items-center gap-3">
                        <UBadge :color="source.active ? 'success' : 'error'"
                            variant="soft"
                            size="sm">
                            {{ source.active ? 'Active' : 'Paused' }}
                        </UBadge>

                        <UButton
                            color="neutral"
                            variant="outline"
                            size="xs"
                            @click="toggleActive(source)"
                        >
                            {{ source.active ? 'Pause' : 'Activate' }}
                        </UButton>

                        <UButton
                            color="error"
                            variant="soft"
                            size="xs"
                            @click="deleteSource(source.id)"
                        >
                            Delete
                        </UButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Source Modal -->
        <UModal
            v-model:open="showAddModal"
            :title="`Add Source: ${selectedPreset?.name ?? ''}`"
        >
            <template #body>
                <div class="space-y-4">
                    <UFormField label="Language"
                        name="language">
                        <USelect
                            v-model="addForm.language"
                            :items="languageOptions"
                            value-key="value"
                            label-key="label"
                            class="w-full"
                        />
                    </UFormField>

                    <UFormField label="Polling Interval (minutes)"
                        name="pollingInterval">
                        <UInput
                            v-model.number="addForm.pollingInterval"
                            type="number"
                            :min="5"
                            :max="1440"
                            class="w-full"
                        />
                    </UFormField>

                    <template v-if="selectedPreset?.filterConfig?.length">
                        <p class="text-xs font-semibold uppercase tracking-widest"
                            style="color: var(--color-text-faint)">
                            Filters
                        </p>

                        <UFormField
                            v-for="field in selectedPreset.filterConfig"
                            :key="field.key"
                            :label="field.label"
                            :name="field.key"
                            :required="field.required"
                        >
                            <UInput
                                v-model="addForm.filters[field.key]"
                                :type="field.type === 'number' ? 'number' : 'text'"
                                class="w-full"
                            />
                        </UFormField>
                    </template>

                    <p v-if="addError"
                        class="text-sm"
                        style="color: var(--color-error)">
                        {{ addError }}
                    </p>
                </div>
            </template>

            <template #footer>
                <UButton color="neutral"
                    variant="ghost"
                    @click="showAddModal = false">
                    Cancel
                </UButton>

                <UButton color="primary"
                    variant="solid"
                    :loading="adding"
                    @click="addSource">
                    Add Source
                </UButton>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { apiFetch } = useApi()

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
        showAddModal.value = false
        selectedPreset.value = null
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
        // ignore
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

const languageOptions = [
    { label: 'Finnish', value: 'fi' },
    { label: 'English', value: 'en' },
    { label: 'Swedish', value: 'sv' },
]
</script>
