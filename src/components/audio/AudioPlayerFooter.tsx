'use client';

import { useRef, useCallback } from 'react';
import {
    Play,
    Pause,
    Music,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    Gauge,
    Volume2,
    Heart,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CurrentTrack {
    url: string;
    cover?: string;
    title: string;
    genId: string;
    trackIndex: number;
}

interface AudioPlayerFooterProps {
    currentTrack: CurrentTrack | null;
    isPlaying: boolean;
    audioProgress: number;
    audioDuration: number;
    volume: number;
    speedPreset: 'normal' | 'slowed' | 'nightcore';
    onTogglePlayPause: () => void;
    onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
    onVolumeChange: (e: React.MouseEvent<HTMLDivElement>) => void;
    onSpeedPresetChange: (preset: 'normal' | 'slowed' | 'nightcore') => void;
    onPlayNext: () => void;
    onPlayPrev: () => void;
    formatDuration: (seconds: number) => string;
}

export function AudioPlayerFooter({
    currentTrack,
    isPlaying,
    audioProgress,
    audioDuration,
    volume,
    speedPreset,
    onTogglePlayPause,
    onSeek,
    onVolumeChange,
    onSpeedPresetChange,
    onPlayNext,
    onPlayPrev,
    formatDuration,
}: AudioPlayerFooterProps) {
    const { language } = useLanguage();
    const volumeRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    const calculateVolume = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!volumeRef.current) return;
        const rect = volumeRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onVolumeChange({ currentTarget: { getBoundingClientRect: () => rect }, clientX: e.clientX } as any);
    }, [onVolumeChange]);

    const handleVolumeMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        calculateVolume(e);

        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingRef.current) {
                calculateVolume(e);
            }
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [calculateVolume]);

    return (
        <footer className="fixed bottom-16 lg:bottom-0 left-0 right-0 h-[100px] lg:h-[110px] bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/5 flex flex-col z-50">
            {/* Progress Bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1 bg-white/5 cursor-pointer group z-10"
                onClick={onSeek}
            >
                <div
                    className="h-full bg-[#6F00FF] group-hover:bg-[#8B33FF] transition-all"
                    style={{
                        width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : '0%',
                    }}
                />
                <div
                    className="absolute top-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{
                        left: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : '0%',
                    }}
                />
            </div>

            {/* Controls Row */}
            <div className="flex-1 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 lg:gap-8">
                {/* Left: Info & Playback Speed */}
                <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-md bg-white/5 flex items-center justify-center border border-white/5 shrink-0 overflow-hidden">
                        {currentTrack?.cover ? (
                            <img
                                src={currentTrack.cover}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Music className="w-5 h-5 lg:w-6 lg:h-6 text-white/20" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-xs lg:text-sm font-bold truncate">
                            {currentTrack?.title ||
                                (language === 'ru' ? 'Ничего не воспроизводится' : 'Nothing playing')}
                        </h4>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest truncate">
                            {currentTrack
                                ? `${formatDuration(audioProgress)} / ${formatDuration(audioDuration)}`
                                : language === 'ru'
                                ? 'Выберите трек'
                                : 'Select a track'}
                        </p>
                    </div>

                    {/* Speed Preset Chips */}
                    <div className="hidden sm:flex items-center gap-1 p-1 bg-white/5 rounded-full">
                        <button
                            onClick={() => onSpeedPresetChange('normal')}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                speedPreset === 'normal'
                                    ? 'bg-white text-black'
                                    : 'text-white/40 hover:text-white'
                            }`}
                        >
                            Normal
                        </button>
                        <button
                            onClick={() => onSpeedPresetChange('slowed')}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                speedPreset === 'slowed'
                                    ? 'bg-[#6F00FF] text-white'
                                    : 'text-white/40 hover:text-white'
                            }`}
                        >
                            Slowed
                        </button>
                        <button
                            onClick={() => onSpeedPresetChange('nightcore')}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                speedPreset === 'nightcore'
                                    ? 'bg-pink-500 text-white'
                                    : 'text-white/40 hover:text-white'
                            }`}
                        >
                            Nightcore
                        </button>
                    </div>
                </div>

                {/* Center: Main Controls */}
                <div className="flex items-center gap-3 lg:gap-8">
                    <button className="hidden sm:block text-white/20 hover:text-white transition-colors">
                        <Shuffle className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-4 lg:gap-6">
                        <button
                            onClick={onPlayPrev}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <SkipBack className="w-5 h-5 fill-current" />
                        </button>
                        <button
                            onClick={onTogglePlayPause}
                            disabled={!currentTrack}
                            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 lg:w-6 lg:h-6 fill-current" />
                            ) : (
                                <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-current ml-0.5" />
                            )}
                        </button>
                        <button
                            onClick={onPlayNext}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <SkipForward className="w-5 h-5 fill-current" />
                        </button>
                    </div>
                    <button className="hidden sm:block text-white/20 hover:text-white transition-colors">
                        <Repeat className="w-4 h-4" />
                    </button>
                </div>

                {/* Right: Volume */}
                <div className="hidden lg:flex items-center justify-end gap-6 flex-1">
                    <div className="flex items-center gap-3 group">
                        <Volume2 className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                        <div
                            ref={volumeRef}
                            className="w-24 h-1.5 bg-white/5 rounded-full relative overflow-hidden cursor-pointer"
                            onMouseDown={handleVolumeMouseDown}
                        >
                            <div
                                className="absolute inset-y-0 left-0 bg-white/20 group-hover:bg-[#6F00FF] transition-all rounded-full"
                                style={{ width: `${volume * 100}%` }}
                            />
                            <div
                                className="absolute top-1/2 w-3 h-3 bg-white rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                style={{ left: `calc(${volume * 100}% - 6px)` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Right: Small buttons */}
                <div className="lg:hidden flex items-center gap-2">
                    <button className="p-2 text-white/40">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </footer>
    );
}
