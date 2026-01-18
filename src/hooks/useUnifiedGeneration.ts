'use client';

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useGenerationStore } from '@/stores/generation-store';
import { useModelsStore } from '@/stores/models-store';
import {
    Model,
    AttachmentConfig,
    hasCapability,
    getAttachmentConfig,
    requiresAttachment,
    supportsAttachment,
    getAttachmentFieldName,
    validateAttachment,
    calculatePrice,
} from '@/stores/models-store';
import { useFileUpload } from '@/hooks/useFileUpload';
import { UploadedImage } from '@/types/generation';

// ============================================================================
// Types
// ============================================================================

export interface GenerationParams {
    prompt: string;
    aspect_ratio?: string;
    resolution?: string;
    duration?: string | number;
    quality?: string;
    sound?: boolean;
    mode?: string;
    [key: string]: any;
}

export interface GenerationFormState {
    prompt: string;
    aspectRatio: string;
    resolution: string;
    duration: string;
    quality: string;
    sound: boolean;
}

export interface UseUnifiedGenerationOptions {
    type: 'image' | 'video' | 'audio';
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

    // Constraints from model
    availableAspectRatios: string[];
    availableResolutions: string[];
    availableDurations: string[];

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
}

// ============================================================================
// Default values
// ============================================================================

const DEFAULT_FORM_STATE: GenerationFormState = {
    prompt: '',
    aspectRatio: '1:1',
    resolution: '1K',
    duration: '5',
    quality: 'basic',
    sound: false,
};

const DEFAULT_ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const DEFAULT_RESOLUTIONS = ['1K', '2K'];
const DEFAULT_DURATIONS = ['5', '10'];

// ============================================================================
// Hook
// ============================================================================

