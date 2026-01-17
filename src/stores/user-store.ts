'use client';

import { create } from 'zustand';
import { api } from '@/api/client';

export interface CreditTransaction {
    id: string;
    delta: number;
    reason: 'generation' | 'refund' | 'purchase' | 'welcome_bonus' | 'referral';
    generation_id?: string;
    created_at: string;
}

export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
    currency: string;
    discount?: number;
}

export interface PaymentProvider {
    id: string;
    name: string;
    enabled: boolean;
}

interface UserState {
    creditBalance: number;
    creditTransactions: CreditTransaction[];
    creditPackages: CreditPackage[];
    paymentProviders: PaymentProvider[];
    isLoading: boolean;
    error: string | null;

    // Pagination
    transactionsHasMore: boolean;
    transactionsOffset: number;

    // Actions
    fetchBalance: () => Promise<void>;
    fetchCreditHistory: (reset?: boolean) => Promise<void>;
    fetchCreditPackages: () => Promise<void>;
    fetchPaymentProviders: () => Promise<void>;
    createPayment: (packageId: string, providerId: string) => Promise<string | null>;
    setBalance: (balance: number) => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
    creditBalance: 0,
    creditTransactions: [],
    creditPackages: [],
    paymentProviders: [],
    isLoading: false,
    error: null,
    transactionsHasMore: true,
    transactionsOffset: 0,

    setBalance: (balance) => set({ creditBalance: balance }),

    fetchBalance: async () => {
        try {
            const { data, error } = await api.GET('/credits/balance');

            if (error) {
                set({ error: 'Failed to fetch balance' });
                return;
            }

            if (data) {
                const balanceData = data as { balance: number };
                set({ creditBalance: balanceData.balance, error: null });
            }
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
        }
    },

    fetchCreditHistory: async (reset = false) => {
        const { transactionsOffset, transactionsHasMore, isLoading } = get();
        if (isLoading || (!transactionsHasMore && !reset)) return;

        const newOffset = reset ? 0 : transactionsOffset;
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await api.GET('/credits/history', {
                params: {
                    query: {
                        limit: '50',
                        offset: String(newOffset),
                    },
                },
            });

            if (error) {
                set({ error: 'Failed to fetch credit history', isLoading: false });
                return;
            }

            if (data) {
                const historyData = data as {
                    data: CreditTransaction[];
                    pagination?: { has_more: boolean };
                };

                set((state) => ({
                    creditTransactions: reset
                        ? historyData.data
                        : [...state.creditTransactions, ...historyData.data],
                    transactionsHasMore: historyData.pagination?.has_more ?? false,
                    transactionsOffset: newOffset + historyData.data.length,
                    isLoading: false,
                }));
            }
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Network error',
                isLoading: false,
            });
        }
    },

    fetchCreditPackages: async () => {
        try {
            const { data, error } = await api.GET('/credits/packages');

            if (error) {
                set({ error: 'Failed to fetch packages' });
                return;
            }

            if (data) {
                const packagesData = data as { packages: CreditPackage[] };
                set({ creditPackages: packagesData.packages || [], error: null });
            }
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
        }
    },

    fetchPaymentProviders: async () => {
        try {
            const { data, error } = await api.GET('/payments/providers');

            if (error) {
                set({ error: 'Failed to fetch payment providers' });
                return;
            }

            if (data) {
                const providersData = data as { providers: PaymentProvider[] };
                set({ paymentProviders: providersData.providers || [], error: null });
            }
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Network error' });
        }
    },

    createPayment: async (packageId: string, providerId: string) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await api.POST('/payments/create', {
                body: {
                    package_id: packageId,
                    provider: providerId,
                },
            });

            if (error) {
                set({ error: 'Failed to create payment', isLoading: false });
                return null;
            }

            if (data) {
                const paymentData = data as { payment_url: string };
                set({ isLoading: false });
                return paymentData.payment_url;
            }

            return null;
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Network error',
                isLoading: false,
            });
            return null;
        }
    },
}));

// Selectors
export const selectCreditBalance = (state: UserState) => state.creditBalance;
export const selectCreditTransactions = (state: UserState) => state.creditTransactions;
export const selectCreditPackages = (state: UserState) => state.creditPackages;
