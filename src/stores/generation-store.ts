'use client';

import { create } from 'zustand';
import { api, API_BASE_URL } from '@/api/client';
import { useAuthStore } from './auth-store';

export interface GenerationAsset {
    url: string;
    mime: string;
    size?: number;
}

export interface Generation {
    id: string;
    type: 'image' | 'video' | 'audio';
    model: string;
    status: 'queued' | 'processing' | 'success' | 'failed';
    prompt: string;
    cost_credits: number;
    result_assets?: GenerationAsset[];
    error?: string;
    created_at: string;
    updated_at?: string;
    is_favorite?: boolean;
}

interface GenerationState {
    generations: Generation[];
    activePolling: Set<string>;
    isLoading: boolean;
    error: string | null;

    // History pagination
    hasMore: boolean;
    offset: number;

    // Actions
    addGeneration: (generation: Generation) => void;
    updateGeneration: (id: string, updates: Partial<Generation>) => void;
    removeGeneration: (id: string) => void;
    toggleFavorite: (id: string) => Promise<void>;

    // Likes
    likedIds: Set<string>;
    fetchLikedIds: () => Promise<void>;

    // API methods
    fetchHistory: (reset?: boolean) => Promise<void>;
    pollGenerationStatus: (id: string) => Promise<void>;
    stopPolling: (id: string) => void;
    stopAllPolling: () => void;

    // Generation methods - Image
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

    // Generation methods - Video
    generateVideoKling: (params: KlingTextToVideoParams) => Promise<string | null>;
    generateVideoKlingI2V: (params: KlingImageToVideoParams) => Promise<string | null>;
    generateVideoWan: (params: WanParams) => Promise<string | null>;
    generateVideoVeo: (params: VeoParams) => Promise<string | null>;
    generateVideoSora: (params: SoraParams) => Promise<string | null>;
    generateVideoRunway: (params: RunwayParams) => Promise<string | null>;
    generateVideoSeedance: (params: SeedanceParams) => Promise<string | null>;
    generateVideoGeneric: (modelId: string, params: GenericVideoParams) => Promise<string | null>;

    // Generation methods - Audio
    generateAudioSuno: (params: SunoParams) => Promise<string | null>;

    // Upload
    uploadImage: (file: File) => Promise<string | null>;
    uploadVideo: (file: File) => Promise<string | null>;

    // Image Tools - Upscale
    upscaleTopaz: (params: TopazUpscaleParams) => Promise<string | null>;
    upscaleRecraft: (params: RecraftUpscaleParams) => Promise<string | null>;

    // Image Tools - Background Removal
    removeBackground: (params: RemoveBackgroundParams) => Promise<string | null>;
}

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
    [key: string]: any;
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
    [key: string]: any;
}

export interface SunoParams {
    prompt: string;
    model: 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';
    custom_mode: boolean;
    instrumental: boolean;
    style?: string;
    title?: string;
    vocal_gender?: 'm' | 'f';
    style_weight?: number;
}

export interface TopazUpscaleParams {
    image_url: string;
    upscale_factor: '1' | '2' | '4' | '8';
}

export interface RecraftUpscaleParams {
    image: string;
}

export interface RemoveBackgroundParams {
    image: string;
}

const POLL_INTERVAL = 5000;
const MAX_POLL_ATTEMPTS = 120;

const pollingIntervals = new Map<string, NodeJS.Timeout>();

