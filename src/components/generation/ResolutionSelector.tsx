'use client';

import { DiamondIcon } from '@/components/ui/diamond-icon';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ResolutionOption {
    id: string;
    name: string;
}

interface ResolutionSelectorProps {
    options: ResolutionOption[];
    value: string;
    onChange: (value: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ResolutionSelector({
    options,
    value,
    onChange,
    open,
    onOpenChange,
}: ResolutionSelectorProps) {
    return (
        <Select value={value} onValueChange={onChange} open={open} onOpenChange={onOpenChange}>
            <SelectTrigger className="w-fit min-w-[70px] h-10 bg-white/5 border-none rounded-2xl px-4 text-xs font-medium gap-3 hover:bg-white/10 transition-colors uppercase tracking-widest">
                <div className="flex items-center gap-3">
                    <DiamondIcon className="w-4 h-4 text-white" />
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
                {options.map((r) => (
                    <SelectItem
                        key={r.id}
                        value={r.id}
                        className="rounded-sm py-2.5 font-medium uppercase tracking-widest"
                    >
                        <div className="flex items-center gap-3">
                            <DiamondIcon className="w-3.5 h-3.5 text-white/40" />
                            {r.name}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
