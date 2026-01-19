'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Generation, useGenerationStore } from '@/stores/generation-store';
import { useLanguage } from '@/lib/language-context';

interface UseDetailDialogOptions<T extends Generation> {
    item: T | null;
    items: T[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectItem?: (item: T) => void;
    onRemix?: (item: T) => void;
}

export function useDetailDialog<T extends Generation>({
    item,
    items,
    open,
    onOpenChange,
    onSelectItem,
    onRemix,
}: UseDetailDialogOptions<T>) {
    const { language } = useLanguage();
    const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
    const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const storeGenerations = useGenerationStore((state) => state.generations);
    const removeGeneration = useGenerationStore((state) => state.removeGeneration);

    // Get current item from store (to reflect real-time updates like favorites)
    const currentItem = item
        ? (storeGenerations.find((g) => g.id === item.id) as T | undefined) || item
        : null;

    // Reset asset index when item changes
    useEffect(() => {
        setSelectedAssetIndex(0);
    }, [item?.id]);

    // Current index in the list
    const currentIndex = item ? items.findIndex((i) => i.id === item.id) : -1;
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === items.length - 1;

    // Navigation handlers
    const handlePrevious = useCallback(() => {
        if (!item || !onSelectItem || items.length === 0) return;
        if (currentIndex > 0) {
            onSelectItem(items[currentIndex - 1]);
        }
    }, [item, items, currentIndex, onSelectItem]);

    const handleNext = useCallback(() => {
        if (!item || !onSelectItem || items.length === 0) return;
        if (currentIndex < items.length - 1) {
            onSelectItem(items[currentIndex + 1]);
        }
    }, [item, items, currentIndex, onSelectItem]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, handlePrevious, handleNext]);

    // Common handlers
    const handleCopyPrompt = useCallback(
        (e?: React.MouseEvent) => {
            e?.preventDefault();
            if (!item?.prompt) return;
            navigator.clipboard.writeText(item.prompt);
            toast.success(language === 'ru' ? 'Промпт скопирован' : 'Prompt copied');
        },
        [item?.prompt, language],
    );

    const handleRemix = useCallback(() => {
        if (!item || !onRemix) return;
        onRemix(item);
        onOpenChange(false);
    }, [item, onRemix, onOpenChange]);

    const handleDelete = useCallback(() => {
        setIsDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (!item) return;
        removeGeneration(item.id);
        toast.success(language === 'ru' ? 'Удалено' : 'Deleted');
        onOpenChange(false);
    }, [item, removeGeneration, language, onOpenChange]);

    const handleOpenAddToCollection = useCallback(() => {
        setIsAddToCollectionOpen(true);
    }, []);

    // Get current asset
    const currentAsset = item?.result_assets?.[selectedAssetIndex] || item?.result_assets?.[0];
    const hasMultipleAssets = (item?.result_assets?.length || 0) > 1;

    return {
        // State
        language,
        selectedAssetIndex,
        setSelectedAssetIndex,
        isAddToCollectionOpen,
        setIsAddToCollectionOpen,
        isDeleteConfirmOpen,
        setIsDeleteConfirmOpen,

        // Derived state
        currentItem,
        currentAsset,
        hasMultipleAssets,
        currentIndex,
        isFirst,
        isLast,

        // Handlers
        handlePrevious,
        handleNext,
        handleCopyPrompt,
        handleRemix,
        handleDelete,
        handleConfirmDelete,
        handleOpenAddToCollection,
    };
}
