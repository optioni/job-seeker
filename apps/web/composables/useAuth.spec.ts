import {
    beforeEach, describe, expect, it, vi,
} from 'vitest';
import { computed, ref } from 'vue';

// Mock Nuxt auto-imports before importing the composable
const mockToken = ref<string | null>(null);
const mockNavigateTo = vi.fn();
const mockFetch = vi.fn();

vi.mock('#app', () => ({}), { virtual: true });

vi.stubGlobal('useCookie', (_name: string) => mockToken);
vi.stubGlobal('useRuntimeConfig', () => ({
    public: { apiBaseUrl: 'http://localhost:3000' },
}));
vi.stubGlobal('$fetch', mockFetch);
vi.stubGlobal('navigateTo', mockNavigateTo);
vi.stubGlobal('computed', computed);
vi.stubGlobal('ref', ref);

// Dynamic import after globals are stubbed
async function loadComposable() {
    const module = await import('./useAuth');
    return module.useAuth;
}

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockToken.value = null;
    });

    it('sets token cookie after successful login', async () => {
        mockFetch.mockResolvedValue({ accessToken: 'jwt-token-abc' });

        const useAuth = await loadComposable();
        const { login } = useAuth();

        await login('test@example.com', 'password123');

        expect(mockToken.value).toBe('jwt-token-abc');
    });

    it('calls $fetch with correct login endpoint and credentials', async () => {
        mockFetch.mockResolvedValue({ accessToken: 'token' });

        const useAuth = await loadComposable();
        const { login } = useAuth();

        await login('user@example.com', 'pass');

        expect(mockFetch).toHaveBeenCalledWith('/auth/login', expect.objectContaining({
            method: 'POST',
            body: { email: 'user@example.com', password: 'pass' },
        }));
    });

    it('does not set token and propagates error on failed login', async () => {
        mockFetch.mockRejectedValue(new Error('401 Unauthorized'));

        const useAuth = await loadComposable();
        const { login } = useAuth();

        await expect(login('bad@example.com', 'wrong')).rejects.toThrow('401 Unauthorized');
        expect(mockToken.value).toBeNull();
    });

    it('clears token on logout', async () => {
        mockToken.value = 'existing-token';

        const useAuth = await loadComposable();
        const { logout } = useAuth();

        logout();

        expect(mockToken.value).toBeNull();
    });

    it('sets token after successful register', async () => {
        mockFetch.mockResolvedValue({ accessToken: 'new-token' });

        const useAuth = await loadComposable();
        const { register } = useAuth();

        await register('new@example.com', 'newpassword');

        expect(mockToken.value).toBe('new-token');
    });
});
