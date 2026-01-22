'use client';

import { useCallback } from 'react';
import { usePendingGenerationStore } from '@/stores/pending-generation-store';
import {
    useModelSelection,
    useGenerationForm,
    useGenerationFiles,
    useGenerationSubmit,
    type GenerationType,
    type GenerationFormState,
    type GenerationParams,
} from './generation';
import type { Model, AttachmentConfig } from '@/stores/models-store';
import type { UploadedImage } from '@/types/generation';

// Re-export types for backward compatibility
export type { GenerationParams, GenerationFormState };

export interface UseUnifiedGenerationOptions {
    type: GenerationType;
    maxFiles?: number;
    language?: 'ru' | 'en';
}

export interface UseUnifiedGenerationReturn {
    // Model selection
    models: Model[];
    selectedModel: Model | undefined;
    selectedModelId: string;
    setSelectedModelId: (id: string) => void;

    // Form state
    formState: GenerationFormState;
    setFormState: React.Dispatch<React.SetStateAction<GenerationFormState>>;
    setPrompt: (prompt: string) => void;
    setAspectRatio: (ratio: string) => void;
    setResolution: (resolution: string) => void;
    setDuration: (duration: string) => void;
    setQuality: (quality: string) => void;
    setSound: (sound: boolean) => void;
    // Advanced options setters
    setNegativePrompt: (value: string) => void;
    setPromptEnhancement: (value: boolean) => void;
    setTranslation: (value: boolean) => void;
    setRemoveWatermark: (value: boolean) => void;
    setUpscale: (value: boolean) => void;
    setSafetyTolerance: (value: number) => void;
    setStrength: (value: number) => void;
    setVariants: (value: number) => void;

    // Constraints from model
    availableAspectRatios: string[];
    availableResolutions: string[];
    availableDurations: string[];

    // Advanced constraints (for UI rendering)
    supportsNegativePrompt: boolean;
    supportsPromptEnhancement: boolean;
    supportsTranslation: boolean;
    supportsWatermark: boolean;
    supportsUpscale: boolean;
    supportsStrength: boolean;
    safetyToleranceRange: [number, number] | null;
    maxVariants: number | null;
    supportsAudio: boolean;

    // Attachments
    uploadedFiles: UploadedImage[];
    attachmentConfig: AttachmentConfig | undefined;
    requiresUpload: boolean;
    supportsUpload: boolean;
    maxFiles: number;
    acceptedMimeTypes: string[];
    isDragging: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleDrop: (e: React.DragEvent) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: () => void;
    removeFile: (id: string) => void;
    clearFiles: () => void;
    openFilePicker: () => void;
    handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    addFileFromUrl: (url: string, name?: string) => void;

    // Pricing
    creditsCost: number;
    estimatedPrice: number;

    // Generation
    isGenerating: boolean;
    canGenerate: boolean;
    validationError: string | null;
    generate: () => Promise<string | null>;

    // State persistence
    syncToStore: () => void;
}

/**
 * Unified generation hook that combines model selection, form state,
 * file handling, and generation submission.
 *
 * This is a composition of smaller, focused hooks:
 * - useModelSelection: Model selection and constraints
 * - useGenerationForm: Form state management
 * - useGenerationFiles: File upload handling
 * - useGenerationSubmit: Validation and generation
 */
export function useUnifiedGeneration(
    options: UseUnifiedGenerationOptions,
): UseUnifiedGenerationReturn {
    const { type, maxFiles = 4, language = 'en' } = options;

    const pendingStore = usePendingGenerationStore();

    // Model selection and constraints
    const { models, selectedModel, selectedModelId, setSelectedModelId, constraints, attachmentState } =
        useModelSelection({ type, maxFiles });

    // Form state
    const {
        formState,
        setFormState,
        setPrompt,
        setAspectRatio,
        setResolution,
        setDuration,
        setQuality,
        setSound,
        setNegativePrompt,
        setPromptEnhancement,
        setTranslation,
        setRemoveWatermark,
        setUpscale,
        setSafetyTolerance,
        setStrength,
        setVariants,
        syncToStore: syncFormToStore,
        resetForm,
    } = useGenerationForm({ type, constraints });

    // File handling
    const {
        uploadedFiles,
        isDragging,
        fileInputRef,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        removeFile,
        clearFiles,
        openFilePicker,
        handleFileInputChange,
        addFileFromUrl,
        syncFilesToStore,
    } = useGenerationFiles({ type, attachmentState });

    // Generation submission
    const { isGenerating, canGenerate, validationError, creditsCost, estimatedPrice, generate } =
        useGenerationSubmit({
            type,
            selectedModel,
            formState,
            constraints,
            attachmentState,
            uploadedFiles,
            clearFiles,
            resetForm,
            language,
        });

    // Combined sync function
    const syncToStore = useCallback(() => {
        syncFormToStore();
        syncFilesToStore();
    }, [syncFormToStore, syncFilesToStore]);

    return {
        // Model selection
        models,
        selectedModel,
        selectedModelId,
        setSelectedModelId,

        // Form state
        formState,
        setFormState,
        setPrompt,
        setAspectRatio,
        setResolution,
        setDuration,
        setQuality,
        setSound,
        setNegativePrompt,
        setPromptEnhancement,
        setTranslation,
        setRemoveWatermark,
        setUpscale,
        setSafetyTolerance,
        setStrength,
        setVariants,

        // Constraints
        availableAspectRatios: constraints.availableAspectRatios,
        availableResolutions: constraints.availableResolutions,
        availableDurations: constraints.availableDurations,

        // Advanced constraints
        supportsNegativePrompt: constraints.supportsNegativePrompt,
        supportsPromptEnhancement: constraints.supportsPromptEnhancement,
        supportsTranslation: constraints.supportsTranslation,
        supportsWatermark: constraints.supportsWatermark,
        supportsUpscale: constraints.supportsUpscale,
        supportsStrength: constraints.supportsStrength,
        safetyToleranceRange: constraints.safetyToleranceRange,
        maxVariants: constraints.maxVariants,
        supportsAudio: constraints.supportsAudio,

        // Attachments
        uploadedFiles,
        attachmentConfig: attachmentState.attachmentConfig,
        requiresUpload: attachmentState.requiresUpload,
        supportsUpload: attachmentState.supportsUpload,
        maxFiles: attachmentState.maxFiles,
        acceptedMimeTypes: attachmentState.acceptedMimeTypes,
        isDragging,
        fileInputRef,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        removeFile,
        clearFiles,
        openFilePicker,
        handleFileInputChange,
        addFileFromUrl,

        // Pricing
        creditsCost,
        estimatedPrice,

        // Generation
        isGenerating,
        canGenerate,
        validationError,
        generate,

        // State persistence
        syncToStore,
    };
}
