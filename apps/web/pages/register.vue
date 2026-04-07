<script setup lang="ts">
definePageMeta({ middleware: [] })

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

<template>
    <div class="auth-container">
        <h1>Create Account</h1>
        <form @submit.prevent="handleSubmit">
            <div class="field">
                <label>Email</label>
                <input v-model="email" type="email" required autocomplete="email" />
            </div>
            <div class="field">
                <label>Password</label>
                <input v-model="password" type="password" required autocomplete="new-password" />
            </div>
            <p v-if="error" class="error">{{ error }}</p>
            <button type="submit" :disabled="loading">
                {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
        </form>
        <p><NuxtLink to="/login">Already have an account? Sign In</NuxtLink></p>
    </div>
</template>

<style scoped>
.auth-container { max-width: 400px; margin: 80px auto; padding: 2rem; }
.field { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.25rem; }
input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
button { width: 100%; padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.error { color: #dc2626; font-size: 0.875rem; }
</style>
