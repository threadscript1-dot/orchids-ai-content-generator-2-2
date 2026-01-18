'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Generation } from '@/stores/generation-store';

export interface CurrentTrack {
    url: string;
    cover?: string;
    title: string;
    genId: string;
    trackIndex: number;
}

export interface AudioTrack {
    url: string;
    cover?: string;
    index: number;
}

interface AudioContextType {
    currentTrack: CurrentTrack | null;
    playlist: Generation[];
    isPlaying: boolean;
    audioProgress: number;
    audioDuration: number;
    volume: number;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
    playTrack: (gen: Generation, trackIndex: number, newPlaylist?: Generation[]) => void;
    togglePlayPause: () => void;
    handleSeek: (percent: number) => void;
    handleVolumeChange: (percent: number) => void;
    playNextTrack: () => void;
    playPrevTrack: () => void;
    getAudioTracks: (gen: Generation) => AudioTrack[];
    formatDuration: (seconds: number) => string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
    const [playlist, setPlaylist] = useState<Generation[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasMounted = useRef(false);

    // Initial mount check to avoid hydration issues
    useEffect(() => {
        hasMounted.current = true;
    }, []);

    // Create audio element programmatically to ensure it persists
    useEffect(() => {
        if (!audioRef.current && typeof window !== 'undefined') {
            audioRef.current = new Audio();
            audioRef.current.preload = 'metadata';
        }

        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setAudioProgress(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setAudioDuration(audio.duration);
        };

        const handleEnded = () => {
            playNextTrack();
        };

        const handlePlayEvent = () => setIsPlaying(true);
        const handlePauseEvent = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlayEvent);
        audio.addEventListener('pause', handlePauseEvent);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlayEvent);
            audio.removeEventListener('pause', handlePauseEvent);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Play a specific track
    const playTrack = useCallback(
        (gen: Generation, trackIndex: number, newPlaylist?: Generation[]) => {
            if (newPlaylist) {
                setPlaylist(newPlaylist);
            }

            const tracks = getAudioTracks(gen);
            const track = tracks[trackIndex];
            if (!track) return;

            // If clicking on the same track that's currently playing, toggle pause
            if (currentTrack?.genId === gen.id && currentTrack?.trackIndex === trackIndex) {
                const audio = audioRef.current;
                if (audio) {
                    if (isPlaying) {
                        audio.pause();
                    } else {
                        audio.play().catch(console.error);
                    }
                }
                return;
            }

            const title =
                (gen as any).input?.title || gen.prompt?.slice(0, 30) || 'Untitled';

            const newTrackData = {
                url: track.url,
                cover: track.cover,
                title: `${title}${tracks.length > 1 ? ` (Track ${trackIndex + 1})` : ''}`,
                genId: gen.id,
                trackIndex,
            };

            setCurrentTrack(newTrackData);
            
            const audio = audioRef.current;
            if (audio) {
                audio.src = track.url;
                audio.volume = volume;
                audio.playbackRate = playbackSpeed;
                audio.play().catch(console.error);
            }
        },
        [getAudioTracks, currentTrack, isPlaying, volume, playbackSpeed]
    );

    // Toggle play/pause
    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(console.error);
        }
    }, [isPlaying]);

    // Seek to position (percent 0-1)
    const handleSeek = useCallback(
        (percent: number) => {
            const audio = audioRef.current;
            if (!audio || !audioDuration) return;
            audio.currentTime = percent * audioDuration;
        },
        [audioDuration]
    );

    // Handle volume change (percent 0-1)
    const handleVolumeChange = useCallback((percent: number) => {
        setVolume(percent);
        if (audioRef.current) {
            audioRef.current.volume = percent;
        }
    }, []);

    // Play next track
    const playNextTrack = useCallback(() => {
        if (!currentTrack || playlist.length === 0) return;
        
        const currentGen = playlist.find((g) => g.id === currentTrack.genId);
        if (!currentGen) return;

        const tracks = getAudioTracks(currentGen);
        if (currentTrack.trackIndex < tracks.length - 1) {
            playTrack(currentGen, currentTrack.trackIndex + 1);
        } else {
            // Play first track of next generation in playlist
            const currentGenIndex = playlist.findIndex((g) => g.id === currentTrack.genId);
            if (currentGenIndex !== -1 && currentGenIndex < playlist.length - 1) {
                const nextGen = playlist[currentGenIndex + 1];
                if (nextGen.status === 'success') {
                    playTrack(nextGen, 0);
                }
            }
        }
    }, [currentTrack, playlist, getAudioTracks, playTrack]);

    const playPrevTrack = useCallback(() => {
        if (!currentTrack || playlist.length === 0) return;
        
        const currentGen = playlist.find((g) => g.id === currentTrack.genId);
        if (!currentGen) return;

            if (currentTrack.trackIndex > 0) {
            playTrack(currentGen, currentTrack.trackIndex - 1);
        } else {
            // Play last track of previous generation in playlist
            const currentGenIndex = playlist.findIndex((g) => g.id === currentTrack.genId);
            if (currentGenIndex > 0) {
                const prevGen = playlist[currentGenIndex - 1];
                if (prevGen.status === 'success') {
                    const tracks = getAudioTracks(prevGen);
                    playTrack(prevGen, tracks.length - 1);
                }
            }
        }
    }, [currentTrack, playlist, getAudioTracks, playTrack]);

    // Format time for display
    const formatDuration = useCallback((seconds: number): string => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Effect for playback speed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    return (
        <AudioContext.Provider
            value={{
                currentTrack,
                playlist,
                isPlaying,
                audioProgress,
                audioDuration,
                volume,
                playbackSpeed,
                setPlaybackSpeed,
                playTrack,
                togglePlayPause,
                handleSeek,
                handleVolumeChange,
                playNextTrack,
                playPrevTrack,
                getAudioTracks,
                formatDuration,
            }}
        >
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
