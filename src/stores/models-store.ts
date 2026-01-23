'use client';

import { create } from 'zustand';
import { api } from '@/api/client';

// ============================================================================
// Types
// ============================================================================

export interface ModelConstraints {
    // Common
    aspectRatios?: string[];
    promptRequired?: boolean;

    // Video-specific
    maxDuration?: number;
    minDuration?: number;
    durations?: number[]; // Available duration options (e.g., [5, 10])
    resolutions?: string[]; // e.g., ['720p', '1080p']
    defaultResolution?: string;
    supportsAudio?: boolean; // Whether model can generate audio with video

    // Image-specific
    outputFormats?: string[]; // e.g., ['png', 'jpg', 'webp']
    maxVariants?: number; // Max number of variations (GPT-4o: 1, 2, 4)
    supportsMask?: boolean; // For inpainting
    minInputImages?: number; // Min reference images (0 for optional, 1+ for required)
    maxInputImages?: number; // Max reference images
    supportsStrength?: boolean; // For image-to-image strength control
    supportsNegativePrompt?: boolean; // For negative prompt support

    // Audio/Music-specific
    maxMusicDuration?: number; // In seconds
    kieModelVersion?: string;
    supportedModels?: string[];
    supportsInstrumental?: boolean;
    supportsLyrics?: boolean;
    supportsCustomMode?: boolean;
    musicStyles?: string[];
    supportsVocalGender?: boolean;
    supportsStyleWeight?: boolean;
    supportsWeirdnessConstraint?: boolean;
    supportsAudioWeight?: boolean;
    supportsNegativeTags?: boolean;
    supportsPersona?: boolean;
    maxPromptLength?: number;
    maxStyleLength?: number;
    maxTitleLength?: number;

    // Advanced options
    supportsPromptEnhancement?: boolean;
    supportsTranslation?: boolean;
    supportsWatermark?: boolean;
    supportsUpscale?: boolean; // For models with 1080p upgrade option
    safetyToleranceRange?: [number, number]; // e.g., [0, 6] for Flux

    // Generation modes (for multi-mode models like Veo)
    generationModes?: string[];
}

export interface PricingDimension {
    name: string;
    options: Array<{
        value: string;
        multiplier: number;
    }>;
}

export interface ModelPricing {
    base: number;
    dimensions?: PricingDimension[];
    currency: string;
    version?: string;
    source?: string;
    updatedAt?: string;
}

export interface AttachmentConfig {
    type: 'image' | 'video' | 'audio';
    mode: 'none' | 'optional' | 'required';
    fieldName: string;
    minCount?: number; // Minimum files required (0 for optional, 1+ for required)
    maxCount: number;
    maxSizeBytes?: number;
    acceptedMimeTypes?: string[];
}

export interface Model {
    id: string;
    name: string;
    description: string;
    type: 'image' | 'video' | 'audio';
    vendor: string;
    endpoint: string;
    capabilities: string[];
    attachments: AttachmentConfig[];
    pricing: ModelPricing;
    constraints?: ModelConstraints;
    credits_cost: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a model has a specific capability
 */
export function hasCapability(model: Model, capability: string): boolean {
    return model.capabilities?.includes(capability) ?? false;
}

/**
 * Get attachment configuration for a specific type
 */
export function getAttachmentConfig(
    model: Model,
    type: 'image' | 'video' | 'audio',
): AttachmentConfig | undefined {
    return model.attachments?.find((a) => a.type === type);
}

/**
 * Check if model requires a specific attachment type
 */
export function requiresAttachment(model: Model, type: 'image' | 'video' | 'audio'): boolean {
    const config = getAttachmentConfig(model, type);
    return config?.mode === 'required';
}

/**
 * Check if model supports optional attachment of a specific type
 */
export function supportsAttachment(model: Model, type: 'image' | 'video' | 'audio'): boolean {
    const config = getAttachmentConfig(model, type);
    return config?.mode === 'optional' || config?.mode === 'required';
}

/**
 * Calculate estimated price based on selected dimensions
 */
export function calculatePrice(model: Model, selectedDimensions?: Record<string, string>): number {
    let price = model.pricing.base;

    if (model.pricing.dimensions && selectedDimensions) {
        for (const dimension of model.pricing.dimensions) {
            const selectedValue = selectedDimensions[dimension.name];
            if (selectedValue) {
                const option = dimension.options.find((o) => o.value === selectedValue);
                if (option) {
                    price *= option.multiplier;
                }
            }
        }
    }

    return Math.round(price);
}

/**
 * Get the field name for attachments in API request
 */
export function getAttachmentFieldName(
    model: Model,
    type: 'image' | 'video' | 'audio',
): string | undefined {
    const config = getAttachmentConfig(model, type);
    return config?.fieldName;
}

/**
 * Validate files against attachment config
 */
export function validateAttachment(
    config: AttachmentConfig,
    files: File[],
): { valid: boolean; error?: string } {
    // Check minimum count
    const minCount = config.minCount ?? (config.mode === 'required' ? 1 : 0);
    if (files.length < minCount) {
        return {
            valid: false,
            error: minCount === 1
                ? 'At least 1 file required'
                : `At least ${minCount} file(s) required`,
        };
    }

    // Check maximum count
    if (files.length > config.maxCount) {
        return {
            valid: false,
            error: `Maximum ${config.maxCount} file(s) allowed`,
        };
    }

    if (config.maxSizeBytes) {
        for (const file of files) {
            if (file.size > config.maxSizeBytes) {
                const maxMb = Math.round(config.maxSizeBytes / (1024 * 1024));
                return {
                    valid: false,
                    error: `File "${file.name}" exceeds maximum size of ${maxMb}MB`,
                };
            }
        }
    }

    if (config.acceptedMimeTypes && config.acceptedMimeTypes.length > 0) {
        for (const file of files) {
            const isAccepted = config.acceptedMimeTypes.some((mime) => {
                if (mime.endsWith('/*')) {
                    return file.type.startsWith(mime.replace('/*', '/'));
                }
                return file.type === mime;
            });
            if (!isAccepted) {
                return {
                    valid: false,
                    error: `File "${file.name}" has unsupported format`,
                };
            }
        }
    }

    return { valid: true };
}

// ============================================================================
// Store
// ============================================================================

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

                // Filter models by capabilities
                const imageModels = allModels.filter(
                    (m) => hasCapability(m, 'text-to-image') || hasCapability(m, 'image-to-image'),
                );
                const videoModels = allModels.filter(
                    (m) => hasCapability(m, 'text-to-video') || hasCapability(m, 'image-to-video'),
                );
                const audioModels = allModels.filter(
                    (m) => hasCapability(m, 'text-to-audio') || m.type === 'audio',
                );

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
        return get().models.filter((m) => hasCapability(m, capability));
    },
}));

// Selectors
export const selectImageModels = (state: ModelsState) => state.imageModels;
export const selectVideoModels = (state: ModelsState) => state.videoModels;
export const selectAudioModels = (state: ModelsState) => state.audioModels;
export const selectModelsLoading = (state: ModelsState) => state.isLoading;
