'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, setAuthToken, getAuthToken, initAuthFromStorage } from '@/api/client';

export interface UserProfile {
    id: string;
    email: string | null;
    display_name: string | null;
    avatar_url: string | null;
    telegram_id: string | null;
    google_id: string | null;
    yandex_id: string | null;
    vk_id: string | null;
    credits: {
        balance: number;
        updated_at: string;
    };
}

interface AuthState {
    user: UserProfile | null;
    token: string | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    // Computed
    isAuthenticated: boolean;
    isDebugMode: boolean;

    // Actions
    setUser: (user: UserProfile | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Auth methods
    loginWithTelegramMiniApp: (initData: string) => Promise<boolean>;
    loginWithTelegramOAuth: (telegramData: TelegramOAuthData) => Promise<boolean>;
    loginWithGoogle: (code: string, redirectUri: string) => Promise<boolean>;
    loginWithGoogleToken: (idToken: string) => Promise<boolean>;
    loginWithYandex: (code: string, redirectUri: string) => Promise<boolean>;
    loginWithVK: (
        code: string,
        codeVerifier: string,
        deviceId: string,
        redirectUri: string
    ) => Promise<boolean>;
    loginWithDebugBypass: () => Promise<boolean>;

    // User methods
    fetchUser: () => Promise<boolean>;
    refreshToken: () => Promise<boolean>;
    logout: () => void;

    // Init
    initialize: (telegramInitData?: string | null, isTMA?: boolean) => Promise<void>;
}

export interface TelegramOAuthData {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

const isDebugMode = () =>
    typeof window !== 'undefined' &&
    (process.env.NEXT_PUBLIC_DEBUG_AUTH_BYPASS === 'true' ||
        process.env.DEBUG_AUTH_BYPASS === 'true');

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: true,
            isInitialized: false,
            error: null,

            get isAuthenticated() {
                const state = get();
                return !!state.user && !!state.token;
            },

            get isDebugMode() {
                return isDebugMode();
            },

            setUser: (user) => set({ user }),
            setToken: (token) => {
                setAuthToken(token);
                set({ token });
            },
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),

            fetchUser: async () => {
                try {
                    const { data, error } = await api.GET('/user/me');
                    if (data && !error) {
                        set({ user: data as UserProfile, error: null });
                        return true;
                    }
                    set({
                        error:
                            (error as { message?: string } | undefined)?.message ||
                            'Failed to fetch user',
                    });
                    return false;
                } catch (err) {
                    set({ error: err instanceof Error ? err.message : 'Network error' });
                    return false;
                }
            },

