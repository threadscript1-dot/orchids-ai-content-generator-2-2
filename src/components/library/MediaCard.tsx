'use client';

import { motion } from 'framer-motion';
import {
    Check,
    Play,
    Image as ImageIcon,
    Video,
    Music,
    X,
    Loader2,
} from 'lucide-react';
import { Generation } from '@/stores/generation-store';
import { useLanguage } from '@/lib/language-context';

interface MediaCardProps {
    generation: Generation;
    isSelected: boolean;
    onToggleSelect: () => void;
    onClick: () => void;
}

export function MediaCard({ generation, isSelected, onToggleSelect, onClick }: MediaCardProps) {
    const { language } = useLanguage();
    const mediaUrl = generation.result_assets?.[0]?.url;
    const isProcessing = generation.status === 'processing' || generation.status === 'queued';

    const renderMediaPreview = () => {
        if (isProcessing) {
            return (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6F00FF]" />
                </div>
            );
        }

        if (generation.status === 'failed') {
            return (
                <div className="w-full h-full bg-red-500/10 flex items-center justify-center">
                    <X className="w-8 h-8 text-red-500" />
                </div>
            );
        }

        switch (generation.type) {
            case 'image':
                return (
                    <div className="relative w-full h-full">
                        {mediaUrl ? (
                            <img
                                src={mediaUrl}
                                alt={generation.prompt}
                                className="w-full h-full object-cover transition-transform duration-700"
                            />
                        ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-white/20" />
                            </div>
                        )}
                        {(generation.result_assets?.length || 0) > 1 && (
                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg text-white/90 opacity-100 sm:group-hover:opacity-0 transition-opacity">
                                <div className="grid grid-cols-2 gap-0.5">
                                    <div className="w-1 h-1 rounded-sm bg-white/60" />
                                    <div className="w-1 h-1 rounded-sm bg-white/60" />
                                    <div className="w-1 h-1 rounded-sm bg-white/60" />
                                    <div className="w-1 h-1 rounded-sm bg-white/20" />
                                </div>
                                <span className="text-[9px] font-bold text-white/90">{generation.result_assets?.length}</span>
                            </div>
                        )}
                    </div>
                );

            case 'video':
                return mediaUrl ? (
                    <div className="relative w-full h-full">
                        <video
                            src={mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                            <Play className="w-12 h-12 fill-white/50 group-hover:fill-white transition-colors ml-1" />
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <Video className="w-8 h-8 text-white/20" />
                    </div>
                );

            case 'audio':
                const assets = generation.result_assets || [];
                const covers: string[] = [];
                for (let i = 0; i < assets.length; i++) {
                    const asset = assets[i];
                    if (asset.mime?.startsWith('audio/') || asset.url?.endsWith('.mp3')) {
                        const next = assets[i + 1];
                        if (next?.mime?.startsWith('image/')) {
                            covers.push(next.url);
                        }
                    }
                }
                return (
                    <div className="w-full h-full bg-[#111]/80 backdrop-blur-xl flex overflow-hidden">
                        {covers.length >= 2 ? (
                            <>
                                <div className="w-1/2 h-full border-r border-white/5">
                                    <img src={covers[0]} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="w-1/2 h-full">
                                    <img src={covers[1]} className="w-full h-full object-cover" alt="" />
                                </div>
                            </>
                        ) : covers.length === 1 ? (
                            <img src={covers[0]} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#6F00FF]/20 to-purple-500/20 backdrop-blur-xl flex items-center justify-center">
                                <Music className="w-12 h-12 text-white/40" />
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="group-hover:scale-110 transition-transform">
                                <Play className="w-12 h-12 fill-white/50 group-hover:fill-white transition-colors ml-1" />
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                );
        }
    };

    if (generation.type === 'audio') {
        return (
            <motion.div
                layout="position"
                initial={false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`group relative aspect-square rounded-[24px] overflow-hidden cursor-pointer transition-all duration-200 ${
                    isSelected
                        ? 'ring-2 ring-white ring-offset-4 ring-offset-black scale-[0.98]'
                        : ''
                }`}
                onClick={onClick}
            >
                {renderMediaPreview()}
                
                {!isProcessing && generation.status === 'success' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <p className="text-sm font-mono line-clamp-2 text-white/90 leading-relaxed mb-1">
                            {generation.prompt}
                        </p>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                            {new Date(generation.created_at).toLocaleDateString(
                                language === 'ru' ? 'ru-RU' : 'en-US',
                                { day: 'numeric', month: 'short' }
                            )}
                        </span>
                    </div>
                )}

                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect();
                    }}
                    className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center z-10 ${
                        isSelected
                            ? 'bg-white border-white'
                            : 'bg-black/20 border-white/20 opacity-0 group-hover:opacity-100'
                    }`}
                >
                    {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout="position"
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className={`group relative aspect-square rounded-[24px] overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected
                    ? 'ring-2 ring-white ring-offset-4 ring-offset-black scale-[0.98]'
                    : ''
            }`}
            onClick={onClick}
        >
            {renderMediaPreview()}

            {!isProcessing && generation.status === 'success' && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <p className="text-sm font-mono line-clamp-2 text-white/90 leading-relaxed">
                        {generation.prompt}
                    </p>
                </div>
            )}

            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect();
                }}
                className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center z-10 ${
                    isSelected
                        ? 'bg-white border-white'
                        : 'bg-black/20 border-white/20 opacity-0 group-hover:opacity-100'
                }`}
            >
                {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
            </div>
        </motion.div>
    );
}
