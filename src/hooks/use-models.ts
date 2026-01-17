'use client';

import { useEffect } from 'react';
import { useModelsStore, type Model } from '@/stores/models-store';

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

    const textToImageModels = imageModels.filter(
        (m) => m.capability === 'text-to-image' || m.capabilities?.includes('text-to-image')
    );

    const imageToImageModels = imageModels.filter(
        (m) => m.capability === 'image-to-image' || m.capabilities?.includes('image-to-image')
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

    const textToVideoModels = videoModels.filter(
        (m) => m.capability === 'text-to-video' || m.capabilities?.includes('text-to-video')
    );

    const imageToVideoModels = videoModels.filter(
        (m) => m.capability === 'image-to-video' || m.capabilities?.includes('image-to-video')
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
