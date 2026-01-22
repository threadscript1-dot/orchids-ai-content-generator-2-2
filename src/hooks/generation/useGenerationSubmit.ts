'use client';

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useGenerationStore } from '@/stores/generation-store';
import { usePendingGenerationStore } from '@/stores/pending-generation-store';
import { validateAttachment, calculatePrice, type Model } from '@/stores/models-store';
import type { UploadedImage } from '@/types/generation';
import type {
    GenerationType,
    GenerationFormState,
    ModelConstraints,
    AttachmentState,
    GenerationParams,
} from './types';

interface UseGenerationSubmitOptions {
    type: GenerationType;
    selectedModel: Model | undefined;
    formState: GenerationFormState;
    constraints: ModelConstraints;
    attachmentState: AttachmentState;
    uploadedFiles: UploadedImage[];
    clearFiles: () => void;
    resetForm: () => void;
    language?: 'ru' | 'en';
}

interface UseGenerationSubmitReturn {
    isGenerating: boolean;
    canGenerate: boolean;
    validationError: string | null;
    creditsCost: number;
    estimatedPrice: number;
    generate: () => Promise<string | null>;
}

export function useGenerationSubmit(options: UseGenerationSubmitOptions): UseGenerationSubmitReturn {
    const {
        type,
        selectedModel,
        formState,
        constraints,
        attachmentState,
        uploadedFiles,
        clearFiles,
        resetForm,
        language = 'en',
    } = options;

    const generationStore = useGenerationStore();
    const pendingStore = usePendingGenerationStore();

    const [isGenerating, setIsGenerating] = useState(false);

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

        if (attachmentState.requiresUpload && uploadedFiles.length === 0) {
            return language === 'ru' ? 'Загрузите изображение' : 'Upload an image';
        }

        // Validate files against attachment config
        if (attachmentState.attachmentConfig && uploadedFiles.length > 0) {
            const files = uploadedFiles.filter((f) => f.file).map((f) => f.file as File);
            if (files.length > 0) {
                const validation = validateAttachment(attachmentState.attachmentConfig, files);
                if (!validation.valid) {
                    return validation.error || 'Invalid files';
                }
            }
        }

        return null;
    }, [selectedModel, formState.prompt, attachmentState, uploadedFiles, language]);

    const canGenerate = validationError === null;

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
                        if (attachmentState.attachmentConfig?.type === 'video') {
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
            if (constraints.supportsNegativePrompt && formState.negativePrompt.trim()) {
                params.negative_prompt = formState.negativePrompt;
            }
            if (constraints.supportsPromptEnhancement) {
                params.prompt_enhancement = formState.promptEnhancement;
            }
            if (constraints.supportsTranslation) {
                params.translate = formState.translation;
            }
            if (constraints.supportsWatermark) {
                params.remove_watermark = formState.removeWatermark;
            }
            if (constraints.supportsUpscale) {
                params.upscale = formState.upscale;
            }
            if (constraints.safetyToleranceRange) {
                params.safety_tolerance = formState.safetyTolerance;
            }
            if (constraints.supportsStrength && uploadedUrls.length > 0) {
                params.strength = formState.strength;
            }
            if (constraints.maxVariants && constraints.maxVariants > 1) {
                params.n = formState.variants;
            }

            // Add uploaded files using the correct field name
            if (uploadedUrls.length > 0 && attachmentState.attachmentConfig) {
                const fieldName = attachmentState.attachmentConfig.fieldName;
                const maxCount = attachmentState.attachmentConfig.maxCount;
                // Use array only if fieldName ends with 's' or maxCount > 1
                if (fieldName.endsWith('s') || (maxCount && maxCount > 1)) {
                    params[fieldName] = uploadedUrls;
                } else {
                    params[fieldName] = uploadedUrls[0];
                }
            }

            // Use unified generation
            const generationId = await generationStore.generateUnified(selectedModel.id, params);

            if (generationId) {
                toast.success(language === 'ru' ? 'Генерация запущена' : 'Generation started');
                clearFiles();
                resetForm();
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
        constraints,
        attachmentState,
        generationStore,
        language,
        clearFiles,
        resetForm,
        pendingStore,
    ]);

    return {
        isGenerating,
        canGenerate,
        validationError,
        creditsCost,
        estimatedPrice,
        generate,
    };
}
