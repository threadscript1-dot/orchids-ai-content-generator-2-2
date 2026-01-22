// Generation factory - unified generation method
// Eliminates duplication of 30+ nearly identical generation methods

import { api, API_BASE_URL } from '@/api/client';
import { useAuthStore } from '../auth-store';
import { useModelsStore } from '../models-store';
import { getEndpointForModel } from './endpoints';
import type { Generation, GenerationType } from './types';

interface GenerationResponse {
    id?: string;
    generation_id?: string;
    status?: string;
    cost_credits?: number;
}

interface GenerationContext {
    addGeneration: (generation: Generation) => void;
    pollGenerationStatus: (id: string) => Promise<void>;
    setError: (error: string | null) => void;
}

/**
 * Creates an optimistic generation object for immediate UI feedback
 */
function createOptimisticGeneration(
    id: string,
    type: GenerationType,
    modelId: string,
    prompt: string,
    costCredits: number,
): Generation {
    return {
        id,
        type,
        model: modelId,
        status: 'processing',
        prompt,
        cost_credits: costCredits,
        created_at: new Date().toISOString(),
    };
}

/**
 * Unified generation method that handles all model types
 * Replaces 30+ duplicate generation methods
 */
export async function generateUnified<T extends object>(
    modelId: string,
    params: T,
    context: GenerationContext,
): Promise<string | null> {
    context.setError(null);

    const model = useModelsStore.getState().getModelById(modelId);

    if (!model) {
        console.error(`[generateUnified] Model ${modelId} not found`);
        context.setError(`Model ${modelId} not found`);
        return null;
    }

    // Use endpoint from model config, fall back to mapping if invalid
    let endpoint = model.endpoint;
    if (!endpoint || endpoint.includes('undefined') || endpoint.startsWith('/v2/')) {
        endpoint = getEndpointForModel(modelId, model.type, params as Record<string, unknown>);
        console.warn(`[generateUnified] Using fallback endpoint mapping for ${modelId}`);
    }

    try {
        console.log(`[generateUnified] Calling ${endpoint} for model ${modelId}`, params);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await api.POST(endpoint as any, {
            body: params as any,
        });

        if (error) {
            const errData = error as { error?: string; message?: string } | undefined;
            const errorMessage = errData?.message || errData?.error || 'Generation failed';
            console.error(`[generateUnified] API error:`, error);
            context.setError(errorMessage);
            return null;
        }

        if (!data) {
            console.error(`[generateUnified] No data returned from API`);
            context.setError('Generation failed - no data returned');
            return null;
        }

        const genData = data as GenerationResponse;
        const generationId = genData.id || genData.generation_id;

        if (!generationId) {
            console.error(`[generateUnified] No generation ID in response:`, data);
            context.setError('Generation failed - no ID returned');
            return null;
        }

        const optimisticGen = createOptimisticGeneration(
            generationId,
            model.type,
            model.id,
            (params as { prompt?: string }).prompt || '',
            genData.cost_credits || model.credits_cost || 0,
        );

        context.addGeneration(optimisticGen);
        context.pollGenerationStatus(generationId);

        console.log(`[generateUnified] Generation started: ${generationId}`);
        return generationId;
    } catch (err) {
        console.error(`[generateUnified] Exception:`, err);
        context.setError(err instanceof Error ? err.message : 'Generation error');
        return null;
    }
}

/**
 * Generic generation method for specific endpoint
 * Used by legacy methods that need specific endpoints
 */
export async function generateWithEndpoint<T extends object>(
    endpoint: string,
    params: T,
    type: GenerationType,
    modelId: string,
    context: GenerationContext,
): Promise<string | null> {
    context.setError(null);

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await api.POST(endpoint as any, {
            body: params as any,
        });

        if (error || !data) {
            context.setError('Generation failed');
            return null;
        }

        const genData = data as GenerationResponse;
        const generationId = genData.id || genData.generation_id;

        if (!generationId) {
            context.setError('Generation failed - no ID returned');
            return null;
        }

        const optimisticGen = createOptimisticGeneration(
            generationId,
            type,
            modelId,
            (params as { prompt?: string }).prompt || '',
            genData.cost_credits || 0,
        );

        context.addGeneration(optimisticGen);
        context.pollGenerationStatus(generationId);

        return generationId;
    } catch (err) {
        context.setError(err instanceof Error ? err.message : 'Generation error');
        return null;
    }
}

/**
 * Upload file (image or video)
 */
export async function uploadFile(
    file: File,
    type: 'image' | 'video',
    setError: (error: string | null) => void,
): Promise<string | null> {
    const token = useAuthStore.getState().token;
    if (!token) {
        setError('Not authenticated');
        return null;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        const endpoint = type === 'image' ? '/upload/image' : '/upload/video';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            setError('Upload failed');
            return null;
        }

        const data = await response.json();
        return data.url as string;
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload error');
        return null;
    }
}
