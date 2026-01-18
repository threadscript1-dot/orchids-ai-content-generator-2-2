'use client';

import { useState, useMemo } from 'react';
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
    Music,
    Mic,
    Settings2,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AUDIO_STYLES } from '@/constants/audio-styles';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { SunoParams } from '@/stores/generation-store';

export type SunoModel = 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';

interface AudioSidebarProps {
    customMode: boolean;
    onCustomModeChange: (value: boolean) => void;
    instrumental: boolean;
    onInstrumentalChange: (value: boolean) => void;
    prompt: string;
    onPromptChange: (value: string) => void;
    style: string;
    onStyleChange: (value: string) => void;
    title: string;
    onTitleChange: (value: string) => void;
    model: SunoModel;
    onModelChange: (value: SunoModel) => void;
    negativeTags: string;
    onNegativeTagsChange: (value: string) => void;
    vocalGender: 'm' | 'f' | undefined;
    onVocalGenderChange: (value: 'm' | 'f' | undefined) => void;
    styleWeight: number;
    onStyleWeightChange: (value: number) => void;
    weirdnessConstraint: number;
    onWeirdnessConstraintChange: (value: number) => void;
    audioWeight: number;
    onAudioWeightChange: (value: number) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    isSidebarMinimized: boolean;
    onToggleSidebar: () => void;
    creditsCost: number;
}

const SUNO_MODELS: { value: SunoModel; label: string; maxDuration: string }[] = [
    { value: 'V4', label: 'Suno V4', maxDuration: '4 min' },
    { value: 'V4_5', label: 'Suno V4.5', maxDuration: '8 min' },
    { value: 'V4_5PLUS', label: 'Suno V4.5+', maxDuration: '8 min' },
    { value: 'V4_5ALL', label: 'Suno V4.5 All', maxDuration: '8 min' },
    { value: 'V5', label: 'Suno V5', maxDuration: '8 min' },
];

