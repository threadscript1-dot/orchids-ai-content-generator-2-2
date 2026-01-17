'use client';

import { motion } from 'framer-motion';
import { Folder, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/language-context';

interface FolderCardProps {
    id: string;
    name: string;
    count: number;
    onClick: () => void;
    onRename: () => void;
    onDelete: () => void;
}

export function FolderCard({ id, name, count, onClick, onRename, onDelete }: FolderCardProps) {
    const { language } = useLanguage();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative aspect-square rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10"
            onClick={onClick}
        >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#6F00FF]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Folder className="w-8 h-8 text-[#6F00FF]" />
                </div>
                <h3 className="text-lg font-bold text-white/90 line-clamp-1 w-full px-2">
                    {name || (language === 'ru' ? 'Новая папка' : 'Untitled Folder')}
                </h3>
                <span className="text-xs font-medium text-white/40 uppercase tracking-widest mt-1">
                    {count} {language === 'ru' ? 'объектов' : 'items'}
                </span>
            </div>

            <div className="absolute top-4 right-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/5 opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-[#0A0A0A] border-white/10">
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onRename();
                        }}>
                            <Pencil className="w-4 h-4 mr-2" />
                            {language === 'ru' ? 'Переименовать' : 'Rename'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="text-red-500 focus:text-red-500"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {language === 'ru' ? 'Удалить' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
}
