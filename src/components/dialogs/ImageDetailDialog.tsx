'use client';

import { useRouter } from 'next/navigation';
import {
    X,
    Download,
    Heart,
    MoreHorizontal,
    FolderPlus,
    Trash2,
    Sparkles,
    Play,
    Wand2,
    ChevronLeft,
    ChevronRight,
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
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

import { AddToCollectionModal } from '@/components/library/AddToCollectionModal';
import { ConfirmDeleteDialog } from '@/components/library/ConfirmDeleteDialog';
import { downloadFile } from '@/lib/utils';

interface ImageDetailDialogProps {
    image: Generation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resolution: string;
    onRemix: (image: Generation) => void;
    onMakeVariations?: (image: Generation) => void;
    onToggleLike: (id: string) => void;
    generations?: Generation[];
    onSelectImage?: (image: Generation) => void;
}

export function ImageDetailDialog({
    image,
    open,
    onOpenChange,
    resolution,
    onRemix,
    onMakeVariations,
    onToggleLike,
    generations = [],
    onSelectImage,
}: ImageDetailDialogProps) {
    const { language } = useLanguage();
    const router = useRouter();
    const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
    const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const storeGenerations = useGenerationStore((state) => state.generations);
    const removeGeneration = useGenerationStore((state) => state.removeGeneration);
    const currentImage = image ? storeGenerations.find((g) => g.id === image.id) || image : null;

    useEffect(() => {
        setSelectedAssetIndex(0);
    }, [image?.id]);

    const handlePrevious = useCallback(() => {
        if (!image || !onSelectImage || generations.length === 0) return;
        const currentIndex = generations.findIndex((g) => g.id === image.id);
        if (currentIndex > 0) {
            onSelectImage(generations[currentIndex - 1]);
        }
    }, [image, generations, onSelectImage]);

    const handleNext = useCallback(() => {
        if (!image || !onSelectImage || generations.length === 0) return;
        const currentIndex = generations.findIndex((g) => g.id === image.id);
        if (currentIndex < generations.length - 1) {
            onSelectImage(generations[currentIndex + 1]);
        }
    }, [image, generations, onSelectImage]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, handlePrevious, handleNext]);

    if (!image) return null;

    const currentAsset = image.result_assets?.[selectedAssetIndex] || image.result_assets?.[0];

    const handleDownload = async () => {
        const url = currentAsset?.url;
        if (!url) return;
        const ext = url.includes('.png') ? 'png' : url.includes('.webp') ? 'webp' : 'jpg';
        await downloadFile(url, `image-${image.id}.${ext}`);
    };

    const handleCopyPrompt = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(image.prompt);
        toast.success(language === 'ru' ? 'Промпт скопирован' : 'Prompt copied');
    };

    const handleRemix = () => {
        onRemix(image);
        onOpenChange(false);
    };

    const handleMakeVariations = () => {
        if (onMakeVariations) {
            onMakeVariations(image);
            onOpenChange(false);
        }
    };

    const handleAnimate = () => {
        router.push(`/app/create/video?image=${encodeURIComponent(currentAsset?.url || '')}`);
    };

    const handleUpscale = () => {
        router.push(`/app/tools/enhance?image=${encodeURIComponent(currentAsset?.url || '')}`);
    };

    const handleDelete = () => {
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        removeGeneration(image.id);
        toast.success(language === 'ru' ? 'Удалено' : 'Deleted');
        onOpenChange(false);
    };

    const hasMultipleAssets = (image.result_assets?.length || 0) > 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="fixed inset-0 w-full h-full max-w-none p-0 border-none bg-black overflow-hidden"
                showCloseButton={false}
            >
                <VisuallyHidden>
                    <DialogTitle>Image Details</DialogTitle>
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
                                disabled={generations.findIndex((g) => g.id === image.id) === 0}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                disabled={
                                    generations.findIndex((g) => g.id === image.id) ===
                                    generations.length - 1
                                }
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center bg-black p-4 lg:p-12 min-h-0">
                        <img
                            src={currentAsset?.url || ''}
                            alt=""
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl lg:rounded-3xl shadow-2xl transition-transform duration-300"
                        />

                        {hasMultipleAssets && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 overflow-x-auto max-w-[90%] scrollbar-hide">
                                {image.result_assets?.map((asset, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedAssetIndex(index)}
                                        className={`relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                                            selectedAssetIndex === index
                                                ? 'border-[#6F00FF]'
                                                : 'border-transparent'
                                        }`}
                                    >
                                        <img
                                            src={asset.url}
                                            alt=""
                                            className="w-full h-full object-cover"
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
                                    disabled={generations.findIndex((g) => g.id === image.id) === 0}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="p-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                    disabled={
                                        generations.findIndex((g) => g.id === image.id) ===
                                        generations.length - 1
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
                                    {image.prompt}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">
                                        Model
                                    </span>
                                    <p className="text-sm text-white/70 font-bold truncate">
                                        {image.model}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">
                                        Quality
                                    </span>
                                    <p className="text-sm text-white/70 font-bold uppercase">
                                        {resolution}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">
                                        Size
                                    </span>
                                    <p className="text-sm text-white/70 font-bold">
                                        {currentAsset?.size
                                            ? `${Math.round(currentAsset.size / 1024)} KB`
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">
                                        Created
                                    </span>
                                    <p className="text-sm text-white/70 font-bold">
                                        {new Date(image.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 lg:p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={handleAnimate}
                                    className="flex flex-col items-center justify-center gap-1 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-[9px] font-bold uppercase tracking-wider"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Анимировать' : 'Animate'}
                                </button>
                                <button
                                    onClick={handleUpscale}
                                    className="flex flex-col items-center justify-center gap-1 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-[9px] font-bold uppercase tracking-wider"
                                >
                                    <Wand2 className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Улучшить' : 'Upscale'}
                                </button>
                                <button
                                    onClick={handleMakeVariations}
                                    className="flex flex-col items-center justify-center gap-1 h-16 rounded-2xl bg-[#6F00FF] hover:bg-[#7F20FF] text-white transition-all text-[9px] font-black uppercase tracking-wider shadow-[0_0_20px_rgba(111,0,255,0.15)]"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Вариации' : 'Variations'}
                                </button>
                            </div>

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
                                    onClick={() => onToggleLike(image.id)}
                                    className={`w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 ${
                                        currentImage?.is_favorite ? 'text-red-500' : 'text-white'
                                    }`}
                                >
                                    <Heart
                                        className={`w-4 h-4 ${
                                            currentImage?.is_favorite ? 'fill-current' : ''
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
                    generationIds={[image.id]}
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
