<template>
    <div>
        <h1
            class="text-3xl font-semibold italic mb-6"
            style="font-family: var(--font-display); color: var(--color-text-default)"
        >
            {{ $t('sources.title') }}
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
                {{ $t('sources.availableBoards') }}
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
                        {{ $t('sources.addSource') }}
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
                {{ $t('sources.mySources') }}
            </h2>

            <p
                v-if="sources.length === 0"
                class="text-sm"
                style="color: var(--color-text-faint)"
            >
                {{ $t('sources.empty') }}
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

                    </div>

                    <div class="flex items-center gap-3">
                        <UBadge :color="source.active ? 'success' : 'error'"
                            variant="soft"
                            size="sm">
                            {{ source.active ? $t('sources.active') : $t('sources.paused') }}
                        </UBadge>

                        <UButton
                            color="neutral"
                            variant="outline"
                            size="xs"
                            @click="toggleActive(source)"
                        >
                            {{ source.active ? $t('sources.pause') : $t('sources.activate') }}
                        </UButton>

                        <UButton
                            color="error"
                            variant="soft"
                            size="xs"
                            @click="deleteSource(source.id)"
                        >
                            {{ $t('common.delete') }}
                        </UButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Source Modal -->
        <UModal
            v-model:open="showAddModal"
            :title="$t('sources.addSourceModal', { name: selectedPreset?.name ?? '' })"
        >
            <template #body>
                <div class="space-y-4">
                    <template v-if="selectedPreset?.filterConfig?.length">
                        <p class="text-xs font-semibold uppercase tracking-widest"
                            style="color: var(--color-text-faint)">
                            {{ $t('sources.filters') }}
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
                    {{ $t('common.cancel') }}
                </UButton>

                <UButton color="primary"
                    variant="solid"
                    :loading="adding"
                    @click="addSource">
                    {{ $t('sources.addSource') }}
                </UButton>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { apiFetch } = useApi()
const { t } = useI18n()

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
    filterConfig: FilterConfigField[]
}

interface JobSource {
    id: string
    presetId: string
    presetName: string
    active: boolean
    filters: Record<string, string>
}

const presets = ref<JobSourcePreset[]>([])
const sources = ref<JobSource[]>([])
const loadError = ref('')

// Modal state
const showAddModal = ref(false)
const selectedPreset = ref<JobSourcePreset | null>(null)
const addForm = ref<{ filters: Record<string, string> }>({
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
        loadError.value = t('sources.failedToLoad')
    }
})

function openAddModal(preset: JobSourcePreset) {
    selectedPreset.value = preset
    addForm.value = {
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
                filters: addForm.value.filters,
            },
        })
        sources.value.push(data)
        showAddModal.value = false
        selectedPreset.value = null
    } catch {
        addError.value = t('sources.failedToAdd')
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

</script>
