'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Image as ImageIcon,
    Video as VideoIcon,
    Music,
    Plus,
    Loader2,
    Zap,
    ChevronDown,
    X,
    Settings2,
    Maximize,
    Clock,
    Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/language-context';
import { useModelsStore } from '@/stores/models-store';
import { ModelSelector } from '@/components/generation/ModelSelector';
import { AspectRatioSelector } from '@/components/generation/AspectRatioSelector';
import { DurationSelector } from '@/components/generation/DurationSelector';

export function UnifiedGenerationBar() {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [mode, setMode] = useState<'image' | 'video'>('image');
    const [prompt, setPrompt] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { imageModels, videoModels, fetchModels } = useModelsStore();

    // Image settings
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [quality, setQuality] = useState('standard');

    // Video settings
    const [duration, setDuration] = useState('5s');
    const [videoQuality, setVideoQuality] = useState('720p');

    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedModelId, setSelectedModelId] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const models = mode === 'image' ? imageModels : videoModels;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setAttachedImage(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    // Fetch models on mount
    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    // Sync default model when mode or models change
    useEffect(() => {
        if (mode === 'image' && imageModels.length > 0) {
            const defaultModel = imageModels.find((m) => m.id.includes('grok')) || imageModels[0];
            setSelectedModelId(defaultModel.id);
        } else if (mode === 'video' && videoModels.length > 0) {
            const defaultModel = videoModels.find((m) => m.id.includes('grok')) || videoModels[0];
            setSelectedModelId(defaultModel.id);
        }
    }, [mode, imageModels, videoModels]);

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        const target = mode === 'image' ? '/app/create/image' : '/app/create/video';
        let url = `${target}?prompt=${encodeURIComponent(prompt)}&model=${selectedModelId}`;

        if (mode === 'image') {
            url += `&aspect_ratio=${aspectRatio}&quality=${quality}`;
        } else if (mode === 'video') {
            url += `&duration=${duration}&quality=${videoQuality}`;
        }

        if (attachedImage) {
            url += `&image=attached`;
        }

        router.push(url);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-2">
                <Link
                    href="/app/create/image"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border bg-white/10 backdrop-blur-md text-white/40 border-white/5 hover:text-white`}
                >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {language === 'ru' ? 'Изображение' : 'Image'}
                </Link>
                <Link
                    href="/app/create/video"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border bg-white/10 backdrop-blur-md text-white/40 border-white/5 hover:text-white`}
                >
                    <VideoIcon className="w-3.5 h-3.5" />
                    {language === 'ru' ? 'Видео' : 'Video'}
                </Link>
                <Link
                    href="/app/create/audio"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border bg-white/10 backdrop-blur-md text-white/40 border-white/5 hover:text-white`}
                >
                    <Music className="w-3.5 h-3.5" />
                    {language === 'ru' ? 'Аудио' : 'Audio'}
                </Link>
            </div>

            <div
                className={`relative transition-all rounded-[32px] p-4 shadow-2xl ${
                    isDragging
                        ? 'border-[#6F00FF] border-2 border-dashed shadow-[0_0_50px_rgba(111,0,255,0.2)]'
                        : ''
                }`}
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(12px)',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {!isDragging && (
                    <div 
                        className="absolute inset-0 rounded-[32px] pointer-events-none"
                        style={{
                            padding: '1px',
                            background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 100%)',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                        }}
                    />
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {attachedImage && (
                    <div className="mb-4">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden group">
                            <img
                                src={attachedImage}
                                className="w-full h-full object-cover"
                                alt="Preview"
                            />
                            <button
                                onClick={() => setAttachedImage(null)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                )}

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                        mode === 'image'
                            ? language === 'ru'
                                ? 'Опишите, что хотите сделать или приложите изображение'
                                : 'Describe what you want to do or attach an image'
                            : language === 'ru'
                            ? 'Опишите, что хотите сделать или приложите изображение'
                            : 'Describe what you want to do or attach an image'
                    }
                    className="w-full bg-transparent resize-none outline-none text-white placeholder:text-white/20 min-h-[44px] font-medium text-sm mb-4 leading-relaxed"
                    rows={1}
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center text-white/40 hover:text-white transition-colors h-9 px-3 rounded-2xl bg-white/5 hover:bg-white/10"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setMode(mode === 'image' ? 'video' : 'image')}
                                className="h-9 px-3 md:px-4 flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"
                                title={mode === 'image' ? 'Switch to Video' : 'Switch to Image'}
                            >
                                {mode === 'image' ? (
                                    <>
                                        <ImageIcon className="w-4 h-4" />
                                        <span className="hidden md:inline text-xs font-medium">{language === 'ru' ? 'Изображение' : 'Image'}</span>
                                    </>
                                ) : (
                                    <>
                                        <VideoIcon className="w-4 h-4" />
                                        <span className="hidden md:inline text-xs font-medium">{language === 'ru' ? 'Видео' : 'Video'}</span>
                                    </>
                                )}
                            </button>

                            <ModelSelector
                                models={models}
                                value={selectedModelId}
                                onChange={setSelectedModelId}
                            />
                        </div>

                        {mode === 'image' ? (
                            <AspectRatioSelector
                                options={[
                                    { id: '1:1', name: '1:1' },
                                    { id: '16:9', name: '16:9' },
                                    { id: '9:16', name: '9:16' },
                                    { id: '4:5', name: '4:5' },
                                ]}
                                value={aspectRatio}
                                onChange={setAspectRatio}
                            />
                        ) : (
                            <DurationSelector
                                options={[
                                    { id: '5s', name: '5s' },
                                    { id: '10s', name: '10s' },
                                ]}
                                value={duration}
                                onChange={setDuration}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="text-sm text-muted-foreground hidden sm:block">
                            <span className="text-[#FFDC74] font-mono flex items-center gap-2 font-black">
                                <Zap className="w-4 h-4 fill-current" />
                                10
                            </span>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim()}
                            className="h-9 px-6 rounded-2xl bg-[#6F00FF] text-white font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(111,0,255,0.3)]"
                        >
                            {t('prompt.create')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
