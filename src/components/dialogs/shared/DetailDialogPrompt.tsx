'use client';

import { Sparkles, Copy } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface DetailDialogPromptProps {
    prompt: string;
    onCopy: () => void;
}

export function DetailDialogPrompt({ prompt, onCopy }: DetailDialogPromptProps) {
    const { language } = useLanguage();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    {language === 'ru' ? 'Промпт' : 'Prompt'}
                </h3>
                <button
                    onClick={onCopy}
                    className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                    title={language === 'ru' ? 'Копировать промпт' : 'Copy prompt'}
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>
            <div className="text-sm lg:text-base text-white/90 leading-relaxed font-medium">
                {prompt}
            </div>
        </div>
    );
}
