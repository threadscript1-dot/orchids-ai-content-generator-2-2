'use client';

interface Asset {
    url: string;
    mime?: string;
}

interface AssetThumbnailSelectorProps {
    assets: Asset[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    type: 'image' | 'video';
}

export function AssetThumbnailSelector({
    assets,
    selectedIndex,
    onSelect,
    type,
}: AssetThumbnailSelectorProps) {
    if (assets.length <= 1) return null;

    const thumbnailSize = type === 'video' ? 'w-16 h-10' : 'w-12 h-12';

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 overflow-x-auto max-w-[90%] scrollbar-hide">
            {assets.map((asset, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(index)}
                    className={`relative ${thumbnailSize} rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                        selectedIndex === index ? 'border-[#6F00FF]' : 'border-transparent'
                    }`}
                >
                    {type === 'image' ? (
                        <img src={asset.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <video src={asset.url} className="w-full h-full object-cover" muted />
                    )}
                </button>
            ))}
        </div>
    );
}
