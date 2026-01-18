'use client';

import { create } from 'zustand';
import { UploadedImage } from '@/types/generation';

export interface PendingFormState {
    prompt: string;
    aspectRatio: string;
    resolution: string;
    duration: string;
    quality: string;
    sound: boolean;
}

interface PendingUploadedFile {
    id: string;
    url: string;
    name: string;
}

type GenerationType = 'image' | 'video' | 'audio';

interface PendingTypeState {
    formState: PendingFormState;
    uploadedFiles: PendingUploadedFile[];
}

interface PendingGenerationState {
    image: PendingTypeState;
    video: PendingTypeState;
    audio: PendingTypeState;

    setFormState: (type: GenerationType, state: Partial<PendingFormState>) => void;
    setUploadedFiles: (type: GenerationType, files: UploadedImage[]) => void;
    addUploadedFile: (type: GenerationType, file: PendingUploadedFile) => void;
    removeUploadedFile: (type: GenerationType, id: string) => void;
    clearUploadedFiles: (type: GenerationType) => void;
    clear: (type: GenerationType) => void;
    getState: (type: GenerationType) => PendingTypeState;
}

const DEFAULT_FORM_STATE: PendingFormState = {
    prompt: '',
    aspectRatio: '1:1',
    resolution: '1K',
    duration: '5',
    quality: 'basic',
    sound: false,
};

export const usePendingGenerationStore = create<PendingGenerationState>()((set, get) => ({
    image: {
        formState: { ...DEFAULT_FORM_STATE },
        uploadedFiles: [],
    },
    video: {
        formState: { ...DEFAULT_FORM_STATE },
        uploadedFiles: [],
    },
    audio: {
        formState: { ...DEFAULT_FORM_STATE },
        uploadedFiles: [],
    },

    setFormState: (type, state) => {
        set((prev) => ({
            [type]: {
                ...prev[type],
                formState: { ...prev[type].formState, ...state },
            },
        }));
    },

    setUploadedFiles: (type, files) => {
        const pendingFiles: PendingUploadedFile[] = files.map((f) => ({
            id: f.id,
            url: f.file ? URL.createObjectURL(f.file) : f.url,
            name: f.name,
        }));
        set((prev) => ({
            [type]: {
                ...prev[type],
                uploadedFiles: pendingFiles,
            },
        }));
    },

    addUploadedFile: (type, file) => {
        set((prev) => ({
            [type]: {
                ...prev[type],
                uploadedFiles: [...prev[type].uploadedFiles, file],
            },
        }));
    },

    removeUploadedFile: (type, id) => {
        set((prev) => ({
            [type]: {
                ...prev[type],
                uploadedFiles: prev[type].uploadedFiles.filter((f) => f.id !== id),
            },
        }));
    },

    clearUploadedFiles: (type) => {
        set((prev) => ({
            [type]: {
                ...prev[type],
                uploadedFiles: [],
            },
        }));
    },

    clear: (type) => {
        set((prev) => ({
            [type]: {
                formState: { ...DEFAULT_FORM_STATE },
                uploadedFiles: [],
            },
        }));
    },

    getState: (type) => {
        return get()[type];
    },
}));
