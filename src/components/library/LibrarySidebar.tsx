'use client';

import {
    Heart,
    Folder,
    Image as ImageIcon,
    Video,
    Music,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type CategoryType =
    | 'all'
    | 'image'
    | 'video'
    | 'audio'
    | 'face-swap'
    | 'stylist'
    | 'relight'
    | 'favorites';

export interface FolderType {
    id: string;
    name: string;
    count: number;
}

interface LibrarySidebarProps {
    activeCategory: CategoryType;
    activeFolderId: string | null;
    onCategoryChange: (category: CategoryType) => void;
    onFolderClick: (id: string) => void;
    folders: FolderType[];
    onAddFolder: () => void;
    onRenameFolder: (id: string, name: string) => void;
    onDeleteFolder: (id: string) => void;
    counts: {
        all: number;
        favorites: number;
        image: number;
        video: number;
        audio: number;
    };
}

interface FolderItemProps {
    folder: FolderType;
    activeFolderId: string | null;
    onFolderClick: (id: string) => void;
    onRenameFolder: (id: string, name: string) => void;
    onDeleteFolder: (id: string) => void;
    language: string;
}

function FolderItem({
    folder,
    activeFolderId,
    onFolderClick,
    onRenameFolder,
    onDeleteFolder,
    language,
}: FolderItemProps) {
    return (
        <div
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group cursor-pointer ${
                activeFolderId && activeFolderId === folder.id
                    ? 'bg-white/10 backdrop-blur-xl text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => onFolderClick(folder.id)}
        >
            <div className="flex items-center gap-3 min-w-0">
                <Folder className={`w-4 h-4 shrink-0 ${activeFolderId === folder.id ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`} />
                <span className="text-sm font-medium truncate">
                    {folder.name || (language === 'ru' ? 'Новая папка' : 'Untitled Folder')}
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-[#0A0A0A] border-white/10">
                        <DropdownMenuItem onClick={() => onRenameFolder(folder.id, folder.name)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            {language === 'ru' ? 'Переименовать' : 'Rename'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => onDeleteFolder(folder.id)}
                            className="text-red-500 focus:text-red-500"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {language === 'ru' ? 'Удалить' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <span className={`text-[10px] font-bold ${activeFolderId === folder.id ? 'opacity-100' : 'opacity-40'}`}>
                    {folder.count}
                </span>
            </div>
        </div>
    );
}

export function LibrarySidebar({
    activeCategory,
    activeFolderId,
    onCategoryChange,
    onFolderClick,
    folders,
    onAddFolder,
    onRenameFolder,
    onDeleteFolder,
    counts,
}: LibrarySidebarProps) {
    const { language } = useLanguage();

    const categories = [
        {
            id: 'all' as const,
            label: language === 'ru' ? 'Библиотека' : 'Library',
            icon: Folder,
            count: counts.all,
        },
        {
            id: 'favorites' as const,
            label: language === 'ru' ? 'Избранное' : 'Favorites',
            icon: Heart,
            count: counts.favorites,
        },
    ];

    const tools = [
        {
            id: 'image' as const,
            label: language === 'ru' ? 'Изображения' : 'Images',
            icon: ImageIcon,
            count: counts.image,
        },
        {
            id: 'video' as const,
            label: language === 'ru' ? 'Видео' : 'Video',
            icon: Video,
            count: counts.video,
        },
        {
            id: 'audio' as const,
            label: language === 'ru' ? 'Аудио' : 'Audio',
            icon: Music,
            count: counts.audio,
        },
    ];

    const renderCategoryButton = (
        id: CategoryType,
        label: string,
        Icon: any,
        count: number
    ) => (
        <button
            key={id}
            onClick={() => onCategoryChange(id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${
                activeCategory === id && !activeFolderId
                    ? 'bg-white/10 backdrop-blur-xl text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
        >
            <div className="flex items-center gap-3">
                <Icon
                    className={`w-4 h-4 ${
                        activeCategory === id && !activeFolderId ? 'text-white' : 'text-white/20 group-hover:text-white/40'
                    }`}
                />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <span
                className={`text-[10px] font-bold ${
                    activeCategory === id && !activeFolderId ? 'opacity-100' : 'opacity-40'
                }`}
            >
                {count}
            </span>
        </button>
    );

    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 px-3">
                    {language === 'ru' ? 'Обзор' : 'Overview'}
                </h2>
                <div className="space-y-1">
                    {categories.map((cat) =>
                        renderCategoryButton(cat.id, cat.label, cat.icon, cat.count)
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 px-3">
                    {language === 'ru' ? 'Инструменты' : 'Tools'}
                </h2>
                <div className="space-y-1">
                    {tools.map((tool) =>
                        renderCategoryButton(tool.id, tool.label, tool.icon, tool.count)
                    )}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between px-3 mb-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        {language === 'ru' ? 'Моё' : 'Mine'}
                    </h2>
                    <button
                        onClick={onAddFolder}
                        className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="space-y-1">
                    {folders.map((folder) => (
                        <FolderItem
                            key={folder.id}
                            folder={folder}
                            activeFolderId={activeFolderId}
                            onFolderClick={onFolderClick}
                            onRenameFolder={onRenameFolder}
                            onDeleteFolder={onDeleteFolder}
                            language={language}
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
}
