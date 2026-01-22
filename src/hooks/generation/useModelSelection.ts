'use client';

import { useState, useMemo } from 'react';
import { useModelsStore, getAttachmentConfig, type Model } from '@/stores/models-store';
import {
    type GenerationType,
    type ModelConstraints,
    type AttachmentState,
    DEFAULT_ASPECT_RATIOS,
    DEFAULT_RESOLUTIONS,
    DEFAULT_DURATIONS,
} from './types';

interface UseModelSelectionOptions {
    type: GenerationType;
    maxFiles?: number;
}

interface UseModelSelectionReturn {
    models: Model[];
    selectedModel: Model | undefined;
    selectedModelId: string;
    setSelectedModelId: (id: string) => void;
    constraints: ModelConstraints;
    attachmentState: AttachmentState;
}

export function useModelSelection(options: UseModelSelectionOptions): UseModelSelectionReturn {
    const { type, maxFiles = 4 } = options;

    const modelsStore = useModelsStore();

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

    // Get constraints from selected model
    const constraints: ModelConstraints = useMemo(() => {
        const modelConstraints = selectedModel?.constraints;

        return {
            availableAspectRatios: modelConstraints?.aspectRatios || DEFAULT_ASPECT_RATIOS,
            availableResolutions: modelConstraints?.resolutions || DEFAULT_RESOLUTIONS,
            availableDurations: modelConstraints?.durations
                ? modelConstraints.durations.map((d) => String(d))
                : DEFAULT_DURATIONS,
            supportsNegativePrompt: modelConstraints?.supportsNegativePrompt ?? false,
            supportsPromptEnhancement: modelConstraints?.supportsPromptEnhancement ?? false,
            supportsTranslation: modelConstraints?.supportsTranslation ?? false,
            supportsWatermark: modelConstraints?.supportsWatermark ?? false,
            supportsUpscale: modelConstraints?.supportsUpscale ?? false,
            supportsStrength: modelConstraints?.supportsStrength ?? false,
            safetyToleranceRange: modelConstraints?.safetyToleranceRange ?? null,
            maxVariants: modelConstraints?.maxVariants ?? null,
            supportsAudio: modelConstraints?.supportsAudio ?? false,
        };
    }, [selectedModel]);

    // Attachment configuration
    const attachmentState: AttachmentState = useMemo(() => {
        if (!selectedModel) {
            return {
                attachmentConfig: undefined,
                requiresUpload: false,
                supportsUpload: false,
                maxFiles,
                acceptedMimeTypes: ['image/*'],
            };
        }

        // For images, look for image attachments; for videos, look for image or video
        let config =
            type === 'image'
                ? getAttachmentConfig(selectedModel, 'image')
                : getAttachmentConfig(selectedModel, 'video') ||
                  getAttachmentConfig(selectedModel, 'image');

        const requiresUpload = config?.mode === 'required';
        const supportsUpload = config?.mode === 'optional' || config?.mode === 'required';
        const effectiveMaxFiles = config?.maxCount || maxFiles;

        let acceptedMimeTypes: string[];
        if (config?.acceptedMimeTypes?.length) {
            acceptedMimeTypes = config.acceptedMimeTypes;
        } else if (type === 'video' && config?.type === 'video') {
            acceptedMimeTypes = ['video/*'];
        } else {
            acceptedMimeTypes = ['image/*'];
        }

        return {
            attachmentConfig: config,
            requiresUpload,
            supportsUpload,
            maxFiles: effectiveMaxFiles,
            acceptedMimeTypes,
        };
    }, [selectedModel, type, maxFiles]);

    return {
        models,
        selectedModel,
        selectedModelId,
        setSelectedModelId,
        constraints,
        attachmentState,
    };
}
