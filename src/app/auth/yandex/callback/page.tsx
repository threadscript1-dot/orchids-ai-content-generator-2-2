'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { getOAuthState, clearOAuthState } from '@/lib/oauth-utils';

export default function YandexCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const loginWithYandex = useAuthStore((state) => state.loginWithYandex);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError(`Authentication failed: ${errorParam}`);
                return;
            }

            if (!code) {
                setError('No authorization code received');
                return;
            }

            const storedState = getOAuthState();
            if (storedState && state !== storedState) {
                setError('Invalid state parameter');
                clearOAuthState();
                return;
            }
            clearOAuthState();

            const redirectUri = `${window.location.origin}/auth/yandex/callback`;
            const success = await loginWithYandex(code, redirectUri);

            if (success) {
                router.push('/app');
            } else {
                setError('Failed to complete authentication');
            }
        };

        handleCallback();
    }, [searchParams, loginWithYandex, router]);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 p-8">
                    <div className="text-destructive text-lg font-medium">Authentication Error</div>
                    <p className="text-muted-foreground text-center">{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Completing authentication...</p>
            </div>
        </div>
    );
}
