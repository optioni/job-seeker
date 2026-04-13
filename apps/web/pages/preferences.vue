<template>
    <div>
        <h1
            class="text-3xl font-semibold italic mb-6"
            style="font-family: var(--font-display); color: var(--color-text-default)"
        >
            {{ $t('preferences.title') }}
        </h1>

        <div
            class="border rounded-xl p-6"
            style="background-color: var(--color-card); border-color: var(--color-border)"
        >
            <div class="grid grid-cols-2 gap-4">
                <UFormField :label="$t('preferences.roleLabel')"
                    name="role">
                    <UInput
                        v-model="prefs.targetRole"
                        type="text"
                        placeholder="e.g. Software Engineer"
                        class="w-full"
                    />
                </UFormField>

                <UFormField :label="$t('preferences.seniorityLabel')"
                    name="seniority">
                    <USelect
                        v-model="prefs.seniority"
                        :items="seniorityOptions"
                        value-key="value"
                        label-key="label"
                        class="w-full"
                    />
                </UFormField>

                <UFormField :label="$t('preferences.locationsLabel')"
                    name="locations"
                    :hint="$t('preferences.commaSeparated')">
                    <UInput
                        v-model="locationsInput"
                        type="text"
                        placeholder="Helsinki, Espoo, Remote"
                        class="w-full"
                    />
                </UFormField>

                <UFormField :label="$t('preferences.industriesLabel')"
                    name="industries"
                    :hint="$t('preferences.commaSeparated')">
                    <UInput
                        v-model="industriesInput"
                        type="text"
                        placeholder="Technology, Finance"
                        class="w-full"
                    />
                </UFormField>

                <UFormField :label="$t('preferences.salaryMinLabel')"
                    name="salaryMin"
                    :hint="$t('preferences.euroPerYear')">
                    <UInput
                        v-model.number="prefs.salaryMin"
                        type="number"
                        :min="0"
                        :step="1000"
                        class="w-full"
                    />
                </UFormField>

                <UFormField :label="$t('preferences.salaryMaxLabel')"
                    name="salaryMax"
                    :hint="$t('preferences.euroPerYear')">
                    <UInput
                        v-model.number="prefs.salaryMax"
                        type="number"
                        :min="0"
                        :step="1000"
                        class="w-full"
                    />
                </UFormField>

                <UFormField :label="$t('preferences.defaultLanguageLabel')"
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
                    {{ $t('preferences.saveButton') }}
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
const { t } = useI18n()

interface JobPreferences {
    id?: string
    locations: string[]
    targetRole: string
    seniority: string
    salaryMin: number | null
    salaryMax: number | null
    desiredIndustries: string[]
    defaultLanguage: string
}

const prefs = ref<JobPreferences>({
    locations: [],
    targetRole: '',
    seniority: 'any',
    salaryMin: null,
    salaryMax: null,
    desiredIndustries: [],
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
        const data = await apiFetch<JobPreferences | null>('/preferences')
        if (data) {
            prefsId.value = data.id ?? null
            prefs.value = { ...data, seniority: data.seniority || 'any' }
            locationsInput.value = (data.locations ?? []).join(', ')
            industriesInput.value = (data.desiredIndustries ?? []).join(', ')
        }
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
    prefs.value.desiredIndustries = industriesInput.value.split(',').map((s) => s.trim()).filter(Boolean)
    try {
        const method = prefsId.value ? 'PATCH' : 'POST'
        const path = '/preferences'
        const body = { ...prefs.value, seniority: prefs.value.seniority === 'any' ? '' : prefs.value.seniority }
        const data = await apiFetch<JobPreferences>(path, { method, body })
        prefsId.value = data.id ?? null
        prefs.value = { ...data, seniority: data.seniority || 'any' }
        saveMessage.value = t('common.saved')
    } catch {
        saveMessage.value = t('common.saveFailed')
        saveFailed.value = true
    } finally {
        saving.value = false
    }
}

const seniorityOptions = computed(() => [
    { label: t('preferences.seniorityAny'), value: 'any' },
    { label: t('preferences.seniorityJunior'), value: 'junior' },
    { label: t('preferences.seniorityMid'), value: 'mid' },
    { label: t('preferences.senioritySenior'), value: 'senior' },
    { label: t('preferences.seniorityLead'), value: 'lead' },
    { label: t('preferences.seniorityPrincipal'), value: 'principal' },
])

const languageOptions = computed(() => [
    { label: t('preferences.languageFinnish'), value: 'fi' },
    { label: t('preferences.languageEnglish'), value: 'en' },
])
</script>
