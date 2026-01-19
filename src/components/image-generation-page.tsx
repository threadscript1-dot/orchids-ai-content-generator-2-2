'use client';

import { toast } from 'sonner';
import { useLanguage } from '@/lib/language-context';
import { Generation } from '@/stores/generation-store';
import { useGenerationPage } from '@/hooks/useGenerationPage';
import { BackgroundEllipses } from '@/components/shared';
import {
    ImageGenerationBar,
    GeneratingPlaceholder,
    ImageCard,
    GenerationPageHeader,
} from '@/components/generation';
import { ImageDetailDialog } from '@/components/dialogs/ImageDetailDialog';

const DEFAULT_IMAGE_MODEL = 'nano-banana-pro';

interface ImageGenerationPageProps {
    initialModelId?: string;
}

export function ImageGenerationPage({ initialModelId }: ImageGenerationPageProps) {
    const { language } = useLanguage();

    const {
        generation,
        gridSize,
        setGridSize,
        viewMode,
        setViewMode,
        selectedItem,
        setSelectedItem,
        aspectRatioOptions,
        resolutionOptions,
        filteredGenerations,
        gridStyle,
        gridClassName,
        handleModelChange,
        handleRemix,
        handleGenerate,
        toggleFavorite,
    } = useGenerationPage({
        type: 'image',
        initialModelId,
        defaultModel: DEFAULT_IMAGE_MODEL,
        maxFiles: 4,
        language: language as 'ru' | 'en',
    });

    const handleMakeVariations = async (gen: Generation) => {
        generation.setPrompt(gen.prompt);
        const foundModel = generation.models.find(
            (m) => m.id === gen.model || m.name === gen.model,
        );
        if (foundModel) generation.setSelectedModelId(foundModel.id);

        const generationId = await generation.generate();
        if (!generationId) {
            toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
        }
    };

    return (
        <div className="max-w-full mx-auto pb-40 relative px-0 sm:px-4">
            <BackgroundEllipses />

            <GenerationPageHeader
                title={language === 'ru' ? 'ИЗОБРАЖЕНИЕ' : 'IMAGE'}
                gridSize={gridSize}
                onGridSizeChange={setGridSize}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isHidden={!!selectedItem}
            />

            <div className="px-2 sm:px-6 mt-4 sm:mt-8">
                <div className={gridClassName} style={gridStyle}>
                    {generation.isGenerating && <GeneratingPlaceholder aspectRatio="square" />}
                    {filteredGenerations.map((gen) => (
                        <ImageCard
                            key={gen.id}
                            generation={gen}
                            onClick={() => setSelectedItem(gen)}
                            onRemix={() => handleRemix(gen)}
                            onToggleLike={() => toggleFavorite(gen.id)}
                        />
                    ))}
                </div>
            </div>

            <ImageGenerationBar
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
                resolutions={resolutionOptions}
                resolution={generation.formState.resolution}
                onResolutionChange={generation.setResolution}
                creditsCost={generation.estimatedPrice}
                isGenerating={generation.isGenerating}
                onGenerate={handleGenerate}
                fileInputRef={generation.fileInputRef}
                onFileInputChange={generation.handleFileInputChange}
                advancedOptions={{
                    negativePrompt: generation.formState.negativePrompt,
                    promptEnhancement: generation.formState.promptEnhancement,
                    translation: generation.formState.translation,
                    removeWatermark: generation.formState.removeWatermark,
                    upscale: generation.formState.upscale,
                    safetyTolerance: generation.formState.safetyTolerance,
                    strength: generation.formState.strength,
                    variants: generation.formState.variants,
                    onNegativePromptChange: generation.setNegativePrompt,
                    onPromptEnhancementChange: generation.setPromptEnhancement,
                    onTranslationChange: generation.setTranslation,
                    onRemoveWatermarkChange: generation.setRemoveWatermark,
                    onUpscaleChange: generation.setUpscale,
                    onSafetyToleranceChange: generation.setSafetyTolerance,
                    onStrengthChange: generation.setStrength,
                    onVariantsChange: generation.setVariants,
                    supportsNegativePrompt: generation.supportsNegativePrompt,
                    supportsPromptEnhancement: generation.supportsPromptEnhancement,
                    supportsTranslation: generation.supportsTranslation,
                    supportsWatermark: generation.supportsWatermark,
                    supportsUpscale: generation.supportsUpscale,
                    supportsStrength: generation.supportsStrength,
                    safetyToleranceRange: generation.safetyToleranceRange,
                    maxVariants: generation.maxVariants,
                }}
            />

            <ImageDetailDialog
                image={selectedItem}
                open={!!selectedItem}
                onOpenChange={(open) => !open && setSelectedItem(null)}
                resolution={generation.formState.resolution}
                onRemix={handleRemix}
                onMakeVariations={handleMakeVariations}
                onToggleLike={toggleFavorite}
                generations={filteredGenerations}
                onSelectImage={setSelectedItem}
            />
        </div>
    );
}
