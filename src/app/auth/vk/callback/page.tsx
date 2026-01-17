'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import {
    getOAuthState,
    clearOAuthState,
    getVKCodeVerifier,
    clearVKCodeVerifier,
} from '@/lib/oauth-utils';

export default function VKCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const loginWithVK = useAuthStore((state) => state.loginWithVK);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const deviceId = searchParams.get('device_id');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError('Authentication failed: ' + errorParam);
                return;
            }

            if (!code) {
                setError('No authorization code received');
                return;
            }

            if (!deviceId) {
                setError('No device ID received from VK');
                return;
            }

            const storedState = getOAuthState();
            if (storedState && state !== storedState) {
                setError('Invalid state parameter');
                clearOAuthState();
                clearVKCodeVerifier();
                return;
            }
            clearOAuthState();

            const codeVerifier = getVKCodeVerifier();
            if (!codeVerifier) {
                setError('Code verifier not found. Please try again.');
                return;
            }
            clearVKCodeVerifier();

            const redirectUri = window.location.origin + '/auth/vk/callback';
            const success = await loginWithVK(code, codeVerifier, deviceId, redirectUri);

            if (success) {
                router.push('/app');
            } else {
                setError('Failed to complete authentication');
            }
        };

        handleCallback();
    }, [searchParams, loginWithVK, router]);

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
