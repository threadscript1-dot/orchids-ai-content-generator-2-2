'use client';

import { Cpu, Image, Video, Wand2, Zap } from 'lucide-react';
import { Model, hasCapability, supportsAttachment } from '@/stores/models-store';
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

function getModelIcon(model: Model) {
    if (model.type === 'video') return Video;
    if (model.type === 'image') return Image;
    return Cpu;
}

function getModelBadges(model: Model): string[] {
    const badges: string[] = [];
    
    // Image capabilities
    if (hasCapability(model, 'text-to-image')) badges.push('T2I');
    if (hasCapability(model, 'image-to-image')) badges.push('I2I');
    
    // Video capabilities
    if (hasCapability(model, 'text-to-video')) badges.push('T2V');
    if (hasCapability(model, 'image-to-video')) badges.push('I2V');
    if (hasCapability(model, 'video-to-video')) badges.push('V2V');
    
    // Edit capabilities
    if (hasCapability(model, 'edit')) badges.push('Edit');
    if (hasCapability(model, 'upscale')) badges.push('Upscale');
    
    return badges;
}

export function ModelSelector({
    models,
    value,
    onChange,
    open,
    onOpenChange,
}: ModelSelectorProps) {
    const selectedModel = models.find((m) => m.id === value);
    const ModelIcon = selectedModel ? getModelIcon(selectedModel) : Cpu;

    return (
        <Select value={value} onValueChange={onChange} open={open} onOpenChange={onOpenChange}>
            <SelectTrigger className="w-fit min-w-[100px] h-9 bg-white/5 border-none rounded-2xl px-4 text-xs font-medium gap-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <ModelIcon className="w-4 h-4 text-white" />
                    <span className="text-white truncate max-w-[120px]">
                        {selectedModel?.name || 'Select model'}
                    </span>
                </div>
                <VisuallyHidden>
                    <SelectValue />
                </VisuallyHidden>
            </SelectTrigger>
            <SelectContent
                className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-md p-2 max-h-[400px]"
                align="start"
            >
                {models.map((m) => {
                    const badges = getModelBadges(m);
                    const Icon = getModelIcon(m);
                    
                    return (
                        <SelectItem 
                            key={m.id} 
                            value={m.id} 
                            className="rounded-sm py-2.5 px-3 cursor-pointer"
                        >
                            <div className="flex flex-col gap-1 w-[240px] sm:w-[300px]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-white/60" />
                                        <span className="font-medium truncate">{m.name}</span>
                                    </div>
                                    <span className="text-credits font-mono text-[10px] font-black shrink-0 flex items-center gap-1">
                                        <Zap className="w-3 h-3 fill-current" />
                                        {m.credits_cost}
                                    </span>
                                </div>
                                {badges.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {badges.map((badge) => (
                                            <span
                                                key={badge}
                                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/60 uppercase"
                                            >
                                                {badge}
                                            </span>
                                        ))}
                                        {supportsAttachment(m, 'image') && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold">
                                                +IMG
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}
