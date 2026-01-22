// Model endpoint mapping
// Maps model IDs to their correct backend endpoints
// The /models registry sometimes returns incorrect endpoints, so we maintain this mapping

import type { GenerationType } from './types';

interface EndpointConfig {
    endpoint: string;
    // If true, endpoint changes based on whether images are provided
    dynamicEndpoint?: {
        withImages: string;
        withoutImages: string;
    };
}

const IMAGE_ENDPOINTS: Record<string, EndpointConfig> = {
    'flux-kontext': {
        endpoint: '',
        dynamicEndpoint: {
            withImages: '/image/flux-kontext/edit',
            withoutImages: '/image/flux-kontext/generate',
        },
    },
    'gpt4o-image': {
        endpoint: '',
        dynamicEndpoint: {
            withImages: '/image/gpt4o/edit',
            withoutImages: '/image/gpt4o/generate',
        },
    },
    'flux2-flex-t2i': { endpoint: '/image/flux-2/generate' },
    'flux2-flex-i2i': { endpoint: '/image/flux-2/generate' },
    'flux2-pro-t2i': { endpoint: '/image/flux-2/generate' },
    'flux2-pro-i2i': { endpoint: '/image/flux-2/generate' },
    'imagen4-fast': { endpoint: '/image/imagen4/fast' },
    'imagen4-ultra': { endpoint: '/image/imagen4/ultra' },
    'nano-banana': { endpoint: '/image/nano-banana/generate' },
    'nano-banana-pro': { endpoint: '/image/nano-banana/generate' },
    'nano-banana-edit': { endpoint: '/image/nano-banana/generate' },
    'nano-banana-pro-i2i': { endpoint: '/image/nano-banana/generate' },
    'seedream-4': { endpoint: '/image/seedream/generate' },
    'seedream-4-5': { endpoint: '/image/seedream/generate' },
    'ideogram-character': { endpoint: '/image/ideogram/character' },
    'ideogram-character-remix': { endpoint: '/image/ideogram/character-remix' },
    'ideogram-v3-reframe': { endpoint: '/image/ideogram/reframe' },
    'qwen-t2i': { endpoint: '/image/qwen/text-to-image' },
    'qwen-i2i': { endpoint: '/image/qwen/image-to-image' },
    'qwen-edit': { endpoint: '/image/qwen/edit' },
    'grok-imagine-t2i': { endpoint: '/image/grok-imagine/generate' },
    'gpt-image-1-5-t2i': { endpoint: '/image/gpt-1.5/generate' },
    'gpt-image-1-5-i2i': { endpoint: '/image/gpt-1.5/generate' },
    midjourney: { endpoint: '/image/midjourney/generate' },
    'midjourney-t2i': { endpoint: '/image/midjourney/generate' },
    'midjourney-i2i': { endpoint: '/image/midjourney/generate' },
};

const VIDEO_ENDPOINTS: Record<string, EndpointConfig> = {
    veo3: {
        endpoint: '',
        dynamicEndpoint: {
            withImages: '/video/veo/image-to-video',
            withoutImages: '/video/veo/text-to-video',
        },
    },
    'veo3-fast': {
        endpoint: '',
        dynamicEndpoint: {
            withImages: '/video/veo/image-to-video',
            withoutImages: '/video/veo/text-to-video',
        },
    },
    'runway-gen3': { endpoint: '/video/runway/text-to-video' },
    'runway-gen3-i2v': { endpoint: '/video/runway/image-to-video' },
    'runway-aleph': { endpoint: '/video/runway/video-to-video' },
    'luma-modify': { endpoint: '/video/luma/modify' },
    'sora2-t2v': { endpoint: '/video/sora-2/generate' },
    'sora2-i2v': { endpoint: '/video/sora-2/generate' },
    'sora2-characters': { endpoint: '/video/sora-2/generate' },
    'kling-t2v': { endpoint: '/video/kling/generate' },
    'kling-i2v': { endpoint: '/video/kling/generate' },
    'seedance-pro': { endpoint: '/video/seedance/generate' },
    'seedance-pro-i2v': { endpoint: '/video/seedance/generate' },
    'bytedance-v1-pro-t2v': { endpoint: '/video/bytedance/v1-pro-t2v' },
    'bytedance-v1-lite-t2v': { endpoint: '/video/bytedance/v1-lite-t2v' },
    'bytedance-pro-fast-i2v': { endpoint: '/video/bytedance/v1-pro-fast-i2v' },
    'bytedance-pro-i2v': { endpoint: '/video/bytedance/v1-pro-i2v' },
    'bytedance-lite-i2v': { endpoint: '/video/bytedance/v1-lite-i2v' },
    'hailuo-i2v-standard': { endpoint: '/video/hailuo/image-to-video-standard' },
    'hailuo-i2v-pro': { endpoint: '/video/hailuo/image-to-video-pro' },
    'wan-t2v': { endpoint: '/video/wan/generate' },
    'wan-i2v': { endpoint: '/video/wan/generate' },
    'wan-v2v': { endpoint: '/video/wan/video-to-video' },
    'wan-animate-move': { endpoint: '/video/wan/generate' },
    'wan-animate-replace': { endpoint: '/video/wan/generate' },
    'grok-imagine-t2v': { endpoint: '/video/grok-imagine/generate' },
    'grok-imagine-i2v': { endpoint: '/video/grok-imagine/generate' },
    'grok-imagine-video': { endpoint: '/video/grok-imagine/generate' },
    'midjourney-video': { endpoint: '/video/midjourney/generate' },
    'midjourney-i2v': { endpoint: '/video/midjourney/generate' },
};

const AUDIO_ENDPOINTS: Record<string, EndpointConfig> = {
    'suno-v4': { endpoint: '/audio/suno/generate-music' },
    'suno-v4-5': { endpoint: '/audio/suno/generate-music' },
    'suno-v5': { endpoint: '/audio/suno/generate-music' },
    'elevenlabs-tts': { endpoint: '/audio/elevenlabs/text-to-speech' },
};

const DEFAULT_ENDPOINTS: Record<GenerationType, string> = {
    image: '/image/flux-2/generate',
    video: '/video/kling/generate',
    audio: '/audio/suno/generate-music',
};

/**
 * Get the endpoint for a given model ID
 * @param modelId - The model identifier
 * @param type - The generation type (image, video, audio)
 * @param params - Generation parameters (used to check if images are provided)
 * @returns The API endpoint path
 */
export function getEndpointForModel(
    modelId: string,
    type: GenerationType,
    params: Record<string, unknown>,
): string {
    const hasImages = Boolean(
        (params.image_urls as string[] | undefined)?.length ||
            (params.input_urls as string[] | undefined)?.length,
    );

    let endpoints: Record<string, EndpointConfig>;

    switch (type) {
        case 'image':
            endpoints = IMAGE_ENDPOINTS;
            break;
        case 'video':
            endpoints = VIDEO_ENDPOINTS;
            break;
        case 'audio':
            endpoints = AUDIO_ENDPOINTS;
            break;
        default:
            return DEFAULT_ENDPOINTS.image;
    }

    const config = endpoints[modelId];

    if (!config) {
        return DEFAULT_ENDPOINTS[type];
    }

    if (config.dynamicEndpoint) {
        return hasImages ? config.dynamicEndpoint.withImages : config.dynamicEndpoint.withoutImages;
    }

    return config.endpoint;
}
