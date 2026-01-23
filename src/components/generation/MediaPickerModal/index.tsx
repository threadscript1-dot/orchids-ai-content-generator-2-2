'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, Sparkles, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/lib/language-context';
import { useUploadsStore } from '@/stores/uploads-store';
import { useGenerationStore } from '@/stores/generation-store';
import { MediaPickerGrid } from './MediaPickerGrid';
import { MediaPickerActionBar } from './MediaPickerActionBar';
import { MediaItem } from './MediaPickerItem';

interface MediaPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    acceptedTypes: 'image' | 'video' | 'all';
    onSelect: (items: MediaItem[]) => void;
}

export function MediaPickerModal({
    open,
    onOpenChange,
    acceptedTypes,
    onSelect,
}: MediaPickerModalProps) {
    const isMobile = useIsMobile();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'uploads' | 'generations' | 'favorites'>('uploads');
    const [selectedItems, setSelectedItems] = useState<Map<string, MediaItem>>(new Map());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Stores
    const uploadsStore = useUploadsStore();
    const { generations } = useGenerationStore();

    // Fetch uploads on mount and tab change
    useEffect(() => {
        if (open && activeTab === 'uploads') {
            const type = acceptedTypes === 'all' ? undefined : acceptedTypes;
            uploadsStore.fetchUploads(type, true);
        }
    }, [open, activeTab, acceptedTypes]);

    // Reset selection when modal closes
    useEffect(() => {
        if (!open) {
            setSelectedItems(new Map());
            setActiveTab('uploads');
        }
    }, [open]);

    const handleToggle = useCallback((item: MediaItem) => {
        setSelectedItems((prev) => {
            const next = new Map(prev);
            if (next.has(item.id)) {
                next.delete(item.id);
            } else {
                next.set(item.id, item);
            }
            return next;
        });
    }, []);

    const handleSelect = useCallback(() => {
        onSelect(Array.from(selectedItems.values()));
        onOpenChange(false);
    }, [selectedItems, onSelect, onOpenChange]);

    const handleDeleteConfirmed = useCallback(async () => {
        const uploadIds = Array.from(selectedItems.values())
            .filter((item) => item.source === 'upload')
            .map((item) => item.id);

        if (uploadIds.length > 0) {
            await uploadsStore.deleteUploads(uploadIds);
        }

        setSelectedItems(new Map());
        setShowDeleteConfirm(false);
    }, [selectedItems, uploadsStore]);

    // Map uploads to MediaItem
    const uploadItems: MediaItem[] = uploadsStore.uploads
        .filter((u) => u.type !== 'audio')
        .map((u) => ({
            id: u.id,
            url: u.url,
            type: u.type as 'image' | 'video',
            source: 'upload' as const,
            name: u.original_name ?? undefined,
        }));

    // Map generations to MediaItem
    const generationItems: MediaItem[] = generations
        .filter((g) => {
            if (g.status !== 'success') return false;
            if (acceptedTypes === 'all') return g.type === 'image' || g.type === 'video';
            return g.type === acceptedTypes;
        })
        .flatMap((g) =>
            (g.result_assets || []).map((asset, idx) => ({
                id: `${g.id}-${idx}`,
                url: asset.url,
                type: g.type as 'image' | 'video',
                source: 'generation' as const,
                name: g.prompt?.slice(0, 50),
            }))
        );

    // Favorites
    const favoriteItems: MediaItem[] = generations
        .filter((g) => {
            if (!g.is_favorite || g.status !== 'success') return false;
            if (acceptedTypes === 'all') return g.type === 'image' || g.type === 'video';
            return g.type === acceptedTypes;
        })
        .flatMap((g) =>
            (g.result_assets || []).map((asset, idx) => ({
                id: `${g.id}-${idx}`,
                url: asset.url,
                type: g.type as 'image' | 'video',
                source: 'favorite' as const,
                name: g.prompt?.slice(0, 50),
            }))
        );

    const content = (
        <div className="flex flex-col h-full max-h-[70vh] md:max-h-[60vh] relative">
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                className="flex flex-col h-full"
            >
                <TabsList className="w-full justify-start bg-white/5 p-1 mx-3 mt-2 rounded-xl">
                    <TabsTrigger value="uploads" className="flex items-center gap-1.5 text-xs">
                        <Upload className="w-3.5 h-3.5" />
                        {t('mediaPicker.uploads')}
                    </TabsTrigger>
                    <TabsTrigger value="generations" className="flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t('mediaPicker.generations')}
                    </TabsTrigger>
                    <TabsTrigger value="favorites" className="flex items-center gap-1.5 text-xs">
                        <Heart className="w-3.5 h-3.5" />
                        {t('mediaPicker.favorites')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="uploads" className="flex-1 overflow-hidden mt-0">
                    <MediaPickerGrid
                        items={uploadItems}
                        selectedItems={selectedItems}
                        onToggle={handleToggle}
                        isLoading={uploadsStore.isLoading}
                        hasMore={uploadsStore.hasMore}
                        onLoadMore={() => {
                            const type = acceptedTypes === 'all' ? undefined : acceptedTypes;
                            uploadsStore.fetchUploads(type);
                        }}
                        emptyMessage={t('mediaPicker.emptyUploads')}
                    />
                </TabsContent>

                <TabsContent value="generations" className="flex-1 overflow-hidden mt-0">
                    <MediaPickerGrid
                        items={generationItems}
                        selectedItems={selectedItems}
                        onToggle={handleToggle}
                        isLoading={false}
                        hasMore={false}
                        onLoadMore={() => {}}
                        emptyMessage={t('mediaPicker.emptyGenerations')}
                    />
                </TabsContent>

                <TabsContent value="favorites" className="flex-1 overflow-hidden mt-0">
                    <MediaPickerGrid
                        items={favoriteItems}
                        selectedItems={selectedItems}
                        onToggle={handleToggle}
                        isLoading={false}
                        hasMore={false}
                        onLoadMore={() => {}}
                        emptyMessage={t('mediaPicker.emptyFavorites')}
                    />
                </TabsContent>
            </Tabs>

            <MediaPickerActionBar
                selectedItems={selectedItems}
                onSelect={handleSelect}
                onDelete={() => setShowDeleteConfirm(true)}
                showDelete={activeTab === 'uploads'}
            />

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('mediaPicker.deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('mediaPicker.deleteConfirmDesc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirmed}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {t('mediaPicker.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[85vh]">
                    <DrawerHeader>
                        <DrawerTitle>{t('mediaPicker.title')}</DrawerTitle>
                    </DrawerHeader>
                    {content}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[600px] p-0 gap-0">
                <DialogHeader className="p-4 pb-0">
                    <DialogTitle>{t('mediaPicker.title')}</DialogTitle>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}

export type { MediaItem };
