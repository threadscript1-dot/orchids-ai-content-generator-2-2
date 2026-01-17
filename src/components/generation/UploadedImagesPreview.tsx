'use client';

import { X } from 'lucide-react';
import { UploadedImage } from '@/types/generation';

interface UploadedImagesPreviewProps {
    images: UploadedImage[];
    onRemove: (id: string) => void;
    showLabels?: boolean;
    labelType?: 'start-end' | 'numbered';
}

export function UploadedImagesPreview({
    images,
    onRemove,
    showLabels = false,
    labelType = 'numbered',
}: UploadedImagesPreviewProps) {
    if (images.length === 0) return null;

    const getLabel = (index: number) => {
        if (!showLabels) return null;
        if (labelType === 'start-end') {
            return index === 0 ? 'Start' : 'End';
        }
        return `${index + 1}`;
    };

    return (
        <div className="flex gap-3 flex-wrap">
            {images.map((img, index) => (
                <div
                    key={img.id}
                    className="relative w-16 h-16 rounded-xl overflow-hidden group border border-white/10 shadow-lg"
                >
                    <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={() => onRemove(img.id)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                    {showLabels && (
                        <span className="absolute bottom-1 left-1 text-[8px] bg-black/60 px-1 rounded text-white font-black uppercase tracking-widest">
                            {getLabel(index)}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