            loginWithTelegramMiniApp: async (initData: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await api.POST('/auth/telegram/miniapp', {
                        body: { init_data: initData },
                    });

                    if (data && !error) {
                        get().setToken((data as { token: string }).token);
                        await get().fetchUser();
                        set({ isLoading: false });
                        return true;
                    }

                    set({
                        error:
                            (error as { message?: string } | undefined)?.message ||
                            'Telegram auth failed',
                        isLoading: false,
                    });
                    return false;
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Telegram auth error',
                        isLoading: false,
                    });
                    return false;
                }
            },

            loginWithTelegramOAuth: async (telegramData: TelegramOAuthData) => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await api.POST('/auth/telegram/oauth', {
                        body: telegramData,
                    });

                    if (data && !error) {
                        get().setToken((data as { token: string }).token);
                        await get().fetchUser();
                        set({ isLoading: false });
                        return true;
                    }

                    set({
                        error:
                            (error as { message?: string } | undefined)?.message ||
                            'Telegram OAuth failed',
                        isLoading: false,
                    });
                    return false;
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Telegram OAuth error',
                        isLoading: false,
                    });
                    return false;
                }
            },

            loginWithGoogle: async (code: string, redirectUri: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await api.POST('/auth/google/callback', {
                        body: { code, redirect_uri: redirectUri },
                    });

                    if (data && !error) {
                        get().setToken((data as { token: string }).token);
                        await get().fetchUser();
                        set({ isLoading: false });
                        return true;
                    }

                    set({
                        error:
                            (error as { message?: string } | undefined)?.message ||
                            'Google auth failed',
                        isLoading: false,
                    });
                    return false;
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Google auth error',
                        isLoading: false,
                    });
                    return false;
                }
            },

            loginWithGoogleToken: async (idToken: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await api.POST('/auth/google/token', {
                        body: { token: idToken },
                    });

                    if (data && !error) {
                        get().setToken((data as { token: string }).token);
                        await get().fetchUser();
                        set({ isLoading: false });
                        return true;
                    }

                    set({
                        error:
                            (error as { message?: string } | undefined)?.message ||
                            'Google token auth failed',
                        isLoading: false,
                    });
                    return false;
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Google token auth error',
                        isLoading: false,
                    });
                    return false;
                }
            },

            loginWithYandex: async (code: string, redirectUri: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await api.POST('/auth/yandex/callback', {
                        body: { code, redirect_uri: redirectUri },
                    });

                    if (data && !error) {
                        get().setToken((data as { token: string }).token);
                        await get().fetchUser();
                        set({ isLoading: false });
                        return true;
                    }

                    set({
                        error:
                            (error as { message?: string } | undefined)?.message ||
                            'Yandex auth failed',
                        isLoading: false,
                    });
                    return false;
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Yandex auth error',
                        isLoading: false,
                    });
                    return false;
                }
            },

            loginWithVK: async (
                code: string,
                codeVerifier: string,
                deviceId: string,
                redirectUri: string
            ) => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await api.POST('/auth/vk/callback', {
                        body: {
                            code,
                            code_verifier: codeVerifier,
                            device_id: deviceId,
                            redirect_uri: redirectUri,
                        },
                    });

                    if (data && !error) {
                        get().setToken((data as { token: string }).token);
                        await get().fetchUser();
                        set({ isLoading: false });
                        return true;
                    }

                    set({
                        error:
                            (error as { message?: string } | undefined)?.message ||
                            'VK auth failed',
                        isLoading: false,
                    });
                    return false;
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'VK auth error',
                        isLoading: false,
                    });
                    return false;
                }
            },

            loginWithDebugBypass: async () => {
                set({ isLoading: true, error: null });
                const dummyToken = 'debug-bypass-token';
                get().setToken(dummyToken);

                const success = await get().fetchUser();
                if (!success) {
                    get().setToken(null);
                }
                set({ isLoading: false });
                return success;
            },

            refreshToken: async () => {
                const { token } = get();
                if (!token) return false;

                try {
                    const { data, error } = await api.POST('/auth/refresh');
                    if (data && !error) {
                        get().setToken((data as { token: string }).token);
                        return true;
                    }
                    return false;
                } catch {
                    return false;
                }
            },

            logout: () => {
                setAuthToken(null);
                set({ user: null, token: null, error: null });
            },

            initialize: async (telegramInitData?: string | null, isTMA?: boolean) => {
                if (get().isInitialized) return;

                set({ isLoading: true });

                // Check for existing token in storage
                initAuthFromStorage();
                const existingToken = getAuthToken();

                if (existingToken) {
                    set({ token: existingToken });
                    const success = await get().fetchUser();

                    if (!success) {
                        // Token invalid, try re-auth
                        if (isTMA && telegramInitData) {
                            await get().loginWithTelegramMiniApp(telegramInitData);
                        } else if (isDebugMode()) {
                            await get().loginWithDebugBypass();
                        }
                    }
                } else {
                    // No token, try to authenticate
                    if (isTMA && telegramInitData) {
                        await get().loginWithTelegramMiniApp(telegramInitData);
                    } else if (isDebugMode()) {
                        await get().loginWithDebugBypass();
                    }
                }

                set({ isLoading: false, isInitialized: true });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ token: state.token }),
        }
    )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => !!state.user && !!state.token;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectCreditsBalance = (state: AuthState) => state.user?.credits.balance ?? 0;
