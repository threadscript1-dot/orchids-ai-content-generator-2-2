'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { UploadedImage } from '@/types/generation';

interface UseFileUploadOptions {
    maxFiles?: number;
    acceptedTypes?: string[];
    initialFiles?: Array<{ id: string; url: string; name: string }>;
    onFilesChange?: (files: UploadedImage[]) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
    const { maxFiles = 4, acceptedTypes = ['image/'], initialFiles, onFilesChange } = options;

    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(() => {
        if (initialFiles && initialFiles.length > 0) {
            return initialFiles.map((f) => ({
                id: f.id,
                url: f.url,
                name: f.name,
            }));
        }
        return [];
    });
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Notify parent of file changes (debounced)
    const notifyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (onFilesChange) {
            if (notifyTimeoutRef.current) {
                clearTimeout(notifyTimeoutRef.current);
            }
            notifyTimeoutRef.current = setTimeout(() => {
                onFilesChange(uploadedImages);
            }, 50);
        }
        return () => {
            if (notifyTimeoutRef.current) {
                clearTimeout(notifyTimeoutRef.current);
            }
        };
    }, [uploadedImages, onFilesChange]);

    const handleFiles = useCallback(
        (files: File[]) => {
            const validFiles = files.filter((f) =>
                acceptedTypes.some((type) => f.type.startsWith(type)),
            );

            const newImages = validFiles.map((file) => ({
                id: Math.random().toString(36).substr(2, 9),
                url: URL.createObjectURL(file),
                name: file.name,
                file: file,
            }));

            setUploadedImages((prev) => [...prev, ...newImages].slice(0, maxFiles));
        },
        [maxFiles, acceptedTypes],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files);
            handleFiles(files);
        },
        [handleFiles],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const removeImage = useCallback((id: string) => {
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    }, []);

    const clearImages = useCallback(() => {
        setUploadedImages([]);
    }, []);

    const openFilePicker = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFiles(Array.from(e.target.files || []));
        },
        [handleFiles],
    );

    const addImageFromUrl = useCallback(
        (url: string, name: string = 'Reference Image') => {
            setUploadedImages((prev) =>
                [
                    ...prev,
                    {
                        id: 'url-' + Math.random().toString(36).substr(2, 9),
                        url,
                        name,
                    },
                ].slice(0, maxFiles),
            );
        },
        [maxFiles],
    );

    return {
        uploadedImages,
        setUploadedImages,
        isDragging,
        fileInputRef,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        handleFiles,
        removeImage,
        clearImages,
        openFilePicker,
        handleInputChange,
        addImageFromUrl,
    };
}
