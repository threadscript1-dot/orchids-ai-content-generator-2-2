'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Loader2,
    Download,
    Zap,
    Video,
    Image as ImageIcon,
    Play,
    Sparkles,
    Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { toast } from 'sonner';
import { useGenerationStore } from '@/stores/generation-store';

function MotionControlToolContent() {
    const { language } = useLanguage();
    const router = useRouter();

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
    const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
    const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState<'720p' | '1080p'>('720p');
    const [characterOrientation, setCharacterOrientation] = useState<'image' | 'video'>('image');
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generationId, setGenerationId] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const [isDraggingVideo, setIsDraggingVideo] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const uploadImage = useGenerationStore((state) => state.uploadImage);
    const uploadVideo = useGenerationStore((state) => state.uploadVideo);
    const klingMotionControl = useGenerationStore((state) => state.klingMotionControl);
    const generations = useGenerationStore((state) => state.generations);
    const pollGenerationStatus = useGenerationStore((state) => state.pollGenerationStatus);

    // Watch for generation completion
    useEffect(() => {
        if (!generationId) return;

        const generation = generations.find((g) => g.id === generationId);
        if (!generation) return;

        if (generation.status === 'success' && generation.result_assets?.[0]?.url) {
            setResult(generation.result_assets[0].url);
            setIsProcessing(false);
            toast.success(
                language === 'ru' ? 'Видео успешно создано!' : 'Video successfully created!'
            );
        } else if (generation.status === 'failed') {
            setIsProcessing(false);
            toast.error(
                generation.error || (language === 'ru' ? 'Ошибка обработки' : 'Processing failed')
            );
        }
    }, [generationId, generations, language]);

    const handleImageDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingImage(false);
        const files = Array.from(e.dataTransfer.files);
        if (files[0]?.type.startsWith('image/')) {
            const url = URL.createObjectURL(files[0]);
            setUploadedImage(url);
            setUploadedImageFile(files[0]);
            setResult(null);
            setGenerationId(null);
        }
    }, []);

    const handleVideoDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingVideo(false);
        const files = Array.from(e.dataTransfer.files);
        if (files[0]?.type.startsWith('video/')) {
            const url = URL.createObjectURL(files[0]);
            setUploadedVideo(url);
            setUploadedVideoFile(files[0]);
            setResult(null);
            setGenerationId(null);
        }
    }, []);

    const handleImageFiles = (files: FileList | null) => {
        if (files?.[0]?.type.startsWith('image/')) {
            const url = URL.createObjectURL(files[0]);
            setUploadedImage(url);
            setUploadedImageFile(files[0]);
            setResult(null);
            setGenerationId(null);
        }
    };

    const handleVideoFiles = (files: FileList | null) => {
        if (files?.[0]?.type.startsWith('video/')) {
            const url = URL.createObjectURL(files[0]);
            setUploadedVideo(url);
            setUploadedVideoFile(files[0]);
            setResult(null);
            setGenerationId(null);
        }
    };

    const handleProcess = async () => {
        if (!uploadedImage || !uploadedVideo) {
            toast.error(
                language === 'ru'
                    ? 'Загрузите изображение и видео'
                    : 'Please upload both image and video'
            );
            return;
        }

        setIsProcessing(true);
        setResult(null);

        try {
            let imageUrl = uploadedImage;
            let videoUrl = uploadedVideo;

            // Upload image if it's a local file
            if (uploadedImageFile) {
                setIsUploading(true);
                const uploadedImageUrl = await uploadImage(uploadedImageFile);
                if (!uploadedImageUrl) {
                    toast.error(
                        language === 'ru' ? 'Ошибка загрузки изображения' : 'Failed to upload image'
                    );
                    setIsProcessing(false);
                    setIsUploading(false);
                    return;
                }
                imageUrl = uploadedImageUrl;
            }

            // Upload video if it's a local file
            if (uploadedVideoFile) {
                const uploadedVideoUrl = await uploadVideo(uploadedVideoFile);
                setIsUploading(false);
                if (!uploadedVideoUrl) {
                    toast.error(
                        language === 'ru' ? 'Ошибка загрузки видео' : 'Failed to upload video'
                    );
                    setIsProcessing(false);
                    return;
                }
                videoUrl = uploadedVideoUrl;
            }

            // Call motion control API
            const genId = await klingMotionControl({
                input_url: imageUrl,
                video_url: videoUrl,
                mode,
                character_orientation: characterOrientation,
                ...(prompt.trim() ? { prompt: prompt.trim() } : {}),
            });

            if (!genId) {
                toast.error(
                    language === 'ru' ? 'Ошибка запуска обработки' : 'Failed to start processing'
                );
                setIsProcessing(false);
                return;
            }

            setGenerationId(genId);
            pollGenerationStatus(genId);
        } catch (error) {
            console.error('Motion control error:', error);
            toast.error(language === 'ru' ? 'Ошибка обработки' : 'Processing failed');
            setIsProcessing(false);
        }
    };

    const canProcess = uploadedImage && uploadedVideo;

    return (
        <div className="h-[calc(100vh-80px)] -m-6 flex flex-col lg:flex-row bg-[#0A0A0B]">
            {/* Main Area */}
            <div className="flex-1 relative overflow-hidden bg-black/40 flex flex-col items-center justify-center p-4 md:p-8">
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 z-20 p-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {result ? (
                    <div className="relative max-w-full max-h-full rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
                        <video
                            src={result}
                            controls
                            autoPlay
                            loop
                            className="max-w-full max-h-[70vh] object-contain"
                        />
                        <div className="absolute bottom-6 right-6 flex gap-3">
                            <a
                                href={result}
                                download="motion-control-result.mp4"
                                className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#6F00FF] text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Download className="w-4 h-4" />
                                {language === 'ru' ? 'Скачать' : 'Download'}
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                        {/* Image Upload */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingImage(true);
                            }}
                            onDragLeave={() => setIsDraggingImage(false)}
                            onDrop={handleImageDrop}
                            onClick={() => imageInputRef.current?.click()}
                            className={`aspect-square rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden ${
                                isDraggingImage
                                    ? 'border-[#6F00FF] bg-[#6F00FF]/5'
                                    : uploadedImage
                                      ? 'border-green-500/30 bg-green-500/5'
                                      : 'border-white/10 hover:border-white/20 bg-white/5'
                            }`}
                        >
                            {uploadedImage ? (
                                <>
                                    <img
                                        src={uploadedImage}
                                        alt="Character"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-bold text-sm">
                                            {language === 'ru' ? 'Заменить' : 'Replace'}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-white/30" />
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">
                                        {language === 'ru' ? 'Изображение' : 'Character Image'}
                                    </h3>
                                    <p className="text-xs text-white/40">
                                        {language === 'ru'
                                            ? 'Персонаж для анимации'
                                            : 'Character to animate'}
                                    </p>
                                    <p className="text-[10px] text-white/20 mt-4">
                                        JPG, PNG (max 10MB)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Video Upload */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingVideo(true);
                            }}
                            onDragLeave={() => setIsDraggingVideo(false)}
                            onDrop={handleVideoDrop}
                            onClick={() => videoInputRef.current?.click()}
                            className={`aspect-square rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden ${
                                isDraggingVideo
                                    ? 'border-[#6F00FF] bg-[#6F00FF]/5'
                                    : uploadedVideo
                                      ? 'border-green-500/30 bg-green-500/5'
                                      : 'border-white/10 hover:border-white/20 bg-white/5'
                            }`}
                        >
                            {uploadedVideo ? (
                                <>
                                    <video
                                        src={uploadedVideo}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                        autoPlay
                                        playsInline
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-bold text-sm">
                                            {language === 'ru' ? 'Заменить' : 'Replace'}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <Video className="w-16 h-16 mx-auto mb-4 text-white/30" />
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">
                                        {language === 'ru' ? 'Референс видео' : 'Motion Reference'}
                                    </h3>
                                    <p className="text-xs text-white/40">
                                        {language === 'ru'
                                            ? 'Видео с движением'
                                            : 'Video with motion to copy'}
                                    </p>
                                    <p className="text-[10px] text-white/20 mt-4">
                                        MP4, MOV (3-30s, max 100MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
                        <div className="text-center">
                            <div className="relative">
                                <Loader2 className="w-16 h-16 animate-spin text-[#6F00FF] mx-auto mb-4" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Play className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-[#6F00FF] animate-pulse">
                                {language === 'ru' ? 'Создаем видео...' : 'Generating video...'}
                            </p>
                        </div>
                    </div>
                )}

                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files)}
                />
                <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleVideoFiles(e.target.files)}
                />
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-[#0A0A0B] p-6 lg:p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6F00FF] to-[#FF00FF] flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight">
                            Motion Control
                        </h1>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            Kling 2.6
                        </p>
                    </div>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto">
                    {/* Prompt */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            {language === 'ru' ? 'Описание (опционально)' : 'Prompt (optional)'}
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={
                                language === 'ru'
                                    ? 'Опишите желаемый результат...'
                                    : 'Describe the desired result...'
                            }
                            className="w-full h-24 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:border-[#6F00FF]/50"
                            maxLength={2500}
                        />
                    </div>

                    {/* Resolution */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                            {language === 'ru' ? 'Разрешение' : 'Resolution'}
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                            <button
                                onClick={() => setMode('720p')}
                                className={`h-11 rounded-xl text-xs font-black transition-all ${
                                    mode === '720p'
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                720p
                            </button>
                            <button
                                onClick={() => setMode('1080p')}
                                className={`h-11 rounded-xl text-xs font-black transition-all ${
                                    mode === '1080p'
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                1080p
                            </button>
                        </div>
                    </div>

                    {/* Character Orientation */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                            {language === 'ru' ? 'Ориентация персонажа' : 'Character Orientation'}
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                            <button
                                onClick={() => setCharacterOrientation('image')}
                                className={`h-11 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                                    characterOrientation === 'image'
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <ImageIcon className="w-4 h-4" />
                                {language === 'ru' ? 'Из фото' : 'From Image'}
                            </button>
                            <button
                                onClick={() => setCharacterOrientation('video')}
                                className={`h-11 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                                    characterOrientation === 'video'
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Video className="w-4 h-4" />
                                {language === 'ru' ? 'Из видео' : 'From Video'}
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs text-white/40 leading-relaxed">
                            {language === 'ru'
                                ? 'Загрузите изображение персонажа и референсное видео с движением. ИИ перенесет движение из видео на ваш персонаж.'
                                : 'Upload a character image and a reference video with motion. AI will transfer the motion from the video to your character.'}
                        </p>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        onClick={handleProcess}
                        disabled={isProcessing || !canProcess}
                        className="w-full py-5 rounded-xl bg-[#6F00FF] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(111,0,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                {language === 'ru' ? 'Создать видео' : 'Generate Video'}
                                <div className="ml-2 flex items-center gap-1.5 text-[#FFD700] font-mono">
                                    <Zap className="w-3.5 h-3.5 fill-current" />
                                    <span className="text-xs font-bold">25</span>
                                </div>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MotionControlPage() {
    return (
        <Suspense
            fallback={
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6F00FF]" />
                </div>
            }
        >
            <MotionControlToolContent />
        </Suspense>
    );
}
