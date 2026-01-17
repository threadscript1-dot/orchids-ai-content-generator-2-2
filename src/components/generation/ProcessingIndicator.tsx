'use client';

import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface ProcessingIndicatorProps {
    status: 'queued' | 'processing';
    size?: 'sm' | 'md' | 'lg';
}

export function ProcessingIndicator({ status, size = 'md' }: ProcessingIndicatorProps) {
    const { language } = useLanguage();

    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const textSizeClasses = {
        sm: 'text-[8px]',
        md: 'text-[10px]',
        lg: 'text-xs',
    };

    const statusText = {
        queued: language === 'ru' ? 'В очереди...' : 'Queued...',
        processing: language === 'ru' ? 'Генерация...' : 'Generating...',
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-white/5">
            <div className="text-center">
                <Loader2
                    className={`${sizeClasses[size]} animate-spin text-[#6F00FF] mx-auto mb-2`}
                />
                <p
                    className={`${textSizeClasses[size]} font-bold uppercase tracking-widest text-white/40`}
                >
                    {statusText[status]}
                </p>
            </div>
        </div>
    );
}
