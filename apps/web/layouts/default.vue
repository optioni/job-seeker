<template>
    <div class="relative min-h-screen"
        style="background-color: var(--color-background)">
        <!-- Top nav -->
        <header
            class="relative z-10 h-[72px] border-b"
            style="border-color: var(--color-border); border-top: 3px solid var(--color-accent);"
        >
            <div class="h-full max-w-[1040px] mx-auto px-6 flex items-center justify-between">
                <!-- Brand lockup -->
                <div class="flex items-center gap-8">
                    <div class="flex flex-col leading-none">
                        <span
                            class="text-[10px] font-semibold tracking-widest uppercase"
                            style="color: var(--color-text-faint)"
                        >YOUR SEARCH</span>

                        <span
                            class="text-xl italic font-semibold"
                            style="font-family: var(--font-display); color: var(--color-text-default)"
                        >Job Seeker</span>
                    </div>

                    <!-- Nav links -->
                    <nav class="flex items-center gap-1">
                        <NuxtLink
                            v-for="link in navLinks"
                            :key="link.to"
                            :to="link.to"
                            class="px-3 py-1.5 text-sm rounded-full transition-colors"
                            :class="[
                                isActive(link.to)
                                    ? 'font-semibold italic'
                                    : 'font-medium hover:bg-black/5'
                            ]"
                            :style="isActive(link.to)
                                ? { backgroundColor: 'var(--color-nav-active-bg)', fontFamily: 'var(--font-display)', color: 'var(--color-nav-active-text)' }
                                : { color: 'var(--color-text-muted)' }"
                        >
                            {{ link.label }}
                        </NuxtLink>
                    </nav>
                </div>

                <!-- Right side controls -->
                <div class="flex items-center gap-1">
                    <!-- Color mode toggle -->
                    <UButton
                        variant="ghost"
                        :icon="colorModeIcon"
                        size="sm"
                        :style="{ color: 'var(--color-text-muted)' }"
                        @click="cycleColorMode"
                    />

                    <!-- Logout -->
                    <UButton
                        variant="ghost"
                        icon="i-lucide-log-out"
                        size="sm"
                        :style="{ color: 'var(--color-text-muted)' }"
                        @click="handleLogout"
                    />
                </div>
            </div>
        </header>

        <!-- Page content -->
        <main class="relative z-10 max-w-[1040px] mx-auto px-6 py-8">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
const { logout } = useAuth()
const route = useRoute()
const colorMode = useColorMode()
const { t } = useI18n()

const colorModeIcon = computed(() => {
    const icons: Record<string, string> = {
        light: 'i-lucide-sun',
        dark: 'i-lucide-moon',
        system: 'i-lucide-monitor',
    }
    return icons[colorMode.preference] ?? 'i-lucide-sun'
})

const modes = ['light', 'dark', 'system'] as const

function cycleColorMode() {
    const current = colorMode.preference
    const idx = modes.indexOf(current as typeof modes[number])
    colorMode.preference = modes[(idx + 1) % modes.length]
}

const navLinks = computed(() => [
    { label: t('nav.dashboard'), to: '/' },
    { label: t('nav.applications'), to: '/applications' },
    { label: t('nav.sources'), to: '/sources' },
    { label: t('nav.preferences'), to: '/preferences' },
    { label: t('nav.cv'), to: '/cv' },
])

function isActive(to: string) {
    if (to === '/') return route.path === '/'
    return route.path.startsWith(to)
}

async function handleLogout() {
    logout()
    await navigateTo('/login')
}
</script>
