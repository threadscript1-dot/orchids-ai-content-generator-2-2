'use client';

import { Download, Heart, MoreHorizontal, FolderPlus, Trash2, Share2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/language-context';

interface DetailDialogActionsProps {
    isFavorite: boolean;
    onDownload: () => void;
    onToggleLike: () => void;
    onAddToCollection: () => void;
    onDelete: () => void;
    downloadLabel?: string;
}

export function DetailDialogActions({
    isFavorite,
    onDownload,
    onToggleLike,
    onAddToCollection,
    onDelete,
    downloadLabel,
}: DetailDialogActionsProps) {
    const { language } = useLanguage();

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onDownload}
                className="flex-1 h-11 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2 transition-all border border-white/10 font-bold text-[10px] uppercase tracking-widest"
                title="Download"
            >
                <Download className="w-3.5 h-3.5" />
                {downloadLabel || (language === 'ru' ? 'Скачать' : 'Save')}
            </button>
            <button
                onClick={onToggleLike}
                className={`w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 ${
                    isFavorite ? 'text-red-500' : 'text-white'
                }`}
            >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/10">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2 min-w-[180px]"
                >
                    <DropdownMenuItem className="gap-3 py-3 rounded-lg cursor-pointer focus:bg-white/10">
                        <Share2 className="w-4 h-4" /> {language === 'ru' ? 'Поделиться' : 'Share'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onAddToCollection}
                        className="gap-3 py-3 rounded-lg cursor-pointer focus:bg-white/10"
                    >
                        <FolderPlus className="w-4 h-4" />{' '}
                        {language === 'ru' ? 'В папку' : 'Add to folder'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onDelete}
                        className="gap-3 py-3 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/10"
                    >
                        <Trash2 className="w-4 h-4" /> {language === 'ru' ? 'Удалить' : 'Delete'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
