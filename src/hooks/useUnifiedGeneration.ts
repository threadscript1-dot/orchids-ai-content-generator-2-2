'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useGenerationStore } from '@/stores/generation-store';
import { useModelsStore } from '@/stores/models-store';
import { usePendingGenerationStore } from '@/stores/pending-generation-store';
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
    // Advanced options
    negativePrompt: string;
    promptEnhancement: boolean;
    translation: boolean;
    removeWatermark: boolean;
    upscale: boolean;
    safetyTolerance: number;
    strength: number; // For image-to-image
    variants: number; // Number of variations
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
    // Advanced options defaults
    negativePrompt: '',
    promptEnhancement: false,
    translation: false,
    removeWatermark: false,
    upscale: false,
    safetyTolerance: 3, // Middle of typical [0, 6] range
    strength: 0.75, // Default i2i strength
    variants: 1,
};

const DEFAULT_ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const DEFAULT_RESOLUTIONS = ['1K', '2K'];
const DEFAULT_DURATIONS = ['5', '10'];

// ============================================================================
// Hook
// ============================================================================

export function useUnifiedGeneration(
    options: UseUnifiedGenerationOptions,
): UseUnifiedGenerationReturn {
    const { type, maxFiles = 4, language = 'en' } = options;

    // Stores
    const modelsStore = useModelsStore();
    const generationStore = useGenerationStore();
    const pendingStore = usePendingGenerationStore();

    // Track if we've initialized from pending store
    const initializedRef = useRef(false);

    // Get models for the given type
    const models = useMemo(() => {
        return modelsStore.getModelsByType(type);
    }, [modelsStore, type]);

    // Selected model
    const [selectedModelId, setSelectedModelId] = useState<string>('');
    const selectedModel = useMemo(
        () => models.find((m) => m.id === selectedModelId),
        [models, selectedModelId],
    );

    // Set default model when models load
    useMemo(() => {
        if (models.length > 0 && !selectedModelId) {
            setSelectedModelId(models[0].id);
        }
    }, [models, selectedModelId]);

    // Get form state from pending store - reactive to store changes
    const pendingFormState = usePendingGenerationStore((state) => state[type].formState);
    const pendingFormLastUpdated = usePendingGenerationStore((state) => state[type].lastUpdated);

    // Form state - initialize from pending store
    const [formState, setFormState] = useState<GenerationFormState>(() => {
        const pending = pendingStore.getState(type);
        if (pending.formState.prompt || pending.uploadedFiles.length > 0) {
            return { ...DEFAULT_FORM_STATE, ...pending.formState } as GenerationFormState;
        }
        return DEFAULT_FORM_STATE;
    });
    const [isGenerating, setIsGenerating] = useState(false);

    // Track last processed form update
    const lastProcessedFormUpdateRef = useRef(0);

    // Update form state when pending store changes (e.g., from prepareNavigation)
    useEffect(() => {
        // Only process if this is a new update we haven't seen
        if (
            pendingFormLastUpdated > lastProcessedFormUpdateRef.current &&
            pendingFormState.prompt
        ) {
            setFormState((s) => ({ ...s, prompt: pendingFormState.prompt }));
            lastProcessedFormUpdateRef.current = pendingFormLastUpdated;
        }
    }, [pendingFormState, pendingFormLastUpdated]);

    // Sync form state to pending store (debounced to avoid excessive updates)
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
            pendingStore.setFormState(type, formState);
        }, 100);
        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [formState, type, pendingStore]);

    // Individual setters for convenience
    const setPrompt = useCallback((prompt: string) => setFormState((s) => ({ ...s, prompt })), []);
    const setAspectRatio = useCallback(
        (aspectRatio: string) => setFormState((s) => ({ ...s, aspectRatio })),
        [],
    );
    const setResolution = useCallback(
        (resolution: string) => setFormState((s) => ({ ...s, resolution })),
        [],
    );
    const setDuration = useCallback(
        (duration: string) => setFormState((s) => ({ ...s, duration })),
        [],
    );
    const setQuality = useCallback(
        (quality: string) => setFormState((s) => ({ ...s, quality })),
        [],
    );
    const setSound = useCallback((sound: boolean) => setFormState((s) => ({ ...s, sound })), []);
    // Advanced options setters
    const setNegativePrompt = useCallback(
        (negativePrompt: string) => setFormState((s) => ({ ...s, negativePrompt })),
        [],
    );
    const setPromptEnhancement = useCallback(
        (promptEnhancement: boolean) => setFormState((s) => ({ ...s, promptEnhancement })),
        [],
    );
    const setTranslation = useCallback(
        (translation: boolean) => setFormState((s) => ({ ...s, translation })),
        [],
    );
    const setRemoveWatermark = useCallback(
        (removeWatermark: boolean) => setFormState((s) => ({ ...s, removeWatermark })),
        [],
    );
    const setUpscale = useCallback(
        (upscale: boolean) => setFormState((s) => ({ ...s, upscale })),
        [],
    );
    const setSafetyTolerance = useCallback(
        (safetyTolerance: number) => setFormState((s) => ({ ...s, safetyTolerance })),
        [],
    );
    const setStrength = useCallback(
        (strength: number) => setFormState((s) => ({ ...s, strength })),
        [],
    );
    const setVariants = useCallback(
        (variants: number) => setFormState((s) => ({ ...s, variants })),
        [],
    );

    // Get constraints from selected model
    const availableAspectRatios = useMemo(() => {
        return selectedModel?.constraints?.aspectRatios || DEFAULT_ASPECT_RATIOS;
    }, [selectedModel]);

    const availableResolutions = useMemo(() => {
        return selectedModel?.constraints?.resolutions || DEFAULT_RESOLUTIONS;
    }, [selectedModel]);

    // Convert number[] from backend to string[] for UI
    const availableDurations = useMemo(() => {
        const durations = selectedModel?.constraints?.durations;
        if (durations && durations.length > 0) {
            return durations.map((d) => String(d));
        }
        return DEFAULT_DURATIONS;
    }, [selectedModel]);

    // Advanced constraint flags for UI rendering
    const supportsNegativePrompt = useMemo(
        () => selectedModel?.constraints?.supportsNegativePrompt ?? false,
        [selectedModel],
    );
    const supportsPromptEnhancement = useMemo(
        () => selectedModel?.constraints?.supportsPromptEnhancement ?? false,
        [selectedModel],
    );
    const supportsTranslation = useMemo(
        () => selectedModel?.constraints?.supportsTranslation ?? false,
        [selectedModel],
    );
    const supportsWatermark = useMemo(
        () => selectedModel?.constraints?.supportsWatermark ?? false,
        [selectedModel],
    );
    const supportsUpscale = useMemo(
        () => selectedModel?.constraints?.supportsUpscale ?? false,
        [selectedModel],
    );
    const supportsStrength = useMemo(
        () => selectedModel?.constraints?.supportsStrength ?? false,
        [selectedModel],
    );
    const safetyToleranceRange = useMemo(
        () => selectedModel?.constraints?.safetyToleranceRange ?? null,
        [selectedModel],
    );
    const maxVariants = useMemo(
        () => selectedModel?.constraints?.maxVariants ?? null,
        [selectedModel],
    );
    const supportsAudio = useMemo(
        () => selectedModel?.constraints?.supportsAudio ?? false,
        [selectedModel],
    );

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

    // Get pending state from store - reactive to store changes
    const pendingState = usePendingGenerationStore((state) => state[type]);
    const pendingFiles = pendingState.uploadedFiles;
    const pendingLastUpdated = pendingState.lastUpdated;

    // Track last processed update to avoid duplicate processing
    const lastProcessedUpdateRef = useRef(0);
    const [initialPendingFiles, setInitialPendingFiles] = useState(pendingFiles);

    // Update initialPendingFiles when pending store changes (e.g., from prepareNavigation)
    useEffect(() => {
        // Only process if this is a new update we haven't seen
        if (pendingLastUpdated > lastProcessedUpdateRef.current && pendingFiles.length > 0) {
            setInitialPendingFiles(pendingFiles);
            lastProcessedUpdateRef.current = pendingLastUpdated;
        }
    }, [pendingFiles, pendingLastUpdated]);

    // Sync files to pending store
    const handleFilesChange = useCallback(
        (files: UploadedImage[]) => {
            pendingStore.setUploadedFiles(type, files);
        },
        [type, pendingStore],
    );

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
    } = useFileUpload({
        maxFiles: effectiveMaxFiles,
        initialFiles: initialPendingFiles,
        onFilesChange: handleFilesChange,
    });

    // Immediate sync function for use before navigation - syncs BOTH form state and files
    const syncToStore = useCallback(() => {
        pendingStore.setFormState(type, formState);
        pendingStore.setUploadedFiles(type, uploadedFiles);
    }, [pendingStore, type, formState, uploadedFiles]);

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
            return language === 'ru' ? 'Загрузите изображение' : 'Upload an image';
        }

        // Validate files against attachment config
        if (attachmentConfig && uploadedFiles.length > 0) {
            const files = uploadedFiles.filter((f) => f.file).map((f) => f.file as File);
            if (files.length > 0) {
                const validation = validateAttachment(attachmentConfig, files);
                if (!validation.valid) {
                    return validation.error || 'Invalid files';
                }
            }
        }

        return null;
    }, [
        selectedModel,
        formState.prompt,
        requiresUpload,
        uploadedFiles,
        attachmentConfig,
        language,
    ]);

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

            // Add advanced options based on model constraints
            if (supportsNegativePrompt && formState.negativePrompt.trim()) {
                params.negative_prompt = formState.negativePrompt;
            }
            if (supportsPromptEnhancement) {
                params.prompt_enhancement = formState.promptEnhancement;
            }
            if (supportsTranslation) {
                params.translate = formState.translation;
            }
            if (supportsWatermark) {
                params.remove_watermark = formState.removeWatermark;
            }
            if (supportsUpscale) {
                params.upscale = formState.upscale;
            }
            if (safetyToleranceRange) {
                params.safety_tolerance = formState.safetyTolerance;
            }
            if (supportsStrength && uploadedUrls.length > 0) {
                params.strength = formState.strength;
            }
            if (maxVariants && maxVariants > 1) {
                params.n = formState.variants;
            }

            // Add uploaded files using the correct field name
            if (uploadedUrls.length > 0 && attachmentConfig) {
                const fieldName = attachmentConfig.fieldName;
                // Use array only if fieldName ends with 's' or maxCount > 1
                if (
                    fieldName.endsWith('s') ||
                    (attachmentConfig.maxCount && attachmentConfig.maxCount > 1)
                ) {
                    params[fieldName] = uploadedUrls;
                } else {
                    params[fieldName] = uploadedUrls[0];
                }
            }

            // Use unified generation
            const generationId = await generationStore.generateUnified(selectedModel.id, params);

            if (generationId) {
                toast.success(language === 'ru' ? 'Генерация запущена' : 'Generation started');
                setFormState((s) => ({ ...s, prompt: '' }));
                clearFiles();
                // Clear pending store after successful generation
                pendingStore.clear(type);
                return generationId;
            } else {
                toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
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
        pendingStore,
        supportsNegativePrompt,
        supportsPromptEnhancement,
        supportsTranslation,
        supportsWatermark,
        supportsUpscale,
        safetyToleranceRange,
        supportsStrength,
        maxVariants,
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
        // Advanced options setters
        setNegativePrompt,
        setPromptEnhancement,
        setTranslation,
        setRemoveWatermark,
        setUpscale,
        setSafetyTolerance,
        setStrength,
        setVariants,

        // Constraints
        availableAspectRatios,
        availableResolutions,
        availableDurations,

        // Advanced constraints (for UI rendering)
        supportsNegativePrompt,
        supportsPromptEnhancement,
        supportsTranslation,
        supportsWatermark,
        supportsUpscale,
        supportsStrength,
        safetyToleranceRange,
        maxVariants,
        supportsAudio,

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

        // State persistence
        syncToStore,
    };
}
