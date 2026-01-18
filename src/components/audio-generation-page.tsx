'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { useLanguage } from '@/lib/language-context';
import { downloadFile } from '@/lib/utils';
import { useModelsStore } from '@/stores/models-store';
import { useGenerationStore } from '@/stores/generation-store';
import { useAudio } from '@/context/audio-context';

import { AudioSidebar, AudioTrackCard, SunoModel } from '@/components/audio';

export function AudioGenerationPage() {
    const { language } = useLanguage();
    const searchParams = useSearchParams();

    // Stores
    const { audioModels, fetchModels } = useModelsStore();
    const { generations, generateAudioSuno, fetchHistory } = useGenerationStore();

    // Local state - Suno params
    const [customMode, setCustomMode] = useState(true);
    const [instrumental, setInstrumental] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('');
    const [title, setTitle] = useState('');
    const [model, setModel] = useState<SunoModel>('V5');
    const [negativeTags, setNegativeTags] = useState('');
    const [vocalGender, setVocalGender] = useState<'m' | 'f' | undefined>(undefined);
    const [styleWeight, setStyleWeight] = useState(0.5);
    const [weirdnessConstraint, setWeirdnessConstraint] = useState(0.5);
    const [audioWeight, setAudioWeight] = useState(0.5);

    // UI state
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

    // Filter generations to only show audio and apply search
    const audioGenerations = useMemo(() => {
        const audioOnly = generations.filter((g) => g.type === 'audio');
        if (!searchQuery.trim()) return audioOnly;

        const query = searchQuery.toLowerCase();
        return audioOnly.filter((g) => {
            const prompt = g.prompt?.toLowerCase() || '';
            const model = g.model?.toLowerCase() || '';
            return prompt.includes(query) || model.includes(query);
        });
    }, [generations, searchQuery]);

    // Audio player hook
    const {
        currentTrack,
        isPlaying,
        getAudioTracks,
        playTrack,
    } = useAudio();

    // Fetch models and history on mount
    useEffect(() => {
        fetchModels();
        fetchHistory(true);
    }, [fetchModels, fetchHistory]);

    // Handle URL params
    useEffect(() => {
        const promptParam = searchParams.get('prompt');
        if (promptParam) {
            setPrompt(decodeURIComponent(promptParam));
        }
    }, [searchParams]);

    // Credits cost (could be dynamic based on model in the future)
    const creditsCost = 10;

    const handleGenerate = async () => {
        setIsGenerating(true);
        if (window.innerWidth < 1024) {
            setIsSidebarMinimized(true);
        }

        try {
            const params: Parameters<typeof generateAudioSuno>[0] = {
                model,
                custom_mode: customMode,
                instrumental,
            };

            // Add prompt based on mode
            if (!customMode) {
                params.prompt = prompt;
            } else if (!instrumental) {
                params.prompt = prompt;
                params.style = style;
                params.title = title;
            } else {
                params.style = style;
                params.title = title;
            }

            // Add advanced params only in custom mode
            if (customMode) {
                if (negativeTags.trim()) params.negative_tags = negativeTags;
                if (vocalGender && !instrumental) params.vocal_gender = vocalGender;
                if (styleWeight !== 0.5) params.style_weight = styleWeight;
                if (weirdnessConstraint !== 0.5) params.weirdness_constraint = weirdnessConstraint;
                if (audioWeight !== 0.5) params.audio_weight = audioWeight;
            }

            const generationId = await generateAudioSuno(params);

            if (generationId) {
                toast.success(language === 'ru' ? 'Генерация запущена' : 'Generation started');
                // Reset form
                setPrompt('');
                setStyle('');
                setTitle('');
                setNegativeTags('');
            } else {
                toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-black text-white -m-4">
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <AudioSidebar
                    customMode={customMode}
                    onCustomModeChange={setCustomMode}
                    instrumental={instrumental}
                    onInstrumentalChange={setInstrumental}
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    style={style}
                    onStyleChange={setStyle}
                    title={title}
                    onTitleChange={setTitle}
                    model={model}
                    onModelChange={setModel}
                    negativeTags={negativeTags}
                    onNegativeTagsChange={setNegativeTags}
                    vocalGender={vocalGender}
                    onVocalGenderChange={setVocalGender}
                    styleWeight={styleWeight}
                    onStyleWeightChange={setStyleWeight}
                    weirdnessConstraint={weirdnessConstraint}
                    onWeirdnessConstraintChange={setWeirdnessConstraint}
                    audioWeight={audioWeight}
                    onAudioWeightChange={setAudioWeight}
                    isGenerating={isGenerating}
                    onGenerate={handleGenerate}
                    isSidebarMinimized={isSidebarMinimized}
                    onToggleSidebar={() => setIsSidebarMinimized(!isSidebarMinimized)}
                    creditsCost={creditsCost}
                />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col relative h-full bg-[#050505] overflow-hidden">
                    {/* Top Header with Search */}
                    <header className="p-6 flex items-center justify-between gap-6 sticky top-0 z-40 pointer-events-none">
                        <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
                            <Link
                                href="/app"
                                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                                {language === 'ru' ? 'АУДИО' : 'AUDIO'}
                            </h1>
                        </div>
                        <div className="flex-1 max-w-xl relative pointer-events-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 z-10" />
                            <input
                                type="text"
                                placeholder={language === 'ru' ? 'Поиск...' : 'Search...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 bg-black/20 backdrop-blur-sm rounded-full pl-11 pr-4 outline-none text-sm font-mono border border-white/10 focus:border-white/30 transition-all placeholder:text-white/30"
                            />
                        </div>
                    </header>

                    {/* Tracks List */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-80 no-scrollbar">
                        <div className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
                            {isGenerating && (
                                <div className="h-[100px] rounded-[20px] bg-white/[0.02] border border-white/5 flex items-center px-6 gap-6 relative overflow-hidden group">
                                    <div className="w-[68px] h-[68px] rounded-md bg-white/5 animate-pulse flex items-center justify-center shrink-0">
                                        <Loader2 className="w-5 h-5 animate-spin text-[#6F00FF]" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-1/3 bg-white/5 animate-pulse rounded" />
                                        <div className="h-2 w-1/2 bg-white/5 animate-pulse rounded opacity-50" />
                                    </div>
                                </div>
                            )}

                            <AnimatePresence mode="popLayout">
                                {audioGenerations.map((gen) => {
                                    const tracks = getAudioTracks(gen);

                                    // Show loading/error state
                                    if (
                                        gen.status === 'processing' ||
                                        gen.status === 'queued' ||
                                        gen.status === 'failed' ||
                                        tracks.length === 0
                                    ) {
                                        return (
                                            <AudioTrackCard
                                                key={gen.id}
                                                generation={gen}
                                                track={{ url: '', index: 0 }}
                                                trackIndex={0}
                                                totalTracks={0}
                                                isCurrentTrack={false}
                                                isPlaying={false}
                                                onClick={() => {}}
                                                onDownload={() => {}}
                                            />
                                        );
                                    }

                                    // Render each track separately
                                    return tracks.map((track, trackIdx) => {
                                        const isCurrentTrack =
                                            currentTrack?.genId === gen.id &&
                                            currentTrack?.trackIndex === trackIdx;

                                        return (
                                            <AudioTrackCard
                                                key={`${gen.id}-track-${trackIdx}`}
                                                generation={gen}
                                                track={track}
                                                trackIndex={trackIdx}
                                                totalTracks={tracks.length}
                                                isCurrentTrack={isCurrentTrack}
                                                isPlaying={isCurrentTrack && isPlaying}
                                                onClick={() => playTrack(gen, trackIdx, audioGenerations)}
                                                onDownload={() => {
                                                    downloadFile(track.url, `audio-${gen.id}.mp3`);
                                                }}
                                            />
                                        );
                                    });
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>

        </div>
    );
}
