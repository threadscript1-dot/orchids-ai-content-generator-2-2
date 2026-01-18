'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useLanguage } from '@/lib/language-context';
import { useModelsStore } from '@/stores/models-store';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { useUnifiedGeneration } from '@/hooks/useUnifiedGeneration';

import { PageHeader, BackgroundEllipses } from '@/components/shared';
import {
    GridSizeSlider,
    GenerationBar,
    GeneratingPlaceholder,
    VideoCard,
} from '@/components/generation';
import { VideoDetailDialog } from '@/components/dialogs/VideoDetailDialog';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_VIDEO_MODEL = 'kling-2.6';

interface VideoGenerationPageProps {
    initialModelId?: string;
}

export function VideoGenerationPage({ initialModelId }: VideoGenerationPageProps) {
    const { t, language } = useLanguage();
    const router = useRouter();

    // Stores
    const { fetchModels } = useModelsStore();
    const { generations, fetchHistory, toggleFavorite } = useGenerationStore();

    // Unified generation hook
    const generation = useUnifiedGeneration({
        type: 'video',
        maxFiles: 2,
        language: language as 'ru' | 'en',
    });

    // Local UI state
    const [gridSize, setGridSize] = useState([250]);
    const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
    const [selectedVideo, setSelectedVideo] = useState<Generation | null>(null);

    // Fetch models and history on mount
    useEffect(() => {
        fetchModels();
        fetchHistory(true);
    }, [fetchModels, fetchHistory]);

    // Set model from URL path
    useEffect(() => {
        if (generation.models.length > 0) {
            const modelId = initialModelId || DEFAULT_VIDEO_MODEL;
            const foundModel = generation.models.find(
                (m) => m.id === modelId || m.name === modelId,
            );
            if (foundModel && generation.selectedModelId !== foundModel.id) {
                generation.setSelectedModelId(foundModel.id);
            } else if (!foundModel && generation.models.length > 0 && !generation.selectedModelId) {
                // Fallback to first model if specified model not found
                generation.setSelectedModelId(generation.models[0].id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generation.models.length, initialModelId]);

    // Navigate to model URL when model changes via dropdown
    // State is preserved in pending-generation-store across navigation
    const handleModelChange = useCallback(
        (modelId: string) => {
            // Sync state to store immediately before navigation to prevent data loss
            generation.syncToStore();
            generation.setSelectedModelId(modelId);
            router.push(`/app/create/video/${modelId}`);
        },
        [generation, router],
    );

    // Build aspect ratio options for the bar
    const aspectRatioOptions = useMemo(
        () =>
            generation.availableAspectRatios.map((ar) => ({
                id: ar,
                name: ar,
            })),
        [generation.availableAspectRatios],
    );

    // Filter generations to only show videos
    const videoGenerations = useMemo(
        () => generations.filter((g) => g.type === 'video'),
        [generations],
    );

    // Handlers
    const handleRemix = (gen: Generation) => {
        generation.setPrompt(gen.prompt);
        const foundModel = generation.models.find(
            (m) => m.id === gen.model || m.name === gen.model,
        );
        if (foundModel) generation.setSelectedModelId(foundModel.id);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleGenerate = async () => {
        await generation.generate();
    };

    return (
        <div className="max-w-full mx-auto pb-40 relative px-0 sm:px-4">
            <BackgroundEllipses />

            <div
                className={`sticky top-0 z-10 w-full px-2 sm:px-6 py-4 flex items-center justify-between gap-4 transition-all duration-300 ${
                    selectedVideo
                        ? 'opacity-0 pointer-events-none -translate-y-4'
                        : 'opacity-100 pointer-events-auto translate-y-0'
                }`}
            >
                <div className="flex items-center gap-2 sm:gap-6">
                    <Link
                        href="/app"
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors bg-white/5 border border-white/10"
                    >
                        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                    </Link>
                    <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight">
                        {language === 'ru' ? 'ВИДЕО' : 'VIDEO'}
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    <GridSizeSlider
                        value={gridSize}
                        onChange={setGridSize}
                        min={200}
                        max={800}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />
                </div>
            </div>

            <div className="px-2 sm:px-6 mt-4 sm:mt-8">
                <div
                    className={`grid gap-2 ${
                        viewMode === 'grid'
                            ? 'grid-cols-2 sm:grid-cols-none'
                            : 'grid-cols-1 sm:grid-cols-none'
                    }`}
                    style={{
                        gridTemplateColumns:
                            typeof window !== 'undefined' && window.innerWidth > 640
                                ? `repeat(auto-fill, minmax(${gridSize[0]}px, 1fr))`
                                : undefined,
                    }}
                >
                    {generation.isGenerating && <GeneratingPlaceholder aspectRatio="video" />}
                    {videoGenerations.map((gen) => (
                        <VideoCard
                            key={gen.id}
                            generation={gen}
                            onClick={() => setSelectedVideo(gen)}
                            onRemix={() => handleRemix(gen)}
                            onToggleLike={() => toggleFavorite(gen.id)}
                        />
                    ))}
                </div>
            </div>

            <GenerationBar
                prompt={generation.formState.prompt}
                onPromptChange={generation.setPrompt}
                uploadedImages={generation.uploadedFiles}
                onRemoveImage={generation.removeFile}
                onOpenFilePicker={generation.openFilePicker}
                isDragging={generation.isDragging}
                onDragOver={generation.handleDragOver}
                onDragLeave={generation.handleDragLeave}
                onDrop={generation.handleDrop}
                models={generation.models}
                selectedModelId={generation.selectedModelId}
                onModelChange={handleModelChange}
                aspectRatios={aspectRatioOptions}
                aspectRatio={generation.formState.aspectRatio}
                onAspectRatioChange={generation.setAspectRatio}
                showDuration
                durations={generation.availableDurations}
                duration={generation.formState.duration}
                onDurationChange={generation.setDuration}
                creditsCost={generation.estimatedPrice}
                isGenerating={generation.isGenerating}
                onGenerate={handleGenerate}
                showLabels
                labelType="start-end"
                addFrameText={language === 'ru' ? 'Добавьте кадр' : 'Add frame'}
                fileInputRef={generation.fileInputRef}
                onFileInputChange={generation.handleFileInputChange}
            />

            <VideoDetailDialog
                video={selectedVideo}
                open={!!selectedVideo}
                onOpenChange={(open) => !open && setSelectedVideo(null)}
                models={generation.models}
                aspectRatio={generation.formState.aspectRatio}
                duration={generation.formState.duration}
                onRemix={handleRemix}
                onToggleLike={toggleFavorite}
                videos={videoGenerations}
                onSelectVideo={setSelectedVideo}
            />
        </div>
    );
}
