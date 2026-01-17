'use client';

import { motion } from 'framer-motion';
import { Download, Trash2, FolderPlus, X } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { Generation } from '@/stores/generation-store';

interface SelectionActionBarProps {
    selectedCount: number;
    selectedGenerations?: Generation[];
    onClear: () => void;
    onDownload?: () => void;
    onAddToFolder?: () => void;
    onDelete?: () => void;
}

export function SelectionActionBar({
    selectedCount,
    selectedGenerations = [],
    onClear,
    onDownload,
    onAddToFolder,
    onDelete,
}: SelectionActionBarProps) {
    const { language } = useLanguage();

    const thumbnails = selectedGenerations.slice(0, 3).map((gen) => {
        const url = gen.result_assets?.[0]?.url;
        return { id: gen.id, url, type: gen.type };
    });

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
        >
            <div className="bg-black/80 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center justify-between gap-4 backdrop-blur-xl border border-white/20">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center">
                        {thumbnails.length > 0 ? (
                            <div className="flex -space-x-2">
                                {thumbnails.map((thumb, idx) => (
                                    <div
                                        key={thumb.id}
                                        className="w-8 h-8 rounded-lg overflow-hidden border-2 border-black/50 bg-white/10"
                                        style={{ zIndex: thumbnails.length - idx }}
                                    >
                                        {thumb.url && thumb.type !== 'audio' ? (
                                            thumb.type === 'video' ? (
                                                <video
                                                    src={thumb.url}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                />
                                            ) : (
                                                <img
                                                    src={thumb.url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            )
                                        ) : (
                                            <div className="w-full h-full bg-white/10" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs ml-1">
                            {selectedCount}
                        </div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight whitespace-nowrap hidden sm:block">
                        {language === 'ru' ? 'Выбрано' : 'Selected'}
                    </span>
                </div>

                <div className="h-6 w-px bg-white/10" />

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    <button
                        onClick={onDownload}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-xs font-bold whitespace-nowrap"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">{language === 'ru' ? 'Скачать' : 'Download'}</span>
                    </button>
                    <button
                        onClick={onAddToFolder}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-xs font-bold whitespace-nowrap"
                    >
                        <FolderPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">{language === 'ru' ? 'В папку' : 'To folder'}</span>
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-500 transition-colors text-xs font-bold whitespace-nowrap"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{language === 'ru' ? 'Удалить' : 'Delete'}</span>
                    </button>
                </div>

                <button
                    onClick={onClear}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
