'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePendingGenerationStore } from '@/stores/pending-generation-store';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { UploadedImage } from '@/types/generation';
import type { GenerationType, AttachmentState } from './types';

interface UseGenerationFilesOptions {
    type: GenerationType;
    attachmentState: AttachmentState;
}

interface UseGenerationFilesReturn {
    uploadedFiles: UploadedImage[];
    isDragging: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleDrop: (e: React.DragEvent) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: () => void;
    removeFile: (id: string) => void;
    clearFiles: () => void;
    openFilePicker: () => void;
    handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    addFileFromUrl: (url: string, name?: string) => void;
    syncFilesToStore: () => void;
}

export function useGenerationFiles(options: UseGenerationFilesOptions): UseGenerationFilesReturn {
    const { type, attachmentState } = options;

    const pendingStore = usePendingGenerationStore();

    // Get pending state from store - reactive to store changes
    const pendingState = usePendingGenerationStore((state) => state[type]);
    const pendingFiles = pendingState.uploadedFiles;
    const pendingLastUpdated = pendingState.lastUpdated;

    // Track last processed update to avoid duplicate processing
    const lastProcessedUpdateRef = useRef(0);
    const [initialPendingFiles, setInitialPendingFiles] = useState(pendingFiles);

    // Update initialPendingFiles when pending store changes
    useEffect(() => {
        if (pendingLastUpdated > lastProcessedUpdateRef.current && pendingFiles.length > 0) {
            setInitialPendingFiles(pendingFiles);
            lastProcessedUpdateRef.current = pendingLastUpdated;
        }
    }, [pendingFiles, pendingLastUpdated]);

    // Sync files to pending store
    const handleFilesChange = useCallback(
        (files: UploadedImage[]) => {
            pendingStore.setUploadedFiles(type, files);
        },
        [type, pendingStore],
    );

    // File upload hook
    const {
        uploadedImages: uploadedFiles,
        isDragging,
        fileInputRef,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        removeImage: removeFile,
        clearImages: clearFiles,
        openFilePicker,
        handleInputChange: handleFileInputChange,
        addImageFromUrl: addFileFromUrl,
    } = useFileUpload({
        maxFiles: attachmentState.maxFiles,
        initialFiles: initialPendingFiles,
        onFilesChange: handleFilesChange,
    });

    // Immediate sync function
    const syncFilesToStore = useCallback(() => {
        pendingStore.setUploadedFiles(type, uploadedFiles);
    }, [pendingStore, type, uploadedFiles]);

    return {
        uploadedFiles,
        isDragging,
        fileInputRef,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        removeFile,
        clearFiles,
        openFilePicker,
        handleFileInputChange,
        addFileFromUrl,
        syncFilesToStore,
    };
}
