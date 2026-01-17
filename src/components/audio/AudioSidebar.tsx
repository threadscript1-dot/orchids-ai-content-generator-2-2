'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    Loader2,
    Zap,
    Shuffle,
    ChevronDown,
    ChevronRight,
    Sparkles,
    Cpu,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { Model } from '@/stores/models-store';
import { AUDIO_STYLES } from '@/constants/audio-styles';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface AudioSidebarProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    lyrics: string;
    onLyricsChange: (value: string) => void;
    songTitle: string;
    onSongTitleChange: (value: string) => void;
    style: string;
    onStyleChange: (value: string) => void;
    models: Model[];
    selectedModelId: string;
    onModelChange: (value: string) => void;
    weirdness: number[];
    onWeirdnessChange: (value: number[]) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    isSidebarMinimized: boolean;
    onToggleSidebar: () => void;
}

export function AudioSidebar({
    prompt,
    onPromptChange,
    lyrics,
    onLyricsChange,
    songTitle,
    onSongTitleChange,
    style,
    onStyleChange,
    models,
    selectedModelId,
    onModelChange,
    weirdness,
    onWeirdnessChange,
    isGenerating,
    onGenerate,
    isSidebarMinimized,
    onToggleSidebar,
}: AudioSidebarProps) {
    const { language } = useLanguage();
    const [showLyrics, setShowLyrics] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [displayedStyles, setDisplayedStyles] = useState<string[]>(() => getRandomStyles());

    const selectedModel = models.find((m) => m.id === selectedModelId);

    function getRandomStyles() {
        const currentStyles = style
            .toLowerCase()
            .split(',')
            .map((s) => s.trim());
        const filtered = AUDIO_STYLES.filter((s) => !currentStyles.includes(s.toLowerCase()));
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 15);
    }

    const shuffleStyles = () => {
        setDisplayedStyles(getRandomStyles());
    };

    const generateLyrics = () => {
        onLyricsChange(
            language === 'ru'
                ? 'В звездной ночи, где мечты оживают,\nМы строим миры, что в огне не сгорают.\nСквозь тернии к свету, сквозь время и мрак,\nМы ищем свой путь, подавая нам знак.'
                : 'In the starry night, where dreams come alive,\nWe build worlds that in fire will survive.\nThrough thorns to the light, through time and the dark,\nWe seek our own way, giving us a spark.'
        );
    };

    return (
        <AnimatePresence mode="wait">
            {!isSidebarMinimized ? (
                <motion.aside
                    initial={{ x: 0, opacity: 1 }}
                    exit={{ x: -400, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full lg:w-[380px] border-r border-white/5 flex flex-col h-full bg-[#0A0A0A] relative z-30"
                >
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-80">
                        {/* Header for Mobile Collapse */}
                        <div className="flex items-center justify-between lg:hidden mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                                {language === 'ru' ? 'Создать' : 'Create'}
                            </span>
                            <button
                                onClick={onToggleSidebar}
                                className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white"
                            >
                                <ChevronDown className="w-5 h-5 rotate-90" />
                            </button>
                        </div>

                        {/* Lyrics Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setShowLyrics(!showLyrics)}
                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/50 group hover:text-white transition-colors"
                                >
                                    {showLyrics ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                    <span>{language === 'ru' ? 'Текст песни' : 'Lyrics'}</span>
                                </button>
                                <button
                                    onClick={generateLyrics}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6F00FF] transition-all"
                                    title={
                                        language === 'ru'
                                            ? 'Сгенерировать текст'
                                            : 'Generate lyrics'
                                    }
                                >
                                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                                </button>
                            </div>
                            {showLyrics && (
                                <textarea
                                    value={lyrics}
                                    onChange={(e) => onLyricsChange(e.target.value)}
                                    placeholder={
                                        language === 'ru'
                                            ? 'Введите текст песни...'
                                            : 'Enter lyrics...'
                                    }
                                    className="w-full bg-white/[0.03] rounded-2xl p-4 resize-none outline-none text-white placeholder:text-white/20 min-h-[140px] font-mono text-sm border border-white/5 leading-relaxed focus:border-[#6F00FF]/50 transition-all"
                                />
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50 block mb-4">
                                {language === 'ru' ? 'Описание' : 'Description'}
                            </span>
                            <textarea
                                value={prompt}
                                onChange={(e) => onPromptChange(e.target.value)}
                                placeholder={
                                    language === 'ru'
                                        ? 'Общее описание песни...'
                                        : 'General song description...'
                                }
                                className="w-full bg-white/[0.03] rounded-2xl p-4 resize-none outline-none text-white placeholder:text-white/20 min-h-[80px] font-mono text-sm border border-white/5 leading-relaxed focus:border-[#6F00FF]/50 transition-all"
                            />
                        </div>

                        {/* Style Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                                    {language === 'ru' ? 'Стиль' : 'Style'}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onStyleChange('')}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={shuffleStyles}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6F00FF] transition-all"
                                    >
                                        <Shuffle className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={style}
                                onChange={(e) => onStyleChange(e.target.value)}
                                placeholder={
                                    language === 'ru'
                                        ? 'Жанр и стиль музыки...'
                                        : 'Genre and music style...'
                                }
                                className="w-full bg-white/[0.03] rounded-2xl p-4 resize-none outline-none text-white placeholder:text-white/20 min-h-[60px] font-mono text-sm border border-white/5 leading-relaxed focus:border-[#6F00FF]/50 transition-all"
                            />
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                                {displayedStyles.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() =>
                                            onStyleChange(style ? `${style}, ${s}` : s)
                                        }
                                        className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono font-medium lowercase tracking-normal transition-all border border-white/5 hover:border-[#6F00FF]/30"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Advanced + Create */}
                    <div className="absolute bottom-[164px] lg:bottom-[110px] left-0 right-0 p-6 bg-[#0A0A0A] border-t border-white/5 space-y-4 z-40">
                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden space-y-6 mb-4"
                                >
                                    <div className="space-y-4">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50 block mb-4">
                                            {language === 'ru' ? 'Название' : 'Title'}
                                        </span>
                                        <input
                                            type="text"
                                            value={songTitle}
                                            onChange={(e) => onSongTitleChange(e.target.value)}
                                            className="w-full h-12 bg-white/[0.03] rounded-lg px-4 outline-none text-sm font-mono border border-white/5 placeholder:text-white/20"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                                    {language === 'ru' ? 'Креативность' : 'Creativity'}
                                                </span>
                                                <span className="text-[10px] font-mono font-bold text-white">
                                                    {weirdness}%
                                                </span>
                                            </div>
                                            <Slider
                                                value={weirdness}
                                                onValueChange={onWeirdnessChange}
                                                max={100}
                                                step={0.1}
                                                className="py-2"
                                            />
                                        </div>
                                        <Select value={selectedModelId} onValueChange={onModelChange}>
                                            <SelectTrigger className="w-[130px] h-10 bg-white/5 border-none rounded-xl px-3 text-xs font-mono gap-2 hover:bg-white/10 transition-colors shrink-0">
                                                <Cpu className="w-3.5 h-3.5 text-white/40 shrink-0" />
                                                <span className="truncate">{selectedModel?.name}</span>
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0A0A0A] border-white/10 rounded-xl p-2 font-mono">
                                                {models.map((m) => (
                                                    <SelectItem
                                                        key={m.id}
                                                        value={m.id}
                                                        className="rounded-lg"
                                                    >
                                                        <div className="flex items-center justify-between w-full gap-4">
                                                            <span className="font-medium">{m.name}</span>
                                                            <span className="text-credits font-mono text-[10px] font-black opacity-50">
                                                                {m.credits_cost}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-start gap-2 py-1 text-xs font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
                        >
                            {showAdvanced ? (
                                <ChevronDown className="w-3 h-3" />
                            ) : (
                                <ChevronRight className="w-3 h-3" />
                            )}
                            <span>{language === 'ru' ? 'Настройки' : 'Settings'}</span>
                        </button>

                        <button
                            onClick={onGenerate}
                            disabled={!prompt.trim() || isGenerating}
                            className="w-full h-14 rounded-2xl bg-[#6F00FF] text-white font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(111,0,255,0.2)]"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-4">
                                    <span>{language === 'ru' ? 'Создать' : 'Create'}</span>
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 text-[#FFD700]">
                                        <Zap className="w-3 h-3 fill-current" />
                                        <span className="text-[10px] font-black">10</span>
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>
                </motion.aside>
            ) : (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={onToggleSidebar}
                    className="fixed right-6 bottom-[180px] z-[60] w-14 h-14 rounded-2xl bg-[#6F00FF] text-white flex items-center justify-center shadow-[0_0_30px_rgba(111,0,255,0.5)] hover:scale-110 active:scale-95 transition-all lg:hidden"
                >
                    <Plus className="w-7 h-7" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
