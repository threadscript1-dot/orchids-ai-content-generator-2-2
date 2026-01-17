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
import { useGenerationStore, Generation } from '@/stores/generation-store';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

import { AudioSidebar, AudioTrackCard, AudioPlayerFooter } from '@/components/audio';

export function AudioGenerationPage() {
    const { language } = useLanguage();
    const searchParams = useSearchParams();

    // Stores
    const { audioModels, fetchModels } = useModelsStore();
    const { generations, generateAudioSuno, fetchHistory } = useGenerationStore();

    // Local state
    const [prompt, setPrompt] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [songTitle, setSongTitle] = useState('');
    const [style, setStyle] = useState('');
    const [model, setModel] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
    const [weirdness, setWeirdness] = useState([50]);

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
        audioRef,
        currentTrack,
        isPlaying,
        setIsPlaying,
        audioProgress,
        audioDuration,
        volume,
        playbackSpeed,
        setPlaybackSpeed,
        getAudioTracks,
        playTrack,
        togglePlayPause,
        handleTimeUpdate,
        handleLoadedMetadata,
        handleSeek,
        handleVolumeChange,
        playNextTrack,
        playPrevTrack,
        formatDuration,
    } = useAudioPlayer(audioGenerations);

    // Fetch models and history on mount
    useEffect(() => {
        fetchModels();
        fetchHistory(true);
    }, [fetchModels, fetchHistory]);

    // Set default model when models are loaded (prefer Suno V5)
    useEffect(() => {
        if (audioModels.length > 0 && !model) {
            const sunoV5 = audioModels.find(m => m.name.toLowerCase().includes('v5'));
            setModel(sunoV5?.id || audioModels[0].id);
        }
    }, [audioModels, model]);

    // Handle URL params
    useEffect(() => {
        const promptParam = searchParams.get('prompt');
        if (promptParam && audioModels.length > 0) {
            setPrompt(decodeURIComponent(promptParam));
        }
    }, [searchParams, audioModels]);

    const handleGenerate = async () => {
        if (!prompt.trim() && !lyrics.trim() && !style.trim()) return;

        setIsGenerating(true);
        if (window.innerWidth < 1024) {
            setIsSidebarMinimized(true);
        }

        try {
            const hasLyrics = lyrics.trim().length > 0;
            const generationId = await generateAudioSuno({
                prompt: hasLyrics ? lyrics : prompt,
                model: 'V5',
                custom_mode: hasLyrics,
                instrumental: false,
                style: style || undefined,
                title: songTitle || undefined,
                style_weight: weirdness[0] / 100,
            });

            if (generationId) {
                toast.success(language === 'ru' ? 'Генерация запущена' : 'Generation started');
                setPrompt('');
                setLyrics('');
                setSongTitle('');
                setStyle('');
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
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    lyrics={lyrics}
                    onLyricsChange={setLyrics}
                    songTitle={songTitle}
                    onSongTitleChange={setSongTitle}
                    style={style}
                    onStyleChange={setStyle}
                    models={audioModels}
                    selectedModelId={model}
                    onModelChange={setModel}
                    weirdness={weirdness}
                    onWeirdnessChange={setWeirdness}
                    isGenerating={isGenerating}
                    onGenerate={handleGenerate}
                    isSidebarMinimized={isSidebarMinimized}
                    onToggleSidebar={() => setIsSidebarMinimized(!isSidebarMinimized)}
                />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col relative h-full bg-[#050505] overflow-hidden">
                    {/* Top Header with Search */}
                    <header className="p-6 flex items-center justify-between gap-6 sticky top-0 z-40 pointer-events-none">
                        <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
                            <Link href="/app" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
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
                                                onClick={() => playTrack(gen, trackIdx)}
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

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={playNextTrack}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Bottom Audio Player */}
            <AudioPlayerFooter
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                audioProgress={audioProgress}
                audioDuration={audioDuration}
                volume={volume}
                playbackSpeed={playbackSpeed}
                onTogglePlayPause={togglePlayPause}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                onPlaybackSpeedChange={setPlaybackSpeed}
                onPlayNext={playNextTrack}
                onPlayPrev={playPrevTrack}
                formatDuration={formatDuration}
            />
        </div>
    );
}
