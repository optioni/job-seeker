import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { computed, ref } from 'vue';

import { type JobApplication } from './useApplications';

const mockToken = ref<string | null>('test-token');
const mockUseFetch = vi.fn();

vi.stubGlobal('useCookie', (_name: string) => mockToken);
vi.stubGlobal('useRuntimeConfig', () => ({
    public: { apiBaseUrl: 'http://localhost:3000' },
}));
vi.stubGlobal('useFetch', mockUseFetch);
vi.stubGlobal('computed', computed);
vi.stubGlobal('ref', ref);

async function loadComposable() {
    const module = await import('./useApplications');
    return module.useApplications;
}

const sampleApplications: JobApplication[] = [
    {
        id: 'app-1',
        jobTitle: 'Senior Developer',
        company: 'Acme Corp',
        matchScore: 85,
        matched: true,
        matchRationale: 'Great fit',
        tailoredCvSnapshot: null,
        coverLetterText: null,
        emailedAt: null,
        createdAt: '2024-01-15T00:00:00Z',
        jobUrl: 'https://example.com/job/1',
    },
];

describe('useApplications', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns applications list when fetch resolves', async () => {
        mockUseFetch.mockReturnValue({
            data: ref(sampleApplications),
            error: ref(null),
            status: ref('success'),
        });

        const useApplications = await loadComposable();
        const { applications } = useApplications();

        expect(applications.value).toEqual(sampleApplications);
    });

    it('returns empty array when data is null', async () => {
        mockUseFetch.mockReturnValue({
            data: ref(null),
            error: ref(null),
            status: ref('idle'),
        });

        const useApplications = await loadComposable();
        const { applications } = useApplications();

        expect(applications.value).toEqual([]);
    });

    it('exposes error when fetch fails', async () => {
        const mockError = { message: 'Network error' };
        mockUseFetch.mockReturnValue({
            data: ref(null),
            error: ref(mockError),
            status: ref('error'),
        });

        const useApplications = await loadComposable();
        const { error } = useApplications();

        expect(error.value).toEqual(mockError);
    });

    it('calls useFetch with correct endpoint and base URL', async () => {
        mockUseFetch.mockReturnValue({
            data: ref([]),
            error: ref(null),
            status: ref('success'),
        });

        const useApplications = await loadComposable();
        useApplications();

        expect(mockUseFetch).toHaveBeenCalledWith('/applications', expect.objectContaining({
            baseURL: 'http://localhost:3000',
        }));
    });
});
