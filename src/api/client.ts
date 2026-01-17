import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from '@/openapi/api';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000';

let authToken: string | null = null;

const authMiddleware: Middleware = {
    async onRequest({ request }) {
        if (authToken) {
            request.headers.set('Authorization', `Bearer ${authToken}`);
        }
        return request;
    },
    async onResponse({ response }) {
        if (response.status === 401) {
            // Token is invalid or expired
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                authToken = null;
            }
        }
        return response;
    },
};

export const api = createClient<paths>({
    baseUrl: API_BASE_URL,
});

api.use(authMiddleware);

export function setAuthToken(token: string | null) {
    authToken = token;
    if (typeof window !== 'undefined') {
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }
}

export function getAuthToken(): string | null {
    if (typeof window !== 'undefined' && !authToken) {
        authToken = localStorage.getItem('auth_token');
    }
    return authToken;
}

export function initAuthFromStorage() {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            authToken = token;
        }
    }
}

export { API_BASE_URL };
