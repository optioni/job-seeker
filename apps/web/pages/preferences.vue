<template>
    <div>
        <h1
            class="text-3xl font-semibold italic mb-6"
            style="font-family: var(--font-display); color: var(--color-text-default)"
        >
            Job Preferences
        </h1>

        <div
            class="border rounded-xl p-6"
            style="background-color: var(--color-card); border-color: var(--color-border)"
        >
            <div class="grid grid-cols-2 gap-4">
                <UFormField label="Target Role"
                    name="role">
                    <UInput
                        v-model="prefs.role"
                        type="text"
                        placeholder="e.g. Software Engineer"
                        class="w-full"
                    />
                </UFormField>

                <UFormField label="Seniority"
                    name="seniority">
                    <USelect
                        v-model="prefs.seniority"
                        :items="seniorityOptions"
                        value-key="value"
                        label-key="label"
                        class="w-full"
                    />
                </UFormField>

                <UFormField label="Locations (comma-separated)"
                    name="locations">
                    <UInput
                        v-model="locationsInput"
                        type="text"
                        placeholder="e.g. Helsinki, Espoo, Remote"
                        class="w-full"
                    />
                </UFormField>

                <UFormField label="Industries (comma-separated)"
                    name="industries">
                    <UInput
                        v-model="industriesInput"
                        type="text"
                        placeholder="e.g. Technology, Finance"
                        class="w-full"
                    />
                </UFormField>

                <UFormField label="Minimum Salary (€/year)"
                    name="salaryMin">
                    <UInput
                        v-model.number="prefs.salaryMin"
                        type="number"
                        :min="0"
                        :step="1000"
                        class="w-full"
                    />
                </UFormField>

                <UFormField label="Maximum Salary (€/year)"
                    name="salaryMax">
                    <UInput
                        v-model.number="prefs.salaryMax"
                        type="number"
                        :min="0"
                        :step="1000"
                        class="w-full"
                    />
                </UFormField>

                <UFormField label="Default Language"
                    name="defaultLanguage">
                    <USelect
                        v-model="prefs.defaultLanguage"
                        :items="languageOptions"
                        value-key="value"
                        label-key="label"
                        class="w-full"
                    />
                </UFormField>
            </div>

            <div class="flex items-center gap-4 mt-6 pt-6 border-t"
                style="border-color: var(--color-border)">
                <UButton
                    color="primary"
                    variant="solid"
                    :loading="saving"
                    @click="save"
                >
                    Save Preferences
                </UButton>

                <span
                    v-if="saveMessage"
                    class="text-sm"
                    :style="{ color: saveFailed ? 'var(--color-error)' : 'var(--color-success)' }"
                >{{ saveMessage }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { apiFetch } = useApi()

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
const saveFailed = ref(false)
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
    saveFailed.value = false
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
        saveFailed.value = true
    } finally {
        saving.value = false
    }
}

const seniorityOptions = [
    { label: 'Any', value: '' },
    { label: 'Junior', value: 'junior' },
    { label: 'Mid-level', value: 'mid' },
    { label: 'Senior', value: 'senior' },
    { label: 'Lead', value: 'lead' },
    { label: 'Principal', value: 'principal' },
]

const languageOptions = [
    { label: 'Finnish', value: 'fi' },
    { label: 'English', value: 'en' },
    { label: 'Swedish', value: 'sv' },
]
</script>
