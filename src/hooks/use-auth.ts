'use client';

import { useCallback, useEffect } from 'react';
import { useAuthStore, type UserProfile, type TelegramOAuthData } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';

export function useAuth() {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const isLoading = useAuthStore((state) => state.isLoading);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const error = useAuthStore((state) => state.error);

    const loginWithTelegramMiniApp = useAuthStore((state) => state.loginWithTelegramMiniApp);
    const loginWithTelegramOAuth = useAuthStore((state) => state.loginWithTelegramOAuth);
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
    const loginWithGoogleToken = useAuthStore((state) => state.loginWithGoogleToken);
    const loginWithYandex = useAuthStore((state) => state.loginWithYandex);
    const loginWithVK = useAuthStore((state) => state.loginWithVK);
    const loginWithDebugBypass = useAuthStore((state) => state.loginWithDebugBypass);

    const fetchUser = useAuthStore((state) => state.fetchUser);
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const logout = useAuthStore((state) => state.logout);

    const isAuthenticated = !!user && !!token;
    const isDebugMode =
        typeof window !== 'undefined' &&
        (process.env.NEXT_PUBLIC_DEBUG_AUTH_BYPASS === 'true' ||
            process.env.DEBUG_AUTH_BYPASS === 'true');

    return {
        user,
        token,
        isLoading,
        isInitialized,
        isAuthenticated,
        isDebugMode,
        error,

        loginWithTelegramMiniApp,
        loginWithTelegramOAuth,
        loginWithGoogle,
        loginWithGoogleToken,
        loginWithYandex,
        loginWithVK,
        loginWithDebugBypass,

        fetchUser,
        refreshToken,
        logout,
    };
}

export function useUser() {
    const user = useAuthStore((state) => state.user);
    const fetchUser = useAuthStore((state) => state.fetchUser);

    const creditBalance = useUserStore((state) => state.creditBalance);
    const creditTransactions = useUserStore((state) => state.creditTransactions);
    const fetchBalance = useUserStore((state) => state.fetchBalance);
    const fetchCreditHistory = useUserStore((state) => state.fetchCreditHistory);

    // Sync credit balance from user profile
    useEffect(() => {
        if (user?.credits?.balance !== undefined) {
            useUserStore.getState().setBalance(user.credits.balance);
        }
    }, [user?.credits?.balance]);

    return {
        user,
        creditBalance: user?.credits?.balance ?? creditBalance,
        creditTransactions,
        refreshUser: fetchUser,
        refreshBalance: fetchBalance,
        fetchCreditHistory,
    };
}

export function useCredits() {
    const creditBalance = useUserStore((state) => state.creditBalance);
    const creditTransactions = useUserStore((state) => state.creditTransactions);
    const creditPackages = useUserStore((state) => state.creditPackages);
    const paymentProviders = useUserStore((state) => state.paymentProviders);
    const isLoading = useUserStore((state) => state.isLoading);
    const error = useUserStore((state) => state.error);
    const transactionsHasMore = useUserStore((state) => state.transactionsHasMore);

    const fetchBalance = useUserStore((state) => state.fetchBalance);
    const fetchCreditHistory = useUserStore((state) => state.fetchCreditHistory);
    const fetchCreditPackages = useUserStore((state) => state.fetchCreditPackages);
    const fetchPaymentProviders = useUserStore((state) => state.fetchPaymentProviders);
    const createPayment = useUserStore((state) => state.createPayment);

    // Get balance from auth store as primary source
    const userCredits = useAuthStore((state) => state.user?.credits?.balance);
    const actualBalance = userCredits ?? creditBalance;

    return {
        balance: actualBalance,
        transactions: creditTransactions,
        packages: creditPackages,
        paymentProviders,
        isLoading,
        error,
        hasMoreTransactions: transactionsHasMore,

        fetchBalance,
        fetchHistory: fetchCreditHistory,
        fetchPackages: fetchCreditPackages,
        fetchProviders: fetchPaymentProviders,
        createPayment,
    };
}

export type { UserProfile, TelegramOAuthData };
