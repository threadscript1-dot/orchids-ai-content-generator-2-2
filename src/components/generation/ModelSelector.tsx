'use client';

import { Cpu } from 'lucide-react';
import { Model } from '@/stores/models-store';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ModelSelectorProps {
    models: Model[];
    value: string;
    onChange: (value: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ModelSelector({
    models,
    value,
    onChange,
    open,
    onOpenChange,
}: ModelSelectorProps) {
    const selectedModel = models.find((m) => m.id === value);

    return (
        <Select value={value} onValueChange={onChange} open={open} onOpenChange={onOpenChange}>
            <SelectTrigger className="w-fit min-w-[100px] h-9 bg-white/5 border-none rounded-2xl px-4 text-xs font-medium gap-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-white" />
                    <span className="text-white">{selectedModel?.name || 'Select model'}</span>
                </div>
                <VisuallyHidden>
                    <SelectValue />
                </VisuallyHidden>
            </SelectTrigger>
            <SelectContent
                className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-md p-2"
                align="start"
            >
                {models.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="rounded-sm py-2.5">
                        <div className="flex items-center justify-between w-[220px] sm:w-[280px]">
                            <span className="font-medium truncate pr-2">{m.name}</span>
                            <span className="text-credits font-mono text-[10px] font-black shrink-0">
                                {m.credits_cost}
                            </span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
