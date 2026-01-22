'use client';

import { create } from 'zustand';
import { api } from '@/api/client';
import { useAuthStore } from './auth-store';
import {
    generateUnified,
    generateWithEndpoint,
    uploadFile,
    getEndpointForModel,
    type Generation,
    type GenerationAsset,
    type TopazUpscaleParams,
    type RecraftUpscaleParams,
    type RemoveBackgroundParams,
    type KlingMotionControlParams,
    type SeedanceStartEndFrameParams,
} from './generation';

// Re-export types for backward compatibility
export type {
    Generation,
    GenerationAsset,
    TopazUpscaleParams,
    RecraftUpscaleParams,
    RemoveBackgroundParams,
    KlingMotionControlParams,
    SeedanceStartEndFrameParams,
};

// Legacy param interfaces for backward compatibility
export interface Flux2TextToImageParams {
    prompt: string;
    aspect_ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | 'auto';
    resolution: '1K' | '2K';
}

export interface Flux2ImageToImageParams {
    prompt: string;
    input_urls: string[];
    aspect_ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | 'auto';
    resolution: '1K' | '2K';
}

export interface Imagen4Params {
    prompt: string;
    aspect_ratio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
}

export interface SeedreamParams {
    prompt: string;
    aspect_ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | '21:9';
    quality: 'basic' | 'high';
}

export interface NanoBananaParams {
    prompt: string;
    reference_urls?: string[];
    aspect_ratio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
}

export interface GrokImagineParams {
    prompt: string;
    aspect_ratio?: '1:1' | '16:9' | '9:16';
}

export interface FluxKontextParams {
    prompt: string;
    aspect_ratio?: string;
    input_urls?: string[];
}

export interface GPT4oImageParams {
    prompt: string;
    aspect_ratio?: string;
    input_urls?: string[];
}

export interface IdeogramParams {
    prompt: string;
    aspect_ratio?: string;
    input_urls?: string[];
}

export interface QwenImageParams {
    prompt: string;
    aspect_ratio?: string;
    input_urls?: string[];
}

export interface GenericImageParams {
    prompt: string;
    aspect_ratio?: string;
    input_urls?: string[];
    [key: string]: unknown;
}

export interface KlingTextToVideoParams {
    prompt: string;
    aspect_ratio: '1:1' | '16:9' | '9:16';
    duration: '5' | '10';
    sound: boolean;
}

export interface KlingImageToVideoParams {
    prompt: string;
    image_urls: string[];
    duration: '5' | '10';
    sound: boolean;
}

export interface WanParams {
    prompt: string;
    duration?: '5' | '10' | '15';
    resolution?: '720p' | '1080p';
    image_urls?: string[];
}

export interface VeoParams {
    prompt: string;
    aspect_ratio?: string;
    image_urls?: string[];
}

export interface SoraParams {
    prompt: string;
    aspect_ratio?: string;
    duration?: number;
    image_urls?: string[];
}

export interface RunwayParams {
    prompt: string;
    aspect_ratio?: string;
    duration?: number;
    resolution?: string;
    image_urls?: string[];
}

export interface SeedanceParams {
    prompt: string;
    aspect_ratio?: string;
    duration?: number;
    resolution?: string;
    generate_audio?: boolean;
    image_urls?: string[];
}

export interface GenericVideoParams {
    prompt: string;
    aspect_ratio?: string;
    duration?: number;
    resolution?: string;
    image_urls?: string[];
    [key: string]: unknown;
}

export interface SunoParams {
    prompt?: string;
    model: 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';
    custom_mode: boolean;
    instrumental: boolean;
    style?: string;
    title?: string;
    negative_tags?: string;
    vocal_gender?: 'm' | 'f';
    style_weight?: number;
    weirdness_constraint?: number;
    audio_weight?: number;
}

// Constants
const POLL_INTERVAL = 5000;
const MAX_POLL_ATTEMPTS = 120;
const pollingIntervals = new Map<string, NodeJS.Timeout>();

