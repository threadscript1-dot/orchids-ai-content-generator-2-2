'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/lib/language-context';
import { useFoldersStore } from '@/stores/folders-store';
import { Folder, Plus, Check, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGenerationStore } from '@/stores/generation-store';
import { toast } from 'sonner';

interface AddToCollectionModalProps {
    generationIds: string[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddToCollectionModal({
    generationIds,
    open,
    onOpenChange,
}: AddToCollectionModalProps) {
    const { language } = useLanguage();
    const {
        folders,
        fetchFolders,
        addToFolder,
        removeFromFolder,
        createFolder,
        getFoldersForGeneration,
    } = useFoldersStore();
    const { generations, toggleFavorite } = useGenerationStore();

    const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const firstGenerationId = generationIds[0];
    const generation = generations.find((g) => g.id === firstGenerationId);
    const isFavorite = generation?.is_favorite || false;

    useEffect(() => {
        if (open && firstGenerationId) {
            setIsLoading(true);
            Promise.all([fetchFolders(), getFoldersForGeneration(firstGenerationId)]).then(
                ([_, currentFolders]) => {
                    setSelectedFolderIds(currentFolders.map((f) => f.id));
                    setIsLoading(false);
                }
            );
        }
    }, [open, firstGenerationId]);

    const handleToggleFolder = async (folderId: string) => {
        const isSelected = selectedFolderIds.includes(folderId);
        const folder = folders.find((f) => f.id === folderId);
        const folderName = folder?.name || (language === 'ru' ? 'папку' : 'folder');
        
        if (isSelected) {
            const success = await removeFromFolder(folderId, generationIds);
            if (success) {
                setSelectedFolderIds((prev) => prev.filter((id) => id !== folderId));
                toast.success(
                    language === 'ru'
                        ? `Удалено из "${folderName}"`
                        : `Removed from "${folderName}"`
                );
            }
        } else {
            const success = await addToFolder(folderId, generationIds);
            if (success) {
                setSelectedFolderIds((prev) => [...prev, folderId]);
                toast.success(
                    language === 'ru'
                        ? `Добавлено в "${folderName}"`
                        : `Added to "${folderName}"`
                );
            }
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreating(true);
        const folderName = newFolderName.trim();
        const newFolder = await createFolder(folderName);
        if (newFolder) {
            await addToFolder(newFolder.id, generationIds);
            setSelectedFolderIds((prev) => [...prev, newFolder.id]);
            setNewFolderName('');
            fetchFolders();
            toast.success(
                language === 'ru'
                    ? `Добавлено в "${folderName}"`
                    : `Added to "${folderName}"`
            );
        }
        setIsCreating(false);
    };

    const handleToggleFavorite = async () => {
        for (const id of generationIds) {
            await toggleFavorite(id);
        }
        toast.success(
            language === 'ru'
                ? isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное'
                : isFavorite ? 'Removed from favorites' : 'Added to favorites'
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden bg-[#0A0A0A] border-white/10">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold">
                        {language === 'ru' ? 'Добавить в папку' : 'Add to folder'}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <button
                        onClick={handleToggleFavorite}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                            isFavorite ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/60'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Heart
                                className={`w-4 h-4 ${
                                    isFavorite ? 'text-red-500 fill-red-500' : 'text-white/20'
                                }`}
                            />
                            <span className="text-sm font-medium">
                                {language === 'ru' ? 'Избранное' : 'Favorites'}
                            </span>
                        </div>
                        {isFavorite && <Check className="w-4 h-4 text-white" />}
                    </button>

                    <div className="h-px bg-white/5 mx-[-24px]" />

                    <div className="max-h-[300px] overflow-y-auto space-y-1 -mx-2 px-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                            </div>
                        ) : folders.length > 0 ? (
                            folders
                                .filter((f) => f.name !== 'Избранное' && f.name !== 'Favorites')
                                .map((folder) => {
                                    const isSelected = selectedFolderIds.includes(folder.id);
                                    return (
                                        <button
                                            key={folder.id}
                                            onClick={() => handleToggleFolder(folder.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                                                isSelected
                                                    ? 'bg-white/10 text-white'
                                                    : 'hover:bg-white/5 text-white/60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Folder
                                                    className={`w-4 h-4 ${
                                                        isSelected ? 'text-white' : 'text-white/20'
                                                    }`}
                                                />
                                                <span className="text-sm font-medium">
                                                    {folder.name ||
                                                        (language === 'ru'
                                                            ? 'Новая папка'
                                                            : 'Untitled Folder')}
                                                </span>
                                            </div>
                                            {isSelected && <Check className="w-4 h-4 text-white" />}
                                        </button>
                                    );
                                })
                        ) : (
                            <p className="text-center py-4 text-sm text-white/40">
                                {language === 'ru' ? 'Папок пока нет' : 'No folders yet'}
                            </p>
                        )}
                    </div>

                    <div className="h-px bg-white/5 mx-[-24px]" />

                    <div className="flex gap-2 pt-2">
                        <Input
                            placeholder={language === 'ru' ? 'Название папки...' : 'Folder name...'}
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                            className="bg-white/5 border-white/10 focus-visible:border-white/30 focus-visible:ring-white/10"
                        />
                        <Button
                            size="icon"
                            onClick={handleCreateFolder}
                            disabled={!newFolderName.trim() || isCreating}
                            className="shrink-0"
                        >
                            {isCreating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
