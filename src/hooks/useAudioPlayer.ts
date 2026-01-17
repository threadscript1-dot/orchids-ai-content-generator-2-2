'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Generation } from '@/stores/generation-store';

interface CurrentTrack {
    url: string;
    cover?: string;
    title: string;
    genId: string;
    trackIndex: number;
}

interface AudioTrack {
    url: string;
    cover?: string;
    index: number;
}

export function useAudioPlayer(audioGenerations: Generation[]) {
    const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Extract audio tracks with covers from result_assets
    const getAudioTracks = useCallback((gen: Generation): AudioTrack[] => {
        if (!gen.result_assets || gen.result_assets.length === 0) return [];

        const tracks: AudioTrack[] = [];
        const assets = gen.result_assets;

        // Pattern: audio, cover, audio, cover
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            if (
                asset.mime?.startsWith('audio/') ||
                asset.url?.endsWith('.bin') ||
                asset.url?.endsWith('.mp3')
            ) {
                const coverAsset = assets[i + 1];
                const cover = coverAsset?.mime?.startsWith('image/') ? coverAsset.url : undefined;
                tracks.push({
                    url: asset.url,
                    cover,
                    index: tracks.length,
                });
            }
        }

        return tracks;
    }, []);

    // Play a specific track (or toggle if already playing)
    const playTrack = useCallback(
        (gen: Generation, trackIndex: number) => {
            const tracks = getAudioTracks(gen);
            const track = tracks[trackIndex];
            if (!track) return;

            // If clicking on the same track that's currently playing, toggle pause
            if (currentTrack?.genId === gen.id && currentTrack?.trackIndex === trackIndex) {
                if (audioRef.current) {
                    if (isPlaying) {
                        audioRef.current.pause();
                    } else {
                        audioRef.current.play();
                    }
                }
                setIsPlaying(!isPlaying);
                return;
            }

            const title =
                (gen as any).input?.title || gen.prompt?.slice(0, 30) || 'Untitled';

            setCurrentTrack({
                url: track.url,
                cover: track.cover,
                title: `${title}${tracks.length > 1 ? ` (Track ${trackIndex + 1})` : ''}`,
                genId: gen.id,
                trackIndex,
            });
            setIsPlaying(true);
        },
        [getAudioTracks, currentTrack, isPlaying]
    );

    // Toggle play/pause
    const togglePlayPause = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    // Handle audio time update
    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            setAudioProgress(audioRef.current.currentTime);
        }
    }, []);

    // Handle audio loaded metadata
    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current) {
            setAudioDuration(audioRef.current.duration);
        }
    }, []);

    // Seek to position
    const handleSeek = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!audioRef.current || !audioDuration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = percent * audioDuration;
        },
        [audioDuration]
    );

    // Handle volume change
    const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setVolume(percent);
        if (audioRef.current) {
            audioRef.current.volume = percent;
        }
    }, []);

    // Play next track
    const playNextTrack = useCallback(() => {
        if (!currentTrack || !Array.isArray(audioGenerations)) return;
        const gen = audioGenerations.find((g) => g.id === currentTrack.genId);
        if (!gen) return;

        const tracks = getAudioTracks(gen);
        if (currentTrack.trackIndex < tracks.length - 1) {
            playTrack(gen, currentTrack.trackIndex + 1);
        } else {
            // Play first track of next generation
            const currentIndex = audioGenerations.findIndex((g) => g.id === currentTrack.genId);
            if (currentIndex < audioGenerations.length - 1) {
                const nextGen = audioGenerations[currentIndex + 1];
                if (nextGen.status === 'success') {
                    playTrack(nextGen, 0);
                }
            }
        }
    }, [currentTrack, audioGenerations, getAudioTracks, playTrack]);

    // Play previous track
    const playPrevTrack = useCallback(() => {
        if (!currentTrack || !Array.isArray(audioGenerations)) return;
        const gen = audioGenerations.find((g) => g.id === currentTrack.genId);
        if (!gen) return;

        if (currentTrack.trackIndex > 0) {
            playTrack(gen, currentTrack.trackIndex - 1);
        } else {
            // Play last track of previous generation
            const currentIndex = audioGenerations.findIndex((g) => g.id === currentTrack.genId);
            if (currentIndex > 0) {
                const prevGen = audioGenerations[currentIndex - 1];
                if (prevGen.status === 'success') {
                    const tracks = getAudioTracks(prevGen);
                    playTrack(prevGen, tracks.length - 1);
                }
            }
        }
    }, [currentTrack, audioGenerations, getAudioTracks, playTrack]);

    // Format time for display
    const formatDuration = useCallback((seconds: number): string => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Effect to handle audio element
    useEffect(() => {
        if (currentTrack && audioRef.current) {
            audioRef.current.src = currentTrack.url;
            audioRef.current.volume = volume;
            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            }
        }
    }, [currentTrack?.url]);

    // Effect for playback speed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    return {
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
    };
}
