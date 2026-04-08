<template>
    <div
        class="border rounded-2xl p-8"
        style="background-color: var(--color-card); border-color: var(--color-border)"
    >
        <div class="mb-8">
            <p class="text-xs font-semibold uppercase tracking-widest mb-1"
                style="color: var(--color-text-faint)">
                YOUR SEARCH
            </p>

            <h1
                class="text-3xl italic font-semibold"
                style="font-family: var(--font-display); color: var(--color-text-default)"
            >
                Create Account
            </h1>
        </div>

        <UForm :state="{ email, password }"
            @submit="handleSubmit">
            <UFormField label="Email"
                name="email"
                class="mb-4">
                <UInput
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    placeholder="you@example.com"
                    required
                    class="w-full"
                />
            </UFormField>

            <UFormField label="Password"
                name="password"
                class="mb-6">
                <UInput
                    v-model="password"
                    type="password"
                    autocomplete="new-password"
                    placeholder="••••••••"
                    required
                    class="w-full"
                />
            </UFormField>

            <p v-if="error"
                class="text-sm mb-4"
                style="color: var(--color-error)">
                {{ error }}
            </p>

            <UButton
                type="submit"
                color="primary"
                variant="solid"
                class="w-full justify-center"
                :loading="loading"
            >
                Create Account
            </UButton>
        </UForm>

        <p class="text-sm mt-6 text-center"
            style="color: var(--color-text-muted)">
            Already have an account?
            <NuxtLink to="/login"
                class="font-medium"
                style="color: var(--color-accent)">
                Sign In
            </NuxtLink>
        </p>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: [] })

const { register } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
    loading.value = true
    error.value = ''
    try {
        await register(email.value, password.value)
        await navigateTo('/')
    } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status === 409) error.value = 'Email already registered'
        else if (status === 403) error.value = 'Registration is not available'
        else error.value = 'Registration failed. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>
