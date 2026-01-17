'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { useLanguage } from '@/lib/language-context';
import { useModelsStore } from '@/stores/models-store';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { useFileUpload } from '@/hooks/useFileUpload';

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

export function VideoGenerationPage() {
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();

    // Stores
    const { videoModels, fetchModels } = useModelsStore();
    const {
        generations,
        generateVideoGeneric,
        uploadImage,
        fetchHistory,
        toggleFavorite,
    } = useGenerationStore();

    // Local state
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [duration, setDuration] = useState('5');
    const [isGenerating, setIsGenerating] = useState(false);
    const [gridSize, setGridSize] = useState([250]);
    const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
    const [selectedVideo, setSelectedVideo] = useState<Generation | null>(null);

    // File upload hook
    const {
        uploadedImages,
        isDragging,
        fileInputRef,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        removeImage,
        clearImages,
        openFilePicker,
        handleInputChange,
        addImageFromUrl,
    } = useFileUpload({ maxFiles: 2 });

    // Fetch models and history on mount
    useEffect(() => {
        fetchModels();
        fetchHistory(true);
    }, [fetchModels, fetchHistory]);

    // Set default model when models are loaded
    useEffect(() => {
        if (videoModels.length > 0 && !model) {
            setModel(videoModels[0].id);
        }
    }, [videoModels, model]);

    // Handle URL params
    useEffect(() => {
        const promptParam = searchParams.get('prompt');
        const imageParam = searchParams.get('image');
        if (promptParam && videoModels.length > 0) {
            setPrompt(decodeURIComponent(promptParam));
        }
        if (imageParam) {
            addImageFromUrl(decodeURIComponent(imageParam), 'Reference Image');
        }
    }, [searchParams, videoModels, addImageFromUrl]);

    // Get current model and its constraints
    const selectedModel = useMemo(
        () => videoModels.find((m) => m.id === model),
        [videoModels, model]
    );

    // Dynamic aspect ratios from model constraints
    const availableAspectRatios = useMemo(() => {
        if (selectedModel?.constraints?.aspectRatios) {
            return selectedModel.constraints.aspectRatios.map((ar) => ({
                id: ar,
                name: ar,
            }));
        }
        return [
            { id: '1:1', name: '1:1' },
            { id: '16:9', name: '16:9' },
            { id: '9:16', name: '9:16' },
        ];
    }, [selectedModel]);

    // Dynamic durations from model constraints
    const availableDurations = useMemo(() => {
        if (selectedModel?.constraints?.durations) {
            return selectedModel.constraints.durations;
        }
        return ['5', '10'];
    }, [selectedModel]);

    // Filter generations to only show videos
    const videoGenerations = useMemo(
        () => generations.filter((g) => g.type === 'video'),
        [generations]
    );

    const handleRemix = (gen: Generation) => {
        setPrompt(gen.prompt);
        const foundModel = videoModels.find((m) => m.id === gen.model || m.name === gen.model);
        if (foundModel) setModel(foundModel.id);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || !selectedModel) return;

        setIsGenerating(true);

        try {
            // Upload images if present (for image-to-video)
            const uploadedUrls: string[] = [];
            if (uploadedImages.length > 0) {
                for (const img of uploadedImages) {
                    if (img.file) {
                        const url = await uploadImage(img.file);
                        if (url) uploadedUrls.push(url);
                    } else if (img.url && !img.url.startsWith('blob:')) {
                        uploadedUrls.push(img.url);
                    }
                }
            }

            const generationId = await generateVideoGeneric(selectedModel.id, {
                prompt,
                aspect_ratio: aspectRatio,
                duration: parseInt(duration),
                image_urls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
            });

            if (generationId) {
                toast.success(language === 'ru' ? 'Генерация запущена' : 'Generation started');
                setPrompt('');
                clearImages();
            } else {
                toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
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
                        <ArrowLeft className="w-5 h-5" />
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
                    {isGenerating && <GeneratingPlaceholder aspectRatio="video" />}
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
                prompt={prompt}
                onPromptChange={setPrompt}
                uploadedImages={uploadedImages}
                onRemoveImage={removeImage}
                onOpenFilePicker={openFilePicker}
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                models={videoModels}
                selectedModelId={model}
                onModelChange={setModel}
                aspectRatios={availableAspectRatios}
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                showDuration
                durations={availableDurations}
                duration={duration}
                onDurationChange={setDuration}
                creditsCost={selectedModel?.credits_cost || 25}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                showLabels
                labelType="start-end"
                addFrameText={language === 'ru' ? 'Добавьте кадр' : 'Add frame'}
                fileInputRef={fileInputRef}
                onFileInputChange={handleInputChange}
            />

            <VideoDetailDialog
                video={selectedVideo}
                open={!!selectedVideo}
                onOpenChange={(open) => !open && setSelectedVideo(null)}
                models={videoModels}
                aspectRatio={aspectRatio}
                duration={duration}
                onRemix={handleRemix}
                onToggleLike={toggleFavorite}
                videos={videoGenerations}
                onSelectVideo={setSelectedVideo}
            />
        </div>
    );
}
