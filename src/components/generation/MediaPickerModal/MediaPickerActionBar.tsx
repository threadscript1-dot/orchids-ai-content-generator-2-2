'use client';

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