interface GenerationState {
    generations: Generation[];
    activePolling: Set<string>;
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    offset: number;
    likedIds: Set<string>;

    // Core actions
    addGeneration: (generation: Generation) => void;
    updateGeneration: (id: string, updates: Partial<Generation>) => void;
    removeGeneration: (id: string) => void;
    toggleFavorite: (id: string) => Promise<void>;
    fetchLikedIds: () => Promise<void>;

    // History & Polling
    fetchHistory: (reset?: boolean) => Promise<void>;
    pollGenerationStatus: (id: string) => Promise<void>;
    stopPolling: (id: string) => void;
    stopAllPolling: () => void;

    // Unified generation (recommended)
    generateUnified: (modelId: string, params: Record<string, unknown>) => Promise<string | null>;

    // Legacy methods (for backward compatibility)
    generateImageFlux2: (params: Flux2TextToImageParams) => Promise<string | null>;
    generateImageFlux2I2I: (params: Flux2ImageToImageParams) => Promise<string | null>;
    generateImageImagen4Fast: (params: Imagen4Params) => Promise<string | null>;
    generateImageImagen4Ultra: (params: Imagen4Params) => Promise<string | null>;
    generateImageSeedream: (params: SeedreamParams) => Promise<string | null>;
    generateImageNanoBanana: (params: NanoBananaParams) => Promise<string | null>;
    generateImageGrokImagine: (params: GrokImagineParams) => Promise<string | null>;
    generateImageFluxKontext: (params: FluxKontextParams) => Promise<string | null>;
    generateImageGPT4o: (params: GPT4oImageParams) => Promise<string | null>;
    generateImageIdeogram: (params: IdeogramParams) => Promise<string | null>;
    generateImageQwen: (params: QwenImageParams) => Promise<string | null>;
    generateImageGeneric: (modelId: string, params: GenericImageParams) => Promise<string | null>;
    generateVideoKling: (params: KlingTextToVideoParams) => Promise<string | null>;
    generateVideoKlingI2V: (params: KlingImageToVideoParams) => Promise<string | null>;
    generateVideoWan: (params: WanParams) => Promise<string | null>;
    generateVideoVeo: (params: VeoParams) => Promise<string | null>;
    generateVideoSora: (params: SoraParams) => Promise<string | null>;
    generateVideoRunway: (params: RunwayParams) => Promise<string | null>;
    generateVideoSeedance: (params: SeedanceParams) => Promise<string | null>;
    generateVideoGeneric: (modelId: string, params: GenericVideoParams) => Promise<string | null>;
    generateAudioSuno: (params: SunoParams) => Promise<string | null>;

    // Upload
    uploadImage: (file: File) => Promise<string | null>;
    uploadVideo: (file: File) => Promise<string | null>;

    // Image Tools
    upscaleTopaz: (params: TopazUpscaleParams) => Promise<string | null>;
    upscaleRecraft: (params: RecraftUpscaleParams) => Promise<string | null>;
    removeBackground: (params: RemoveBackgroundParams) => Promise<string | null>;

    // Video Tools
    klingMotionControl: (params: KlingMotionControlParams) => Promise<string | null>;
    seedanceStartEndFrame: (params: SeedanceStartEndFrameParams) => Promise<string | null>;
}

