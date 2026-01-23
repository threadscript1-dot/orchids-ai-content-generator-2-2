# Media Picker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add ability to select attachments from user's library (uploads, generations, favorites) in addition to device uploads.

**Architecture:** Dropdown menu on "+" button with two options. MediaPickerModal with tabs for different sources. Uploads tab in main Library page. Uses existing Zustand stores pattern, openapi-fetch for API.

**Tech Stack:** React, TypeScript, Tailwind, Radix UI (Dialog, DropdownMenu, Tabs, AlertDialog), Vaul (Drawer), Framer Motion, openapi-fetch, Zustand

---

## Task 1: Add i18n translations

**Files:**
- Modify: `src/lib/language-context.tsx`

**Step 1: Add translation keys**

Add to `translations.ru` object (around line 13):
```typescript
// Media Picker
"attachment.fromDevice": "С устройства",
"attachment.fromLibrary": "Из библиотеки",
"mediaPicker.title": "Выбрать из библиотеки",
"mediaPicker.uploads": "Загрузки",
"mediaPicker.generations": "Генерации",
"mediaPicker.favorites": "Избранное",
"mediaPicker.select": "Выбрать",
"mediaPicker.delete": "Удалить",
"mediaPicker.selected": "Выбрано: {count}",
"mediaPicker.emptyUploads": "Нет загруженных файлов",
"mediaPicker.emptyGenerations": "Нет генераций",
"mediaPicker.emptyFavorites": "Нет избранного",
"mediaPicker.deleteConfirmTitle": "Удалить файлы?",
"mediaPicker.deleteConfirmDesc": "Это действие нельзя отменить. Выбранные файлы будут удалены.",
"library.uploads": "Загрузки",
```

Add same keys to `translations.en`:
```typescript
"attachment.fromDevice": "From device",
"attachment.fromLibrary": "From library",
"mediaPicker.title": "Select from library",
"mediaPicker.uploads": "Uploads",
"mediaPicker.generations": "Generations",
"mediaPicker.favorites": "Favorites",
"mediaPicker.select": "Select",
"mediaPicker.delete": "Delete",
"mediaPicker.selected": "Selected: {count}",
"mediaPicker.emptyUploads": "No uploaded files",
"mediaPicker.emptyGenerations": "No generations",
"mediaPicker.emptyFavorites": "No favorites",
"mediaPicker.deleteConfirmTitle": "Delete files?",
"mediaPicker.deleteConfirmDesc": "This action cannot be undone. Selected files will be deleted.",
"library.uploads": "Uploads",
```

**Step 2: Verify file saves without errors**

Run: `cd /Users/vaceslaveliseev/@dev/sdelai/orchids-ai-content-generator-2-2 && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/lib/language-context.tsx
git commit -m "feat: add i18n translations for media picker"
```

---

## Task 2: Create uploads store

**Files:**
- Create: `src/stores/uploads-store.ts`

**Step 1: Create the store**

