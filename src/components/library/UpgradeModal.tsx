'use client';

import { Zap } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/lib/language-context';

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
}

export function UpgradeModal({ open, onOpenChange, title, description }: UpgradeModalProps) {
    const { language } = useLanguage();

    const defaultTitle = language === 'ru' ? 'Лимит папок исчерпан' : 'Folder limit reached';
    const defaultDescription =
        language === 'ru'
            ? 'На бесплатном плане можно создавать до 3 папок. Перейдите на Pro, чтобы создавать неограниченное количество папок и лучше организовывать свои проекты.'
            : 'You can create up to 3 folders on the free plan. Upgrade to Pro for unlimited folders and better organization.';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0A0A0A] border-white/10 text-white rounded-[32px] p-8 max-w-md">
                <DialogHeader className="items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#6F00FF]/20 flex items-center justify-center mb-6">
                        <Zap className="w-8 h-8 text-[#6F00FF] fill-current" />
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-2">
                        {title || defaultTitle}
                    </DialogTitle>
                    <DialogDescription className="text-white/60 text-base leading-relaxed">
                        {description || defaultDescription}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-8 flex-col sm:flex-col gap-3">
                    <button
                        className="w-full py-4 rounded-2xl bg-[#6F00FF] text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(111,0,255,0.3)]"
                        onClick={() => onOpenChange(false)}
                    >
                        {language === 'ru' ? 'Улучшить план' : 'Upgrade Plan'}
                    </button>
                    <button
                        className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors"
                        onClick={() => onOpenChange(false)}
                    >
                        {language === 'ru' ? 'Позже' : 'Maybe later'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