export function AudioSidebar({
    customMode,
    onCustomModeChange,
    instrumental,
    onInstrumentalChange,
    prompt,
    onPromptChange,
    style,
    onStyleChange,
    title,
    onTitleChange,
    model,
    onModelChange,
    negativeTags,
    onNegativeTagsChange,
    vocalGender,
    onVocalGenderChange,
    styleWeight,
    onStyleWeightChange,
    weirdnessConstraint,
    onWeirdnessConstraintChange,
    audioWeight,
    onAudioWeightChange,
    isGenerating,
    onGenerate,
    isSidebarMinimized,
    onToggleSidebar,
    creditsCost,
}: AudioSidebarProps) {
    const { language } = useLanguage();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [displayedStyles, setDisplayedStyles] = useState<string[]>(() => getRandomStyles());

    const isV4 = model === 'V4';
    const promptLimit = customMode ? (isV4 ? 3000 : 5000) : 500;
    const styleLimit = isV4 ? 200 : 1000;
    const titleLimit = 80;

    const showPrompt = !customMode || !instrumental;
    const showStyleAndTitle = customMode;

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

    const generateSampleLyrics = () => {
        onPromptChange(
            language === 'ru'
                ? '[Куплет 1]\nВ звездной ночи, где мечты оживают\nМы строим миры, что в огне не сгорают\n\n[Припев]\nСквозь тернии к свету, сквозь время и мрак\nМы ищем свой путь, подавая нам знак'
                : '[Verse 1]\nIn the starry night, where dreams come alive\nWe build worlds that in fire will survive\n\n[Chorus]\nThrough thorns to the light, through time and the dark\nWe seek our own way, giving us a spark',
        );
    };

    const canGenerate = useMemo(() => {
        if (!customMode) {
            return prompt.trim().length > 0;
        }
        if (!style.trim() || !title.trim()) return false;
        if (!instrumental && !prompt.trim()) return false;
        return true;
    }, [customMode, instrumental, prompt, style, title]);

    return (
        <AnimatePresence mode="wait">
            {!isSidebarMinimized ? (
                <motion.aside
                    initial={{ x: 0, opacity: 1 }}
                    exit={{ x: -400, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full lg:w-[400px] border-r border-white/5 flex flex-col h-full bg-[#0A0A0A] relative z-30"
                >
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-80">
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

                        {/* Mode Toggle */}
                        <div className="space-y-3">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                                {language === 'ru' ? 'Режим' : 'Mode'}
                            </span>
                            <div className="flex rounded-xl bg-white/[0.03] border border-white/5 p-1">
                                <button
                                    onClick={() => onCustomModeChange(false)}
                                    className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                        !customMode
                                            ? 'bg-[#6F00FF] text-white shadow-lg'
                                            : 'text-white/50 hover:text-white'
                                    }`}
                                >
                                    {language === 'ru' ? 'Простой' : 'Simple'}
                                </button>
                                <button
                                    onClick={() => onCustomModeChange(true)}
                                    className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                        customMode
                                            ? 'bg-[#6F00FF] text-white shadow-lg'
                                            : 'text-white/50 hover:text-white'
                                    }`}
                                >
                                    {language === 'ru' ? 'Кастом' : 'Custom'}
                                </button>
                            </div>
                        </div>

                        {/* Model Selector */}
                        <div className="space-y-3">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                                {language === 'ru' ? 'Модель' : 'Model'}
                            </span>
                            <Select
                                value={model}
                                onValueChange={(v) => onModelChange(v as SunoModel)}
                            >
                                <SelectTrigger className="w-full h-12 bg-white/[0.03] border-white/5 rounded-xl px-4 text-sm font-mono gap-2 hover:bg-white/[0.05] transition-colors">
                                    <Music className="w-4 h-4 text-[#6F00FF] shrink-0" />
                                    <span className="flex-1 text-left">
                                        {SUNO_MODELS.find((m) => m.value === model)?.label}
                                    </span>
                                    <span className="text-[10px] text-white/40">
                                        {SUNO_MODELS.find((m) => m.value === model)?.maxDuration}
                                    </span>
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0A] border-white/10 rounded-xl p-2 font-mono">
                                    {SUNO_MODELS.map((m) => (
                                        <SelectItem
                                            key={m.value}
                                            value={m.value}
                                            className="rounded-lg"
                                        >
                                            <div className="flex items-center justify-between w-full gap-4">
                                                <span className="font-medium">{m.label}</span>
                                                <span className="text-white/40 text-[10px]">
                                                    {m.maxDuration}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Instrumental Toggle */}
                        <div className="space-y-3">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                                {language === 'ru' ? 'Тип' : 'Type'}
                            </span>
                            <div className="flex rounded-xl bg-white/[0.03] border border-white/5 p-1">
                                <button
                                    onClick={() => onInstrumentalChange(false)}
                                    className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                        !instrumental
                                            ? 'bg-[#6F00FF] text-white shadow-lg'
                                            : 'text-white/50 hover:text-white'
                                    }`}
                                >
                                    <Mic className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'С вокалом' : 'Vocal'}
                                </button>
                                <button
                                    onClick={() => onInstrumentalChange(true)}
                                    className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                        instrumental
                                            ? 'bg-[#6F00FF] text-white shadow-lg'
                                            : 'text-white/50 hover:text-white'
                                    }`}
                                >
                                    <Music className="w-3.5 h-3.5" />
                                    {language === 'ru' ? 'Инструментал' : 'Instrumental'}
                                </button>
                            </div>
                        </div>

                        {/* Prompt / Lyrics Section */}
                        {showPrompt && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                                        {customMode
                                            ? language === 'ru'
                                                ? 'Текст песни'
                                                : 'Lyrics'
                                            : language === 'ru'
                                              ? 'Описание'
                                              : 'Description'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-white/30">
                                            {prompt.length}/{promptLimit}
                                        </span>
                                        {customMode && !instrumental && (
                                            <button
                                                onClick={generateSampleLyrics}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#6F00FF] transition-all"
                                                title={
                                                    language === 'ru'
                                                        ? 'Пример текста'
                                                        : 'Sample lyrics'
                                                }
                                            >
                                                <Sparkles className="w-3.5 h-3.5 fill-current" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => {
                                        if (e.target.value.length <= promptLimit) {
                                            onPromptChange(e.target.value);
                                        }
                                    }}
                                    placeholder={
                                        customMode
                                            ? language === 'ru'
                                ? '[Куплет 1]\nВведите текст песни…\n\n[Припев]\n…'
                                : '[Verse 1]\nEnter your lyrics…\n\n[Chorus]\n…'
                            : language === 'ru'
                              ? 'Опишите песню которую хотите создать…'
                              : 'Describe the song you want to create…'
                                    }
                                    className={`w-full bg-white/[0.03] rounded-2xl p-4 resize-none text-white placeholder:text-white/20 font-mono text-sm border border-white/5 leading-relaxed focus:border-[#6F00FF]/50 focus-visible:ring-2 focus-visible:ring-[#6F00FF]/50 focus-visible:outline-none transition-[border-color] ${
                                        customMode ? 'min-h-[180px]' : 'min-h-[100px]'
                                    }`}
                                />
                            </div>
                        )}

                        {/* Style Section (Custom Mode Only) */}
                        {showStyleAndTitle && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                                        {language === 'ru' ? 'Стиль' : 'Style'}
                                        <span className="text-[#6F00FF] ml-1">*</span>
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-mono text-white/30">
                                            {style.length}/{styleLimit}
                                        </span>
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
                                    onChange={(e) => {
                                        if (e.target.value.length <= styleLimit) {
                                            onStyleChange(e.target.value);
                                        }
                                    }}
                        placeholder={
                            language === 'ru'
                                ? 'Pop, Upbeat, Electronic, Female vocals…'
                                : 'Pop, Upbeat, Electronic, Female vocals…'
                        }
                        className="w-full bg-white/[0.03] rounded-2xl p-4 resize-none text-white placeholder:text-white/20 min-h-[60px] font-mono text-sm border border-white/5 leading-relaxed focus:border-[#6F00FF]/50 focus-visible:ring-2 focus-visible:ring-[#6F00FF]/50 focus-visible:outline-none transition-[border-color]"
                                />
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                                    {displayedStyles.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                const newStyle = style ? `${style}, ${s}` : s;
                                                if (newStyle.length <= styleLimit) {
                                                    onStyleChange(newStyle);
                                                }
                                            }}
                                            className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono font-medium lowercase tracking-normal transition-all border border-white/5 hover:border-[#6F00FF]/30"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Title Section (Custom Mode Only) */}
                        {showStyleAndTitle && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                                        {language === 'ru' ? 'Название' : 'Title'}
                                        <span className="text-[#6F00FF] ml-1">*</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-white/30">
                                        {title.length}/{titleLimit}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => {
                                        if (e.target.value.length <= titleLimit) {
                                            onTitleChange(e.target.value);
                                        }
                                    }}
                        placeholder={
                            language === 'ru' ? 'Название трека…' : 'Track title…'
                        }
                        className="w-full h-12 bg-white/[0.03] rounded-xl px-4 text-sm font-mono border border-white/5 placeholder:text-white/20 focus:border-[#6F00FF]/50 focus-visible:ring-2 focus-visible:ring-[#6F00FF]/50 focus-visible:outline-none transition-[border-color]"
                                />
                            </div>
                        )}

                        {/* Advanced Settings (Custom Mode Only) */}
                        {customMode && (
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="w-full flex items-center justify-between py-2 text-xs font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Settings2 className="w-3.5 h-3.5" />
                                        <span>
                                            {language === 'ru'
                                                ? 'Расширенные настройки'
                                                : 'Advanced Settings'}
                                        </span>
                                    </div>
                                    {showAdvanced ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showAdvanced && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden space-y-5"
                                        >
                                            {/* Vocal Gender (only for non-instrumental) */}
                                            {!instrumental && (
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                                        {language === 'ru'
                                                            ? 'Пол вокала'
                                                            : 'Vocal Gender'}
                                                    </span>
                                                    <div className="flex rounded-xl bg-white/[0.03] border border-white/5 p-1">
                                                        <button
                                                            onClick={() =>
                                                                onVocalGenderChange(undefined)
                                                            }
                                                            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                                                vocalGender === undefined
                                                                    ? 'bg-white/10 text-white'
                                                                    : 'text-white/40 hover:text-white'
                                                            }`}
                                                        >
                                                            {language === 'ru' ? 'Авто' : 'Auto'}
                                                        </button>
                                                        <button
                                                            onClick={() => onVocalGenderChange('m')}
                                                            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                                                vocalGender === 'm'
                                                                    ? 'bg-white/10 text-white'
                                                                    : 'text-white/40 hover:text-white'
                                                            }`}
                                                        >
                                                            {language === 'ru' ? 'Муж' : 'Male'}
                                                        </button>
                                                        <button
                                                            onClick={() => onVocalGenderChange('f')}
                                                            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                                                vocalGender === 'f'
                                                                    ? 'bg-white/10 text-white'
                                                                    : 'text-white/40 hover:text-white'
                                                            }`}
                                                        >
                                                            {language === 'ru' ? 'Жен' : 'Female'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Negative Tags */}
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                                    {language === 'ru'
                                                        ? 'Исключить стили'
                                                        : 'Negative Tags'}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={negativeTags}
                                                    onChange={(e) =>
                                                        onNegativeTagsChange(e.target.value)
                                                    }
                                    placeholder="Heavy Metal, Screaming, Drums…"
                                    className="w-full h-10 bg-white/[0.03] rounded-lg px-3 text-xs font-mono border border-white/5 placeholder:text-white/20 focus:border-[#6F00FF]/50 focus-visible:ring-2 focus-visible:ring-[#6F00FF]/50 focus-visible:outline-none transition-[border-color]"
                                                />
                                            </div>

                                            {/* Style Weight */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                                        {language === 'ru'
                                                            ? 'Следование стилю'
                                                            : 'Style Adherence'}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-bold text-white">
                                                        {Math.round(styleWeight * 100)}%
                                                    </span>
                                                </div>
                                                <Slider
                                                    value={[styleWeight]}
                                                    onValueChange={([v]) => onStyleWeightChange(v)}
                                                    max={1}
                                                    step={0.01}
                                                    className="py-2"
                                                />
                                            </div>

                                            {/* Weirdness Constraint */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                                        {language === 'ru'
                                                            ? 'Экспериментальность'
                                                            : 'Creativity'}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-bold text-white">
                                                        {Math.round(weirdnessConstraint * 100)}%
                                                    </span>
                                                </div>
                                                <Slider
                                                    value={[weirdnessConstraint]}
                                                    onValueChange={([v]) =>
                                                        onWeirdnessConstraintChange(v)
                                                    }
                                                    max={1}
                                                    step={0.01}
                                                    className="py-2"
                                                />
                                            </div>

                                            {/* Audio Weight */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                                        {language === 'ru'
                                                            ? 'Аудио баланс'
                                                            : 'Audio Balance'}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-bold text-white">
                                                        {Math.round(audioWeight * 100)}%
                                                    </span>
                                                </div>
                                                <Slider
                                                    value={[audioWeight]}
                                                    onValueChange={([v]) => onAudioWeightChange(v)}
                                                    max={1}
                                                    step={0.01}
                                                    className="py-2"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Bottom Section: Create Button */}
                    <div className="absolute bottom-[164px] lg:bottom-[110px] left-0 right-0 p-6 bg-[#0A0A0A] border-t border-white/5 z-40">
                        <button
                            onClick={onGenerate}
                            disabled={!canGenerate || isGenerating}
                            className="w-full h-14 rounded-2xl bg-[#6F00FF] text-white font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(111,0,255,0.2)]"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-4">
                                    <span>{language === 'ru' ? 'Создать' : 'Create'}</span>
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 text-[#FFD700]">
                                        <Zap className="w-3 h-3 fill-current" />
                                        <span className="text-[10px] font-black">
                                            {creditsCost}
                                        </span>
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
