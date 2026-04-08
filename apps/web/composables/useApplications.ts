export interface JobApplication {
    id: string
    jobTitle: string
    company: string
    matchScore: number
    matched: boolean
    matchRationale: string
    tailoredCvSnapshot: Record<string, unknown> | null
    coverLetterText: string | null
    emailedAt: string | null
    createdAt: string
    jobUrl: string
}

export const useApplications = () => {
    const config = useRuntimeConfig();
    const token = useCookie('auth_token');

    const { data: applications, error, status } = useFetch<JobApplication[]>('/applications', {
        baseURL: config.public.apiBaseUrl,
        headers: computed(() => ({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: token.value ? `Bearer ${token.value}` : '',
        })),
    });

    return {
        applications: computed(() => applications.value ?? []),
        error,
        pending: computed(() => status.value === 'pending'),
    };
};
