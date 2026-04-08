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
                Job Seeker
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
                    autocomplete="current-password"
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
                Sign In
            </UButton>
        </UForm>

        <p class="text-sm mt-6 text-center"
            style="color: var(--color-text-muted)">
            Don't have an account?
            <NuxtLink to="/register"
                class="font-medium"
                style="color: var(--color-accent)">
                Register
            </NuxtLink>
        </p>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: [] })

const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
    loading.value = true
    error.value = ''
    try {
        await login(email.value, password.value)
        await navigateTo('/')
    } catch {
        error.value = 'Invalid email or password'
    } finally {
        loading.value = false
    }
}
</script>
