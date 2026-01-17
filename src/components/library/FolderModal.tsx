'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/language-context';

interface FolderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'rename';
    initialName?: string;
    onConfirm: (name: string) => void;
}

export function FolderModal({
    open,
    onOpenChange,
    mode,
    initialName = '',
    onConfirm,
}: FolderModalProps) {
    const { language } = useLanguage();
    const [name, setName] = useState(initialName);

    useEffect(() => {
        if (open) {
            setName(initialName);
        }
    }, [open, initialName]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (name.trim()) {
            onConfirm(name.trim());
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {mode === 'create'
                            ? language === 'ru' ? 'Новая папка' : 'New Folder'
                            : language === 'ru' ? 'Переименовать папку' : 'Rename Folder'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={language === 'ru' ? 'Название папки' : 'Folder name'}
                        autoFocus
                        className="bg-white/5 border-white/10 h-12 text-lg focus-visible:border-white/30 focus-visible:ring-white/10"
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                            {language === 'ru' ? 'Отмена' : 'Cancel'}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim()}
                            className="bg-[#6F00FF] hover:bg-[#5D00D6] text-white px-8"
                        >
                            {mode === 'create'
                                ? language === 'ru' ? 'Создать' : 'Create'
                                : language === 'ru' ? 'Сохранить' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
