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
