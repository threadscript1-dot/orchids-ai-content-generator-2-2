'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useModelsStore } from '@/stores/models-store';
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { useUnifiedGeneration } from '@/hooks/useUnifiedGeneration';

type GenerationType = 'image' | 'video';

interface UseGenerationPageOptions {
    type: GenerationType;
    initialModelId?: string;
    defaultModel: string;
    maxFiles: number;
    language: 'ru' | 'en';
}

export function useGenerationPage({
    type,
    initialModelId,
    defaultModel,
    maxFiles,
    language,
}: UseGenerationPageOptions) {
    const router = useRouter();

    // Stores
    const { fetchModels } = useModelsStore();
    const { generations, fetchHistory, toggleFavorite } = useGenerationStore();

    // Unified generation hook
    const generation = useUnifiedGeneration({
        type,
        maxFiles,
        language,
    });

    // Local UI state
    const [gridSize, setGridSize] = useState([250]);
    const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
    const [selectedItem, setSelectedItem] = useState<Generation | null>(null);

    // Fetch models and history on mount
    useEffect(() => {
        fetchModels();
        fetchHistory(true);
    }, [fetchModels, fetchHistory]);

    // Set model from URL path
    useEffect(() => {
        if (generation.models.length > 0) {
            const modelId = initialModelId || defaultModel;
            const foundModel = generation.models.find(
                (m) => m.id === modelId || m.name === modelId,
            );
            if (foundModel && generation.selectedModelId !== foundModel.id) {
                generation.setSelectedModelId(foundModel.id);
            } else if (!foundModel && generation.models.length > 0 && !generation.selectedModelId) {
                generation.setSelectedModelId(generation.models[0].id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generation.models.length, initialModelId, defaultModel]);

    // Navigate to model URL when model changes
    const handleModelChange = useCallback(
        (modelId: string) => {
            generation.syncToStore();
            generation.setSelectedModelId(modelId);
            router.push(`/app/create/${type}/${modelId}`);
        },
        [generation, router, type],
    );

    // Build aspect ratio options
    const aspectRatioOptions = useMemo(
        () =>
            generation.availableAspectRatios.map((ar) => ({
                id: ar,
                name: ar,
            })),
        [generation.availableAspectRatios],
    );

    // Build resolution options (for images)
    const resolutionOptions = useMemo(
        () =>
            generation.availableResolutions.map((res) => ({
                id: res,
                name: res,
            })),
        [generation.availableResolutions],
    );

    // Filter generations by type
    const filteredGenerations = useMemo(
        () => generations.filter((g) => g.type === type),
        [generations, type],
    );

    // Remix handler
    const handleRemix = useCallback(
        (gen: Generation) => {
            generation.setPrompt(gen.prompt);
            const foundModel = generation.models.find(
                (m) => m.id === gen.model || m.name === gen.model,
            );
            if (foundModel) generation.setSelectedModelId(foundModel.id);
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        },
        [generation],
    );

    // Generate handler
    const handleGenerate = useCallback(async () => {
        await generation.generate();
    }, [generation]);

    // Grid style calculation
    const gridStyle = useMemo(
        () => ({
            gridTemplateColumns:
                typeof window !== 'undefined' && window.innerWidth > 640
                    ? `repeat(auto-fill, minmax(${gridSize[0]}px, 1fr))`
                    : undefined,
        }),
        [gridSize],
    );

    const gridClassName = useMemo(
        () =>
            `grid gap-2 ${
                viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-none' : 'grid-cols-1 sm:grid-cols-none'
            }`,
        [viewMode],
    );

    return {
        // Generation hook
        generation,

        // UI state
        gridSize,
        setGridSize,
        viewMode,
        setViewMode,
        selectedItem,
        setSelectedItem,

        // Derived data
        aspectRatioOptions,
        resolutionOptions,
        filteredGenerations,
        gridStyle,
        gridClassName,

        // Handlers
        handleModelChange,
        handleRemix,
        handleGenerate,
        toggleFavorite,
    };
}
