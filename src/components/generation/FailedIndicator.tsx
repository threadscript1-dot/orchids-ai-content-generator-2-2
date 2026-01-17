'use client';

import { X } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface FailedIndicatorProps {
    size?: 'sm' | 'md' | 'lg';
    error?: string;
}

export function FailedIndicator({ size = 'md', error }: FailedIndicatorProps) {
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

    return (
        <div className="w-full h-full flex items-center justify-center bg-red-500/10">
            <div className="text-center">
                <X className={`${sizeClasses[size]} text-red-500 mx-auto mb-2`} />
                <p className={`${textSizeClasses[size]} font-bold uppercase tracking-widest text-red-500`}>
                    {error || (language === 'ru' ? 'Ошибка' : 'Failed')}
                </p>
            </div>
        </div>
    );
}
