'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { Plus, X, Loader2, Zap } from 'lucide-react';
import { Model } from '@/stores/models-store';
import { UploadedImage } from '@/types/generation';
import { useLanguage } from '@/lib/language-context';
import { UploadedImagesPreview } from './UploadedImagesPreview';
import { ModelSelector } from './ModelSelector';
import { AspectRatioSelector } from './AspectRatioSelector';
import { DurationSelector } from './DurationSelector';
import { AspectRatioOption } from '@/types/generation';

interface GenerationBarProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    uploadedImages: UploadedImage[];
    onRemoveImage: (id: string) => void;
    onOpenFilePicker: () => void;
    isDragging: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    models: Model[];
    selectedModelId: string;
    onModelChange: (value: string) => void;
    aspectRatios: AspectRatioOption[];
    aspectRatio: string;
    onAspectRatioChange: (value: string) => void;
    durations?: string[];
    duration?: string;
    onDurationChange?: (value: string) => void;
    creditsCost: number;
    isGenerating: boolean;
    onGenerate: () => void;
    showDuration?: boolean;
    showLabels?: boolean;
    labelType?: 'start-end' | 'numbered';
    addFrameText?: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function GenerationBar({
    prompt,
    onPromptChange,
    uploadedImages,
    onRemoveImage,
    onOpenFilePicker,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    models,
    selectedModelId,
    onModelChange,
    aspectRatios,
    aspectRatio,
    onAspectRatioChange,
    durations,
    duration,
    onDurationChange,
    creditsCost,
    isGenerating,
    onGenerate,
    showDuration = false,
    showLabels = false,
    labelType = 'numbered',
    addFrameText,
    fileInputRef,
    onFileInputChange,
}: GenerationBarProps) {
    const { t, language } = useLanguage();

    // Local state for prompt to avoid re-rendering parent on every keystroke
    const [localPrompt, setLocalPrompt] = useState(prompt);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Sync local prompt with parent (debounced)
    useEffect(() => {
        if (localPrompt !== prompt) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                onPromptChange(localPrompt);
            }, 150);
        }
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [localPrompt, onPromptChange, prompt]);

    // Sync from parent when prompt changes externally (e.g., from remix)
    useEffect(() => {
        if (prompt !== localPrompt) {
            setLocalPrompt(prompt);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prompt]);

    return (
        <div className="fixed bottom-0 md:bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-0 md:px-6 mb-[64px] md:mb-0">
            <div className="w-full max-w-2xl pointer-events-auto">
                <div
                    className={`relative rounded-t-[32px] md:rounded-[32px] p-4 transition-[border-color,box-shadow] ${
                        isDragging
                            ? 'border-[#6F00FF] border-2 border-dashed shadow-[0_0_50px_rgba(111,0,255,0.2)]'
                            : 'shadow-2xl'
                    }`}
                    style={{
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(12px)',
                    }}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {!isDragging && (
                        <div
                            className="absolute inset-0 rounded-t-[32px] md:rounded-[32px] pointer-events-none"
                            style={{
                                padding: '1px',
                                background:
                                    'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 100%)',
                                WebkitMask:
                                    'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude',
                            }}
                        />
                    )}
                    {uploadedImages.length > 0 && (
                        <div className="mb-4">
                            <UploadedImagesPreview
                                images={uploadedImages}
                                onRemove={onRemoveImage}
                                showLabels={showLabels}
                                labelType={labelType}
                            />
                        </div>
                    )}

                    <textarea
                        value={localPrompt}
                        onChange={(e) => setLocalPrompt(e.target.value)}
                        aria-label={
                            language === 'ru' ? 'Промпт для генерации' : 'Generation prompt'
                        }
                        placeholder={`${t('prompt.placeholder')}…`}
                        className="w-full bg-transparent resize-none text-white placeholder:text-white/20 min-h-[44px] font-medium text-sm mb-4 leading-relaxed focus-visible:outline-none"
                        rows={1}
                    />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={onOpenFilePicker}
                                aria-label="Attach image"
                                className="flex items-center justify-center text-white/40 hover:text-white transition-colors h-10 px-3 rounded-2xl bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50"
                            >
                                <Plus className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <ModelSelector
                                models={models}
                                value={selectedModelId}
                                onChange={onModelChange}
                            />
                            <AspectRatioSelector
                                options={aspectRatios}
                                value={aspectRatio}
                                onChange={onAspectRatioChange}
                            />
                            {showDuration && durations && duration && onDurationChange && (
                                <DurationSelector
                                    options={durations}
                                    value={duration}
                                    onChange={onDurationChange}
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="text-sm text-muted-foreground hidden sm:block">
                                <span className="text-[#FFDC74] font-mono flex items-center gap-2 font-black">
                                    <Zap className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                                    {creditsCost}
                                </span>
                            </div>
                            <button
                                onClick={onGenerate}
                                disabled={!localPrompt.trim() || isGenerating}
                                className="px-6 py-2.5 rounded-2xl bg-[#6F00FF] text-white font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_30px_rgba(111,0,255,0.3)] focus-visible:ring-2 focus-visible:ring-white/50"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    t('prompt.create')
                                )}
                            </button>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onFileInputChange}
                    />
                </div>
            </div>
        </div>
    );
}