export const useGenerationStore = create<GenerationState>()((set, get) => {
    // Helper to get generation context for factory functions
    const getContext = () => ({
        addGeneration: get().addGeneration,
        pollGenerationStatus: get().pollGenerationStatus,
        setError: (error: string | null) => set({ error }),
    });

    return {
        generations: [],
        activePolling: new Set(),
        isLoading: false,
        error: null,
        hasMore: true,
        offset: 0,
        likedIds: new Set<string>(),

        addGeneration: (generation) => {
            set((state) => ({
                generations: [generation, ...state.generations],
            }));
        },

        updateGeneration: (id, updates) => {
            set((state) => ({
                generations: state.generations.map((g) => (g.id === id ? { ...g, ...updates } : g)),
            }));
        },

        removeGeneration: (id) => {
            get().stopPolling(id);
            set((state) => ({
                generations: state.generations.filter((g) => g.id !== id),
            }));
        },

        fetchLikedIds: async () => {
            try {
                const { data, error } = await api.GET('/likes/my');
                if (error) {
                    console.error('Failed to fetch liked IDs:', error);
                    return;
                }

                if (data && typeof data === 'object' && 'data' in data) {
                    const result = (data as { data: { generation_ids?: string[] } }).data;
                    if (result && Array.isArray(result.generation_ids)) {
                        const likedSet = new Set<string>(result.generation_ids);
                        set({ likedIds: likedSet });
                        set((state) => ({
                            generations: state.generations.map((g) => ({
                                ...g,
                                is_favorite: likedSet.has(g.id),
                            })),
                        }));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch liked IDs:', err);
            }
        },

        toggleFavorite: async (id: string) => {
            const gen = get().generations.find((g) => g.id === id);
            if (!gen) return;

            const newState = !gen.is_favorite;
            get().updateGeneration(id, { is_favorite: newState });

            try {
                const { data, error } = await api.POST('/likes/toggle', {
                    body: { generation_id: id },
                });

                if (error) {
                    get().updateGeneration(id, { is_favorite: !newState });
                    console.error('Failed to toggle like:', error);
                    return;
                }

                if (data && typeof data === 'object' && 'data' in data) {
                    const result = (data as { data: { liked?: boolean } }).data;
                    if (result && typeof result.liked === 'boolean') {
                        get().updateGeneration(id, { is_favorite: result.liked });
                    }
                }
            } catch (err) {
                get().updateGeneration(id, { is_favorite: !newState });
                console.error('Failed to toggle like:', err);
            }
        },

        fetchHistory: async (reset = false) => {
            const { offset, hasMore, isLoading } = get();
            if (isLoading || (!hasMore && !reset)) return;

            const newOffset = reset ? 0 : offset;
            set({ isLoading: true, error: null });

            try {
                const { data, error } = await api.GET('/user/history', {
                    params: {
                        query: {
                            limit: '20',
                            offset: String(newOffset),
                        },
                    },
                });

                if (error) {
                    set({ error: 'Failed to fetch history', isLoading: false });
                    return;
                }

                if (
                    data &&
                    typeof data === 'object' &&
                    'data' in data &&
                    Array.isArray((data as { data: Generation[] }).data)
                ) {
                    const historyData = data as {
                        data: Generation[];
                        pagination: { has_more: boolean };
                    };

                    const { likedIds } = get();
                    set((state) => {
                        const newGenerations = reset
                            ? historyData.data
                            : [...state.generations, ...historyData.data];
                        const uniqueGenerations = Array.from(
                            new Map(newGenerations.map((g) => [g.id, g])).values(),
                        );
                        const withLikedStatus = uniqueGenerations.map((g) => ({
                            ...g,
                            is_favorite: likedIds.has(g.id) || g.is_favorite,
                        }));

                        return {
                            generations: withLikedStatus,
                            hasMore: historyData.pagination.has_more,
                            offset: newOffset + historyData.data.length,
                            isLoading: false,
                        };
                    });

                    if (reset) {
                        get().fetchLikedIds();
                    }
                } else {
                    set({
                        generations: reset ? [] : get().generations,
                        hasMore: false,
                        isLoading: false,
                    });
                }
            } catch (err) {
                set({
                    error: err instanceof Error ? err.message : 'Network error',
                    isLoading: false,
                });
            }
        },

        pollGenerationStatus: async (id: string) => {
            const { activePolling } = get();
            if (activePolling.has(id)) return;

            set((state) => ({
                activePolling: new Set(state.activePolling).add(id),
            }));

            let attempts = 0;

            const poll = async () => {
                attempts++;

                try {
                    const { data } = await api.GET('/generations/{id}', {
                        params: { path: { id } },
                    });

                    if (data) {
                        const genData = data as Generation;
                        get().updateGeneration(id, genData);

                        if (genData.status === 'success' || genData.status === 'failed') {
                            get().stopPolling(id);
                            useAuthStore.getState().fetchUser();
                            return;
                        }
                    }
                } catch {
                    // Continue polling on network errors
                }

                if (attempts >= MAX_POLL_ATTEMPTS) {
                    get().stopPolling(id);
                    get().updateGeneration(id, {
                        status: 'failed',
                        error: 'Polling timeout',
                    });
                }
            };

            await poll();
            const interval = setInterval(poll, POLL_INTERVAL);
            pollingIntervals.set(id, interval);
        },

        stopPolling: (id: string) => {
            const interval = pollingIntervals.get(id);
            if (interval) {
                clearInterval(interval);
                pollingIntervals.delete(id);
            }
            set((state) => {
                const newPolling = new Set(state.activePolling);
                newPolling.delete(id);
                return { activePolling: newPolling };
            });
        },

        stopAllPolling: () => {
            pollingIntervals.forEach((interval) => clearInterval(interval));
            pollingIntervals.clear();
            set({ activePolling: new Set() });
        },

        // Unified generation - recommended for new code
        generateUnified: async (modelId: string, params: Record<string, unknown>) => {
            return generateUnified(modelId, params, getContext());
        },

        // Legacy methods using factory - for backward compatibility
        generateImageFlux2: async (params) => {
            return generateWithEndpoint(
                '/image/flux-2/generate',
                params,
                'image',
                'flux-2-pro',
                getContext(),
            );
        },

        generateImageFlux2I2I: async (params) => {
            return generateWithEndpoint(
                '/image/flux-2/generate',
                params,
                'image',
                'flux-2-pro-i2i',
                getContext(),
            );
        },

        generateImageImagen4Fast: async (params) => {
            return generateWithEndpoint(
                '/image/imagen4/fast',
                params,
                'image',
                'imagen4-fast',
                getContext(),
            );
        },

        generateImageImagen4Ultra: async (params) => {
            return generateWithEndpoint(
                '/image/imagen4/ultra',
                params,
                'image',
                'imagen4-ultra',
                getContext(),
            );
        },

        generateImageSeedream: async (params) => {
            return generateWithEndpoint(
                '/image/seedream/generate',
                params,
                'image',
                'seedream-4.5',
                getContext(),
            );
        },

        generateImageNanoBanana: async (params) => {
            return generateWithEndpoint(
                '/image/nano-banana/generate',
                params,
                'image',
                'nano-banana-pro',
                getContext(),
            );
        },

        generateImageGrokImagine: async (params) => {
            return generateWithEndpoint(
                '/video/grok-imagine/generate',
                params,
                'image',
                'grok-imagine',
                getContext(),
            );
        },

        generateImageFluxKontext: async (params) => {
            const endpoint = params.input_urls?.length
                ? '/image/flux-kontext/edit'
                : '/image/flux-kontext/generate';
            return generateWithEndpoint(endpoint, params, 'image', 'flux-kontext', getContext());
        },

        generateImageGPT4o: async (params) => {
            const endpoint = params.input_urls?.length
                ? '/image/gpt4o/edit'
                : '/image/gpt4o/generate';
            return generateWithEndpoint(endpoint, params, 'image', 'gpt4o-image', getContext());
        },

        generateImageIdeogram: async (params) => {
            const endpoint = params.input_urls?.length
                ? '/image/ideogram/character-remix'
                : '/image/ideogram/character';
            return generateWithEndpoint(endpoint, params, 'image', 'ideogram', getContext());
        },

        generateImageQwen: async (params) => {
            const endpoint = params.input_urls?.length
                ? '/image/qwen/image-to-image'
                : '/image/qwen/text-to-image';
            return generateWithEndpoint(endpoint, params, 'image', 'qwen', getContext());
        },

        generateImageGeneric: async (modelId: string, params) => {
            const endpoint = getEndpointForModel(modelId, 'image', params);
            return generateWithEndpoint(endpoint, params, 'image', modelId, getContext());
        },

        generateVideoKling: async (params) => {
            return generateWithEndpoint(
                '/video/kling/generate',
                params,
                'video',
                'kling-2.6',
                getContext(),
            );
        },

        generateVideoKlingI2V: async (params) => {
            return generateWithEndpoint(
                '/video/kling/generate',
                params,
                'video',
                'kling-2.6-i2v',
                getContext(),
            );
        },

        generateVideoWan: async (params) => {
            return generateWithEndpoint('/video/wan/generate', params, 'video', 'wan', getContext());
        },

        generateVideoVeo: async (params) => {
            const endpoint = params.image_urls?.length
                ? '/video/veo/image-to-video'
                : '/video/veo/text-to-video';
            return generateWithEndpoint(endpoint, params, 'video', 'veo3', getContext());
        },

        generateVideoSora: async (params) => {
            return generateWithEndpoint(
                '/video/sora-2/generate',
                params,
                'video',
                'sora2',
                getContext(),
            );
        },

        generateVideoRunway: async (params) => {
            const endpoint = params.image_urls?.length
                ? '/video/runway/image-to-video'
                : '/video/runway/text-to-video';
            return generateWithEndpoint(endpoint, params, 'video', 'runway-gen3', getContext());
        },

        generateVideoSeedance: async (params) => {
            const body = {
                ...params,
                aspect_ratio: params.aspect_ratio || '16:9',
            };
            return generateWithEndpoint(
                '/video/seedance/generate',
                body,
                'video',
                'seedance-pro',
                getContext(),
            );
        },

        generateVideoGeneric: async (modelId: string, params) => {
            const endpoint = getEndpointForModel(modelId, 'video', params);
            return generateWithEndpoint(endpoint, params, 'video', modelId, getContext());
        },

        generateAudioSuno: async (params) => {
            const body = {
                ...params,
                prompt: params.prompt || '',
            };
            return generateWithEndpoint(
                '/audio/suno/generate-music',
                body,
                'audio',
                'suno',
                getContext(),
            );
        },

        // Upload methods
        uploadImage: async (file: File) => {
            return uploadFile(file, 'image', (error) => set({ error }));
        },

        uploadVideo: async (file: File) => {
            return uploadFile(file, 'video', (error) => set({ error }));
        },

        // Image Tools
        upscaleTopaz: async (params) => {
            return generateWithEndpoint(
                '/upscale/topaz/upscale',
                params,
                'image',
                'topaz-upscale',
                getContext(),
            );
        },

        upscaleRecraft: async (params) => {
            return generateWithEndpoint(
                '/upscale/recraft/upscale',
                params,
                'image',
                'recraft-upscale',
                getContext(),
            );
        },

        removeBackground: async (params) => {
            return generateWithEndpoint(
                '/background-removal/recraft/remove',
                params,
                'image',
                'recraft-bg-removal',
                getContext(),
            );
        },

        // Video Tools
        klingMotionControl: async (params) => {
            return generateWithEndpoint(
                '/video/kling/motion-control',
                params,
                'video',
                'kling-motion-control',
                getContext(),
            );
        },

        seedanceStartEndFrame: async (params) => {
            return generateWithEndpoint(
                '/video/seedance/start-end-frame',
                params,
                'video',
                'seedance-start-end',
                getContext(),
            );
        },
    };
});

// Selectors
export const selectGenerations = (state: GenerationState) => state.generations;
export const selectProcessingGenerations = (state: GenerationState) =>
    state.generations.filter((g) => g.status === 'processing' || g.status === 'queued');
export const selectCompletedGenerations = (state: GenerationState) =>
    state.generations.filter((g) => g.status === 'success');
