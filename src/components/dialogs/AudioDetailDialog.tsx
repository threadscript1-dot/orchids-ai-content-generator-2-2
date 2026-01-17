'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
    X,
    Download,
    Heart,
    MoreHorizontal,
    FolderPlus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Share2,
    Copy,
    Music,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    RefreshCw,
    Clock,
    Sparkles,
    FileText,
    Shuffle,
    Repeat,
    Gauge,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/lib/language-context';
import { Generation, useGenerationStore } from '@/stores/generation-store';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { AddToCollectionModal } from '@/components/library/AddToCollectionModal';
import { ConfirmDeleteDialog } from '@/components/library/ConfirmDeleteDialog';

interface AudioTrack {
    url: string;
    cover: string;
}

interface AudioDetailDialogProps {
    audio: Generation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRemix: (audio: Generation) => void;
    onToggleLike: (id: string) => void;
    audios?: Generation[];
    onSelectAudio?: (audio: Generation) => void;
}

export function AudioDetailDialog({
    audio,
    open,
    onOpenChange,
    onRemix,
    onToggleLike,
    audios = [],
    onSelectAudio,
}: AudioDetailDialogProps) {
    const { language } = useLanguage();
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement>(null);
    const { user } = useAuth();
    
    const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isShuffleOn, setIsShuffleOn] = useState(false);
    const [isRepeatOn, setIsRepeatOn] = useState(false);
    const [speedPreset, setSpeedPreset] = useState<'normal' | 'slowed' | 'nightcore'>('normal');

    const storeGenerations = useGenerationStore((state) => state.generations);
    const removeGeneration = useGenerationStore((state) => state.removeGeneration);
    const currentAudio = audio ? storeGenerations.find((g) => g.id === audio.id) || audio : null;

    const getAudioTracks = useCallback((gen: Generation | null): AudioTrack[] => {
        if (!gen?.result_assets) return [];
        const tracks: AudioTrack[] = [];
        const assets = gen.result_assets;
        
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            if (asset.mime?.startsWith('audio/') || asset.url?.endsWith('.mp3')) {
                const nextAsset = assets[i + 1];
                tracks.push({
                    url: asset.url,
                    cover: nextAsset?.mime?.startsWith('image/') ? nextAsset.url : '',
                });
            }
        }
        return tracks;
    }, []);

    const tracks = audio ? getAudioTracks(audio) : [];
    const currentTrack = tracks[selectedTrackIndex];

    useEffect(() => {
        setSelectedTrackIndex(0);
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
    }, [audio?.id]);

    useEffect(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.src = currentTrack.url;
            audioRef.current.load();
        }
    }, [currentTrack?.url]);

    useEffect(() => {
        if (audioRef.current) {
            const speed = speedPreset === 'slowed' ? 0.8 : speedPreset === 'nightcore' ? 1.2 : 1.0;
            audioRef.current.playbackRate = speed;
        }
    }, [speedPreset]);

    const handlePrevious = useCallback(() => {
        if (!audio || !onSelectAudio || audios.length === 0) return;
        const currentIndex = audios.findIndex((a) => a.id === audio.id);
        if (currentIndex > 0) {
            onSelectAudio(audios[currentIndex - 1]);
        }
    }, [audio, audios, onSelectAudio]);

    const handleNext = useCallback(() => {
        if (!audio || !onSelectAudio || audios.length === 0) return;
        const currentIndex = audios.findIndex((a) => a.id === audio.id);
        if (currentIndex < audios.length - 1) {
            onSelectAudio(audios[currentIndex + 1]);
        }
    }, [audio, audios, onSelectAudio]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === ' ') {
                e.preventDefault();
                togglePlayPause();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, handlePrevious, handleNext, isPlaying]);

    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setProgress(value[0]);
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const playPrevTrack = () => {
        if (selectedTrackIndex > 0) {
            setSelectedTrackIndex(selectedTrackIndex - 1);
            setIsPlaying(false);
        }
    };

    const playNextTrack = () => {
        if (selectedTrackIndex < tracks.length - 1) {
            setSelectedTrackIndex(selectedTrackIndex + 1);
            setIsPlaying(false);
        }
    };

    const handleTrackEnded = () => {
        if (isRepeatOn) {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
        } else if (isShuffleOn && tracks.length > 1) {
            let randomIndex = Math.floor(Math.random() * tracks.length);
            while (randomIndex === selectedTrackIndex) {
                randomIndex = Math.floor(Math.random() * tracks.length);
            }
            setSelectedTrackIndex(randomIndex);
            setIsPlaying(false);
        } else {
            playNextTrack();
        }
    };

    const getTrackTitle = () => {
        if (audio.prompt) {
            const lines = audio.prompt.split('\n');
            const firstLine = lines[0]?.trim();
            if (firstLine && firstLine.length > 0 && firstLine.length < 60) {
                return firstLine;
            }
        }
        return language === 'ru' ? `Трек ${selectedTrackIndex + 1}` : `Track ${selectedTrackIndex + 1}`;
    };

    const getArtistName = () => {
        return user?.display_name || (language === 'ru' ? 'Пользователь' : 'User');
    };

    if (!audio) return null;

    const handleDownload = async (trackIndex?: number) => {
        const idx = trackIndex ?? selectedTrackIndex;
        const track = tracks[idx];
        if (!track) return;
        
        try {
            const response = await fetch(track.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `audio-${audio.id}-track-${idx + 1}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            const link = document.createElement('a');
            link.href = track.url;
            link.download = `audio-${audio.id}-track-${idx + 1}.mp3`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.click();
        }
    };

    const handleDownloadAll = () => {
        tracks.forEach((_, idx) => handleDownload(idx));
    };

    const handleCopyPrompt = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(audio.prompt);
        toast.success(language === 'ru' ? 'Промпт скопирован' : 'Prompt copied');
    };

    const handleRemix = () => {
        onRemix(audio);
        onOpenChange(false);
    };

    const handleExtend = () => {
        router.push(`/app/create/audio?extend=${encodeURIComponent(currentTrack?.url || '')}&prompt=${encodeURIComponent(audio.prompt)}`);
        onOpenChange(false);
    };

    const handleDelete = () => {
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        removeGeneration(audio.id);
        toast.success(language === 'ru' ? 'Удалено' : 'Deleted');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="fixed inset-0 w-full h-full max-w-none p-0 border-none bg-black overflow-hidden"
                showCloseButton={false}
            >
                <VisuallyHidden>
                    <DialogTitle>Audio Details</DialogTitle>
                </VisuallyHidden>

                <div className="flex flex-col lg:flex-row h-full w-full relative">
                    <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none lg:hidden">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all pointer-events-auto"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex gap-2 pointer-events-auto">
                            <button
                                onClick={handlePrevious}
                                className="p-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                disabled={audios.findIndex((a) => a.id === audio.id) === 0}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="p-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                disabled={audios.findIndex((a) => a.id === audio.id) === audios.length - 1}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative flex flex-col items-center bg-black pt-16 pb-4 px-4 lg:pt-12 lg:pb-12 lg:px-12 min-h-0 overflow-y-auto lg:justify-center">
                        <div className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-md mx-auto shrink-0">
                            <div className="relative w-full aspect-square rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl mb-4 lg:mb-6">
                                {currentTrack?.cover ? (
                                    <img
                                        src={currentTrack.cover}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#6F00FF]/30 to-purple-500/30 flex items-center justify-center">
                                        <Music className="w-16 h-16 lg:w-24 lg:h-24 text-white/40" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20" />
                            </div>
                            
                            <div className="text-center mb-6 lg:mb-8">
                                <h2 className="text-lg lg:text-xl font-bold text-white truncate mb-1">
                                    {getTrackTitle()}
                                </h2>
                                <p className="text-sm text-white/50">
                                    {getArtistName()}
                                </p>
                            </div>
                        </div>

                        <div className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-md mx-auto space-y-4 shrink-0">
                            <div className="flex items-center justify-center gap-4 lg:gap-6">
                                <button
                                    onClick={() => setIsShuffleOn(!isShuffleOn)}
                                    className={`p-2 rounded-full transition-all ${isShuffleOn ? 'text-[#6F00FF]' : 'text-white/40 hover:text-white'}`}
                                >
                                    <Shuffle className="w-4 h-4 lg:w-5 lg:h-5" />
                                </button>
                                <button
                                    onClick={playPrevTrack}
                                    disabled={selectedTrackIndex === 0}
                                    className="p-3 rounded-full text-white/60 hover:text-white disabled:opacity-30 transition-all"
                                >
                                    <SkipBack className="w-5 h-5 lg:w-6 lg:h-6" />
                                </button>
                                <button
                                    onClick={togglePlayPause}
                                    className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6 lg:w-7 lg:h-7 text-black fill-black" />
                                    ) : (
                                        <Play className="w-6 h-6 lg:w-7 lg:h-7 text-black fill-black ml-1" />
                                    )}
                                </button>
                                <button
                                    onClick={playNextTrack}
                                    disabled={selectedTrackIndex === tracks.length - 1}
                                    className="p-3 rounded-full text-white/60 hover:text-white disabled:opacity-30 transition-all"
                                >
                                    <SkipForward className="w-5 h-5 lg:w-6 lg:h-6" />
                                </button>
                                <button
                                    onClick={() => setIsRepeatOn(!isRepeatOn)}
                                    className={`p-2 rounded-full transition-all ${isRepeatOn ? 'text-[#6F00FF]' : 'text-white/40 hover:text-white'}`}
                                >
                                    <Repeat className="w-4 h-4 lg:w-5 lg:h-5" />
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setSpeedPreset('normal')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        speedPreset === 'normal'
                                            ? 'bg-white text-black'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    Normal
                                </button>
                                <button
                                    onClick={() => setSpeedPreset('slowed')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        speedPreset === 'slowed'
                                            ? 'bg-[#6F00FF] text-white'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    Slowed
                                </button>
                                <button
                                    onClick={() => setSpeedPreset('nightcore')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        speedPreset === 'nightcore'
                                            ? 'bg-pink-500 text-white'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    Nightcore
                                </button>
                            </div>

                            <div className="space-y-2">
                                <Slider
                                    value={[progress]}
                                    max={duration || 100}
                                    step={0.1}
                                    onValueChange={handleSeek}
                                    className="cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-white/40 font-mono">
                                    <span>{formatTime(progress)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {tracks.length > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    {tracks.map((track, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedTrackIndex(idx);
                                                setIsPlaying(false);
                                            }}
                                            className={`relative w-12 h-12 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl overflow-hidden transition-all border-2 ${
                                                selectedTrackIndex === idx
                                                    ? 'border-[#6F00FF] scale-105'
                                                    : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            {track.cover ? (
                                                <img
                                                    src={track.cover}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                                    <Music className="w-4 h-4 lg:w-5 lg:h-5 text-white/40" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <span className="text-[10px] font-bold">{idx + 1}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="lg:hidden w-full max-w-[280px] sm:max-w-[320px] mx-auto mt-6 space-y-4">
                            {audio.prompt && (
                                <div className="text-sm text-white/60 leading-relaxed line-clamp-3">
                                    {audio.prompt}
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold uppercase tracking-wider text-white/40">
                                <span className="px-2 py-1 bg-white/5 rounded">{audio.model}</span>
                                <span className="px-2 py-1 bg-white/5 rounded">{formatTime(duration)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleExtend}
                                    className="flex items-center justify-center gap-2 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-[10px] font-bold uppercase tracking-wider"
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Продлить' : 'Extend'}
                                </button>
                                <button
                                    onClick={handleRemix}
                                    className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#6F00FF] hover:bg-[#7F20FF] text-white transition-all text-[10px] font-black uppercase tracking-wider"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Пересоздать' : 'Recreate'}
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadAll}
                                    className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2 transition-all border border-white/10 font-bold text-[10px] uppercase tracking-widest"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Скачать' : 'Save'}
                                </button>
                                <button
                                    onClick={() => onToggleLike(audio.id)}
                                    className={`w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 ${
                                        currentAudio?.is_favorite ? 'text-red-500' : 'text-white'
                                    }`}
                                >
                                    <Heart
                                        className={`w-4 h-4 ${
                                            currentAudio?.is_favorite ? 'fill-current' : ''
                                        }`}
                                    />
                                </button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/10">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-xl p-2 min-w-[160px]"
                                    >
                                        <DropdownMenuItem className="gap-3 py-2.5 rounded-lg cursor-pointer focus:bg-white/10 text-sm">
                                            <Share2 className="w-4 h-4" />{' '}
                                            {language === 'ru' ? 'Поделиться' : 'Share'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setIsAddToCollectionOpen(true)}
                                            className="gap-3 py-2.5 rounded-lg cursor-pointer focus:bg-white/10 text-sm"
                                        >
                                            <FolderPlus className="w-4 h-4" />{' '}
                                            {language === 'ru' ? 'В папку' : 'Add to folder'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleDelete}
                                            className="gap-3 py-2.5 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/10 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />{' '}
                                            {language === 'ru' ? 'Удалить' : 'Delete'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex w-[450px] bg-[#0A0A0A] border-l border-white/5 flex-col h-full relative overflow-hidden">
                        <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevious}
                                    className="p-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                    disabled={audios.findIndex((a) => a.id === audio.id) === 0}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="p-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                                    disabled={audios.findIndex((a) => a.id === audio.id) === audios.length - 1}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="p-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 scrollbar-hide">
                            {audio.prompt && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" />
                                        {language === 'ru' ? 'Текст песни' : 'Lyrics'}
                                    </h3>
                                    <div className="text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap bg-white/[0.02] rounded-xl p-4 border border-white/5 max-h-[200px] overflow-y-auto scrollbar-hide">
                                        {audio.prompt}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {language === 'ru' ? 'Описание' : 'Description'}
                                    </h3>
                                    <button
                                        onClick={handleCopyPrompt}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                                        title={language === 'ru' ? 'Копировать' : 'Copy'}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-sm text-white/70 leading-relaxed">
                                    {audio.prompt?.slice(0, 100) || (language === 'ru' ? 'Без описания' : 'No description')}
                                    {audio.prompt && audio.prompt.length > 100 && '...'}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap text-[10px] font-bold uppercase tracking-wider text-white/50">
                                <span className="px-2.5 py-1.5 bg-white/5 rounded-lg">{audio.model}</span>
                                <span className="px-2.5 py-1.5 bg-white/5 rounded-lg">{formatTime(duration)}</span>
                                <span className="px-2.5 py-1.5 bg-white/5 rounded-lg">{new Date(audio.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="p-4 lg:p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleExtend}
                                    className="flex flex-col items-center justify-center gap-1 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-[9px] font-bold uppercase tracking-wider"
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Продлить' : 'Extend'}
                                </button>
                                <button
                                    onClick={handleRemix}
                                    className="flex flex-col items-center justify-center gap-1 h-16 rounded-2xl bg-[#6F00FF] hover:bg-[#7F20FF] text-white transition-all text-[9px] font-black uppercase tracking-wider shadow-[0_0_20px_rgba(111,0,255,0.15)]"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Пересоздать' : 'Recreate'}
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadAll}
                                    className="flex-1 h-11 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2 transition-all border border-white/10 font-bold text-[10px] uppercase tracking-widest"
                                    title="Download"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Скачать' : 'Save'}
                                    {tracks.length > 1 && ` (${tracks.length})`}
                                </button>
                                <button
                                    onClick={() => onToggleLike(audio.id)}
                                    className={`w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 ${
                                        currentAudio?.is_favorite ? 'text-red-500' : 'text-white'
                                    }`}
                                >
                                    <Heart
                                        className={`w-4 h-4 ${
                                            currentAudio?.is_favorite ? 'fill-current' : ''
                                        }`}
                                    />
                                </button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/10">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2 min-w-[180px]"
                                    >
                                        <DropdownMenuItem className="gap-3 py-3 rounded-lg cursor-pointer focus:bg-white/10">
                                            <Share2 className="w-4 h-4" />{' '}
                                            {language === 'ru' ? 'Поделиться' : 'Share'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setIsAddToCollectionOpen(true)}
                                            className="gap-3 py-3 rounded-lg cursor-pointer focus:bg-white/10"
                                        >
                                            <FolderPlus className="w-4 h-4" />{' '}
                                            {language === 'ru' ? 'В папку' : 'Add to folder'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleDelete}
                                            className="gap-3 py-3 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />{' '}
                                            {language === 'ru' ? 'Удалить' : 'Delete'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={handleTrackEnded}
                />

                <AddToCollectionModal
                    generationIds={[audio.id]}
                    open={isAddToCollectionOpen}
                    onOpenChange={setIsAddToCollectionOpen}
                />

                <ConfirmDeleteDialog
                    open={isDeleteConfirmOpen}
                    onOpenChange={setIsDeleteConfirmOpen}
                    onConfirm={handleConfirmDelete}
                />
            </DialogContent>
        </Dialog>
    );
}
