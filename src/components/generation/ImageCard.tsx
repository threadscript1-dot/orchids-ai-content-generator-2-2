'use client';

import { Heart, MoreHorizontal, FolderPlus, Trash2, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Generation } from '@/stores/generation-store';
import { ProcessingIndicator } from './ProcessingIndicator';
import { FailedIndicator } from './FailedIndicator';
import { useLanguage } from '@/lib/language-context';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ImageCardProps {
    generation: Generation;
    onClick: () => void;
    onRemix: () => void;
    onToggleLike: () => void;
}

export function ImageCard({ generation, onClick, onRemix, onToggleLike }: ImageCardProps) {
    const { language } = useLanguage();
    const imageUrl = generation.result_assets?.[0]?.url;
    const isProcessing = generation.status === 'processing' || generation.status === 'queued';
    const hasMultipleImages = (generation.result_assets?.length || 0) > 1;

    return (
        <div
            className="relative group rounded-2xl overflow-hidden glass transition-all aspect-square cursor-pointer border border-white/5 hover:border-white/20 shadow-xl"
            onClick={() => !isProcessing && onClick()}
        >
            {isProcessing ? (
                <ProcessingIndicator status={generation.status as 'queued' | 'processing'} />
            ) : generation.status === 'failed' ? (
                <FailedIndicator />
            ) : imageUrl ? (
                <>
                    <img
                        src={imageUrl}
                        alt={generation.prompt}
                        className="w-full h-full object-cover transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <p className="text-sm font-mono line-clamp-2 text-white/90 leading-relaxed">
                            {generation.prompt}
                        </p>
                    </div>

                    {hasMultipleImages && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 opacity-100 sm:group-hover:opacity-0 transition-opacity">
                            <div className="grid grid-cols-2 gap-0.5">
                                <div className="w-1.5 h-1.5 rounded-sm bg-white/60" />
                                <div className="w-1.5 h-1.5 rounded-sm bg-white/60" />
                                <div className="w-1.5 h-1.5 rounded-sm bg-white/60" />
                                <div className="w-1.5 h-1.5 rounded-sm bg-white/20" />
                            </div>
                            <span className="text-[10px] font-bold text-white/90">{generation.result_assets?.length}</span>
                        </div>
                    )}
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <ImageIcon className="w-8 h-8 text-white/20" />
                </div>
            )}

            {!isProcessing && generation.status === 'success' && (
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2 min-w-[180px]"
                        >
                            <DropdownMenuItem className="gap-3 py-3 rounded-lg cursor-pointer focus:bg-white/10">
                                <FolderPlus className="w-4 h-4 text-white/40" />
                                <span className="text-sm font-medium">
                                    {language === 'ru' ? 'В папку' : 'Add to folder'}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 py-3 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {language === 'ru' ? 'Удалить' : 'Delete'}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemix();
                        }}
                        className="p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleLike();
                        }}
                        className="p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        <Heart
                            className={`w-4 h-4 ${generation.is_favorite ? 'fill-white' : ''}`}
                        />
                    </button>
                </div>
            )}
        </div>
    );
}
