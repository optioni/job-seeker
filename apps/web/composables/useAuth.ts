export const useAuth = () => {
    const config = useRuntimeConfig();
    // needs to be readable by client for redirects
    // maxAge: 7 days
    const token = useCookie('auth_token', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
    });

    const login = async (email: string, password: string) => {
        const data = await $fetch<{ accessToken: string }>('/auth/login', {
            baseURL: config.public.apiBaseUrl,
            method: 'POST',
            body: { email, password },
        });
        token.value = data.accessToken;
    };

    const register = async (email: string, password: string) => {
        const data = await $fetch<{ accessToken: string }>('/auth/register', {
            baseURL: config.public.apiBaseUrl,
            method: 'POST',
            body: { email, password },
        });
        token.value = data.accessToken;
    };

    const logout = () => {
        token.value = null;
    };

    return { token, login, register, logout };
};
