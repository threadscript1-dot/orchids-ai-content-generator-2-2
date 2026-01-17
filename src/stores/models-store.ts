'use client';

import { create } from 'zustand';
import { api } from '@/api/client';

export interface ModelConstraints {
    aspectRatios?: string[];
    durations?: string[];
    resolutions?: string[];
    maxImages?: number;
    maxSize?: number;
}

export interface ModelPricing {
    base: number;
    dimensions?: Array<{
        name: string;
        options: Array<{
            value: string;
            multiplier: number;
        }>;
    }>;
    currency: string;
}

export interface Model {
    id: string;
    name: string;
    type: 'image' | 'video' | 'audio';
    vendor: string;
    capability: string;
    capabilities: string[];
    credits_cost: number;
    pricing: ModelPricing;
    constraints?: ModelConstraints;
    description?: string;
}

interface ModelsState {
    models: Model[];
    imageModels: Model[];
    videoModels: Model[];
    audioModels: Model[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    fetchModels: () => Promise<void>;
    getModelById: (id: string) => Model | undefined;
    getModelsByType: (type: 'image' | 'video' | 'audio') => Model[];
    getModelsByCapability: (capability: string) => Model[];
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useModelsStore = create<ModelsState>()((set, get) => ({
    models: [],
    imageModels: [],
    videoModels: [],
    audioModels: [],
    isLoading: false,
    error: null,
    lastFetched: null,

    fetchModels: async () => {
        const { lastFetched, models } = get();

        // Use cache if data is fresh
        if (lastFetched && models.length > 0 && Date.now() - lastFetched < CACHE_DURATION) {
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const { data, error } = await api.GET('/models');

            if (error) {
                set({ error: 'Failed to fetch models', isLoading: false });
                return;
            }

            if (data) {
                const allModels = (data.models || []) as Model[];
                const imageModels = (data.image_models || []) as Model[];
                const videoModels = (data.video_models || []) as Model[];
                const audioModels = (data.audio_models || []) as Model[];

                set({
                    models: allModels,
                    imageModels,
                    videoModels,
                    audioModels,
                    isLoading: false,
                    lastFetched: Date.now(),
                });
            }
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Network error',
                isLoading: false,
            });
        }
    },

    getModelById: (id: string) => {
        return get().models.find((m) => m.id === id);
    },

    getModelsByType: (type: 'image' | 'video' | 'audio') => {
        switch (type) {
            case 'image':
                return get().imageModels;
            case 'video':
                return get().videoModels;
            case 'audio':
                return get().audioModels;
            default:
                return [];
        }
    },

    getModelsByCapability: (capability: string) => {
        return get().models.filter(
            (m) => m.capability === capability || m.capabilities?.includes(capability)
        );
    },
}));

// Selectors
export const selectImageModels = (state: ModelsState) => state.imageModels;
export const selectVideoModels = (state: ModelsState) => state.videoModels;
export const selectAudioModels = (state: ModelsState) => state.audioModels;
export const selectModelsLoading = (state: ModelsState) => state.isLoading;
