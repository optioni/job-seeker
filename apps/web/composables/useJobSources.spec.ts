import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { computed, ref } from 'vue';

import { type JobSource } from './useJobSources';

const mockToken = ref<string | null>('test-token');
const mockUseFetch = vi.fn();
const mockDollarFetch = vi.fn();

vi.stubGlobal('useCookie', (_name: string) => mockToken);
vi.stubGlobal('useRuntimeConfig', () => ({
    public: { apiBaseUrl: 'http://localhost:3000' },
}));
vi.stubGlobal('useFetch', mockUseFetch);
vi.stubGlobal('$fetch', mockDollarFetch);
vi.stubGlobal('computed', computed);
vi.stubGlobal('ref', ref);

async function loadComposable() {
    const module = await import('./useJobSources');
    return module.useJobSources;
}

const sampleSource: JobSource = {
    id: 'source-1',
    presetId: 'preset-1',
    presetName: 'TE-palvelut',
    active: true,
    language: 'fi',
    pollingInterval: 60,
    filters: { keyword: 'developer' },
};

describe('useJobSources', () => {
    let refreshMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        refreshMock = vi.fn();
        mockUseFetch.mockReturnValue({
            data: ref([sampleSource]),
            error: ref(null),
            refresh: refreshMock,
        });
        mockDollarFetch.mockResolvedValue({ ...sampleSource });
    });

    it('returns sources list from useFetch', async () => {
        const useJobSources = await loadComposable();
        const { sources } = useJobSources();

        expect(sources.value).toEqual([sampleSource]);
    });

    it('calls useFetch with correct /job-sources endpoint', async () => {
        const useJobSources = await loadComposable();
        useJobSources();

        expect(mockUseFetch).toHaveBeenCalledWith('/job-sources', expect.objectContaining({
            baseURL: 'http://localhost:3000',
        }));
    });

    it('returns empty array when data is null', async () => {
        mockUseFetch.mockReturnValue({
            data: ref(null),
            error: ref(null),
            refresh: refreshMock,
        });

        const useJobSources = await loadComposable();
        const { sources } = useJobSources();

        expect(sources.value).toEqual([]);
    });

    it('toggleActive calls PATCH with inverted active state', async () => {
        const useJobSources = await loadComposable();
        const { toggleActive } = useJobSources();

        await toggleActive(sampleSource);

        expect(mockDollarFetch).toHaveBeenCalledWith(
            `/job-sources/${sampleSource.id}`,
            expect.objectContaining({
                method: 'PATCH',
                body: { active: false },
            }),
        );
    });

    it('toggleActive refreshes the list after PATCH', async () => {
        const useJobSources = await loadComposable();
        const { toggleActive } = useJobSources();

        await toggleActive(sampleSource);

        expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it('createSource calls POST with provided data', async () => {
        const useJobSources = await loadComposable();
        const { createSource } = useJobSources();

        await createSource({
            presetId: 'preset-1',
            language: 'fi',
            pollingInterval: 60,
            filters: { keyword: 'developer' },
        });

        expect(mockDollarFetch).toHaveBeenCalledWith(
            '/job-sources',
            expect.objectContaining({
                method: 'POST',
                body: expect.objectContaining({ presetId: 'preset-1' }),
            }),
        );
    });

    it('createSource refreshes the list after POST', async () => {
        const useJobSources = await loadComposable();
        const { createSource } = useJobSources();

        await createSource({ presetId: 'preset-1' });

        expect(refreshMock).toHaveBeenCalledTimes(1);
    });
});