```typescript
import { create } from 'zustand';
import createClient from 'openapi-fetch';
import type { paths } from '@/openapi/api';

const client = createClient<paths>({
    baseUrl: import.meta.env.VITE_API_URL || '',
});

export interface Upload {
    id: string;
    url: string;
    original_name: string | null;
    type: 'image' | 'video' | 'audio';
    mime_type: string;
    size: number;
    created_at: string;
}

interface UploadsState {
    uploads: Upload[];
    isLoading: boolean;
    error: string | null;
    nextCursor: string | null;
    hasMore: boolean;

    fetchUploads: (type?: 'image' | 'video' | 'audio', reset?: boolean) => Promise<void>;
    deleteUploads: (ids: string[]) => Promise<{ deleted: string[]; notFound: string[] }>;
    reset: () => void;
}

export const useUploadsStore = create<UploadsState>((set, get) => ({
    uploads: [],
    isLoading: false,
    error: null,
    nextCursor: null,
    hasMore: true,

    fetchUploads: async (type, reset = false) => {
        const state = get();
        if (state.isLoading) return;
        if (!reset && !state.hasMore) return;

        set({ isLoading: true, error: null });

        try {
            const token = localStorage.getItem('auth_token');
            const cursor = reset ? undefined : state.nextCursor ?? undefined;

            const { data, error } = await client.GET('/uploads/', {
                params: {
                    query: { type, cursor, limit: '20' },
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (error) {
                set({ error: 'Failed to fetch uploads', isLoading: false });
                return;
            }

            const items = data?.items ?? [];
            const nextCursor = data?.next_cursor ?? null;

            set({
                uploads: reset ? items : [...state.uploads, ...items],
                nextCursor,
                hasMore: nextCursor !== null,
                isLoading: false,
            });
        } catch (e) {
            set({ error: 'Failed to fetch uploads', isLoading: false });
        }
    },

    deleteUploads: async (ids) => {
        const token = localStorage.getItem('auth_token');

        const { data, error } = await client.DELETE('/uploads/', {
            body: { ids },
            headers: { Authorization: `Bearer ${token}` },
        });

        if (error || !data) {
            throw new Error('Failed to delete uploads');
        }

        // Remove deleted uploads from state
        set((state) => ({
            uploads: state.uploads.filter((u) => !data.deleted.includes(u.id)),
        }));

        return { deleted: data.deleted, notFound: data.not_found };
    },

    reset: () => {
        set({ uploads: [], nextCursor: null, hasMore: true, error: null });
    },
}));
```

**Step 2: Verify TypeScript**

Run: `cd /Users/vaceslaveliseev/@dev/sdelai/orchids-ai-content-generator-2-2 && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/stores/uploads-store.ts
git commit -m "feat: add uploads zustand store with API integration"
```

---

## Task 3: Create MediaPickerItem component

**Files:**
- Create: `src/components/generation/MediaPickerModal/MediaPickerItem.tsx`

**Step 1: Create directory and component**

```bash
mkdir -p src/components/generation/MediaPickerModal
```

```typescript
import { Check, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    source: 'upload' | 'generation' | 'favorite';
    name?: string;
}

interface MediaPickerItemProps {
    item: MediaItem;
    isSelected: boolean;
    onToggle: (item: MediaItem) => void;
}

export function MediaPickerItem({ item, isSelected, onToggle }: MediaPickerItemProps) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onToggle(item)}
            onKeyDown={(e) => e.key === 'Enter' && onToggle(item)}
            className={cn(
                'relative aspect-square rounded-xl overflow-hidden cursor-pointer group',
                'transition-all duration-200',
                'hover:opacity-90',
                isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-black'
            )}
        >
            {item.type === 'video' ? (
                <>
                    <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-8 h-8 text-white/80" fill="currentColor" />
                    </div>
                </>
            ) : (
                <img
                    src={item.url}
                    alt={item.name || 'Media'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            )}

            {/* Checkbox */}
            <div
                className={cn(
                    'absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    'transition-all duration-200',
                    isSelected
                        ? 'bg-white border-white'
                        : 'bg-black/30 border-white/50 opacity-70 group-hover:opacity-100'
                )}
            >
                {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
            </div>
        </div>
    );
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/generation/MediaPickerModal/MediaPickerItem.tsx
git commit -m "feat: add MediaPickerItem component with selection state"
```

---

## Task 4: Create MediaPickerGrid component

**Files:**
- Create: `src/components/generation/MediaPickerModal/MediaPickerGrid.tsx`

**Step 1: Create the component**

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { MediaPickerItem, MediaItem } from './MediaPickerItem';

interface MediaPickerGridProps {
    items: MediaItem[];
    selectedItems: Map<string, MediaItem>;
    onToggle: (item: MediaItem) => void;
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    emptyMessage: string;
}

