// Generation hook types

import type { Model, AttachmentConfig } from '@/stores/models-store';
import type { UploadedImage } from '@/types/generation';

export type GenerationType = 'image' | 'video' | 'audio';

export interface GenerationParams {
    prompt: string;
    aspect_ratio?: string;
    resolution?: string;
    duration?: string | number;
    quality?: string;
    sound?: boolean;
    mode?: string;
    negative_prompt?: string;
    prompt_enhancement?: boolean;
    translate?: boolean;
    remove_watermark?: boolean;
    upscale?: boolean;
    safety_tolerance?: number;
    strength?: number;
    n?: number;
    [key: string]: unknown;
}

export interface GenerationFormState {
    prompt: string;
    aspectRatio: string;
    resolution: string;
    duration: string;
    quality: string;
    sound: boolean;
    // Advanced options
    negativePrompt: string;
    promptEnhancement: boolean;
    translation: boolean;
    removeWatermark: boolean;
    upscale: boolean;
    safetyTolerance: number;
    strength: number;
    variants: number;
}

export interface ModelConstraints {
    availableAspectRatios: string[];
    availableResolutions: string[];
    availableDurations: string[];
    supportsNegativePrompt: boolean;
    supportsPromptEnhancement: boolean;
    supportsTranslation: boolean;
    supportsWatermark: boolean;
    supportsUpscale: boolean;
    supportsStrength: boolean;
    safetyToleranceRange: [number, number] | null;
    maxVariants: number | null;
    supportsAudio: boolean;
}

export interface AttachmentState {
    attachmentConfig: AttachmentConfig | undefined;
    requiresUpload: boolean;
    supportsUpload: boolean;
    maxFiles: number;
    acceptedMimeTypes: string[];
}

export interface UseUnifiedGenerationOptions {
    type: GenerationType;
    maxFiles?: number;
    language?: 'ru' | 'en';
}

export const DEFAULT_FORM_STATE: GenerationFormState = {
    prompt: '',
    aspectRatio: '1:1',
    resolution: '1K',
    duration: '5',
    quality: 'basic',
    sound: false,
    negativePrompt: '',
    promptEnhancement: false,
    translation: false,
    removeWatermark: false,
    upscale: false,
    safetyTolerance: 3,
    strength: 0.75,
    variants: 1,
};

export const DEFAULT_ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
export const DEFAULT_RESOLUTIONS = ['1K', '2K'];
export const DEFAULT_DURATIONS = ['5', '10'];
