'use client';

import { Clock } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface DurationOption {
    id: string;
    name: string;
}

interface DurationSelectorProps {
    options: string[] | DurationOption[];
    value: string;
    onChange: (value: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DurationSelector({
    options,
    value,
    onChange,
    open,
    onOpenChange,
}: DurationSelectorProps) {
    return (
        <Select value={value} onValueChange={onChange} open={open} onOpenChange={onOpenChange}>
            <SelectTrigger className="w-fit min-w-[70px] h-9 bg-white/5 border-none rounded-2xl px-4 text-xs font-medium gap-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-white" />
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
                {options.map((dur) => (
                    <SelectItem
                        key={typeof dur === 'string' ? dur : dur.id}
                        value={typeof dur === 'string' ? dur : dur.id}
                        className="rounded-sm py-2.5 font-medium uppercase tracking-widest"
                    >
                        <div className="flex items-center gap-3">
                            <Clock className="w-3.5 h-3.5 text-white/40" />
                            {typeof dur === 'string' ? dur : dur.name}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
