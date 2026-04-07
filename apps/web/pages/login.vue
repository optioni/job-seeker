<script setup lang="ts">
definePageMeta({ middleware: [] }) // skip auth middleware for this page

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

<template>
    <div class="auth-container">
        <h1>Sign In</h1>
        <form @submit.prevent="handleSubmit">
            <div class="field">
                <label>Email</label>
                <input v-model="email" type="email" required autocomplete="email" />
            </div>
            <div class="field">
                <label>Password</label>
                <input v-model="password" type="password" required autocomplete="current-password" />
            </div>
            <p v-if="error" class="error">{{ error }}</p>
            <button type="submit" :disabled="loading">
                {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
        </form>
        <p><NuxtLink to="/register">Don't have an account? Register</NuxtLink></p>
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
