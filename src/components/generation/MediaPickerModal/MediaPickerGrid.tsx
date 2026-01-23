import { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { MediaPickerItem, MediaItem } from './MediaPickerItem';

interface MediaPickerGridProps {
    items: MediaItem[];
    selectedItems: Map<string, MediaItem>;
    onToggle: (item: MediaItem) => void;
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    emptyMessage: string;
}

export function MediaPickerGrid({
    items,
    selectedItems,
    onToggle,
    isLoading,
    hasMore,
    onLoadMore,
    emptyMessage,
}: MediaPickerGridProps) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                onLoadMore();
            }
        },
        [hasMore, isLoading, onLoadMore]
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

    if (!isLoading && items.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-white/40">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3">
                {items.map((item) => (
                    <MediaPickerItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.has(item.id)}
                        onToggle={onToggle}
                    />
                ))}
            </div>

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="h-4" />

            {isLoading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                </div>
            )}
        </div>
    );
}