export const useGenerationStore = create<GenerationState>()((set, get) => ({
    generations: [],
    activePolling: new Set(),
    isLoading: false,
    error: null,
    hasMore: true,
    offset: 0,
    likedIds: new Set<string>(),

    fetchLikedIds: async () => {
        try {
            const { data, error } = await api.GET('/likes/my');
            if (error) {
                console.error('Failed to fetch liked IDs:', error);
                return;
            }

            if (data && typeof data === 'object' && 'data' in data) {
                const result = (data as any).data;
                if (result && Array.isArray(result.generation_ids)) {
                    const likedSet = new Set<string>(result.generation_ids);
                    set({ likedIds: likedSet });

                    // Update is_favorite on existing generations
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

    toggleFavorite: async (id: string) => {
        const gen = get().generations.find((g) => g.id === id);
        if (!gen) return;

        const newState = !gen.is_favorite;
        // Optimistic update
        get().updateGeneration(id, { is_favorite: newState });

        try {
            const { data, error } = await api.POST('/likes/toggle', {
                body: { generation_id: id },
            });

            if (error) {
                // Revert on error
                get().updateGeneration(id, { is_favorite: !newState });
                console.error('Failed to toggle like:', error);
                return;
            }

            // Sync with server response
            if (data && typeof data === 'object' && 'data' in data) {
                const result = (data as any).data;
                if (result && typeof result.liked === 'boolean') {
                    get().updateGeneration(id, { is_favorite: result.liked });
                }
            }
        } catch (err) {
            // Revert on error
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
                Array.isArray((data as any).data)
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
                    // Ensure uniqueness by ID
                    const uniqueGenerations = Array.from(
                        new Map(newGenerations.map((g) => [g.id, g])).values()
                    );

                    // Apply liked status from likedIds
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

                // Fetch liked IDs on initial load to sync favorites
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

                        // Refresh user credits after generation completes
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
                return;
            }
        };

        // Initial poll
        await poll();

        // Set up interval
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

    // Image generation methods
    generateImageFlux2: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/flux-2/text-to-image', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'flux-2-pro',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageFlux2I2I: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/flux-2/image-to-image', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'flux-2-pro-i2i',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageImagen4Fast: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/imagen4/fast', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'imagen4-fast',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageImagen4Ultra: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/imagen4/ultra', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'imagen4-ultra',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageSeedream: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/seedream/text-to-image', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'seedream-4.5',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageNanoBanana: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/nano-banana/generate', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'nano-banana-pro',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageGrokImagine: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/image/grok-imagine/text-to-image', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'grok-imagine',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageFluxKontext: async (params) => {
        set({ error: null });
        try {
            const endpoint = params.input_urls?.length
                ? '/image/flux-kontext/edit'
                : '/image/flux-kontext/generate';
            const { data, error } = await api.POST(endpoint as any, {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'flux-kontext',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageGPT4o: async (params) => {
        set({ error: null });
        try {
            const endpoint = params.input_urls?.length
                ? '/image/gpt4o/edit'
                : '/image/gpt4o/generate';
            const { data, error } = await api.POST(endpoint as any, {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'gpt4o-image',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageIdeogram: async (params) => {
        set({ error: null });
        try {
            const endpoint = params.input_urls?.length
                ? '/image/ideogram/character-remix'
                : '/image/ideogram/character';
            const { data, error } = await api.POST(endpoint as any, {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'ideogram',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateImageQwen: async (params) => {
        set({ error: null });
        try {
            const endpoint = params.input_urls?.length
                ? '/image/qwen/image-to-image'
                : '/image/qwen/text-to-image';
            const { data, error } = await api.POST(endpoint as any, {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'qwen',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    // Generic image generation that maps model ID to correct endpoint
    generateImageGeneric: async (modelId: string, params) => {
        set({ error: null });

        // Model ID to endpoint mapping
        const modelEndpointMap: Record<string, string> = {
            'flux-kontext': params.input_urls?.length
                ? '/image/flux-kontext/edit'
                : '/image/flux-kontext/generate',
            'gpt4o-image': params.input_urls?.length
                ? '/image/gpt4o/edit'
                : '/image/gpt4o/generate',
            'flux2-flex-t2i': '/image/flux-2/text-to-image',
            'flux2-flex-i2i': '/image/flux-2/image-to-image',
            'flux2-pro-t2i': '/image/flux-2/text-to-image',
            'flux2-pro-i2i': '/image/flux-2/image-to-image',
            'imagen4-fast': '/image/imagen4/fast',
            'imagen4-ultra': '/image/imagen4/ultra',
            'nano-banana': '/image/nano-banana/generate',
            'nano-banana-pro': '/image/nano-banana/generate',
            'nano-banana-edit': '/image/nano-banana/generate',
            'nano-banana-pro-i2i': '/image/nano-banana/generate',
            'seedream-4': '/image/seedream/text-to-image',
            'seedream-4-5': '/image/seedream/text-to-image',
            'ideogram-character': '/image/ideogram/character',
            'ideogram-character-remix': '/image/ideogram/character-remix',
            'ideogram-v3-reframe': '/image/ideogram/reframe',
            'qwen-t2i': '/image/qwen/text-to-image',
            'qwen-i2i': '/image/qwen/image-to-image',
            'qwen-edit': '/image/qwen/edit',
            'grok-imagine-t2i': '/image/grok-imagine/text-to-image',
            'z-image': '/image/flux-2/text-to-image', // fallback
            'gpt-image-1-5-t2i': '/image/gpt4o/generate',
            'gpt-image-1-5-i2i': '/image/gpt4o/edit',
        };

        const endpoint = modelEndpointMap[modelId] || '/image/flux-2/text-to-image';

        try {
            const { data, error } = await api.POST(endpoint as any, {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: modelId,
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    // Video generation methods
    generateVideoKling: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/video/kling/text-to-video', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: 'kling-2.6',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateVideoKlingI2V: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/video/kling/image-to-video', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: 'kling-2.6-i2v',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateVideoWan: async (params) => {
        set({ error: null });
        try {
            const endpoint = params.image_urls?.length
                ? '/video/wan/image-to-video'
                : '/video/wan/text-to-video';
            const { data, error } = await api.POST(endpoint as any, {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: 'wan',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateVideoVeo: async (params) => {
        set({ error: null });
        try {
            const endpoint = params.image_urls?.length
                ? '/video/veo/image-to-video'
                : '/video/veo/text-to-video';
            const { data, error } = await api.POST(endpoint as any, {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: 'veo3',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateVideoSora: async (params) => {
        set({ error: null });
        try {
            const endpoint = params.image_urls?.length
                ? '/video/sora-2/image-to-video'
                : '/video/sora-2/text-to-video';
            const { data, error } = await api.POST(endpoint as any, {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: 'sora2',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateVideoRunway: async (params) => {
        set({ error: null });
        try {
            const endpoint = params.image_urls?.length
                ? '/video/runway/image-to-video'
                : '/video/runway/text-to-video';
            const { data, error } = await api.POST(endpoint as any, {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: 'runway-gen3',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    generateVideoSeedance: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/video/seedance/generate', {
                body: {
                    ...params,
                    aspect_ratio: params.aspect_ratio || '16:9',
                } as any,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: 'seedance-pro',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    // Generic video generation that maps model ID to correct endpoint
    generateVideoGeneric: async (modelId: string, params) => {
        set({ error: null });

        const hasImages = params.image_urls?.length;

        // Model ID to endpoint mapping
        const modelEndpointMap: Record<string, string> = {
            veo3: hasImages ? '/video/veo/image-to-video' : '/video/veo/text-to-video',
            'veo3-fast': hasImages ? '/video/veo/image-to-video' : '/video/veo/text-to-video',
            'runway-gen3': '/video/runway/text-to-video',
            'runway-gen3-i2v': '/video/runway/image-to-video',
            'runway-aleph': '/video/runway/video-to-video',
            'luma-modify': '/video/luma/modify',
            'sora2-t2v': '/video/sora-2/text-to-video',
            'sora2-i2v': '/video/sora-2/image-to-video',
            'sora2-characters': '/video/sora-2/image-to-video',
            'kling-t2v': '/video/kling/text-to-video',
            'kling-i2v': '/video/kling/image-to-video',
            'seedance-pro': '/video/seedance/generate',
            'seedance-pro-i2v': '/video/seedance/generate',
            'bytedance-v1-pro-t2v': '/video/bytedance/v1-pro-t2v',
            'bytedance-v1-lite-t2v': '/video/bytedance/v1-lite-t2v',
            'bytedance-pro-fast-i2v': '/video/bytedance/v1-pro-fast-i2v',
            'bytedance-pro-i2v': '/video/bytedance/v1-pro-i2v',
            'bytedance-lite-i2v': '/video/bytedance/v1-lite-i2v',
            'hailuo-i2v-standard': '/video/hailuo/image-to-video-standard',
            'hailuo-i2v-pro': '/video/hailuo/image-to-video-pro',
            'wan-t2v': '/video/wan/text-to-video',
            'wan-i2v': '/video/wan/image-to-video',
            'wan-v2v': '/video/wan/video-to-video',
            'wan-animate-move': '/video/wan/image-to-video',
            'wan-animate-replace': '/video/wan/image-to-video',
            'grok-imagine-t2v': '/video/grok-imagine/text-to-video',
            'grok-imagine-i2v': '/video/grok-imagine/image-to-video',
        };

        const endpoint =
            modelEndpointMap[modelId] ||
            (hasImages ? '/video/kling/image-to-video' : '/video/kling/text-to-video');

        try {
            const { data, error } = await api.POST(endpoint as any, {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'video',
                model: modelId,
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    // Audio generation
    generateAudioSuno: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/audio/suno/generate-music', {
                body: params,
            });

            if (error || !data) {
                set({ error: 'Generation failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'audio',
                model: 'suno',
                status: 'processing',
                prompt: params.prompt,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Generation error' });
            return null;
        }
    },

    // Upload methods
    uploadImage: async (file: File) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            set({ error: 'Not authenticated' });
            return null;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/upload/image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                set({ error: 'Upload failed' });
                return null;
            }

            const data = await response.json();
            return data.url as string;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Upload error' });
            return null;
        }
    },

    uploadVideo: async (file: File) => {
        const token = useAuthStore.getState().token;
        if (!token) {
            set({ error: 'Not authenticated' });
            return null;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/upload/video`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                set({ error: 'Upload failed' });
                return null;
            }

            const data = await response.json();
            return data.url as string;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Upload error' });
            return null;
        }
    },

    // Image Tools - Upscale
    upscaleTopaz: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/upscale/topaz/upscale', {
                body: params,
            });

            if (error || !data) {
                const errData = error as { error?: string; message?: string } | undefined;
                set({ error: errData?.message || errData?.error || 'Upscale failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'topaz-upscale',
                status: 'processing',
                prompt: `Upscale ${params.upscale_factor}x`,
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Upscale error' });
            return null;
        }
    },

    upscaleRecraft: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/upscale/recraft/upscale', {
                body: params,
            });

            if (error || !data) {
                const errData = error as { error?: string; message?: string } | undefined;
                set({ error: errData?.message || errData?.error || 'Upscale failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'recraft-upscale',
                status: 'processing',
                prompt: 'Recraft AI Upscale',
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Upscale error' });
            return null;
        }
    },

    // Image Tools - Background Removal
    removeBackground: async (params) => {
        set({ error: null });
        try {
            const { data, error } = await api.POST('/background-removal/recraft/remove', {
                body: params,
            });

            if (error || !data) {
                const errData = error as { error?: string; message?: string } | undefined;
                set({ error: errData?.message || errData?.error || 'Background removal failed' });
                return null;
            }

            const genData = data as { id: string; status: string; cost_credits: number };
            const optimisticGen: Generation = {
                id: genData.id,
                type: 'image',
                model: 'recraft-bg-removal',
                status: 'processing',
                prompt: 'Remove Background',
                cost_credits: genData.cost_credits,
                created_at: new Date().toISOString(),
            };

            get().addGeneration(optimisticGen);
            get().pollGenerationStatus(genData.id);

            return genData.id;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Background removal error' });
            return null;
        }
    },
}));

// Selectors
export const selectGenerations = (state: GenerationState) => state.generations;
export const selectProcessingGenerations = (state: GenerationState) =>
    state.generations.filter((g) => g.status === 'processing' || g.status === 'queued');
export const selectCompletedGenerations = (state: GenerationState) =>
    state.generations.filter((g) => g.status === 'success');
