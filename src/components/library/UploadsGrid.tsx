import { useEffect, useRef, useCallback } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUploadsStore, Upload as UploadType } from '@/stores/uploads-store';
import { useLanguage } from '@/lib/language-context';

interface UploadsGridProps {
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onClick: (upload: UploadType) => void;
}

export function UploadsGrid({ selectedIds, onToggleSelect, onClick }: UploadsGridProps) {
    const { t } = useLanguage();
    const { uploads, isLoading, hasMore, fetchUploads } = useUploadsStore();
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUploads(undefined, true);
    }, []);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                fetchUploads();
            }
        },
        [hasMore, isLoading, fetchUploads]
    );

    useEffect(() => {
        observerRef.current = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '100px',
            threshold: 0,
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [handleObserver]);

    if (!isLoading && uploads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-white/40">
                <Upload className="w-12 h-12 mb-4 opacity-50" />
                <p>{t('mediaPicker.emptyUploads')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
                {uploads.map((upload) => (
                    <motion.div
                        key={upload.id}
                        layout="position"
                        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                        onClick={() => onClick(upload)}
                    >
                        {upload.type === 'video' ? (
                            <video
                                src={upload.url}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={upload.url}
                                alt={upload.original_name || 'Upload'}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        )}

                        {/* Selection checkbox */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelect(upload.id);
                            }}
                            className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center z-10 ${
                                selectedIds.has(upload.id)
                                    ? 'bg-white border-white'
                                    : 'bg-black/20 border-white/20 opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            {selectedIds.has(upload.id) && (
                                <svg
                                    className="w-3.5 h-3.5 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                ))}
            </div>

            <div ref={loadMoreRef} className="h-4" />

            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                </div>
            )}
        </div>
    );
}
