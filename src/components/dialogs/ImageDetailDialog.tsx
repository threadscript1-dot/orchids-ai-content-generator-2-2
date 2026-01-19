'use client';

import { useRouter } from 'next/navigation';
import { Play, Wand2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Generation } from '@/stores/generation-store';
import { usePendingGenerationStore } from '@/stores/pending-generation-store';
import { AddToCollectionModal } from '@/components/library/AddToCollectionModal';
import { ConfirmDeleteDialog } from '@/components/library/ConfirmDeleteDialog';
import { downloadFile } from '@/lib/utils';
import { useDetailDialog } from '@/hooks/useDetailDialog';
import {
    DetailDialogHeader,
    DetailDialogActions,
    DetailDialogPrompt,
    DetailDialogMetadata,
    AssetThumbnailSelector,
} from './shared';

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
    onToggleLike,
    generations = [],
    onSelectImage,
}: ImageDetailDialogProps) {
    const router = useRouter();
    const prepareNavigation = usePendingGenerationStore((s) => s.prepareNavigation);

    const {
        language,
        selectedAssetIndex,
        setSelectedAssetIndex,
        isAddToCollectionOpen,
        setIsAddToCollectionOpen,
        isDeleteConfirmOpen,
        setIsDeleteConfirmOpen,
        currentItem,
        currentAsset,
        hasMultipleAssets,
        isFirst,
        isLast,
        handlePrevious,
        handleNext,
        handleCopyPrompt,
        handleDelete,
        handleConfirmDelete,
        handleOpenAddToCollection,
    } = useDetailDialog({
        item: image,
        items: generations,
        open,
        onOpenChange,
        onSelectItem: onSelectImage,
        onRemix,
    });

    if (!image) return null;

    const handleDownload = async () => {
        const url = currentAsset?.url;
        if (!url) return;
        const ext = url.includes('.png') ? 'png' : url.includes('.webp') ? 'webp' : 'jpg';
        await downloadFile(url, `image-${image.id}.${ext}`);
    };

    const handleMakeVariations = () => {
        const imageUrl = currentAsset?.url || '';
        if (imageUrl) {
            prepareNavigation('image', {
                prompt: image.prompt,
                imageUrl,
                imageName: 'Reference',
            });
            router.push('/app/create/image/nano-banana-pro');
        }
        onOpenChange(false);
    };

    const handleAnimate = () => {
        const imageUrl = currentAsset?.url || '';
        if (imageUrl) {
            prepareNavigation('video', {
                prompt: image.prompt,
                imageUrl,
                imageName: 'Reference',
            });
        }
        router.push('/app/create/video/kling-2.6');
        onOpenChange(false);
    };

    const handleUpscale = () => {
        router.push(`/app/tools/enhance?image=${encodeURIComponent(currentAsset?.url || '')}`);
        onOpenChange(false);
    };

    const metadataItems = [
        { label: 'Model', value: image.model },
        { label: 'Quality', value: resolution.toUpperCase() },
        {
            label: 'Size',
            value: currentAsset?.size ? `${Math.round(currentAsset.size / 1024)} KB` : 'N/A',
        },
        { label: 'Created', value: new Date(image.created_at).toLocaleDateString() },
    ];

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
                    <DetailDialogHeader
                        variant="mobile"
                        onClose={() => onOpenChange(false)}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        isFirst={isFirst}
                        isLast={isLast}
                    />

                    <div className="flex-1 relative flex items-center justify-center bg-black p-4 lg:p-12 min-h-0">
                        <img
                            src={currentAsset?.url || ''}
                            alt=""
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl lg:rounded-3xl shadow-2xl transition-transform duration-300"
                        />

                        {hasMultipleAssets && image.result_assets && (
                            <AssetThumbnailSelector
                                assets={image.result_assets}
                                selectedIndex={selectedAssetIndex}
                                onSelect={setSelectedAssetIndex}
                                type="image"
                            />
                        )}
                    </div>

                    <div className="w-full lg:w-[450px] bg-[#0A0A0A] border-l border-white/5 flex flex-col h-[50vh] lg:h-full relative overflow-hidden">
                        <DetailDialogHeader
                            variant="desktop"
                            onClose={() => onOpenChange(false)}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            isFirst={isFirst}
                            isLast={isLast}
                        />

                        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-hide">
                            <DetailDialogPrompt prompt={image.prompt} onCopy={handleCopyPrompt} />
                            <DetailDialogMetadata items={metadataItems} />
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

                            <DetailDialogActions
                                isFavorite={currentItem?.is_favorite || false}
                                onDownload={handleDownload}
                                onToggleLike={() => onToggleLike(image.id)}
                                onAddToCollection={handleOpenAddToCollection}
                                onDelete={handleDelete}
                            />
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
