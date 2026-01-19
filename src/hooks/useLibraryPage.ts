'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { useFoldersStore, Folder } from '@/stores/folders-store';
import { usePendingGenerationStore } from '@/stores/pending-generation-store';
import { useModelsStore } from '@/stores/models-store';
import { useAudio } from '@/context/audio-context';
import { downloadFile } from '@/lib/utils';
import type { CategoryType } from '@/components/library';

interface UseLibraryPageOptions {
    language: 'ru' | 'en';
}

export function useLibraryPage({ language }: UseLibraryPageOptions) {
    const router = useRouter();

    // Stores
    const { generations, toggleFavorite, fetchHistory, removeGeneration } = useGenerationStore();
    const { videoModels } = useModelsStore();
    const {
        folders,
        isLoading: isFoldersLoading,
        fetchFolders,
        createFolder,
        renameFolder,
        deleteFolder,
        fetchFolderDetails,
        removeFromFolder,
    } = useFoldersStore();

    // Local UI state
    const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
    const [isFolderLoading, setIsFolderLoading] = useState(false);
    const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
    const [gridSize, setGridSize] = useState([250]);
    const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

    // Modals state
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [folderModalMode, setFolderModalMode] = useState<'create' | 'rename'>('create');
    const [folderToRename, setFolderToRename] = useState<{ id: string; name: string } | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'folder' | 'generations'; id?: string } | null>(null);
    const [isBatchAddToCollectionOpen, setIsBatchAddToCollectionOpen] = useState(false);

    // Audio hook
    const audioContext = useAudio();
    const prepareNavigation = usePendingGenerationStore((s) => s.prepareNavigation);

    // Initial data fetch
    useEffect(() => {
        fetchFolders();
        fetchHistory(true);
    }, []);

    // Fetch folder details when activeFolderId changes
    useEffect(() => {
        if (activeFolderId) {
            setIsFolderLoading(true);
            fetchFolderDetails(activeFolderId).then((data: Folder | null) => {
                setActiveFolder(data);
                setIsFolderLoading(false);
            });
        } else {
            setActiveFolder(null);
            setIsFolderLoading(false);
        }
    }, [activeFolderId, fetchFolderDetails]);

    // Category label
    const getCategoryLabel = useCallback(() => {
        if (activeFolder) return activeFolder.name;
        if (activeCategory === 'favorites') return language === 'ru' ? 'Избранное' : 'Favorites';
        if (activeCategory === 'image') return language === 'ru' ? 'Изображения' : 'Images';
        if (activeCategory === 'video') return language === 'ru' ? 'Видео' : 'Videos';
        if (activeCategory === 'audio') return language === 'ru' ? 'Аудио' : 'Audio';
        return language === 'ru' ? 'Библиотека' : 'Library';
    }, [activeFolder, activeCategory, language]);

    // Folder handlers
    const handleOpenCreateFolder = useCallback(() => {
        setFolderModalMode('create');
        setFolderToRename(null);
        setIsFolderModalOpen(true);
    }, []);

    const handleOpenRenameFolder = useCallback((id: string, name: string) => {
        setFolderModalMode('rename');
        setFolderToRename({ id, name });
        setIsFolderModalOpen(true);
    }, []);

    const handleFolderModalConfirm = useCallback(async (name: string) => {
        if (folderModalMode === 'create') {
            const newFolder = await createFolder(name);
            if (newFolder) {
                setActiveFolderId(newFolder.id);
                setActiveCategory('all');
                toast.success(language === 'ru' ? 'Папка создана' : 'Folder created');
            }
        } else if (folderModalMode === 'rename' && folderToRename) {
            const success = await renameFolder(folderToRename.id, name);
            if (success) {
                if (activeFolder && activeFolder.id === folderToRename.id) {
                    setActiveFolder({ ...activeFolder, name });
                }
                toast.success(language === 'ru' ? 'Переименовано' : 'Renamed');
            }
        }
    }, [folderModalMode, folderToRename, createFolder, renameFolder, activeFolder, language]);

    const handleDeleteFolder = useCallback((id: string) => {
        setDeleteTarget({ type: 'folder', id });
        setIsDeleteConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'folder' && deleteTarget.id) {
            const success = await deleteFolder(deleteTarget.id);
            if (success) {
                toast.success(language === 'ru' ? 'Папка удалена' : 'Folder deleted');
                if (activeFolderId === deleteTarget.id) {
                    setActiveFolderId(null);
                    setActiveCategory('all');
                }
            }
        } else if (deleteTarget.type === 'generations') {
            if (activeFolderId) {
                const success = await removeFromFolder(activeFolderId, selectedIds);
                if (success) {
                    toast.success(language === 'ru' ? 'Удалено из папки' : 'Removed from folder');
                    fetchFolderDetails(activeFolderId).then((data: Folder | null) => {
                        setActiveFolder(data);
                    });
                    setSelectedIds([]);
                }
            } else {
                selectedIds.forEach((id) => removeGeneration(id));
                toast.success(language === 'ru' ? 'Удалено' : 'Deleted');
                setSelectedIds([]);
            }
        }
        setDeleteTarget(null);
    }, [deleteTarget, deleteFolder, activeFolderId, selectedIds, removeFromFolder, fetchFolderDetails, removeGeneration, language]);

    // Selection handlers
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    }, []);

    // Remix and variations handlers
    const handleRemix = useCallback((gen: Generation) => {
        const modelId = gen.model || (gen.type === 'video' ? 'kling-2.6' : gen.type === 'image' ? 'nano-banana-pro' : '');
        if (gen.type === 'audio') {
            prepareNavigation('audio', { prompt: gen.prompt });
            router.push('/app/create/audio');
        } else {
            prepareNavigation(gen.type, { prompt: gen.prompt });
            router.push(`/app/create/${gen.type}/${modelId}`);
        }
    }, [prepareNavigation, router]);

    const handleMakeVariations = useCallback((gen: Generation) => {
        const assetUrl = gen.result_assets?.[0]?.url;
        if (gen.type === 'audio') {
            router.push('/app/create/audio');
        } else if (gen.type === 'video') {
            prepareNavigation('video', { prompt: gen.prompt, imageUrl: assetUrl, imageName: 'Reference' });
            router.push('/app/create/video/kling-2.6');
        } else {
            prepareNavigation('image', { prompt: gen.prompt, imageUrl: assetUrl, imageName: 'Reference' });
            router.push('/app/create/image/nano-banana-pro');
        }
    }, [prepareNavigation, router]);

    // Batch handlers
    const handleBatchDownload = useCallback(async () => {
        for (const id of selectedIds) {
            const gen = generations.find((g) => g.id === id);
            if (gen?.result_assets?.[0]) {
                const url = gen.result_assets[0].url;
                const ext = gen.type === 'video' ? 'mp4' : gen.type === 'audio' ? 'mp3' : 'jpg';
                await downloadFile(url, `${gen.type}-${gen.id}.${ext}`);
            }
        }
        toast.success(
            language === 'ru'
                ? `Начато скачивание ${selectedIds.length} файлов`
                : `Started downloading ${selectedIds.length} files`
        );
    }, [selectedIds, generations, language]);

    const handleBatchDelete = useCallback(() => {
        setDeleteTarget({ type: 'generations' });
        setIsDeleteConfirmOpen(true);
    }, []);

    // Derived state
    const filteredGenerations = useMemo(() => {
        if (!Array.isArray(generations)) return [];
        if (activeFolderId) {
            if (!activeFolder || activeFolder.id !== activeFolderId) return [];
            const base = activeFolder.items || [];
            if (contentTypeFilter === 'all') return base;
            return base.filter((g) => g.type === contentTypeFilter);
        }
        return generations.filter((g) => {
            if (activeCategory === 'all') return true;
            if (activeCategory === 'favorites') return g.is_favorite;
            return g.type === activeCategory;
        });
    }, [generations, activeCategory, activeFolder, activeFolderId, contentTypeFilter]);

    const folderStats = useMemo(() => {
        if (!activeFolder?.items) return null;
        return {
            image: activeFolder.items.filter((i) => i.type === 'image').length,
            video: activeFolder.items.filter((i) => i.type === 'video').length,
            audio: activeFolder.items.filter((i) => i.type === 'audio').length,
        };
    }, [activeFolder]);

    const groupedGenerations = useMemo(() => {
        const groups: Record<string, Generation[]> = {};
        filteredGenerations.forEach((gen) => {
            const date = new Date(gen.created_at);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
            let label = '';
            if (diffDays === 0) label = language === 'ru' ? 'Сегодня' : 'Today';
            else if (diffDays === 1) label = language === 'ru' ? 'Вчера' : 'Yesterday';
            else label = language === 'ru' ? 'Ранее' : 'Older';
            if (!groups[label]) groups[label] = [];
            groups[label].push(gen);
        });
        return Object.entries(groups);
    }, [filteredGenerations, language]);

    const counts = useMemo(() => {
        if (!Array.isArray(generations)) return { all: 0, favorites: 0, image: 0, video: 0, audio: 0 };
        return {
            all: generations.length,
            favorites: generations.filter((g) => g.is_favorite).length,
            image: generations.filter((g) => g.type === 'image').length,
            video: generations.filter((g) => g.type === 'video').length,
            audio: generations.filter((g) => g.type === 'audio').length,
        };
    }, [generations]);

    const sidebarFolders = useMemo(() => {
        if (!Array.isArray(folders)) return [];
        return folders.map((f) => ({
            id: f.id,
            name: f.name || (language === 'ru' ? 'Новая папка' : 'Untitled Folder'),
            count: f.itemCount || 0,
        }));
    }, [folders, language]);

    const audioGenerations = useMemo(() => {
        if (!Array.isArray(generations)) return [];
        return generations.filter((g) => g.type === 'audio');
    }, [generations]);

    return {
        // State
        activeCategory,
        setActiveCategory,
        activeFolderId,
        setActiveFolderId,
        activeFolder,
        contentTypeFilter,
        setContentTypeFilter,
        gridSize,
        setGridSize,
        viewMode,
        setViewMode,
        selectedIds,
        setSelectedIds,
        selectedGeneration,
        setSelectedGeneration,

        // Modal state
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        isFolderModalOpen,
        setIsFolderModalOpen,
        folderModalMode,
        folderToRename,
        isDeleteConfirmOpen,
        setIsDeleteConfirmOpen,
        deleteTarget,
        isBatchAddToCollectionOpen,
        setIsBatchAddToCollectionOpen,

        // Loading state
        isFoldersLoading,
        isFolderLoading,

        // Derived data
        getCategoryLabel,
        filteredGenerations,
        folderStats,
        groupedGenerations,
        counts,
        sidebarFolders,
        audioGenerations,
        videoModels,

        // Handlers
        handleOpenCreateFolder,
        handleOpenRenameFolder,
        handleFolderModalConfirm,
        handleDeleteFolder,
        handleConfirmDelete,
        toggleSelect,
        handleRemix,
        handleMakeVariations,
        handleBatchDownload,
        handleBatchDelete,
        toggleFavorite,

        // Audio
        ...audioContext,
    };
}
