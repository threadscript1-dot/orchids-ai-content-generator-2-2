'use client';

import { RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Generation } from '@/stores/generation-store';
import { Model } from '@/stores/models-store';
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
        handleRemix,
        handleDelete,
        handleConfirmDelete,
        handleOpenAddToCollection,
    } = useDetailDialog({
        item: video,
        items: videos,
        open,
        onOpenChange,
        onSelectItem: onSelectVideo,
        onRemix,
    });

    if (!video) return null;

    const handleDownload = async () => {
        const url = currentAsset?.url;
        if (!url) return;
        await downloadFile(url, `video-${video.id}.mp4`);
    };

    const metadataItems = [
        { label: 'Model', value: models.find((m) => m.id === video.model)?.name || video.model },
        { label: 'Aspect', value: aspectRatio.toUpperCase() },
        { label: 'Duration', value: `${duration}s` },
        { label: 'Created', value: new Date(video.created_at).toLocaleDateString() },
    ];

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
                    <DetailDialogHeader
                        variant="mobile"
                        onClose={() => onOpenChange(false)}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        isFirst={isFirst}
                        isLast={isLast}
                    />

                    <div className="flex-1 relative flex items-center justify-center bg-black p-4 lg:p-12 min-h-0">
                        <video
                            key={currentAsset?.url}
                            src={currentAsset?.url || ''}
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl lg:rounded-3xl shadow-2xl transition-transform duration-300"
                            controls
                            autoPlay
                        />

                        {hasMultipleAssets && video.result_assets && (
                            <AssetThumbnailSelector
                                assets={video.result_assets}
                                selectedIndex={selectedAssetIndex}
                                onSelect={setSelectedAssetIndex}
                                type="video"
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
                            <DetailDialogPrompt prompt={video.prompt} onCopy={handleCopyPrompt} />
                            <DetailDialogMetadata items={metadataItems} />
                        </div>

                        <div className="p-4 lg:p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 space-y-3">
                            <button
                                onClick={handleRemix}
                                className="w-full py-4 rounded-2xl bg-[#6F00FF] hover:bg-[#7F20FF] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(111,0,255,0.15)]"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {language === 'ru' ? 'Переделать' : 'Remake'}
                            </button>

                            <DetailDialogActions
                                isFavorite={currentItem?.is_favorite || false}
                                onDownload={handleDownload}
                                onToggleLike={() => onToggleLike(video.id)}
                                onAddToCollection={handleOpenAddToCollection}
                                onDelete={handleDelete}
                            />
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
