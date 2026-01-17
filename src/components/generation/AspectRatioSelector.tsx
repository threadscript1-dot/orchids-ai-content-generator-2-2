'use client';

import { AspectRatioIcon } from './AspectRatioIcon';
import { AspectRatioOption } from '@/types/generation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface AspectRatioSelectorProps {
    options: AspectRatioOption[];
    value: string;
    onChange: (value: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AspectRatioSelector({
    options,
    value,
    onChange,
    open,
    onOpenChange,
}: AspectRatioSelectorProps) {
    return (
        <Select value={value} onValueChange={onChange} open={open} onOpenChange={onOpenChange}>
            <SelectTrigger className="w-fit min-w-[70px] h-9 bg-white/5 border-none rounded-2xl px-4 text-xs font-medium gap-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <AspectRatioIcon ratio={value} className="text-white" />
                    <span className="text-white">{value}</span>
                </div>
                <VisuallyHidden>
                    <SelectValue />
                </VisuallyHidden>
            </SelectTrigger>
            <SelectContent
                className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-md p-2"
                align="start"
            >
                {options.map((ar) => (
                    <SelectItem
                        key={ar.id}
                        value={ar.id}
                        className="rounded-sm py-2.5 font-medium"
                    >
                        <div className="flex items-center gap-3">
                            <AspectRatioIcon ratio={ar.id} className="text-white/40" />
                            {ar.name}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
