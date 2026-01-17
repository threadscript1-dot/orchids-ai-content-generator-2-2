'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { useLanguage } from '@/lib/language-context';
import { useModelsStore } from '@/stores/models-store';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { useFileUpload } from '@/hooks/useFileUpload';

import { BackgroundEllipses } from '@/components/shared';
import {
    GridSizeSlider,
    ImageGenerationBar,
    GeneratingPlaceholder,
    ImageCard,
} from '@/components/generation';
import { ImageDetailDialog } from '@/components/dialogs/ImageDetailDialog';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function ImageGenerationPage() {
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();

    // Stores
    const { imageModels, fetchModels } = useModelsStore();
    const { generations, generateImageGeneric, uploadImage, fetchHistory, toggleFavorite } =
        useGenerationStore();

    // Local state
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [resolution, setResolution] = useState('1K');
    const [isGenerating, setIsGenerating] = useState(false);
    const [gridSize, setGridSize] = useState([250]);
    const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
    const [selectedImage, setSelectedImage] = useState<Generation | null>(null);

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
    } = useFileUpload({ maxFiles: 4 });

    // Fetch models and history on mount
    useEffect(() => {
        fetchModels();
        fetchHistory(true);
    }, [fetchModels, fetchHistory]);

    // Set default model when models are loaded
    useEffect(() => {
        if (imageModels.length > 0 && !model) {
            setModel(imageModels[0].id);
        }
    }, [imageModels, model]);

    // Handle URL params
    useEffect(() => {
        const promptParam = searchParams.get('prompt');
        const modelParam = searchParams.get('model');
        const actionParam = searchParams.get('action');

        if (imageModels.length > 0) {
            let currentPrompt = prompt;
            let currentModel = model;

            if (promptParam) {
                currentPrompt = decodeURIComponent(promptParam);
                setPrompt(currentPrompt);
            }
            if (modelParam) {
                const foundModel = imageModels.find(
                    (m) => m.id === modelParam || m.name === modelParam
                );
                if (foundModel) {
                    currentModel = foundModel.id;
                    setModel(currentModel);
                }
            }

            if (actionParam === 'generate' && currentPrompt && currentModel && !isGenerating) {
                // Small delay to ensure state is updated
                setTimeout(() => {
                    handleGenerate();
                    // Clear the action param from URL to avoid re-triggering on refresh
                    const newUrl =
                        window.location.pathname +
                        (currentPrompt ? `?prompt=${encodeURIComponent(currentPrompt)}` : '');
                    window.history.replaceState({}, '', newUrl);
                }, 500);
            }
        }
    }, [searchParams, imageModels]);

    // Get current model and its constraints
    const selectedModel = useMemo(
        () => imageModels.find((m) => m.id === model),
        [imageModels, model]
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
            { id: '4:3', name: '4:3' },
            { id: '3:2', name: '3:2' },
        ];
    }, [selectedModel]);

    // Dynamic resolutions from model constraints
    const availableResolutions = useMemo(() => {
        if (selectedModel?.constraints?.resolutions) {
            return selectedModel.constraints.resolutions.map((res) => ({
                id: res,
                name: res,
            }));
        }
        return [
            { id: '1K', name: '1K' },
            { id: '2K', name: '2K' },
        ];
    }, [selectedModel]);

    // Filter generations to only show images
    const imageGenerations = useMemo(
        () => generations.filter((g) => g.type === 'image'),
        [generations]
    );

    const handleRemix = (gen: Generation) => {
        setPrompt(gen.prompt);
        const foundModel = imageModels.find((m) => m.id === gen.model || m.name === gen.model);
        if (foundModel) setModel(foundModel.id);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleMakeVariations = async (gen: Generation) => {
        setPrompt(gen.prompt);
        const foundModel = imageModels.find((m) => m.id === gen.model || m.name === gen.model);
        if (foundModel) setModel(foundModel.id);

        setIsGenerating(true);
        try {
            const generationId = await generateImageGeneric(foundModel?.id || gen.model, {
                prompt: gen.prompt,
                aspect_ratio: (gen as any).aspect_ratio || aspectRatio,
                resolution: resolution,
            });

            if (generationId) {
                toast.success(language === 'ru' ? 'Генерация запущена' : 'Generation started');
            } else {
                toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
            }
        } catch (error) {
            console.error('Variation error:', error);
            toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || !selectedModel) return;

        setIsGenerating(true);

        try {
            // Upload images if present (for image-to-image)
            const uploadedUrls: string[] = [];
            if (uploadedImages.length > 0) {
                for (const img of uploadedImages) {
                    if (img.file) {
                        const url = await uploadImage(img.file);
                        if (url) uploadedUrls.push(url);
                    }
                }
            }

            const generationId = await generateImageGeneric(selectedModel.id, {
                prompt,
                aspect_ratio: aspectRatio,
                input_urls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
                resolution,
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
                    selectedImage
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
                        {language === 'ru' ? 'ИЗОБРАЖЕНИЕ' : 'IMAGE'}
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
                    {isGenerating && <GeneratingPlaceholder aspectRatio="square" />}
                    {imageGenerations.map((gen) => (
                        <ImageCard
                            key={gen.id}
                            generation={gen}
                            onClick={() => setSelectedImage(gen)}
                            onRemix={() => handleRemix(gen)}
                            onToggleLike={() => toggleFavorite(gen.id)}
                        />
                    ))}
                </div>
            </div>

            <ImageGenerationBar
                prompt={prompt}
                onPromptChange={setPrompt}
                uploadedImages={uploadedImages}
                onRemoveImage={removeImage}
                onOpenFilePicker={openFilePicker}
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                models={imageModels}
                selectedModelId={model}
                onModelChange={setModel}
                aspectRatios={availableAspectRatios}
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                resolutions={availableResolutions}
                resolution={resolution}
                onResolutionChange={setResolution}
                creditsCost={selectedModel?.credits_cost || 10}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                fileInputRef={fileInputRef}
                onFileInputChange={handleInputChange}
            />

            <ImageDetailDialog
                image={selectedImage}
                open={!!selectedImage}
                onOpenChange={(open) => !open && setSelectedImage(null)}
                resolution={resolution}
                onRemix={handleRemix}
                onMakeVariations={handleMakeVariations}
                onToggleLike={toggleFavorite}
                generations={imageGenerations}
                onSelectImage={setSelectedImage}
            />
        </div>
    );
}
