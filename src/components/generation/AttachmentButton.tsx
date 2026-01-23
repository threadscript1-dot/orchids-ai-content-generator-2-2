'use client';

import { Plus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/language-context';
import { Upload, Image } from 'lucide-react';

interface AttachmentButtonProps {
    currentCount: number;
    minCount: number;
    maxCount: number;
    onUploadFromDevice: () => void;
    onSelectFromLibrary?: () => void;
    disabled?: boolean;
    showLibraryOption?: boolean;
}

export function AttachmentButton({
    currentCount,
    minCount,
    maxCount,
    onUploadFromDevice,
    onSelectFromLibrary,
    disabled = false,
    showLibraryOption = true,
}: AttachmentButtonProps) {
    const { t } = useLanguage();

    const isAtMax = currentCount >= maxCount;
    const needsMore = currentCount < minCount;
    const canAdd = !disabled && !isAtMax;

    // Show counter only if model supports attachments (maxCount > 0)
    const showCounter = maxCount > 0;

    // Determine counter color based on state
    const getCounterColor = () => {
        if (needsMore) return 'text-amber-400'; // Need more files
        if (isAtMax) return 'text-white/30'; // At max
        return 'text-white/50'; // Normal state
    };

    const button = (
        <button
            aria-label="Attach file"
            className={`flex items-center justify-center gap-1.5 text-white/40 hover:text-white transition-colors h-10 px-3 rounded-2xl bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                needsMore ? 'ring-1 ring-amber-400/50' : ''
            }`}
            disabled={!canAdd}
        >
            <Plus className="w-4 h-4" aria-hidden="true" />
            {showCounter && (
                <span className={`text-xs font-mono tabular-nums ${getCounterColor()}`}>
                    {currentCount}/{maxCount}
                </span>
            )}
        </button>
    );

    // If no library option or at max, just show the button that triggers file picker
    if (!showLibraryOption || !onSelectFromLibrary) {
        return (
            <button
                onClick={canAdd ? onUploadFromDevice : undefined}
                aria-label="Attach file"
                className={`flex items-center justify-center gap-1.5 text-white/40 hover:text-white transition-colors h-10 px-3 rounded-2xl bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                    needsMore ? 'ring-1 ring-amber-400/50' : ''
                }`}
                disabled={!canAdd}
            >
                <Plus className="w-4 h-4" aria-hidden="true" />
                {showCounter && (
                    <span className={`text-xs font-mono tabular-nums ${getCounterColor()}`}>
                        {currentCount}/{maxCount}
                    </span>
                )}
            </button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={!canAdd}>
                {button}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
                <DropdownMenuItem onClick={onUploadFromDevice}>
                    <Upload className="w-4 h-4 mr-2" />
                    {t('attachment.fromDevice')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSelectFromLibrary}>
                    <Image className="w-4 h-4 mr-2" />
                    {t('attachment.fromLibrary')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
