'use client';

import { useEffect, useMemo } from 'react';
import { useModelsStore, type Model, hasCapability } from '@/stores/models-store';

export function useModels() {
    const models = useModelsStore((state) => state.models);
    const imageModels = useModelsStore((state) => state.imageModels);
    const videoModels = useModelsStore((state) => state.videoModels);
    const audioModels = useModelsStore((state) => state.audioModels);
    const isLoading = useModelsStore((state) => state.isLoading);
    const error = useModelsStore((state) => state.error);

    const fetchModels = useModelsStore((state) => state.fetchModels);
    const getModelById = useModelsStore((state) => state.getModelById);
    const getModelsByType = useModelsStore((state) => state.getModelsByType);
    const getModelsByCapability = useModelsStore((state) => state.getModelsByCapability);

    useEffect(() => {
        if (models.length === 0 && !isLoading) {
            fetchModels();
        }
    }, [models.length, isLoading, fetchModels]);

    return {
        models,
        imageModels,
        videoModels,
        audioModels,
        isLoading,
        error,

        fetchModels,
        getModelById,
        getModelsByType,
        getModelsByCapability,
    };
}

export function useImageModels() {
    const imageModels = useModelsStore((state) => state.imageModels);
    const isLoading = useModelsStore((state) => state.isLoading);
    const fetchModels = useModelsStore((state) => state.fetchModels);

    useEffect(() => {
        if (imageModels.length === 0 && !isLoading) {
            fetchModels();
        }
    }, [imageModels.length, isLoading, fetchModels]);

    const textToImageModels = useMemo(
        () => imageModels.filter((m) => hasCapability(m, 'text-to-image')),
        [imageModels]
    );

    const imageToImageModels = useMemo(
        () => imageModels.filter((m) => hasCapability(m, 'image-to-image')),
        [imageModels]
    );

    return {
        models: imageModels,
        textToImageModels,
        imageToImageModels,
        isLoading,
    };
}

export function useVideoModels() {
    const videoModels = useModelsStore((state) => state.videoModels);
    const isLoading = useModelsStore((state) => state.isLoading);
    const fetchModels = useModelsStore((state) => state.fetchModels);

    useEffect(() => {
        if (videoModels.length === 0 && !isLoading) {
            fetchModels();
        }
    }, [videoModels.length, isLoading, fetchModels]);

    const textToVideoModels = useMemo(
        () => videoModels.filter((m) => hasCapability(m, 'text-to-video')),
        [videoModels]
    );

    const imageToVideoModels = useMemo(
        () => videoModels.filter((m) => hasCapability(m, 'image-to-video')),
        [videoModels]
    );

    return {
        models: videoModels,
        textToVideoModels,
        imageToVideoModels,
        isLoading,
    };
}

export function useAudioModels() {
    const audioModels = useModelsStore((state) => state.audioModels);
    const isLoading = useModelsStore((state) => state.isLoading);
    const fetchModels = useModelsStore((state) => state.fetchModels);

    useEffect(() => {
        if (audioModels.length === 0 && !isLoading) {
            fetchModels();
        }
    }, [audioModels.length, isLoading, fetchModels]);

    return {
        models: audioModels,
        isLoading,
    };
}

export type { Model };

// Re-export helper functions for convenience
export {
    hasCapability,
    getAttachmentConfig,
    requiresAttachment,
    supportsAttachment,
    calculatePrice,
    getAttachmentFieldName,
    validateAttachment,
} from '@/stores/models-store';

