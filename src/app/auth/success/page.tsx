'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function AuthSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const setToken = useAuthStore((state) => state.setToken);
    const fetchUser = useAuthStore((state) => state.fetchUser);

    useEffect(() => {
        const handleSuccess = async () => {
            const token = searchParams.get('token');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError('Authentication failed: ' + errorParam);
                return;
            }

            if (!token) {
                setError('No token received');
                return;
            }

            setToken(token);
            const success = await fetchUser();

            if (success) {
                router.push('/app');
            } else {
                setError('Failed to fetch user data');
            }
        };

        handleSuccess();
    }, [searchParams, setToken, fetchUser, router]);

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
