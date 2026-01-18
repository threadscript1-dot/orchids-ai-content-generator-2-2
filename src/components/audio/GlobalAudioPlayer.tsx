'use client';

import { useAudio } from '@/context/audio-context';
import { AudioPlayerFooter } from './AudioPlayerFooter';

export function GlobalAudioPlayer() {
    const {
        currentTrack,
        isPlaying,
        audioProgress,
        audioDuration,
        volume,
        playbackSpeed,
        setPlaybackSpeed,
        togglePlayPause,
        handleSeek,
        handleVolumeChange,
        playNextTrack,
        playPrevTrack,
        formatDuration,
    } = useAudio();

    if (!currentTrack) return null;

    const onSeekInternal = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        handleSeek(percent);
    };

    const onVolumeChangeInternal = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        handleVolumeChange(percent);
    };

    return (
        <AudioPlayerFooter
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            audioProgress={audioProgress}
            audioDuration={audioDuration}
            volume={volume}
            playbackSpeed={playbackSpeed}
            onTogglePlayPause={togglePlayPause}
            onSeek={onSeekInternal}
            onVolumeChange={onVolumeChangeInternal}
            onPlaybackSpeedChange={setPlaybackSpeed}
            onPlayNext={playNextTrack}
            onPlayPrev={playPrevTrack}
            formatDuration={formatDuration}
        />
    );
}
