'use client';

import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface GeneratingPlaceholderProps {
    aspectRatio?: 'square' | 'video' | 'audio';
}

export function GeneratingPlaceholder({ aspectRatio = 'square' }: GeneratingPlaceholderProps) {
    const { language } = useLanguage();

    const aspectClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        audio: 'h-[100px]',
    };

    return (
        <div
            className={`${aspectClasses[aspectRatio]} rounded-[32px] glass flex items-center justify-center`}
        >
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#6F00FF] mx-auto mb-4" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                    {language === 'ru' ? 'Генерация...' : 'Generating...'}
                </p>
            </div>
        </div>
    );
}
