'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
}

interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        user?: TelegramUser;
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

interface TelegramContextValue {
    webApp: TelegramWebApp | null;
    user: TelegramUser | null;
    initData: string | null;
    isTMA: boolean;
    isReady: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({
    webApp: null,
    user: null,
    initData: null,
    isTMA: false,
    isReady: false,
});

export function useTelegram() {
    return useContext(TelegramContext);
}

interface TelegramProviderProps {
    children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
    const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;

        if (tg && tg.initData) {
            setWebApp(tg);
            tg.ready();
            tg.expand();
            setIsReady(true);
        } else {
            // Not in TMA environment
            setIsReady(true);
        }
    }, []);

    const value: TelegramContextValue = {
        webApp,
        user: webApp?.initDataUnsafe.user || null,
        initData: webApp?.initData || null,
        isTMA: !!webApp?.initData,
        isReady,
    };

    return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}