export function MediaPickerGrid({
    items,
    selectedItems,
    onToggle,
    isLoading,
    hasMore,
    onLoadMore,
    emptyMessage,
}: MediaPickerGridProps) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                onLoadMore();
            }
        },
        [hasMore, isLoading, onLoadMore]
    );

    useEffect(() => {
        observerRef.current = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '100px',
            threshold: 0,
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [handleObserver]);

    if (!isLoading && items.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-white/40">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3">
                {items.map((item) => (
                    <MediaPickerItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.has(item.id)}
                        onToggle={onToggle}
                    />
                ))}
            </div>

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="h-4" />

            {isLoading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                </div>
            )}
        </div>
    );
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/generation/MediaPickerModal/MediaPickerGrid.tsx
git commit -m "feat: add MediaPickerGrid with infinite scroll"
```

---

## Task 5: Create MediaPickerActionBar component

**Files:**
- Create: `src/components/generation/MediaPickerModal/MediaPickerActionBar.tsx`

**Step 1: Create the component**

```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { MediaItem } from './MediaPickerItem';

interface MediaPickerActionBarProps {
    selectedItems: Map<string, MediaItem>;
    onSelect: () => void;
    onDelete: () => void;
    showDelete?: boolean;
}

export function MediaPickerActionBar({
    selectedItems,
    onSelect,
    onDelete,
    showDelete = true,
}: MediaPickerActionBarProps) {
    const { t } = useLanguage();
    const count = selectedItems.size;

    return (
        <AnimatePresence>
            {count > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute bottom-0 inset-x-0 p-4 bg-black/95 backdrop-blur-xl border-t border-white/10"
                >
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-white/60">
                            {t('mediaPicker.selected').replace('{count}', String(count))}
                        </span>
                        <div className="flex gap-2">
                            {showDelete && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onDelete}
                                    className="border-white/10 text-white/70 hover:text-red-400 hover:border-red-400/50"
                                >
                                    <Trash2 className="w-4 h-4 mr-1.5" />
                                    {t('mediaPicker.delete')}
                                </Button>
                            )}
                            <Button size="sm" onClick={onSelect}>
                                <Check className="w-4 h-4 mr-1.5" />
                                {t('mediaPicker.select')}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/generation/MediaPickerModal/MediaPickerActionBar.tsx
git commit -m "feat: add MediaPickerActionBar with select/delete actions"
```

---

## Task 6: Create MediaPickerModal main component

**Files:**
- Create: `src/components/generation/MediaPickerModal/index.tsx`

**Step 1: Create the component**

```typescript
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
        <div className="flex flex-col h-full max-h-[70vh] md:max-h-[60vh]">
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
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/generation/MediaPickerModal/
git commit -m "feat: add MediaPickerModal with tabs, grid, and actions"
```

---

## Task 7: Create AttachmentDropdown component

**Files:**
- Create: `src/components/generation/AttachmentDropdown.tsx`

**Step 1: Create the component**

```typescript
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
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/generation/AttachmentDropdown.tsx
git commit -m "feat: add AttachmentDropdown with device/library options"
```

---

## Task 8: Integrate AttachmentDropdown into ImageGenerationBar

**Files:**
- Modify: `src/components/generation/ImageGenerationBar.tsx`

**Step 1: Add imports**

Add after existing imports:
```typescript
import { AttachmentDropdown } from './AttachmentDropdown';
import { MediaPickerModal, MediaItem } from './MediaPickerModal';
```

**Step 2: Add state for MediaPickerModal**

Add inside component, after other state:
```typescript
const [showMediaPicker, setShowMediaPicker] = useState(false);
```

**Step 3: Add handler for media selection**

Add handler function:
```typescript
const handleMediaSelect = useCallback((items: MediaItem[]) => {
    const newImages: UploadedImage[] = items.map((item) => ({
        id: item.id,
        url: item.url,
        name: item.name || 'Selected media',
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
}, [setUploadedImages]);
```

**Step 4: Replace the + button with AttachmentDropdown**

Find (around line 190-196):
```typescript
<button
    onClick={onOpenFilePicker}
    aria-label="Attach image"
    className="flex items-center justify-center text-white/40 hover:text-white transition-colors h-10 px-3 rounded-2xl bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50"
>
    <Plus className="w-4 h-4" aria-hidden="true" />
</button>
```

Replace with:
```typescript
<AttachmentDropdown
    onUploadFromDevice={onOpenFilePicker}
    onSelectFromLibrary={() => setShowMediaPicker(true)}
/>
```

**Step 5: Add MediaPickerModal at end of component**

Before the closing fragment/div, add:
```typescript
<MediaPickerModal
    open={showMediaPicker}
    onOpenChange={setShowMediaPicker}
    acceptedTypes="image"
    onSelect={handleMediaSelect}
/>
```

**Step 6: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 7: Commit**

```bash
git add src/components/generation/ImageGenerationBar.tsx
git commit -m "feat: integrate AttachmentDropdown and MediaPickerModal into ImageGenerationBar"
```

---

## Task 9: Add Uploads tab to Library

**Files:**
- Modify: `src/components/library/LibrarySidebar.tsx`
- Modify: `src/components/library-page.tsx`

**Step 1: Add 'uploads' to CategoryType**

In `LibrarySidebar.tsx`, find CategoryType (around line 22-30) and add 'uploads':
```typescript
export type CategoryType =
    | 'all'
    | 'image'
    | 'video'
    | 'audio'
    | 'face-swap'
    | 'stylist'
    | 'relight'
    | 'favorites'
    | 'uploads';
```

**Step 2: Add Uploads tab button in library-page.tsx**

Find the tabs section (around line 430-516) and add after Audio tab:
```typescript
{/* Uploads Tab */}
<button
    onClick={() => {
        setActiveCategory('uploads');
        setActiveFolderId(null);
    }}
    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-[background-color,color,box-shadow] flex items-center gap-2 ${
        activeCategory === 'uploads' && !activeFolderId
            ? 'bg-white text-black shadow-lg shadow-black/20'
            : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}
>
    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
    <span className="hidden sm:inline">{t('library.uploads')}</span>
</button>
```

**Step 3: Add Upload import**

Add to imports in library-page.tsx:
```typescript
import { Upload } from 'lucide-react';
```

**Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add src/components/library/LibrarySidebar.tsx src/components/library-page.tsx
git commit -m "feat: add Uploads category type and tab button in Library"
```

---

## Task 10: Create UploadsGrid component for Library

**Files:**
- Create: `src/components/library/UploadsGrid.tsx`

**Step 1: Create the component**

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUploadsStore, Upload as UploadType } from '@/stores/uploads-store';
import { useLanguage } from '@/lib/language-context';

interface UploadsGridProps {
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onClick: (upload: UploadType) => void;
}

export function UploadsGrid({ selectedIds, onToggleSelect, onClick }: UploadsGridProps) {
    const { t } = useLanguage();
    const { uploads, isLoading, hasMore, fetchUploads } = useUploadsStore();
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUploads(undefined, true);
    }, []);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                fetchUploads();
            }
        },
        [hasMore, isLoading, fetchUploads]
    );

    useEffect(() => {
        observerRef.current = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '100px',
            threshold: 0,
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [handleObserver]);

    if (!isLoading && uploads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-white/40">
                <Upload className="w-12 h-12 mb-4 opacity-50" />
                <p>{t('mediaPicker.emptyUploads')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
                {uploads.map((upload) => (
                    <motion.div
                        key={upload.id}
                        layout="position"
                        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                        onClick={() => onClick(upload)}
                    >
                        {upload.type === 'video' ? (
                            <video
                                src={upload.url}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={upload.url}
                                alt={upload.original_name || 'Upload'}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        )}

                        {/* Selection checkbox */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelect(upload.id);
                            }}
                            className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center z-10 ${
                                selectedIds.has(upload.id)
                                    ? 'bg-white border-white'
                                    : 'bg-black/20 border-white/20 opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            {selectedIds.has(upload.id) && (
                                <svg
                                    className="w-3.5 h-3.5 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                ))}
            </div>

            <div ref={loadMoreRef} className="h-4" />

            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                </div>
            )}
        </div>
    );
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/library/UploadsGrid.tsx
git commit -m "feat: add UploadsGrid component for Library uploads tab"
```

---

## Task 11: Integrate UploadsGrid into LibraryPage

**Files:**
- Modify: `src/components/library-page.tsx`

**Step 1: Add imports**

```typescript
import { UploadsGrid } from './library/UploadsGrid';
import { useUploadsStore } from '@/stores/uploads-store';
```

**Step 2: Add uploads store and selection state**

Inside the component, add:
```typescript
const uploadsStore = useUploadsStore();
const [selectedUploadIds, setSelectedUploadIds] = useState<Set<string>>(new Set());

const handleToggleUploadSelect = useCallback((id: string) => {
    setSelectedUploadIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        return next;
    });
}, []);

const handleDeleteUploads = useCallback(async () => {
    if (selectedUploadIds.size === 0) return;
    await uploadsStore.deleteUploads(Array.from(selectedUploadIds));
    setSelectedUploadIds(new Set());
}, [selectedUploadIds, uploadsStore]);
```

**Step 3: Add conditional render for uploads category**

Find where filteredGenerations is rendered (the main grid area) and add condition before it:
```typescript
{activeCategory === 'uploads' ? (
    <UploadsGrid
        selectedIds={selectedUploadIds}
        onToggleSelect={handleToggleUploadSelect}
        onClick={(upload) => {
            // Optional: open detail view
            console.log('Upload clicked:', upload);
        }}
    />
) : (
    // existing grid render
)}
```

**Step 4: Add SelectionActionBar for uploads**

Add uploads action bar (if not covered by existing one):
```typescript
{activeCategory === 'uploads' && selectedUploadIds.size > 0 && (
    <SelectionActionBar
        selectedCount={selectedUploadIds.size}
        onClear={() => setSelectedUploadIds(new Set())}
        onDelete={handleDeleteUploads}
    />
)}
```

**Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 6: Commit**

```bash
git add src/components/library-page.tsx
git commit -m "feat: integrate UploadsGrid into LibraryPage with selection"
```

---

## Task 12: Test the implementation

**Step 1: Start dev server**

Run: `cd /Users/vaceslaveliseev/@dev/sdelai/orchids-ai-content-generator-2-2 && npm run dev`

**Step 2: Manual testing checklist**

1. [ ] Go to generation page
2. [ ] Click "+" button - dropdown appears with two options
3. [ ] Click "From device" - file picker opens
4. [ ] Click "From library" - MediaPickerModal opens
5. [ ] Switch between tabs (Uploads, Generations, Favorites)
6. [ ] Select multiple items - action bar appears
7. [ ] Click "Select" - modal closes, items added to generation
8. [ ] Click "Delete" on uploads tab - confirmation dialog appears
9. [ ] Confirm delete - items removed
10. [ ] Go to Library page
11. [ ] Click "Uploads" tab - uploads grid displays
12. [ ] Select items - selection action bar appears
13. [ ] Delete works with confirmation

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete media picker integration with library uploads"
```

---

## Summary

| Task | Component | Purpose |
|------|-----------|---------|
| 1 | i18n | Add translations |
| 2 | uploads-store | API integration |
| 3 | MediaPickerItem | Grid item with checkbox |
| 4 | MediaPickerGrid | Infinite scroll grid |
| 5 | MediaPickerActionBar | Select/Delete actions |
| 6 | MediaPickerModal | Main modal with tabs |
| 7 | AttachmentDropdown | Dropdown menu for + button |
| 8 | ImageGenerationBar | Integration |
| 9 | LibrarySidebar + library-page | Add uploads category |
| 10 | UploadsGrid | Library uploads grid |
| 11 | library-page | Integration |
| 12 | Testing | Manual verification |
