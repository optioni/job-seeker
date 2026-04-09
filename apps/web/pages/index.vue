<template>
    <div>
        <!-- Loading -->
        <div v-if="pending"
            class="flex items-center justify-center py-24">
            <UIcon name="i-lucide-loader-2"
                class="size-8 animate-spin"
                style="color: var(--color-text-faint)" />
        </div>

        <!-- Error -->
        <div v-else-if="error"
            class="text-sm py-8"
            style="color: var(--color-error)">
            {{ error }}
        </div>

        <!-- Content -->
        <div v-else-if="data">
            <!-- Header row -->
            <div class="flex items-start justify-between mb-8">
                <div>
                    <p class="text-xs font-medium uppercase tracking-widest mb-1"
                        style="color: var(--color-text-faint)">
                        {{ today }}
                    </p>

                    <h1
                        class="text-4xl font-semibold italic leading-tight"
                        style="font-family: var(--font-display); color: var(--color-text-default)"
                    >
                        <template v-if="data.newMatchesToday === 0">{{ $t('dashboard.noNewMatches') }}</template>

                        <template v-else>
                            <span style="color: var(--color-accent)">{{ data.newMatchesToday }}</span>
                            {{ data.newMatchesToday !== 1 ? $t('dashboard.newMatchesPlural') : $t('dashboard.newMatchesSingular') }}
                        </template>
                    </h1>
                </div>

                <!-- Week stats top-right -->
                <div
                    class="flex gap-6 border rounded-xl px-6 py-4 shrink-0"
                    style="background-color: var(--color-card); border-color: var(--color-border)"
                >
                    <div class="text-center">
                        <p class="text-xs font-medium uppercase tracking-wider mb-0.5"
                            style="color: var(--color-text-faint)">
                            {{ $t('dashboard.evaluated') }}
                        </p>

                        <p class="text-2xl font-semibold"
                            style="font-family: var(--font-display); color: var(--color-text-default)">
                            {{ data.thisWeek.evaluated }}
                        </p>

                        <p class="text-xs mt-0.5"
                            :class="statDeltaClass(data.thisWeek.evaluated, data.lastWeek.evaluated)">
                            {{ statDelta(data.thisWeek.evaluated, data.lastWeek.evaluated) }}
                        </p>
                    </div>

                    <div class="text-center">
                        <p class="text-xs font-medium uppercase tracking-wider mb-0.5"
                            style="color: var(--color-text-faint)">
                            {{ $t('dashboard.matched') }}
                        </p>

                        <p class="text-2xl font-semibold"
                            style="font-family: var(--font-display); color: var(--color-text-default)">
                            {{ data.thisWeek.matched }}
                        </p>

                        <p class="text-xs mt-0.5"
                            :class="statDeltaClass(data.thisWeek.matched, data.lastWeek.matched)">
                            {{ statDelta(data.thisWeek.matched, data.lastWeek.matched) }}
                        </p>
                    </div>

                    <div class="text-center">
                        <p class="text-xs font-medium uppercase tracking-wider mb-0.5"
                            style="color: var(--color-text-faint)">
                            {{ $t('dashboard.avgScore') }}
                        </p>

                        <p class="text-2xl font-semibold"
                            style="font-family: var(--font-display); color: var(--color-text-default)">
                            {{ data.thisWeek.avgScore }}%
                        </p>

                        <p class="text-xs mt-0.5"
                            :class="statDeltaClass(data.thisWeek.avgScore, data.lastWeek.avgScore)">
                            {{ statDelta(data.thisWeek.avgScore, data.lastWeek.avgScore) }}
                        </p>
                    </div>

                    <div class="text-center">
                        <p class="text-xs font-medium uppercase tracking-wider mb-0.5"
                            style="color: var(--color-text-faint)">
                            {{ $t('dashboard.digests') }}
                        </p>

                        <p class="text-2xl font-semibold"
                            style="font-family: var(--font-display); color: var(--color-text-default)">
                            {{ data.thisWeek.digestsSent }}
                        </p>

                        <p class="text-xs mt-0.5 text-[var(--color-text-faint)]">{{ $t('dashboard.thisWeek') }}</p>
                    </div>
                </div>
            </div>

            <!-- Best match hero card -->
            <div
                v-if="data.bestMatch"
                class="border rounded-xl p-6 mb-6"
                style="background-color: var(--color-card); border-color: var(--color-border)"
            >
                <div class="flex items-start gap-6">
                    <!-- Score panel -->
                    <div
                        class="shrink-0 flex flex-col items-center justify-center rounded-xl w-24 h-24 border"
                        style="background-color: var(--color-background); border-color: var(--color-border)"
                    >
                        <span
                            class="text-3xl font-bold"
                            :class="scoreClass(data.bestMatch.matchScore)"
                            style="font-family: var(--font-display)"
                        >{{ data.bestMatch.matchScore }}%</span>

                        <span class="text-[10px] uppercase tracking-widest mt-0.5"
                            style="color: var(--color-text-faint)">{{ $t('dashboard.match') }}</span>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <UBadge color="primary"
                                variant="soft"
                                size="xs">
                                {{ $t('dashboard.bestMatch') }}
                            </UBadge>
                        </div>

                        <h2
                            class="text-xl font-semibold leading-tight mb-0.5"
                            style="font-family: var(--font-display); color: var(--color-text-default)"
                        >
                            {{ data.bestMatch.jobTitle }}
                        </h2>

                        <p class="text-sm mb-3"
                            style="color: var(--color-text-muted)">
                            {{ data.bestMatch.company }}
                            <template v-if="data.bestMatch.location"> · {{ data.bestMatch.location }}</template>
                        </p>

                        <p class="text-sm leading-relaxed"
                            style="color: var(--color-text-default)">
                            {{ data.bestMatch.matchRationale }}
                        </p>

                        <div class="flex gap-3 mt-4">
                            <UButton
                                to="/applications"
                                size="sm"
                                color="primary"
                                variant="solid"
                            >
                                {{ $t('dashboard.viewFullApplication') }}
                            </UButton>

                            <UButton
                                v-if="data.bestMatch.jobUrl"
                                :href="data.bestMatch.jobUrl"
                                target="_blank"
                                size="sm"
                                color="neutral"
                                variant="outline"
                                trailing-icon="i-lucide-external-link"
                            >
                                {{ $t('dashboard.openListing') }}
                            </UButton>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Also new today grid -->
            <template v-if="data.otherNewMatches.length > 0">
                <h3
                    class="text-sm font-semibold uppercase tracking-widest mb-3"
                    style="color: var(--color-text-faint)"
                >
                    {{ $t('dashboard.alsoNewToday') }}
                </h3>

                <div class="grid grid-cols-3 gap-4 mb-8">
                    <div
                        v-for="match in data.otherNewMatches"
                        :key="match.id"
                        class="border rounded-xl p-4"
                        style="background-color: var(--color-card); border-color: var(--color-border)"
                    >
                        <div class="flex items-start justify-between mb-2">
                            <UBadge color="primary"
                                variant="soft"
                                size="xs">
                                {{ $t('dashboard.new') }}
                            </UBadge>

                            <span
                                class="text-sm font-semibold"
                                :class="scoreClass(match.matchScore)"
                                style="font-family: var(--font-display)"
                            >{{ match.matchScore }}%</span>
                        </div>

                        <p
                            class="font-semibold text-sm leading-tight mb-1"
                            style="color: var(--color-text-default)"
                        >
                            {{ match.jobTitle }}
                        </p>

                        <p class="text-xs"
                            style="color: var(--color-text-muted)">
                            {{ match.company }}
                        </p>
                    </div>
                </div>
            </template>

            <!-- Empty state -->
            <div
                v-if="!data.bestMatch"
                class="border rounded-xl p-12 text-center"
                style="border-color: var(--color-border)"
            >
                <p class="text-sm"
                    style="color: var(--color-text-faint)">
                    {{ $t('dashboard.emptyState') }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data, pending, error, fetch } = useDashboard()
const { locale } = useI18n()

onMounted(() => fetch())

const today = computed(() => new Date().toLocaleDateString(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
}))

function scoreClass(score: number): string {
    if (score >= 80) return 'text-[var(--color-success)]'
    if (score >= 50) return 'text-[var(--color-warning)]'
    return 'text-[var(--color-error)]'
}

function statDelta(current: number, previous: number): string {
    const diff = current - previous
    if (diff === 0) return '—'
    return diff > 0 ? `+${diff}` : String(diff)
}

function statDeltaClass(current: number, previous: number, higherIsBetter = true): string {
    const diff = current - previous
    if (diff === 0) return 'text-[var(--color-text-faint)]'
    const good = higherIsBetter ? diff > 0 : diff < 0
    return good ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
}
</script>
