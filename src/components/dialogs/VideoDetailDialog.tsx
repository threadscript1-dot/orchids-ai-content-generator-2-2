'use client';

import {
    Download,
    RefreshCw,
    Heart,
    MoreHorizontal,
    FolderPlus,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Share2,
    Copy,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/language-context';
import { Generation, useGenerationStore } from '@/stores/generation-store';
import { Model } from '@/stores/models-store';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

import { AddToCollectionModal } from '@/components/library/AddToCollectionModal';
import { ConfirmDeleteDialog } from '@/components/library/ConfirmDeleteDialog';
import { downloadFile } from '@/lib/utils';

interface VideoDetailDialogProps {
    video: Generation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    models: Model[];
    aspectRatio: string;
    duration: string;
    onRemix: (video: Generation) => void;
    onToggleLike: (id: string) => void;
    videos?: Generation[];
    onSelectVideo?: (video: Generation) => void;
}

export function VideoDetailDialog({
    video,
    open,
    onOpenChange,
    models,
    aspectRatio,
    duration,
    onRemix,
    onToggleLike,
    videos = [],
    onSelectVideo,
}: VideoDetailDialogProps) {
    const { language } = useLanguage();
    const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
    const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const storeGenerations = useGenerationStore((state) => state.generations);
    const removeGeneration = useGenerationStore((state) => state.removeGeneration);
    const currentVideo = video ? storeGenerations.find((g) => g.id === video.id) || video : null;

    useEffect(() => {
        setSelectedAssetIndex(0);
    }, [video?.id]);

    const handlePrevious = useCallback(() => {
        if (!video || !onSelectVideo || videos.length === 0) return;
        const currentIndex = videos.findIndex((v) => v.id === video.id);
        if (currentIndex > 0) {
            onSelectVideo(videos[currentIndex - 1]);
        }
    }, [video, videos, onSelectVideo]);

    const handleNext = useCallback(() => {
        if (!video || !onSelectVideo || videos.length === 0) return;
        const currentIndex = videos.findIndex((v) => v.id === video.id);
        if (currentIndex < videos.length - 1) {
            onSelectVideo(videos[currentIndex + 1]);
        }
    }, [video, videos, onSelectVideo]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, handlePrevious, handleNext]);

    if (!video) return null;

    const currentAsset = video.result_assets?.[selectedAssetIndex] || video.result_assets?.[0];

    const handleDownload = async () => {
        const url = currentAsset?.url;
        if (!url) return;
        await downloadFile(url, `video-${video.id}.mp4`);
    };

    const handleCopyPrompt = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(video.prompt);
        toast.success(language === 'ru' ? 'Промпт скопирован' : 'Prompt copied');
    };

    const handleRemix = () => {
        onRemix(video);
        onOpenChange(false);
    };

    const handleDelete = () => {
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        removeGeneration(video.id);
        toast.success(language === 'ru' ? 'Удалено' : 'Deleted');
        onOpenChange(false);
    };

    const hasMultipleAssets = (video.result_assets?.length || 0) > 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="fixed inset-0 w-full h-full max-w-none p-0 border-none bg-black overflow-hidden"
                showCloseButton={false}
            >
                <VisuallyHidden>
                    <DialogTitle>Video Details</DialogTitle>
                </VisuallyHidden>

                <div className="flex flex-col lg:flex-row h-full w-full relative">
                    <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none lg:hidden">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all pointer-events-auto"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex gap-2 pointer-events-auto">
                            <button
                                onClick={handlePrevious}
                                className="p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                disabled={videos.findIndex((v) => v.id === video.id) === 0}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                disabled={
                                    videos.findIndex((v) => v.id === video.id) ===
                                    videos.length - 1
                                }
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center bg-black p-4 lg:p-12 min-h-0">
                        <video
                            key={currentAsset?.url}
                            src={currentAsset?.url || ''}
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl lg:rounded-3xl shadow-2xl transition-transform duration-300"
                            controls
                            autoPlay
                        />

                        {hasMultipleAssets && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 overflow-x-auto max-w-[90%] scrollbar-hide">
                                {video.result_assets?.map((asset, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedAssetIndex(index)}
                                        className={`relative w-16 h-10 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                                            selectedAssetIndex === index
                                                ? 'border-[#6F00FF]'
                                                : 'border-transparent'
                                        }`}
                                    >
                                        <video
                                            src={asset.url}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-[450px] bg-[#0A0A0A] border-l border-white/5 flex flex-col h-[50vh] lg:h-full relative overflow-hidden">
                        <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevious}
                                    className="p-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                    disabled={videos.findIndex((v) => v.id === video.id) === 0}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="p-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                    disabled={
                                        videos.findIndex((v) => v.id === video.id) ===
                                        videos.length - 1
                                    }
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="p-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-hide">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {language === 'ru' ? 'Промпт' : 'Prompt'}
                                    </h3>
                                    <button
                                        onClick={handleCopyPrompt}
                                        className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                                        title={
                                            language === 'ru' ? 'Копировать промпт' : 'Copy prompt'
                                        }
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-sm lg:text-base text-white/90 leading-relaxed font-medium">
                                    {video.prompt}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">
                                        Model
                                    </span>
                                    <p className="text-sm text-white/70 font-bold truncate">
                                        {models.find((m) => m.id === video.model)?.name ||
                                            video.model}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">
                                        Aspect
                                    </span>
                                    <p className="text-sm text-white/70 font-bold uppercase">
                                        {aspectRatio}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">
                                        Duration
                                    </span>
                                    <p className="text-sm text-white/70 font-bold">{duration}s</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">
                                        Created
                                    </span>
                                    <p className="text-sm text-white/70 font-bold">
                                        {new Date(video.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 lg:p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 space-y-3">
                            <button
                                onClick={handleRemix}
                                className="w-full py-4 rounded-2xl bg-[#6F00FF] hover:bg-[#7F20FF] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(111,0,255,0.15)]"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {language === 'ru' ? 'Переделать' : 'Remake'}
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 h-11 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2 transition-all border border-white/10 font-bold text-[10px] uppercase tracking-widest"
                                    title="Download"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Скачать' : 'Save'}
                                </button>
                                <button
                                    onClick={() => onToggleLike(video.id)}
                                    className={`w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 ${
                                        currentVideo?.is_favorite ? 'text-red-500' : 'text-white'
                                    }`}
                                >
                                    <Heart
                                        className={`w-4 h-4 ${
                                            currentVideo?.is_favorite ? 'fill-current' : ''
                                        }`}
                                    />
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
                                            <Share2 className="w-4 h-4" />{' '}
                                            {language === 'ru' ? 'Поделиться' : 'Share'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setIsAddToCollectionOpen(true)}
                                            className="gap-3 py-3 rounded-lg cursor-pointer focus:bg-white/10"
                                        >
                                            <FolderPlus className="w-4 h-4" />{' '}
                                            {language === 'ru' ? 'В папку' : 'Add to folder'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={handleDelete}
                                            className="gap-3 py-3 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />{' '}
                                            {language === 'ru' ? 'Удалить' : 'Delete'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>

                <AddToCollectionModal
                    generationIds={[video.id]}
                    open={isAddToCollectionOpen}
                    onOpenChange={setIsAddToCollectionOpen}
                />

                <ConfirmDeleteDialog
                    open={isDeleteConfirmOpen}
                    onOpenChange={setIsDeleteConfirmOpen}
                    onConfirm={handleConfirmDelete}
                />
            </DialogContent>
        </Dialog>
    );
}
