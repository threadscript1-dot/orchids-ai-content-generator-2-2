'use client';

import {
    useGenerationStore,
    type Generation,
    type Flux2TextToImageParams,
    type Flux2ImageToImageParams,
    type Imagen4Params,
    type SeedreamParams,
    type NanoBananaParams,
    type KlingTextToVideoParams,
    type KlingImageToVideoParams,
    type WanParams,
    type SunoParams,
    type TopazUpscaleParams,
    type RecraftUpscaleParams,
    type RemoveBackgroundParams,
} from '@/stores/generation-store';

export function useGeneration() {
    const generations = useGenerationStore((state) => state.generations);
    const activePolling = useGenerationStore((state) => state.activePolling);
    const isLoading = useGenerationStore((state) => state.isLoading);
    const error = useGenerationStore((state) => state.error);
    const hasMore = useGenerationStore((state) => state.hasMore);

    const fetchHistory = useGenerationStore((state) => state.fetchHistory);
    const pollGenerationStatus = useGenerationStore((state) => state.pollGenerationStatus);
    const stopPolling = useGenerationStore((state) => state.stopPolling);
    const stopAllPolling = useGenerationStore((state) => state.stopAllPolling);
    const updateGeneration = useGenerationStore((state) => state.updateGeneration);
    const removeGeneration = useGenerationStore((state) => state.removeGeneration);

    const generateImageFlux2 = useGenerationStore((state) => state.generateImageFlux2);
    const generateImageFlux2I2I = useGenerationStore((state) => state.generateImageFlux2I2I);
    const generateImageImagen4Fast = useGenerationStore((state) => state.generateImageImagen4Fast);
    const generateImageImagen4Ultra = useGenerationStore(
        (state) => state.generateImageImagen4Ultra
    );
    const generateImageSeedream = useGenerationStore((state) => state.generateImageSeedream);
    const generateImageNanoBanana = useGenerationStore((state) => state.generateImageNanoBanana);

    const generateVideoKling = useGenerationStore((state) => state.generateVideoKling);
    const generateVideoKlingI2V = useGenerationStore((state) => state.generateVideoKlingI2V);
    const generateVideoWan = useGenerationStore((state) => state.generateVideoWan);

    const generateAudioSuno = useGenerationStore((state) => state.generateAudioSuno);

    const uploadImage = useGenerationStore((state) => state.uploadImage);
    const uploadVideo = useGenerationStore((state) => state.uploadVideo);

    const upscaleTopaz = useGenerationStore((state) => state.upscaleTopaz);
    const upscaleRecraft = useGenerationStore((state) => state.upscaleRecraft);
    const removeBackground = useGenerationStore((state) => state.removeBackground);

    const processingGenerations = generations.filter(
        (g) => g.status === 'processing' || g.status === 'queued'
    );
    const completedGenerations = generations.filter((g) => g.status === 'success');
    const failedGenerations = generations.filter((g) => g.status === 'failed');

    return {
        generations,
        processingGenerations,
        completedGenerations,
        failedGenerations,
        activePolling,
        isLoading,
        error,
        hasMore,

        fetchHistory,
        pollGenerationStatus,
        stopPolling,
        stopAllPolling,
        updateGeneration,
        removeGeneration,

        generateImageFlux2,
        generateImageFlux2I2I,
        generateImageImagen4Fast,
        generateImageImagen4Ultra,
        generateImageSeedream,
        generateImageNanoBanana,

        generateVideoKling,
        generateVideoKlingI2V,
        generateVideoWan,

        generateAudioSuno,

        uploadImage,
        uploadVideo,

        upscaleTopaz,
        upscaleRecraft,
        removeBackground,
    };
}

export function useGenerationById(id: string) {
    const generation = useGenerationStore((state) => state.generations.find((g) => g.id === id));
    const isPolling = useGenerationStore((state) => state.activePolling.has(id));
    const pollGenerationStatus = useGenerationStore((state) => state.pollGenerationStatus);
    const stopPolling = useGenerationStore((state) => state.stopPolling);

    return {
        generation,
        isPolling,
        startPolling: () => pollGenerationStatus(id),
        stopPolling: () => stopPolling(id),
    };
}

export type {
    Generation,
    Flux2TextToImageParams,
    Flux2ImageToImageParams,
    Imagen4Params,
    SeedreamParams,
    NanoBananaParams,
    KlingTextToVideoParams,
    KlingImageToVideoParams,
    WanParams,
    SunoParams,
    TopazUpscaleParams,
    RecraftUpscaleParams,
    RemoveBackgroundParams,
};
