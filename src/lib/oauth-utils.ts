'use client';

import { api } from '@/api/client';

// VK PKCE helpers
export function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Storage keys for OAuth state
const VK_CODE_VERIFIER_KEY = 'vk_code_verifier';
const OAUTH_STATE_KEY = 'oauth_state';

export function storeVKCodeVerifier(verifier: string): void {
    sessionStorage.setItem(VK_CODE_VERIFIER_KEY, verifier);
}

export function getVKCodeVerifier(): string | null {
    return sessionStorage.getItem(VK_CODE_VERIFIER_KEY);
}

export function clearVKCodeVerifier(): void {
    sessionStorage.removeItem(VK_CODE_VERIFIER_KEY);
}

export function storeOAuthState(state: string): void {
    sessionStorage.setItem(OAUTH_STATE_KEY, state);
}

export function getOAuthState(): string | null {
    return sessionStorage.getItem(OAUTH_STATE_KEY);
}

export function clearOAuthState(): void {
    sessionStorage.removeItem(OAUTH_STATE_KEY);
}

// Generate random state for OAuth
export function generateOAuthState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// OAuth URL getters
export async function getGoogleAuthUrl(
    redirectUri: string,
    state?: string
): Promise<string | null> {
    try {
        const { data } = await api.GET('/auth/google/url', {
            params: {
                query: {
                    redirect_uri: redirectUri,
                    state: state,
                },
            },
        });

        if (data) {
            return (data as { url: string }).url;
        }
        return null;
    } catch {
        return null;
    }
}

export async function getYandexAuthUrl(
    redirectUri: string,
    state?: string
): Promise<string | null> {
    try {
        const { data } = await api.GET('/auth/yandex/url', {
            params: {
                query: {
                    redirect_uri: redirectUri,
                    state: state,
                },
            },
        });

        if (data) {
            return (data as { url: string }).url;
        }
        return null;
    } catch {
        return null;
    }
}

export async function getVKAuthUrl(
    redirectUri: string,
    codeChallenge: string,
    state?: string
): Promise<string | null> {
    try {
        const { data } = await api.GET('/auth/vk/url', {
            params: {
                query: {
                    redirect_uri: redirectUri,
                    code_challenge: codeChallenge,
                    code_challenge_method: 's256',
                    state: state,
                },
            },
        });

        if (data) {
            return (data as { url: string }).url;
        }
        return null;
    } catch {
        return null;
    }
}

// Helper to initiate OAuth flows
export async function initiateGoogleAuth(): Promise<void> {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const state = generateOAuthState();
    storeOAuthState(state);

    const url = await getGoogleAuthUrl(redirectUri, state);
    if (url) {
        window.location.href = url;
    }
}

export async function initiateYandexAuth(): Promise<void> {
    const redirectUri = `${window.location.origin}/auth/yandex/callback`;
    const state = generateOAuthState();
    storeOAuthState(state);

    const url = await getYandexAuthUrl(redirectUri, state);
    if (url) {
        window.location.href = url;
    }
}

export async function initiateVKAuth(): Promise<void> {
    const redirectUri = `${window.location.origin}/auth/vk/callback`;
    const state = generateOAuthState();
    storeOAuthState(state);

    const codeVerifier = generateCodeVerifier();
    storeVKCodeVerifier(codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const url = await getVKAuthUrl(redirectUri, codeChallenge, state);

    if (url) {
        window.location.href = url;
    }
}
