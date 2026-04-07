export default defineNuxtConfig({
    devtools: { enabled: true },
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000',
        },
    },
    nitro: {
        preset: 'node-server',
    },
    typescript: {
        strict: true,
    },
    router: {
        middleware: ['auth'],
    },
})
