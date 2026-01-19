'use client';

import { useLanguage } from '@/lib/language-context';
import { useGenerationPage } from '@/hooks/useGenerationPage';
import { BackgroundEllipses } from '@/components/shared';
import {
    GenerationBar,
    GeneratingPlaceholder,
    VideoCard,
    GenerationPageHeader,
} from '@/components/generation';
import { VideoDetailDialog } from '@/components/dialogs/VideoDetailDialog';

const DEFAULT_VIDEO_MODEL = 'kling-2.6';

interface VideoGenerationPageProps {
    initialModelId?: string;
}

export function VideoGenerationPage({ initialModelId }: VideoGenerationPageProps) {
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
        filteredGenerations,
        gridStyle,
        gridClassName,
        handleModelChange,
        handleRemix,
        handleGenerate,
        toggleFavorite,
    } = useGenerationPage({
        type: 'video',
        initialModelId,
        defaultModel: DEFAULT_VIDEO_MODEL,
        maxFiles: 2,
        language: language as 'ru' | 'en',
    });

    return (
        <div className="max-w-full mx-auto pb-40 relative px-0 sm:px-4">
            <BackgroundEllipses />

            <GenerationPageHeader
                title={language === 'ru' ? 'ВИДЕО' : 'VIDEO'}
                gridSize={gridSize}
                onGridSizeChange={setGridSize}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isHidden={!!selectedItem}
            />

            <div className="px-2 sm:px-6 mt-4 sm:mt-8">
                <div className={gridClassName} style={gridStyle}>
                    {generation.isGenerating && <GeneratingPlaceholder aspectRatio="video" />}
                    {filteredGenerations.map((gen) => (
                        <VideoCard
                            key={gen.id}
                            generation={gen}
                            onClick={() => setSelectedItem(gen)}
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
                sound={generation.formState.sound}
                onSoundChange={generation.setSound}
                supportsAudio={generation.supportsAudio}
                creditsCost={generation.estimatedPrice}
                isGenerating={generation.isGenerating}
                onGenerate={handleGenerate}
                showLabels
                labelType="start-end"
                addFrameText={language === 'ru' ? 'Добавьте кадр' : 'Add frame'}
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
                    supportsAudio: generation.supportsAudio,
                }}
            />

            <VideoDetailDialog
                video={selectedItem}
                open={!!selectedItem}
                onOpenChange={(open) => !open && setSelectedItem(null)}
                models={generation.models}
                aspectRatio={generation.formState.aspectRatio}
                duration={generation.formState.duration}
                onRemix={handleRemix}
                onToggleLike={toggleFavorite}
                videos={filteredGenerations}
                onSelectVideo={setSelectedItem}
            />
        </div>
    );
}
