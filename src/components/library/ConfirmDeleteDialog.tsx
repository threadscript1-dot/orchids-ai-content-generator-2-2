'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
}: ConfirmDeleteDialogProps) {
    const { language } = useLanguage();

    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[360px] bg-[#0A0A0A] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        {title || (language === 'ru' ? 'Удалить?' : 'Delete?')}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-white/60">
                        {description ||
                            (language === 'ru'
                                ? 'Это действие нельзя отменить'
                                : 'This action cannot be undone')}
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                        {language === 'ru' ? 'Отмена' : 'Cancel'}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        className="bg-red-500 hover:bg-red-600 text-white px-6"
                    >
                        {language === 'ru' ? 'Удалить' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
