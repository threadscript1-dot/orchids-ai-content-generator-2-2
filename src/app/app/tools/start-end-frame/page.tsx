'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Loader2,
    Download,
    Zap,
    Play,
    Sparkles,
    Image as ImageIcon,
    Volume2,
    VolumeX,
    ArrowRight,
    Lock,
    Unlock,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { toast } from 'sonner';
import { useGenerationStore } from '@/stores/generation-store';

function StartEndFrameToolContent() {
    const { language } = useLanguage();
    const router = useRouter();

    const [startFrame, setStartFrame] = useState<string | null>(null);
    const [startFrameFile, setStartFrameFile] = useState<File | null>(null);
    const [endFrame, setEndFrame] = useState<string | null>(null);
    const [endFrameFile, setEndFrameFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '21:9'>('16:9');
    const [resolution, setResolution] = useState<'480p' | '720p'>('720p');
    const [duration, setDuration] = useState<4 | 8 | 12>(8);
    const [fixedLens, setFixedLens] = useState(false);
    const [generateAudio, setGenerateAudio] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generationId, setGenerationId] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [isDraggingStart, setIsDraggingStart] = useState(false);
    const [isDraggingEnd, setIsDraggingEnd] = useState(false);

    const startInputRef = useRef<HTMLInputElement>(null);
    const endInputRef = useRef<HTMLInputElement>(null);

    const uploadImage = useGenerationStore((state) => state.uploadImage);
    const seedanceStartEndFrame = useGenerationStore((state) => state.seedanceStartEndFrame);
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

    const handleStartDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingStart(false);
        const files = Array.from(e.dataTransfer.files);
        if (files[0]?.type.startsWith('image/')) {
            const url = URL.createObjectURL(files[0]);
            setStartFrame(url);
            setStartFrameFile(files[0]);
            setResult(null);
            setGenerationId(null);
        }
    }, []);

    const handleEndDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingEnd(false);
        const files = Array.from(e.dataTransfer.files);
        if (files[0]?.type.startsWith('image/')) {
            const url = URL.createObjectURL(files[0]);
            setEndFrame(url);
            setEndFrameFile(files[0]);
            setResult(null);
            setGenerationId(null);
        }
    }, []);

    const handleStartFiles = (files: FileList | null) => {
        if (files?.[0]?.type.startsWith('image/')) {
            const url = URL.createObjectURL(files[0]);
            setStartFrame(url);
            setStartFrameFile(files[0]);
            setResult(null);
            setGenerationId(null);
        }
    };

    const handleEndFiles = (files: FileList | null) => {
        if (files?.[0]?.type.startsWith('image/')) {
            const url = URL.createObjectURL(files[0]);
            setEndFrame(url);
            setEndFrameFile(files[0]);
            setResult(null);
            setGenerationId(null);
        }
    };

    const handleProcess = async () => {
        if (!startFrame || !endFrame) {
            toast.error(
                language === 'ru'
                    ? 'Загрузите начальный и конечный кадры'
                    : 'Please upload both start and end frames'
            );
            return;
        }

        if (!prompt.trim() || prompt.trim().length < 3) {
            toast.error(
                language === 'ru'
                    ? 'Введите описание перехода (мин. 3 символа)'
                    : 'Please enter a transition description (min 3 chars)'
            );
            return;
        }

        setIsProcessing(true);
        setResult(null);

        try {
            let startUrl = startFrame;
            let endUrl = endFrame;

            setIsUploading(true);

            // Upload start frame if it's a local file
            if (startFrameFile) {
                const uploadedStartUrl = await uploadImage(startFrameFile);
                if (!uploadedStartUrl) {
                    toast.error(
                        language === 'ru'
                            ? 'Ошибка загрузки начального кадра'
                            : 'Failed to upload start frame'
                    );
                    setIsProcessing(false);
                    setIsUploading(false);
                    return;
                }
                startUrl = uploadedStartUrl;
            }

            // Upload end frame if it's a local file
            if (endFrameFile) {
                const uploadedEndUrl = await uploadImage(endFrameFile);
                if (!uploadedEndUrl) {
                    toast.error(
                        language === 'ru'
                            ? 'Ошибка загрузки конечного кадра'
                            : 'Failed to upload end frame'
                    );
                    setIsProcessing(false);
                    setIsUploading(false);
                    return;
                }
                endUrl = uploadedEndUrl;
            }

            setIsUploading(false);

            // Call Seedance start-end frame API
            const genId = await seedanceStartEndFrame({
                prompt: prompt.trim(),
                start_frame_url: startUrl,
                end_frame_url: endUrl,
                aspect_ratio: aspectRatio,
                resolution,
                duration,
                fixed_lens: fixedLens,
                generate_audio: generateAudio,
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
            console.error('Start-end frame error:', error);
            toast.error(language === 'ru' ? 'Ошибка обработки' : 'Processing failed');
            setIsProcessing(false);
        }
    };

    const canProcess = startFrame && endFrame && prompt.trim().length >= 3;

    // Calculate credits cost based on Seedance pricing
    const calculateCost = () => {
        let cost = 5; // Base cost
        // Duration pricing: 4=0, 8=+10, 12=+20
        if (duration === 8) cost += 10;
        else if (duration === 12) cost += 20;
        // Resolution pricing: 480p=0, 720p=+5
        if (resolution === '720p') cost += 5;
        // Audio: +5
        if (generateAudio) cost += 5;
        return cost;
    };

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
                                download="start-end-frame-result.mp4"
                                className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#6F00FF] text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Download className="w-4 h-4" />
                                {language === 'ru' ? 'Скачать' : 'Download'}
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full max-w-4xl">
                        {/* Start Frame */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingStart(true);
                            }}
                            onDragLeave={() => setIsDraggingStart(false)}
                            onDrop={handleStartDrop}
                            onClick={() => startInputRef.current?.click()}
                            className={`aspect-[4/3] w-full md:flex-1 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden ${
                                isDraggingStart
                                    ? 'border-[#6F00FF] bg-[#6F00FF]/5'
                                    : startFrame
                                      ? 'border-green-500/30 bg-green-500/5'
                                      : 'border-white/10 hover:border-white/20 bg-white/5'
                            }`}
                        >
                            {startFrame ? (
                                <>
                                    <img
                                        src={startFrame}
                                        alt="Start"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-bold text-sm">
                                            {language === 'ru' ? 'Заменить' : 'Replace'}
                                        </p>
                                    </div>
                                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white">
                                        {language === 'ru' ? 'Старт' : 'Start'}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-white/30" />
                                    <h3 className="text-base font-black uppercase tracking-tight mb-1">
                                        {language === 'ru' ? 'Начальный кадр' : 'Start Frame'}
                                    </h3>
                                    <p className="text-xs text-white/40">
                                        {language === 'ru' ? 'Первый кадр видео' : 'First video frame'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 hidden md:flex items-center justify-center w-16">
                            <div className="w-12 h-12 rounded-full bg-[#6F00FF]/20 border border-[#6F00FF]/30 flex items-center justify-center">
                                <ArrowRight className="w-6 h-6 text-[#6F00FF]" />
                            </div>
                        </div>

                        {/* End Frame */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingEnd(true);
                            }}
                            onDragLeave={() => setIsDraggingEnd(false)}
                            onDrop={handleEndDrop}
                            onClick={() => endInputRef.current?.click()}
                            className={`aspect-[4/3] w-full md:flex-1 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden ${
                                isDraggingEnd
                                    ? 'border-[#6F00FF] bg-[#6F00FF]/5'
                                    : endFrame
                                      ? 'border-green-500/30 bg-green-500/5'
                                      : 'border-white/10 hover:border-white/20 bg-white/5'
                            }`}
                        >
                            {endFrame ? (
                                <>
                                    <img
                                        src={endFrame}
                                        alt="End"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-bold text-sm">
                                            {language === 'ru' ? 'Заменить' : 'Replace'}
                                        </p>
                                    </div>
                                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white">
                                        {language === 'ru' ? 'Финиш' : 'End'}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-white/30" />
                                    <h3 className="text-base font-black uppercase tracking-tight mb-1">
                                        {language === 'ru' ? 'Конечный кадр' : 'End Frame'}
                                    </h3>
                                    <p className="text-xs text-white/40">
                                        {language === 'ru' ? 'Последний кадр видео' : 'Last video frame'}
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
                    ref={startInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleStartFiles(e.target.files)}
                />
                <input
                    ref={endInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleEndFiles(e.target.files)}
                />
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-[#0A0A0B] p-6 lg:p-8 overflow-y-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00FF88] to-[#00AAFF] flex items-center justify-center">
                        <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight">
                            {language === 'ru' ? 'Кадр-Кадр' : 'Frame-to-Frame'}
                        </h1>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            Seedance 1.5 Pro
                        </p>
                    </div>
                </div>

                <div className="flex-1 space-y-5">
                    {/* Prompt */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            {language === 'ru' ? 'Описание перехода' : 'Transition Description'}
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={
                                language === 'ru'
                                    ? 'Опишите, как должен происходить переход...'
                                    : 'Describe how the transition should happen...'
                            }
                            className="w-full h-20 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:border-[#6F00FF]/50"
                            maxLength={2500}
                        />
                        <p className="text-[10px] text-white/20 mt-1 text-right">{prompt.length}/2500</p>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                            {language === 'ru' ? 'Соотношение сторон' : 'Aspect Ratio'}
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                            {(['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'] as const).map((ratio) => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`h-9 rounded-xl text-[11px] font-black transition-all ${
                                        aspectRatio === ratio
                                            ? 'bg-white text-black shadow-lg'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                            {language === 'ru' ? 'Длительность' : 'Duration'}
                        </label>
                        <div className="grid grid-cols-3 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                            {([4, 8, 12] as const).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`h-11 rounded-xl text-xs font-black transition-all ${
                                        duration === d
                                            ? 'bg-white text-black shadow-lg'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {d} {language === 'ru' ? 'сек' : 'sec'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resolution */}
                    <div>
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                            {language === 'ru' ? 'Разрешение' : 'Resolution'}
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                            {(['480p', '720p'] as const).map((res) => (
                                <button
                                    key={res}
                                    onClick={() => setResolution(res)}
                                    className={`h-11 rounded-xl text-xs font-black transition-all ${
                                        resolution === res
                                            ? 'bg-white text-black shadow-lg'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {res}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Options Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Fixed Lens */}
                        <button
                            onClick={() => setFixedLens(!fixedLens)}
                            className={`h-12 rounded-2xl border transition-all flex items-center justify-center gap-2 ${
                                fixedLens
                                    ? 'bg-[#6F00FF]/20 border-[#6F00FF]/50 text-white'
                                    : 'bg-white/5 border-white/10 text-white/40'
                            }`}
                        >
                            {fixedLens ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            <span className="text-[10px] font-black uppercase">
                                {language === 'ru' ? 'Фикс. камера' : 'Fixed Cam'}
                            </span>
                        </button>

                        {/* Audio */}
                        <button
                            onClick={() => setGenerateAudio(!generateAudio)}
                            className={`h-12 rounded-2xl border transition-all flex items-center justify-center gap-2 ${
                                generateAudio
                                    ? 'bg-[#6F00FF]/20 border-[#6F00FF]/50 text-white'
                                    : 'bg-white/5 border-white/10 text-white/40'
                            }`}
                        >
                            {generateAudio ? (
                                <Volume2 className="w-4 h-4" />
                            ) : (
                                <VolumeX className="w-4 h-4" />
                            )}
                            <span className="text-[10px] font-black uppercase">
                                {language === 'ru' ? 'Звук' : 'Audio'}
                                {generateAudio && <span className="text-[#FFD700] ml-1">+5</span>}
                            </span>
                        </button>
                    </div>

                    {/* Info */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs text-white/40 leading-relaxed">
                            {language === 'ru'
                                ? 'Загрузите начальный и конечный кадр. ИИ создаст плавный переход между ними на основе вашего описания.'
                                : 'Upload start and end frames. AI will create a smooth transition between them based on your description.'}
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
                                    <span className="text-xs font-bold">{calculateCost()}</span>
                                </div>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StartEndFramePage() {
    return (
        <Suspense
            fallback={
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6F00FF]" />
                </div>
            }
        >
            <StartEndFrameToolContent />
        </Suspense>
    );
}
