interface DashboardBestMatch {
    id: string
    jobTitle: string
    company: string
    location: string
    matchScore: number
    matchRationale: string
    jobUrl: string
}

interface DashboardOtherMatch {
    id: string
    jobTitle: string
    company: string
    matchScore: number
}

interface WeekStats {
    evaluated: number
    matched: number
    avgScore: number
    digestsSent?: number
}

interface DashboardData {
    newMatchesToday: number
    bestMatch: DashboardBestMatch | null
    otherNewMatches: DashboardOtherMatch[]
    thisWeek: WeekStats & { digestsSent: number }
    lastWeek: WeekStats
}

export function useDashboard() {
    const { apiFetch } = useApi();
    const data = ref<DashboardData | null>(null);
    const pending = ref(false);
    const error = ref<string | null>(null);

    async function fetch() {
        pending.value = true;
        error.value = null;
        try {
            data.value = await apiFetch<DashboardData>('/dashboard');
        } catch {
            error.value = 'Failed to load dashboard data';
        } finally {
            pending.value = false;
        }
    }

    return { data, pending, error, fetch };
}
