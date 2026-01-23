'use client';

import { Plus, Upload, Image } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/language-context';

interface AttachmentDropdownProps {
    onUploadFromDevice: () => void;
    onSelectFromLibrary: () => void;
    disabled?: boolean;
}

export function AttachmentDropdown({
    onUploadFromDevice,
    onSelectFromLibrary,
    disabled = false,
}: AttachmentDropdownProps) {
    const { t } = useLanguage();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <button
                    aria-label="Attach file"
                    className="flex items-center justify-center text-white/40 hover:text-white transition-colors h-10 px-3 rounded-2xl bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
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
