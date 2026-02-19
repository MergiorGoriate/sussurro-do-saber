const API_BASE_URL = 'http://localhost:8000/api';

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user_id: number;
    username: string;
}

const authService = {
    requestMagicLink: async (email: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/magic-link/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) throw new Error('Failed to request magic link');
        return response.json();
    },

    verifyMagicLink: async (token: string): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/auth/magic-link/verify/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        if (!response.ok) throw new Error('Failed to verify token');

        const data = await response.json();
        if (data.access) {
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            localStorage.setItem('user', JSON.stringify({
                id: data.user_id,
                username: data.username
            }));
        }
        return data;
    },

    /**
     * Inicia o fluxo OAuth2 retornando a URL de autorização do provider.
     */
    getSocialLoginUrl: async (provider: 'google' | 'apple'): Promise<string> => {
        const response = await fetch(`${API_BASE_URL}/auth/${provider}/login/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`Failed to get ${provider} login URL`);
        const data = await response.json();
        return data.url;
    },

    /**
     * Troca o código de autorização pelo token JWT (Callback).
     */
    exchangeSocialCode: async (provider: 'google' | 'apple', code: string, state?: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/${provider}/callback/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, state })
        });

        if (!response.ok) throw new Error(`${provider} login failed`);

        const data = await response.json();
        if (data.access) {
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            localStorage.setItem('user', JSON.stringify({
                id: data.user_id,
                username: data.username || `user_${data.user_id}`
            }));
        }
        return data;
    },

    // Mantendo compatibilidade temporária (ou para testes manuais/mock)
    loginSocial: async (provider: 'google' | 'apple', token: string) => {
        // ... implementation deprecated/mock ...
        console.warn("Using deprecated loginSocial (Mock mode usually)");
        return { access: "mock_access", refresh: "mock_refresh", user_id: 1, username: "Mock User" };
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    }
};

export default authService;
