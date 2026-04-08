export default defineNuxtConfig({
    compatibilityDate: '2026-04-08',
    devtools: { enabled: true },
    modules: ['@nuxt/ui', '@nuxtjs/google-fonts'],
    css: ['~/assets/css/main.css'],
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000',
        },
    },
    googleFonts: {
        families: {
            Fraunces: [300, 400, 500, 600, 700],
            'Bricolage Grotesque': [300, 400, 500, 600, 700],
        },
        display: 'swap',
        preload: true,
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
});
