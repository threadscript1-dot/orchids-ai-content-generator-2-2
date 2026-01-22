// Generation types and interfaces

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

export type GenerationType = 'image' | 'video' | 'audio';

// Common generation params
export interface BaseGenerationParams {
    prompt: string;
    aspect_ratio?: string;
}

export interface ImageGenerationParams extends BaseGenerationParams {
    input_urls?: string[];
    reference_urls?: string[];
    resolution?: string;
    quality?: string;
}

export interface VideoGenerationParams extends BaseGenerationParams {
    image_urls?: string[];
    duration?: number | string;
    resolution?: string;
    sound?: boolean;
    generate_audio?: boolean;
}

export interface AudioGenerationParams {
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

// Tool-specific params
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

export interface KlingMotionControlParams {
    prompt?: string;
    input_url: string;
    video_url: string;
    mode: '720p' | '1080p';
    character_orientation: 'image' | 'video';
}

export interface SeedanceStartEndFrameParams {
    prompt: string;
    start_frame_url: string;
    end_frame_url: string;
    aspect_ratio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '21:9';
    resolution?: '480p' | '720p';
    duration?: 4 | 8 | 12;
    fixed_lens?: boolean;
    generate_audio?: boolean;
}
