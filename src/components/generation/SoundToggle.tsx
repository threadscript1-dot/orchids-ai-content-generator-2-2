'use client';

import { InfoTooltip } from '@/components/ui/tooltip';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';

interface SoundToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    supported: boolean;
}

function SoundIcon({ enabled }: { enabled: boolean }) {
    return (
        <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {enabled ? (
                <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
            ) : (
                <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                </>
            )}
        </svg>
    );
}

export function SoundToggle({ enabled, onChange, supported }: SoundToggleProps) {
    const { language } = useLanguage();

    if (!supported) return null;

    const tooltip =
        language === 'ru' ? 'Генерировать видео со звуком' : 'Generate video with sound';
    const label = language === 'ru' ? 'Звук' : 'Sound';

    return (
        <InfoTooltip content={tooltip}>
            <button
                type="button"
                onClick={() => onChange(!enabled)}
                className={cn(
                    'flex items-center gap-2 h-10 px-4 rounded-2xl text-xs font-medium transition-all',
                    enabled
                        ? 'bg-[#6F00FF] text-white shadow-[0_0_20px_rgba(111,0,255,0.3)]'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white',
                )}
                aria-label={label}
            >
                <SoundIcon enabled={enabled} />
                <span className="hidden sm:inline">{label}</span>
            </button>
        </InfoTooltip>
    );
}
