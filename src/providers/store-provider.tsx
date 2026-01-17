'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useModelsStore } from '@/stores/models-store';
import { useLanguage } from '@/lib/language-context';

interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
        };
        query_id?: string;
        auth_date: number;
        hash: string;
    };
    ready: () => void;
    expand: () => void;
    close: () => void;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: Record<string, string>;
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isActive: boolean;
        isProgressVisible: boolean;
        setText: (text: string) => void;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
        enable: () => void;
        disable: () => void;
        showProgress: (leaveActive?: boolean) => void;
        hideProgress: () => void;
    };
    BackButton: {
        isVisible: boolean;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
    };
    HapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        selectionChanged: () => void;
    };
}

declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp;
        };
    }
}

interface StoreProviderProps {
    children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
    const [isReady, setIsReady] = useState(false);
    const { language } = useLanguage();
    const initialize = useAuthStore((state) => state.initialize);
    const fetchModels = useModelsStore((state) => state.fetchModels);

    useEffect(() => {
        const initApp = async () => {
            // Check for Telegram WebApp
            const tg = window.Telegram?.WebApp;
            let initData: string | null = null;
            let isTMA = false;

            if (tg && tg.initData) {
                initData = tg.initData;
                isTMA = true;
                tg.ready();
                tg.expand();
            }

            // Initialize auth store
            await initialize(initData, isTMA);

            // Prefetch models (public endpoint)
            fetchModels();

            setIsReady(true);
        };

        initApp();
    }, [initialize, fetchModels]);

    // Show loading state while initializing
    if (!isReady) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">
                        {language === 'ru' ? 'Делаем...' : 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
