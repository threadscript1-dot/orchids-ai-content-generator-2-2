'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import {
    Folder as FolderIcon,
    Maximize2,
    Minimize2,
    ChevronLeft,
    MoreHorizontal,
    Pencil,
    Trash2,
    Filter,
    Plus,
    Heart,
    Sparkles,
    Image,
    Video,
    Music,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AddToCollectionModal } from '@/components/library/AddToCollectionModal';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { useFoldersStore, Folder } from '@/stores/folders-store';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { GridSizeSlider, GeneratingPlaceholder, ImageCard } from '@/components/generation';
import { downloadFile } from '@/lib/utils';
import {
    LibrarySidebar,
    MediaCard,
    SelectionActionBar,
    UpgradeModal,
    FolderCard,
    FolderModal,
    ConfirmDeleteDialog,
    type CategoryType,
} from '@/components/library';
import { ImageDetailDialog } from '@/components/dialogs/ImageDetailDialog';
import { VideoDetailDialog } from '@/components/dialogs/VideoDetailDialog';
import { AudioDetailDialog } from '@/components/dialogs/AudioDetailDialog';
import { useModelsStore } from '@/stores/models-store';
import { AudioTrackCard, AudioPlayerFooter } from '@/components/audio';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LibraryPage() {
    const { language } = useLanguage();
    const router = useRouter();

    // Store
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

    // Local state
    const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
    const [isFolderLoading, setIsFolderLoading] = useState(false);
    const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'image' | 'video' | 'audio'>(
        'all'
    );

    const [gridSize, setGridSize] = useState([250]);
    const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // Folder Modal state
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [folderModalMode, setFolderModalMode] = useState<'create' | 'rename'>('create');
    const [folderToRename, setFolderToRename] = useState<{ id: string; name: string } | null>(null);

    // Delete confirmation state
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'folder' | 'generations'; id?: string } | null>(null);

    // Fetch initial data
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
    }, [activeFolderId]);

    // Helpers
    const getCategoryLabel = () => {
        if (activeFolder) return activeFolder.name;
        if (activeCategory === 'favorites') return language === 'ru' ? 'Избранное' : 'Favorites';
        if (activeCategory === 'image') return language === 'ru' ? 'Изображения' : 'Images';
        if (activeCategory === 'video') return language === 'ru' ? 'Видео' : 'Videos';
        if (activeCategory === 'audio') return language === 'ru' ? 'Аудио' : 'Audio';
        return language === 'ru' ? 'Библиотека' : 'Library';
    };

    const handleOpenCreateFolder = () => {
        setFolderModalMode('create');
        setFolderToRename(null);
        setIsFolderModalOpen(true);
    };

    const handleOpenRenameFolder = (id: string, name: string) => {
        setFolderModalMode('rename');
        setFolderToRename({ id, name });
        setIsFolderModalOpen(true);
    };

    const handleFolderModalConfirm = async (name: string) => {
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
    };

    const handleDeleteFolder = async (id: string) => {
        setDeleteTarget({ type: 'folder', id });
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
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
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Derived state
    const filteredGenerations = useMemo(() => {
        if (!Array.isArray(generations)) return [];

        // If we are in a folder view
        if (activeFolderId) {
            // Only show items if activeFolder matches the requested ID
            if (!activeFolder || activeFolder.id !== activeFolderId) return [];

            const base = activeFolder.items || [];
            if (contentTypeFilter === 'all') return base;
            return base.filter((g) => g.type === contentTypeFilter);
        }

        // Global view
        return generations.filter((g) => {
            if (activeCategory === 'all') return true;
            if (activeCategory === 'favorites') return g.is_favorite;
            if (activeCategory === 'image') return g.type === 'image';
            if (activeCategory === 'video') return g.type === 'video';
            if (activeCategory === 'audio') return g.type === 'audio';
            return false;
        });
    }, [generations, activeCategory, activeFolder, activeFolderId, contentTypeFilter]);

    const folderStats = useMemo(() => {
        if (!activeFolder || !activeFolder.items) return null;
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
        if (!Array.isArray(generations))
            return { all: 0, favorites: 0, image: 0, video: 0, audio: 0 };
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

    // Audio player hook
    const audioGenerations = useMemo(() => {
        if (!Array.isArray(generations)) return [];
        return generations.filter((g) => g.type === 'audio');
    }, [generations]);

    const {
        audioRef,
        currentTrack,
        isPlaying,
        setIsPlaying,
        audioProgress,
        audioDuration,
        volume,
        playbackSpeed,
        setPlaybackSpeed,
        getAudioTracks,
        playTrack,
        togglePlayPause,
        handleTimeUpdate,
        handleLoadedMetadata,
        handleSeek,
        handleVolumeChange,
        playNextTrack,
        playPrevTrack,
        formatDuration,
    } = useAudioPlayer(audioGenerations);

    const handleRemix = (gen: Generation) => {
        router.push(
            `/app/create/${gen.type}?prompt=${encodeURIComponent(
                gen.prompt
            )}&model=${encodeURIComponent(gen.model)}`
        );
    };

    const handleMakeVariations = (gen: Generation) => {
        router.push(
            `/app/create/${gen.type}?prompt=${encodeURIComponent(
                gen.prompt
            )}&model=${encodeURIComponent(gen.model)}&action=generate`
        );
    };

    const showFoldersInMain = false;

    const [isBatchAddToCollectionOpen, setIsBatchAddToCollectionOpen] = useState(false);

    const handleBatchDownload = async () => {
        for (const id of selectedIds) {
            const gen = generations.find((g) => g.id === id);
            if (gen && gen.result_assets && gen.result_assets[0]) {
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
    };

    const handleBatchDelete = async () => {
        setDeleteTarget({ type: 'generations' });
        setIsDeleteConfirmOpen(true);
    };

    return (
        <div className="relative min-h-screen -mt-6 sm:-mx-6 px-4 sm:px-8 py-8 overflow-hidden">
            {/* Background Grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                <div className="hidden lg:block">
                    <LibrarySidebar
                        activeCategory={activeFolderId ? 'all' : activeCategory}
                        activeFolderId={activeFolderId}
                        onCategoryChange={(cat) => {
                            setActiveCategory(cat);
                            setActiveFolderId(null);
                        }}
                        onFolderClick={(id) => {
                            setActiveFolderId(id);
                            setActiveCategory('all');
                        }}
                        folders={sidebarFolders}
                        onAddFolder={handleOpenCreateFolder}
                        onRenameFolder={handleOpenRenameFolder}
                        onDeleteFolder={handleDeleteFolder}
                        counts={counts}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 space-y-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {activeFolder && (
                                    <button
                                        onClick={() => {
                                            setActiveFolderId(null);
                                            setActiveCategory('all');
                                        }}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                )}

                                <div className="flex items-center gap-4">
                                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                                        {getCategoryLabel()}
                                    </h1>
                                    {activeFolder && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() =>
                                                    handleOpenRenameFolder(
                                                        activeFolder.id,
                                                        activeFolder.name
                                                    )
                                                }
                                                className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/60 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFolder(activeFolder.id)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar w-full sm:w-auto">
                                <div className="flex items-center gap-1.5 p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5">
                                    <button
                                        onClick={() => {
                                            setActiveCategory('all');
                                            setActiveFolderId(null);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            activeCategory === 'all' && !activeFolderId
                                                ? 'bg-white text-black shadow-lg shadow-black/20'
                                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {language === 'ru' ? 'Все' : 'All'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveCategory('favorites');
                                            setActiveFolderId(null);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                            activeCategory === 'favorites' && !activeFolderId
                                                ? 'bg-white text-black shadow-lg shadow-black/20'
                                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Heart
                                            className={`w-3.5 h-3.5 ${
                                                activeCategory === 'favorites' && !activeFolderId
                                                    ? 'fill-black'
                                                    : 'fill-white'
                                            }`}
                                        />
                                        <span className="hidden sm:inline">
                                            {language === 'ru' ? 'Избранное' : 'Favorites'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveCategory('image');
                                            setActiveFolderId(null);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                            activeCategory === 'image' && !activeFolderId
                                                ? 'bg-white text-black shadow-lg shadow-black/20'
                                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Image className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">
                                            {language === 'ru' ? 'Фото' : 'Photos'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveCategory('video');
                                            setActiveFolderId(null);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                            activeCategory === 'video' && !activeFolderId
                                                ? 'bg-white text-black shadow-lg shadow-black/20'
                                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Video className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">
                                            {language === 'ru' ? 'Видео' : 'Video'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveCategory('audio');
                                            setActiveFolderId(null);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                            activeCategory === 'audio' && !activeFolderId
                                                ? 'bg-white text-black shadow-lg shadow-black/20'
                                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Music className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">
                                            {language === 'ru' ? 'Аудио' : 'Audio'}
                                        </span>
                                    </button>
                                </div>
                                <div className="hidden sm:block w-px h-8 bg-white/10" />
                                <GridSizeSlider
                                    value={gridSize}
                                    onChange={setGridSize}
                                    min={150}
                                    max={600}
                                    viewMode={viewMode}
                                    onViewModeChange={setViewMode}
                                />
                            </div>
                        </div>

                        {/* Mobile Folders Navigation - Simplified */}
                        <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-2 pb-2">
                            <button
                                onClick={handleOpenCreateFolder}
                                className="flex-shrink-0 p-2 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            {sidebarFolders.map((folder) => (
                                <button
                                    key={folder.id}
                                    onClick={() => {
                                        setActiveFolderId(folder.id);
                                        setActiveCategory('all');
                                    }}
                                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                        activeFolderId === folder.id
                                            ? 'bg-white/10 text-white border border-white/10'
                                            : 'bg-transparent text-white/40 hover:text-white border border-transparent'
                                    }`}
                                >
                                    <FolderIcon className="w-3.5 h-3.5" />
                                    {folder.name}
                                </button>
                            ))}
                        </div>

                        {activeFolder && folderStats && (
                            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl w-fit border border-white/5">
                                <button
                                    onClick={() => setContentTypeFilter('all')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        contentTypeFilter === 'all'
                                            ? 'bg-white/10 backdrop-blur-xl text-white shadow-lg shadow-black/20'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Filter className="w-4 h-4" />
                                    {language === 'ru' ? 'Все' : 'All'}
                                    <span className="text-[10px] font-bold opacity-40 ml-1">
                                        {(activeFolder.items || []).length}
                                    </span>
                                </button>
                                <div className="w-px h-4 bg-white/10 mx-1" />
                                <button
                                    onClick={() => setContentTypeFilter('image')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        contentTypeFilter === 'image'
                                            ? 'bg-white/10 backdrop-blur-xl text-white shadow-lg shadow-black/20'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <FolderIcon className="w-4 h-4" />
                                    {language === 'ru' ? 'Фото' : 'Photos'}
                                    <span className="text-[10px] font-bold opacity-40 ml-1">
                                        {folderStats.image}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setContentTypeFilter('video')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        contentTypeFilter === 'video'
                                            ? 'bg-white/10 backdrop-blur-xl text-white shadow-lg shadow-black/20'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <FolderIcon className="w-4 h-4" />
                                    {language === 'ru' ? 'Видео' : 'Video'}
                                    <span className="text-[10px] font-bold opacity-40 ml-1">
                                        {folderStats.video}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setContentTypeFilter('audio')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        contentTypeFilter === 'audio'
                                            ? 'bg-white/10 backdrop-blur-xl text-white shadow-lg shadow-black/20'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <FolderIcon className="w-4 h-4" />
                                    {language === 'ru' ? 'Аудио' : 'Audio'}
                                    <span className="text-[10px] font-bold opacity-40 ml-1">
                                        {folderStats.audio}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {isFoldersLoading || isFolderLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mb-4" />
                            <p className="text-white/40 text-sm animate-pulse">
                                {language === 'ru' ? 'Делаем...' : 'Loading...'}
                            </p>
                        </div>
                    ) : sidebarFolders.length > 0 || groupedGenerations.length > 0 ? (
                        <div className="space-y-12">
                            {/* Folders in main view */}
                            {showFoldersInMain && sidebarFolders.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-4">
                                        {language === 'ru' ? 'Папки' : 'Folders'}
                                        <div className="h-px flex-1 bg-white/5" />
                                    </h3>
                                    <div
                                        className="grid gap-4 sm:gap-6"
                                        style={{
                                            gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize[0]}px, 1fr))`,
                                        }}
                                    >
                                        {sidebarFolders.map((folder) => (
                                            <FolderCard
                                                key={folder.id}
                                                id={folder.id}
                                                name={folder.name}
                                                count={folder.count}
                                                onClick={() => {
                                                    setActiveFolderId(folder.id);
                                                    setActiveCategory('all');
                                                }}
                                                onRename={() =>
                                                    handleOpenRenameFolder(folder.id, folder.name)
                                                }
                                                onDelete={() => handleDeleteFolder(folder.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {groupedGenerations.map(([label, items]) => (
                                <div key={label} className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-4">
                                        {label}
                                        <div className="h-px flex-1 bg-white/5" />
                                    </h3>

                                    <div
                                        className={
                                            activeCategory === 'audio' ||
                                            (activeFolder && contentTypeFilter === 'audio')
                                                ? 'flex flex-col gap-3 max-w-5xl'
                                                : `grid gap-2 ${
                                                      viewMode === 'grid'
                                                          ? 'grid-cols-2 sm:grid-cols-none'
                                                          : 'grid-cols-1 sm:grid-cols-none'
                                                  }`
                                        }
                                        style={
                                            activeCategory === 'audio' ||
                                            (activeFolder && contentTypeFilter === 'audio')
                                                ? {}
                                                : {
                                                      gridTemplateColumns:
                                                          typeof window !== 'undefined' &&
                                                          window.innerWidth > 640
                                                              ? `repeat(auto-fill, minmax(${gridSize[0]}px, 1fr))`
                                                              : undefined,
                                                  }
                                        }
                                    >
                                        {items.map((gen) => {
                                            if (
                                                activeCategory === 'audio' ||
                                                (activeFolder && contentTypeFilter === 'audio')
                                            ) {
                                                const tracks = getAudioTracks(gen);
                                                return tracks.map((track, trackIdx) => {
                                                    const isCurrentTrack =
                                                        currentTrack?.genId === gen.id &&
                                                        currentTrack?.trackIndex === trackIdx;

                                                    return (
                                                        <AudioTrackCard
                                                            key={`${gen.id}-track-${trackIdx}`}
                                                            generation={gen}
                                                            track={track}
                                                            trackIndex={trackIdx}
                                                            totalTracks={tracks.length}
                                                            isCurrentTrack={isCurrentTrack}
                                                            isPlaying={isCurrentTrack && isPlaying}
                                                            onClick={() => playTrack(gen, trackIdx)}
                                                            onDownload={() => {
                                                                downloadFile(track.url, `audio-${gen.id}.mp3`);
                                                            }}
                                                        />
                                                    );
                                                });
                                            }

                                            return (
                                                <MediaCard
                                                    key={gen.id}
                                                    generation={gen}
                                                    isSelected={selectedIds.includes(gen.id)}
                                                    onToggleSelect={() => toggleSelect(gen.id)}
                                                    onClick={() => setSelectedGeneration(gen)}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <FolderIcon className="w-8 h-8 text-white/20" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                {language === 'ru' ? 'Тут пока ничего нет' : 'Nothing here yet'}
                            </h3>
                        </div>
                    )}
                </main>
            </div>

            {/* Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <SelectionActionBar
                        selectedCount={selectedIds.length}
                        selectedGenerations={generations.filter((g) => selectedIds.includes(g.id))}
                        onClear={() => setSelectedIds([])}
                        onDownload={handleBatchDownload}
                        onDelete={handleBatchDelete}
                        onAddToFolder={() => setIsBatchAddToCollectionOpen(true)}
                    />
                )}
            </AnimatePresence>

            <AddToCollectionModal
                generationIds={selectedIds}
                open={isBatchAddToCollectionOpen}
                onOpenChange={setIsBatchAddToCollectionOpen}
            />

            {/* Upgrade Modal */}
            <UpgradeModal open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} />

            {/* Folder Modal */}
            <FolderModal
                open={isFolderModalOpen}
                onOpenChange={setIsFolderModalOpen}
                mode={folderModalMode}
                initialName={folderToRename?.name}
                onConfirm={handleFolderModalConfirm}
            />

            {/* Delete Confirmation */}
            <ConfirmDeleteDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                onConfirm={handleConfirmDelete}
                title={
                    deleteTarget?.type === 'folder'
                        ? language === 'ru' ? 'Удалить папку?' : 'Delete folder?'
                        : language === 'ru' ? 'Удалить?' : 'Delete?'
                }
                description={
                    deleteTarget?.type === 'folder'
                        ? language === 'ru' ? 'Папка будет удалена. Генерации останутся в библиотеке.' : 'Folder will be deleted. Generations will remain in library.'
                        : language === 'ru' ? 'Выбранные элементы будут удалены' : 'Selected items will be deleted'
                }
            />

            {/* Preview Dialogs */}
            <ImageDetailDialog
                image={selectedGeneration?.type === 'image' ? selectedGeneration : null}
                open={selectedGeneration?.type === 'image'}
                onOpenChange={(open) => !open && setSelectedGeneration(null)}
                resolution="1K"
                onRemix={handleRemix}
                onMakeVariations={handleMakeVariations}
                onToggleLike={toggleFavorite}
                generations={filteredGenerations.filter((g) => g.type === 'image')}
                onSelectImage={setSelectedGeneration}
            />

            <VideoDetailDialog
                video={selectedGeneration?.type === 'video' ? selectedGeneration : null}
                open={selectedGeneration?.type === 'video'}
                onOpenChange={(open) => !open && setSelectedGeneration(null)}
                models={videoModels}
                aspectRatio="16:9"
                duration="5"
                onRemix={handleRemix}
                onToggleLike={toggleFavorite}
                videos={filteredGenerations.filter((g) => g.type === 'video')}
                onSelectVideo={setSelectedGeneration}
            />

            <AudioDetailDialog
                audio={selectedGeneration?.type === 'audio' ? selectedGeneration : null}
                open={selectedGeneration?.type === 'audio'}
                onOpenChange={(open) => !open && setSelectedGeneration(null)}
                onRemix={handleRemix}
                onToggleLike={toggleFavorite}
                audios={filteredGenerations.filter((g) => g.type === 'audio')}
                onSelectAudio={setSelectedGeneration}
            />

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={playNextTrack}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Bottom Audio Player */}
            {(activeCategory === 'audio' || (activeFolder && contentTypeFilter === 'audio')) && (
                <AudioPlayerFooter
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    audioProgress={audioProgress}
                    audioDuration={audioDuration}
                    volume={volume}
                    playbackSpeed={playbackSpeed}
                    onTogglePlayPause={togglePlayPause}
                    onSeek={handleSeek}
                    onVolumeChange={handleVolumeChange}
                    onPlaybackSpeedChange={setPlaybackSpeed}
                    onPlayNext={playNextTrack}
                    onPlayPrev={playPrevTrack}
                    formatDuration={formatDuration}
                />
            )}
        </div>
    );
}
