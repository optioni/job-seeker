export const useApi = () => {
    const config = useRuntimeConfig();
    const token = useCookie('auth_token');

    const apiFetch = <T>(path: string, options: Parameters<typeof $fetch>[1] = {}) => $fetch<T>(path, {
        baseURL: config.public.apiBaseUrl,
        headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: token.value ? `Bearer ${token.value}` : '',
            ...(options.headers as Record<string, string>),
        },
        ...options,
    });

    return { apiFetch };
};