export function useUnifiedGeneration(
    options: UseUnifiedGenerationOptions
): UseUnifiedGenerationReturn {
    const { type, maxFiles = 4, language = 'en' } = options;

    // Stores
    const modelsStore = useModelsStore();
    const generationStore = useGenerationStore();

    // Get models for the given type
    const models = useMemo(() => {
        return modelsStore.getModelsByType(type);
    }, [modelsStore, type]);

    // Selected model
    const [selectedModelId, setSelectedModelId] = useState<string>('');
    const selectedModel = useMemo(
        () => models.find((m) => m.id === selectedModelId),
        [models, selectedModelId]
    );

    // Set default model when models load
    useMemo(() => {
        if (models.length > 0 && !selectedModelId) {
            setSelectedModelId(models[0].id);
        }
    }, [models, selectedModelId]);

    // Form state
    const [formState, setFormState] = useState<GenerationFormState>(DEFAULT_FORM_STATE);
    const [isGenerating, setIsGenerating] = useState(false);

    // Individual setters for convenience
    const setPrompt = useCallback(
        (prompt: string) => setFormState((s) => ({ ...s, prompt })),
        []
    );
    const setAspectRatio = useCallback(
        (aspectRatio: string) => setFormState((s) => ({ ...s, aspectRatio })),
        []
    );
    const setResolution = useCallback(
        (resolution: string) => setFormState((s) => ({ ...s, resolution })),
        []
    );
    const setDuration = useCallback(
        (duration: string) => setFormState((s) => ({ ...s, duration })),
        []
    );
    const setQuality = useCallback(
        (quality: string) => setFormState((s) => ({ ...s, quality })),
        []
    );
    const setSound = useCallback(
        (sound: boolean) => setFormState((s) => ({ ...s, sound })),
        []
    );

    // Get constraints from selected model
    const availableAspectRatios = useMemo(() => {
        return selectedModel?.constraints?.aspectRatios || DEFAULT_ASPECT_RATIOS;
    }, [selectedModel]);

    const availableResolutions = useMemo(() => {
        return selectedModel?.constraints?.resolutions || DEFAULT_RESOLUTIONS;
    }, [selectedModel]);

    const availableDurations = useMemo(() => {
        return selectedModel?.constraints?.durations || DEFAULT_DURATIONS;
    }, [selectedModel]);

    // Auto-correct form state when constraints change
    useMemo(() => {
        if (!availableAspectRatios.includes(formState.aspectRatio)) {
            setFormState((s) => ({ ...s, aspectRatio: availableAspectRatios[0] || '1:1' }));
        }
    }, [availableAspectRatios, formState.aspectRatio]);

    useMemo(() => {
        if (!availableResolutions.includes(formState.resolution)) {
            setFormState((s) => ({ ...s, resolution: availableResolutions[0] || '1K' }));
        }
    }, [availableResolutions, formState.resolution]);

    useMemo(() => {
        if (!availableDurations.includes(formState.duration)) {
            setFormState((s) => ({ ...s, duration: availableDurations[0] || '5' }));
        }
    }, [availableDurations, formState.duration]);

    // Attachment configuration
    const attachmentConfig = useMemo(() => {
        if (!selectedModel) return undefined;
        // For images, look for image attachments; for videos, look for image or video
        if (type === 'image') {
            return getAttachmentConfig(selectedModel, 'image');
        }
        // For video, first check video, then image (for i2v)
        return (
            getAttachmentConfig(selectedModel, 'video') ||
            getAttachmentConfig(selectedModel, 'image')
        );
    }, [selectedModel, type]);

    const requiresUpload = useMemo(() => {
        return attachmentConfig?.mode === 'required';
    }, [attachmentConfig]);

    const supportsUploadMemo = useMemo(() => {
        return attachmentConfig?.mode === 'optional' || attachmentConfig?.mode === 'required';
    }, [attachmentConfig]);

    const effectiveMaxFiles = useMemo(() => {
        return attachmentConfig?.maxCount || maxFiles;
    }, [attachmentConfig, maxFiles]);

    const acceptedMimeTypes = useMemo(() => {
        if (attachmentConfig?.acceptedMimeTypes?.length) {
            return attachmentConfig.acceptedMimeTypes;
        }
        if (type === 'video' && attachmentConfig?.type === 'video') {
            return ['video/*'];
        }
        return ['image/*'];
    }, [attachmentConfig, type]);

    // File upload
    const {
        uploadedImages: uploadedFiles,
        isDragging,
        fileInputRef,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        removeImage: removeFile,
        clearImages: clearFiles,
        openFilePicker,
        handleInputChange: handleFileInputChange,
        addImageFromUrl: addFileFromUrl,
    } = useFileUpload({ maxFiles: effectiveMaxFiles });

    // Pricing
    const creditsCost = useMemo(() => {
        return selectedModel?.credits_cost || 10;
    }, [selectedModel]);

    const estimatedPrice = useMemo(() => {
        if (!selectedModel) return creditsCost;
        return calculatePrice(selectedModel, {
            aspect_ratio: formState.aspectRatio,
            resolution: formState.resolution,
            duration: formState.duration,
        });
    }, [selectedModel, formState, creditsCost]);

    // Validation
    const validationError = useMemo((): string | null => {
        if (!selectedModel) {
            return language === 'ru' ? 'Выберите модель' : 'Select a model';
        }

        if (!formState.prompt.trim() && selectedModel.constraints?.promptRequired !== false) {
            return language === 'ru' ? 'Введите описание' : 'Enter a prompt';
        }

        if (requiresUpload && uploadedFiles.length === 0) {
            return language === 'ru'
                ? 'Загрузите изображение'
                : 'Upload an image';
        }

        // Validate files against attachment config
        if (attachmentConfig && uploadedFiles.length > 0) {
            const files = uploadedFiles
                .filter((f) => f.file)
                .map((f) => f.file as File);
            if (files.length > 0) {
                const validation = validateAttachment(attachmentConfig, files);
                if (!validation.valid) {
                    return validation.error || 'Invalid files';
                }
            }
        }

        return null;
    }, [selectedModel, formState.prompt, requiresUpload, uploadedFiles, attachmentConfig, language]);

    const canGenerate = useMemo(() => {
        return validationError === null;
    }, [validationError]);

    // Generate function
    const generate = useCallback(async (): Promise<string | null> => {
        if (!selectedModel || !canGenerate) {
            if (validationError) {
                toast.error(validationError);
            }
            return null;
        }

        setIsGenerating(true);

        try {
            // Upload files if present
            const uploadedUrls: string[] = [];
            if (uploadedFiles.length > 0) {
                for (const file of uploadedFiles) {
                    if (file.file) {
                        let url: string | null = null;
                        if (attachmentConfig?.type === 'video') {
                            url = await generationStore.uploadVideo(file.file);
                        } else {
                            url = await generationStore.uploadImage(file.file);
                        }
                        if (url) uploadedUrls.push(url);
                    } else if (file.url && !file.url.startsWith('blob:')) {
                        uploadedUrls.push(file.url);
                    }
                }
            }

            // Build params based on model type and constraints
            const params: GenerationParams = {
                prompt: formState.prompt,
            };

            // Add aspect ratio if model supports it
            if (selectedModel.constraints?.aspectRatios) {
                params.aspect_ratio = formState.aspectRatio;
            }

            // Add resolution for image models
            if (type === 'image' && selectedModel.constraints?.resolutions) {
                params.resolution = formState.resolution;
            }

            // Add duration for video models
            if (type === 'video' && selectedModel.constraints?.durations) {
                params.duration = formState.duration;
            }

            // Add sound for video models that support it
            if (type === 'video' && selectedModel.constraints?.supportsAudio !== false) {
                params.sound = formState.sound;
            }

            // Add uploaded files using the correct field name
            if (uploadedUrls.length > 0 && attachmentConfig) {
                const fieldName = attachmentConfig.fieldName;
                params[fieldName] = uploadedUrls;
            }

            // Use unified generation
            const generationId = await generationStore.generateUnified(
                selectedModel.id,
                params
            );

            if (generationId) {
                toast.success(
                    language === 'ru' ? 'Генерация запущена' : 'Generation started'
                );
                setFormState((s) => ({ ...s, prompt: '' }));
                clearFiles();
                return generationId;
            } else {
                toast.error(
                    language === 'ru' ? 'Ошибка генерации' : 'Generation failed'
                );
                return null;
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [
        selectedModel,
        canGenerate,
        validationError,
        uploadedFiles,
        formState,
        type,
        attachmentConfig,
        generationStore,
        language,
        clearFiles,
    ]);

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

        // Constraints
        availableAspectRatios,
        availableResolutions,
        availableDurations,

        // Attachments
        uploadedFiles,
        attachmentConfig,
        requiresUpload,
        supportsUpload: supportsUploadMemo,
        maxFiles: effectiveMaxFiles,
        acceptedMimeTypes,
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
    };
}
