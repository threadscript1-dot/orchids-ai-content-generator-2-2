'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api, setAuthToken, getAuthToken, initAuthFromStorage } from '@/api/client';
import { useTelegram } from './telegram-provider';

interface UserProfile {
    id: string;
    email: string | null;
    display_name: string | null;
    avatar_url: string | null;
    telegram_id: string | null;
    google_id: string | null;
    yandex_id: string | null;
    credits: {
        balance: number;
        updated_at: string;
    };
}

interface AuthContextValue {
    user: UserProfile | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isDebugMode: boolean;
    login: () => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { initData, isTMA, isReady: isTelegramReady } = useTelegram();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isDebugMode =
        process.env.NEXT_PUBLIC_DEBUG_AUTH_BYPASS === 'true' ||
        process.env.DEBUG_AUTH_BYPASS === 'true';

    const fetchUser = useCallback(async () => {
        try {
            const { data, error } = await api.GET('/user/me');
            if (data && !error) {
                setUser(data);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    const loginWithTelegram = useCallback(async () => {
        if (!initData) return false;

        try {
            const { data, error } = await api.POST('/auth/telegram/miniapp', {
                body: { init_data: initData },
            });

            if (data && !error) {
                setToken((data as { token: string }).token);
                setAuthToken((data as { token: string }).token);
                await fetchUser();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Telegram auth error:', err);
            return false;
        }
    }, [initData, fetchUser]);

    const loginWithDebugBypass = useCallback(async () => {
        const dummyToken = 'debug-bypass-token';
        setToken(dummyToken);
        setAuthToken(dummyToken);
        const success = await fetchUser();
        if (!success) {
            setToken(null);
            setAuthToken(null);
        }
        return success;
    }, [fetchUser]);

    const login = useCallback(async () => {
        setIsLoading(true);
        try {
            if (isTMA && initData) {
                await loginWithTelegram();
            } else if (isDebugMode) {
                await loginWithDebugBypass();
            }
        } finally {
            setIsLoading(false);
        }
    }, [isTMA, initData, isDebugMode, loginWithTelegram, loginWithDebugBypass]);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setAuthToken(null);
    }, []);

    const refreshToken = useCallback(async () => {
        if (!token) return;

        try {
            const { data, error } = await api.POST('/auth/refresh');
            if (data && !error) {
                setToken((data as { token: string }).token);
                setAuthToken((data as { token: string }).token);
            }
        } catch (err) {
            console.error('Token refresh error:', err);
        }
    }, [token]);

    const refreshUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    // Initialize auth on mount
    useEffect(() => {
        if (!isTelegramReady) return;

        const initAuth = async () => {
            setIsLoading(true);

            // Check for existing token
            initAuthFromStorage();
            const existingToken = getAuthToken();

            if (existingToken) {
                setToken(existingToken);
                const success = await fetchUser();
                if (!success) {
                    // Token invalid, try to re-authenticate
                    if (isTMA && initData) {
                        await loginWithTelegram();
                    } else if (isDebugMode) {
                        await loginWithDebugBypass();
                    }
                }
            } else {
                // No existing token, try to authenticate
                if (isTMA && initData) {
                    await loginWithTelegram();
                } else if (isDebugMode) {
                    await loginWithDebugBypass();
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, [
        isTelegramReady,
        isTMA,
        initData,
        isDebugMode,
        fetchUser,
        loginWithTelegram,
        loginWithDebugBypass,
    ]);

    // Auto refresh token every 6 days
    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            refreshToken();
        }, 6 * 24 * 60 * 60 * 1000); // 6 days

        return () => clearInterval(interval);
    }, [token, refreshToken]);

    const value: AuthContextValue = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        isDebugMode,
        login,
        logout,
        refreshToken,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
