'use client';

import { useState, useCallback } from 'react';
import {
    useGenerationStore,
    type TopazUpscaleParams,
    type RecraftUpscaleParams,
    type RemoveBackgroundParams,
} from '@/stores/generation-store';

export type UpscaleFactor = '1' | '2' | '4' | '8';

export type UpscaleProvider = 'topaz' | 'recraft';

export interface ImageToolsError {
    code: string;
    message: string;
}

const IMAGE_CONSTRAINTS = {
    upscale: {
        maxSize: 10 * 1024 * 1024, // 10MB
        supportedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
    backgroundRemoval: {
        maxSize: 5 * 1024 * 1024, // 5MB
        maxResolution: 16 * 1024 * 1024, // 16MP
        minDimension: 256,
        maxDimension: 4096,
        supportedTypes: ['image/png', 'image/jpeg', 'image/webp'],
    },
};

function validateImageForUpscale(file: File): ImageToolsError | null {
    if (!IMAGE_CONSTRAINTS.upscale.supportedTypes.includes(file.type)) {
        return {
            code: 'INVALID_TYPE',
            message: 'Supported formats: JPEG, PNG, WebP',
        };
    }
    if (file.size > IMAGE_CONSTRAINTS.upscale.maxSize) {
        return {
            code: 'FILE_TOO_LARGE',
            message: 'Maximum file size: 10MB',
        };
    }
    return null;
}

function validateImageForBackgroundRemoval(file: File): ImageToolsError | null {
    if (!IMAGE_CONSTRAINTS.backgroundRemoval.supportedTypes.includes(file.type)) {
        return {
            code: 'INVALID_TYPE',
            message: 'Supported formats: PNG, JPG, WebP',
        };
    }
    if (file.size > IMAGE_CONSTRAINTS.backgroundRemoval.maxSize) {
        return {
            code: 'FILE_TOO_LARGE',
            message: 'Maximum file size: 5MB',
        };
    }
    return null;
}

export function useImageTools() {
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<ImageToolsError | null>(null);

    const uploadImage = useGenerationStore((state) => state.uploadImage);
    const upscaleTopaz = useGenerationStore((state) => state.upscaleTopaz);
    const upscaleRecraft = useGenerationStore((state) => state.upscaleRecraft);
    const removeBackgroundAction = useGenerationStore((state) => state.removeBackground);
    const storeError = useGenerationStore((state) => state.error);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const upscaleFromFile = useCallback(
        async (
            file: File,
            options: { provider: UpscaleProvider; factor?: UpscaleFactor }
        ): Promise<string | null> => {
            setError(null);
            setIsUploading(true);

            const validationError = validateImageForUpscale(file);
            if (validationError) {
                setError(validationError);
                setIsUploading(false);
                return null;
            }

            try {
                const imageUrl = await uploadImage(file);
                if (!imageUrl) {
                    setError({ code: 'UPLOAD_FAILED', message: 'Failed to upload image' });
                    setIsUploading(false);
                    return null;
                }

                setIsUploading(false);
                setIsProcessing(true);

                let generationId: string | null = null;

                if (options.provider === 'topaz') {
                    generationId = await upscaleTopaz({
                        image_url: imageUrl,
                        upscale_factor: options.factor || '2',
                    });
                } else {
                    generationId = await upscaleRecraft({
                        image: imageUrl,
                    });
                }

                setIsProcessing(false);

                if (!generationId) {
                    setError({
                        code: 'UPSCALE_FAILED',
                        message: storeError || 'Failed to start upscale',
                    });
                    return null;
                }

                return generationId;
            } catch (err) {
                setIsUploading(false);
                setIsProcessing(false);
                setError({
                    code: 'UNEXPECTED_ERROR',
                    message: err instanceof Error ? err.message : 'An unexpected error occurred',
                });
                return null;
            }
        },
        [uploadImage, upscaleTopaz, upscaleRecraft, storeError]
    );

    const upscaleFromUrl = useCallback(
        async (
            imageUrl: string,
            options: { provider: UpscaleProvider; factor?: UpscaleFactor }
        ): Promise<string | null> => {
            setError(null);
            setIsProcessing(true);

            try {
                let generationId: string | null = null;

                if (options.provider === 'topaz') {
                    generationId = await upscaleTopaz({
                        image_url: imageUrl,
                        upscale_factor: options.factor || '2',
                    });
                } else {
                    generationId = await upscaleRecraft({
                        image: imageUrl,
                    });
                }

                setIsProcessing(false);

                if (!generationId) {
                    setError({
                        code: 'UPSCALE_FAILED',
                        message: storeError || 'Failed to start upscale',
                    });
                    return null;
                }

                return generationId;
            } catch (err) {
                setIsProcessing(false);
                setError({
                    code: 'UNEXPECTED_ERROR',
                    message: err instanceof Error ? err.message : 'An unexpected error occurred',
                });
                return null;
            }
        },
        [upscaleTopaz, upscaleRecraft, storeError]
    );

    const removeBackgroundFromFile = useCallback(
        async (file: File): Promise<string | null> => {
            setError(null);
            setIsUploading(true);

            const validationError = validateImageForBackgroundRemoval(file);
            if (validationError) {
                setError(validationError);
                setIsUploading(false);
                return null;
            }

            try {
                const imageUrl = await uploadImage(file);
                if (!imageUrl) {
                    setError({ code: 'UPLOAD_FAILED', message: 'Failed to upload image' });
                    setIsUploading(false);
                    return null;
                }

                setIsUploading(false);
                setIsProcessing(true);

                const generationId = await removeBackgroundAction({ image: imageUrl });

                setIsProcessing(false);

                if (!generationId) {
                    setError({
                        code: 'BG_REMOVAL_FAILED',
                        message: storeError || 'Failed to start background removal',
                    });
                    return null;
                }

                return generationId;
            } catch (err) {
                setIsUploading(false);
                setIsProcessing(false);
                setError({
                    code: 'UNEXPECTED_ERROR',
                    message: err instanceof Error ? err.message : 'An unexpected error occurred',
                });
                return null;
            }
        },
        [uploadImage, removeBackgroundAction, storeError]
    );

    const removeBackgroundFromUrl = useCallback(
        async (imageUrl: string): Promise<string | null> => {
            setError(null);
            setIsProcessing(true);

            try {
                const generationId = await removeBackgroundAction({ image: imageUrl });

                setIsProcessing(false);

                if (!generationId) {
                    setError({
                        code: 'BG_REMOVAL_FAILED',
                        message: storeError || 'Failed to start background removal',
                    });
                    return null;
                }

                return generationId;
            } catch (err) {
                setIsProcessing(false);
                setError({
                    code: 'UNEXPECTED_ERROR',
                    message: err instanceof Error ? err.message : 'An unexpected error occurred',
                });
                return null;
            }
        },
        [removeBackgroundAction, storeError]
    );

    return {
        isUploading,
        isProcessing,
        isLoading: isUploading || isProcessing,
        error,
        clearError,

        upscaleFromFile,
        upscaleFromUrl,

        removeBackgroundFromFile,
        removeBackgroundFromUrl,

        constraints: IMAGE_CONSTRAINTS,
    };
}

export type { TopazUpscaleParams, RecraftUpscaleParams, RemoveBackgroundParams };
