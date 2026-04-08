export interface JobSource {
    id: string
    presetId: string
    presetName: string
    active: boolean
    language: string
    pollingInterval: number
    filters: Record<string, string>
}

export const useJobSources = () => {
    const config = useRuntimeConfig();
    const token = useCookie('auth_token');

    const authHeaders = computed(() => ({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: token.value ? `Bearer ${token.value}` : '',
    }));

    const { data: sources, error, refresh } = useFetch<JobSource[]>('/job-sources', {
        baseURL: config.public.apiBaseUrl,
        headers: authHeaders,
    });

    const toggleActive = async (source: JobSource) => {
        await $fetch<JobSource>(`/job-sources/${source.id}`, {
            baseURL: config.public.apiBaseUrl,
            method: 'PATCH',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { Authorization: token.value ? `Bearer ${token.value}` : '' },
            body: { active: !source.active },
        });
        await refresh();
    };

    const createSource = async (data: {
        presetId: string
        label?: string
        language?: string
        pollingInterval?: number
        filters?: Record<string, string>
    }) => {
        const result = await $fetch<JobSource>('/job-sources', {
            baseURL: config.public.apiBaseUrl,
            method: 'POST',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { Authorization: token.value ? `Bearer ${token.value}` : '' },
            body: data,
        });
        await refresh();
        return result;
    };

    return {
        sources: computed(() => sources.value ?? []),
        error,
        toggleActive,
        createSource,
    };
};
