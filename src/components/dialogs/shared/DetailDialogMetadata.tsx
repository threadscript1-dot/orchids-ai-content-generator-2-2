'use client';

interface MetadataItem {
    label: string;
    value: string;
}

interface DetailDialogMetadataProps {
    items: MetadataItem[];
}

export function DetailDialogMetadata({ items }: DetailDialogMetadataProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {items.map((item, index) => (
                <div key={index} className="space-y-1">
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">
                        {item.label}
                    </span>
                    <p className="text-sm text-white/70 font-bold truncate">{item.value}</p>
                </div>
            ))}
        </div>
    );
}
