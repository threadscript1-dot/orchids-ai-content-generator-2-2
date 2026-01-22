'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePendingGenerationStore } from '@/stores/pending-generation-store';
import {
    type GenerationType,
    type GenerationFormState,
    type ModelConstraints,
    DEFAULT_FORM_STATE,
} from './types';

interface UseGenerationFormOptions {
    type: GenerationType;
    constraints: ModelConstraints;
}

interface UseGenerationFormReturn {
    formState: GenerationFormState;
    setFormState: React.Dispatch<React.SetStateAction<GenerationFormState>>;
    setPrompt: (prompt: string) => void;
    setAspectRatio: (ratio: string) => void;
    setResolution: (resolution: string) => void;
    setDuration: (duration: string) => void;
    setQuality: (quality: string) => void;
    setSound: (sound: boolean) => void;
    setNegativePrompt: (value: string) => void;
    setPromptEnhancement: (value: boolean) => void;
    setTranslation: (value: boolean) => void;
    setRemoveWatermark: (value: boolean) => void;
    setUpscale: (value: boolean) => void;
    setSafetyTolerance: (value: number) => void;
    setStrength: (value: number) => void;
    setVariants: (value: number) => void;
    syncToStore: () => void;
    resetForm: () => void;
}

export function useGenerationForm(options: UseGenerationFormOptions): UseGenerationFormReturn {
    const { type, constraints } = options;

    const pendingStore = usePendingGenerationStore();

    // Get form state from pending store - reactive to store changes
    const pendingFormState = usePendingGenerationStore((state) => state[type].formState);
    const pendingFormLastUpdated = usePendingGenerationStore((state) => state[type].lastUpdated);

    // Form state - initialize from pending store
    const [formState, setFormState] = useState<GenerationFormState>(() => {
        const pending = pendingStore.getState(type);
        if (pending.formState.prompt || pending.uploadedFiles.length > 0) {
            return { ...DEFAULT_FORM_STATE, ...pending.formState } as GenerationFormState;
        }
        return DEFAULT_FORM_STATE;
    });

    // Track last processed form update
    const lastProcessedFormUpdateRef = useRef(0);

    // Update form state when pending store changes (e.g., from prepareNavigation)
    useEffect(() => {
        if (
            pendingFormLastUpdated > lastProcessedFormUpdateRef.current &&
            pendingFormState.prompt
        ) {
            setFormState((s) => ({ ...s, prompt: pendingFormState.prompt }));
            lastProcessedFormUpdateRef.current = pendingFormLastUpdated;
        }
    }, [pendingFormState, pendingFormLastUpdated]);

    // Sync form state to pending store (debounced)
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
            pendingStore.setFormState(type, formState);
        }, 100);
        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [formState, type, pendingStore]);

    // Auto-correct form state when constraints change
    useEffect(() => {
        setFormState((s) => {
            let updated = { ...s };
            let changed = false;

            if (!constraints.availableAspectRatios.includes(s.aspectRatio)) {
                updated.aspectRatio = constraints.availableAspectRatios[0] || '1:1';
                changed = true;
            }
            if (!constraints.availableResolutions.includes(s.resolution)) {
                updated.resolution = constraints.availableResolutions[0] || '1K';
                changed = true;
            }
            if (!constraints.availableDurations.includes(s.duration)) {
                updated.duration = constraints.availableDurations[0] || '5';
                changed = true;
            }

            return changed ? updated : s;
        });
    }, [constraints]);

    // Individual setters
    const setPrompt = useCallback((prompt: string) => setFormState((s) => ({ ...s, prompt })), []);
    const setAspectRatio = useCallback(
        (aspectRatio: string) => setFormState((s) => ({ ...s, aspectRatio })),
        [],
    );
    const setResolution = useCallback(
        (resolution: string) => setFormState((s) => ({ ...s, resolution })),
        [],
    );
    const setDuration = useCallback(
        (duration: string) => setFormState((s) => ({ ...s, duration })),
        [],
    );
    const setQuality = useCallback(
        (quality: string) => setFormState((s) => ({ ...s, quality })),
        [],
    );
    const setSound = useCallback((sound: boolean) => setFormState((s) => ({ ...s, sound })), []);
    const setNegativePrompt = useCallback(
        (negativePrompt: string) => setFormState((s) => ({ ...s, negativePrompt })),
        [],
    );
    const setPromptEnhancement = useCallback(
        (promptEnhancement: boolean) => setFormState((s) => ({ ...s, promptEnhancement })),
        [],
    );
    const setTranslation = useCallback(
        (translation: boolean) => setFormState((s) => ({ ...s, translation })),
        [],
    );
    const setRemoveWatermark = useCallback(
        (removeWatermark: boolean) => setFormState((s) => ({ ...s, removeWatermark })),
        [],
    );
    const setUpscale = useCallback(
        (upscale: boolean) => setFormState((s) => ({ ...s, upscale })),
        [],
    );
    const setSafetyTolerance = useCallback(
        (safetyTolerance: number) => setFormState((s) => ({ ...s, safetyTolerance })),
        [],
    );
    const setStrength = useCallback(
        (strength: number) => setFormState((s) => ({ ...s, strength })),
        [],
    );
    const setVariants = useCallback(
        (variants: number) => setFormState((s) => ({ ...s, variants })),
        [],
    );

    // Immediate sync function for use before navigation
    const syncToStore = useCallback(() => {
        pendingStore.setFormState(type, formState);
    }, [pendingStore, type, formState]);

    // Reset form
    const resetForm = useCallback(() => {
        setFormState(DEFAULT_FORM_STATE);
        pendingStore.clear(type);
    }, [pendingStore, type]);

    return {
        formState,
        setFormState,
        setPrompt,
        setAspectRatio,
        setResolution,
        setDuration,
        setQuality,
        setSound,
        setNegativePrompt,
        setPromptEnhancement,
        setTranslation,
        setRemoveWatermark,
        setUpscale,
        setSafetyTolerance,
        setStrength,
        setVariants,
        syncToStore,
        resetForm,
    };
}
