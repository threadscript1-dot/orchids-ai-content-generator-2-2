'use client';

import { useState } from 'react';
import {
    Settings2,
    Sparkles,
    Languages,
    Droplets,
    ArrowUpFromDot,
    Shield,
    MinusCircle,
    Copy,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/tooltip';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';

interface AdvancedOptionsPanelProps {
    // Form values
    negativePrompt: string;
    promptEnhancement: boolean;
    translation: boolean;
    removeWatermark: boolean;
    upscale: boolean;
    safetyTolerance: number;
    strength: number;
    variants: number;

    // Setters
    onNegativePromptChange: (value: string) => void;
    onPromptEnhancementChange: (value: boolean) => void;
    onTranslationChange: (value: boolean) => void;
    onRemoveWatermarkChange: (value: boolean) => void;
    onUpscaleChange: (value: boolean) => void;
    onSafetyToleranceChange: (value: number) => void;
    onStrengthChange: (value: number) => void;
    onVariantsChange: (value: number) => void;

    // Constraint flags - determine which options to show
    supportsNegativePrompt: boolean;
    supportsPromptEnhancement: boolean;
    supportsTranslation: boolean;
    supportsWatermark: boolean;
    supportsUpscale: boolean;
    supportsStrength: boolean;
    safetyToleranceRange: [number, number] | null;
    maxVariants: number | null;

    // Whether user has attached images (for strength control)
    hasAttachments?: boolean;
}

export function AdvancedOptionsPanel({
    negativePrompt,
    promptEnhancement,
    translation,
    removeWatermark,
    upscale,
    safetyTolerance,
    strength,
    variants,
    onNegativePromptChange,
    onPromptEnhancementChange,
    onTranslationChange,
    onRemoveWatermarkChange,
    onUpscaleChange,
    onSafetyToleranceChange,
    onStrengthChange,
    onVariantsChange,
    supportsNegativePrompt,
    supportsPromptEnhancement,
    supportsTranslation,
    supportsWatermark,
    supportsUpscale,
    supportsStrength,
    safetyToleranceRange,
    maxVariants,
    hasAttachments = false,
}: AdvancedOptionsPanelProps) {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    // Check if there are any options to show
    const hasAnyOptions =
        supportsNegativePrompt ||
        supportsPromptEnhancement ||
        supportsTranslation ||
        supportsWatermark ||
        supportsUpscale ||
        (supportsStrength && hasAttachments) ||
        safetyToleranceRange !== null ||
        (maxVariants !== null && maxVariants > 1);

    if (!hasAnyOptions) {
        return null;
    }

    // Count active options for badge
    const activeCount = [
        negativePrompt.trim().length > 0,
        promptEnhancement,
        translation,
        removeWatermark,
        upscale,
    ].filter(Boolean).length;

    const t = {
        settings: language === 'ru' ? 'Настройки' : 'Settings',
        settingsTooltip: language === 'ru' ? 'Дополнительные настройки генерации' : 'Additional generation settings',
        negativePrompt: language === 'ru' ? 'Негативный промпт' : 'Negative prompt',
        negativePromptPlaceholder: language === 'ru' ? 'Что исключить из результата...' : 'What to exclude from result...',
        negativePromptTooltip: language === 'ru' ? 'Опишите что НЕ должно быть в результате' : 'Describe what should NOT appear in the result',
        promptEnhancement: language === 'ru' ? 'Улучшить' : 'Enhance',
        promptEnhancementTooltip: language === 'ru' ? 'AI улучшит и дополнит ваш промпт' : 'AI will improve and expand your prompt',
        translation: language === 'ru' ? 'Перевод' : 'Translate',
        translationTooltip: language === 'ru' ? 'Автоматически перевести промпт на английский' : 'Automatically translate prompt to English',
        removeWatermark: language === 'ru' ? 'Без знака' : 'No mark',
        removeWatermarkTooltip: language === 'ru' ? 'Убрать водяной знак с результата' : 'Remove watermark from result',
        upscale: language === 'ru' ? 'HD' : 'HD',
        upscaleTooltip: language === 'ru' ? 'Увеличить разрешение результата' : 'Increase result resolution',
        safetyTolerance: language === 'ru' ? 'Безопасность' : 'Safety',
        safetyToleranceTooltip: language === 'ru' ? 'Уровень фильтрации контента (0 = строго, 6 = свободно)' : 'Content filtering level (0 = strict, 6 = permissive)',
        strength: language === 'ru' ? 'Сила изменений' : 'Change strength',
        strengthTooltip: language === 'ru' ? 'Насколько сильно изменить исходное изображение' : 'How much to transform the source image',
        variants: language === 'ru' ? 'Варианты' : 'Variants',
        variantsTooltip: language === 'ru' ? 'Количество вариантов для генерации' : 'Number of variations to generate',
    };

    return (
        <div className="flex flex-col">
            {/* Settings Button */}
            <InfoTooltip content={t.settingsTooltip}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'relative flex items-center justify-center h-10 w-10 rounded-2xl transition-all',
                        'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white',
                        isOpen && 'bg-[#6F00FF]/20 text-[#6F00FF] border border-[#6F00FF]/30',
                    )}
                    aria-label={t.settings}
                    aria-expanded={isOpen}
                >
                    <Settings2 className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-90')} />
                    {activeCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6F00FF] text-[10px] font-bold flex items-center justify-center text-white">
                            {activeCount}
                        </span>
                    )}
                </button>
            </InfoTooltip>

            {/* Expandable Panel - rendered outside the button row via portal-like positioning */}
            {isOpen && (
                <div className="absolute left-0 right-0 bottom-full mb-3 mx-4">
                    <div
                        className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-4 animate-in slide-in-from-bottom-2 fade-in-0 duration-200"
                    >
                        {/* Toggle Buttons Row */}
                        <div className="flex flex-wrap gap-2">
                            {supportsPromptEnhancement && (
                                <OptionToggle
                                    icon={<Sparkles className="w-3.5 h-3.5" />}
                                    label={t.promptEnhancement}
                                    tooltip={t.promptEnhancementTooltip}
                                    active={promptEnhancement}
                                    onClick={() => onPromptEnhancementChange(!promptEnhancement)}
                                />
                            )}
                            {supportsTranslation && (
                                <OptionToggle
                                    icon={<Languages className="w-3.5 h-3.5" />}
                                    label={t.translation}
                                    tooltip={t.translationTooltip}
                                    active={translation}
                                    onClick={() => onTranslationChange(!translation)}
                                />
                            )}
                            {supportsWatermark && (
                                <OptionToggle
                                    icon={<Droplets className="w-3.5 h-3.5" />}
                                    label={t.removeWatermark}
                                    tooltip={t.removeWatermarkTooltip}
                                    active={removeWatermark}
                                    onClick={() => onRemoveWatermarkChange(!removeWatermark)}
                                />
                            )}
                            {supportsUpscale && (
                                <OptionToggle
                                    icon={<ArrowUpFromDot className="w-3.5 h-3.5" />}
                                    label={t.upscale}
                                    tooltip={t.upscaleTooltip}
                                    active={upscale}
                                    onClick={() => onUpscaleChange(!upscale)}
                                />
                            )}
                            {maxVariants !== null && maxVariants > 1 && (
                                <InfoTooltip content={t.variantsTooltip}>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-white/60">
                                        <Copy className="w-3.5 h-3.5" />
                                        <Select
                                            value={String(variants)}
                                            onValueChange={(v) => onVariantsChange(Number(v))}
                                        >
                                            <SelectTrigger className="w-10 h-6 p-0 bg-transparent border-none text-xs font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-lg min-w-[50px]">
                                                {Array.from({ length: maxVariants }, (_, i) => i + 1).map((n) => (
                                                    <SelectItem key={n} value={String(n)} className="text-xs font-medium">
                                                        {n}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </InfoTooltip>
                            )}
                        </div>

                        {/* Negative Prompt */}
                        {supportsNegativePrompt && (
                            <InfoTooltip content={t.negativePromptTooltip}>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                                        <MinusCircle className="w-3 h-3" />
                                        {t.negativePrompt}
                                    </label>
                                    <textarea
                                        value={negativePrompt}
                                        onChange={(e) => onNegativePromptChange(e.target.value)}
                                        placeholder={t.negativePromptPlaceholder}
                                        className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 resize-none min-h-[50px] focus:outline-none focus:ring-1 focus:ring-[#6F00FF]/50 border border-white/5 transition-all"
                                        rows={2}
                                    />
                                </div>
                            </InfoTooltip>
                        )}

                        {/* Sliders */}
                        {(safetyToleranceRange || (supportsStrength && hasAttachments)) && (
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                {/* Safety Tolerance */}
                                {safetyToleranceRange && (
                                    <InfoTooltip content={t.safetyToleranceTooltip}>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                                                    <Shield className="w-3 h-3" />
                                                    {t.safetyTolerance}
                                                </label>
                                                <span className="text-xs text-white/30 font-mono tabular-nums">
                                                    {safetyTolerance}
                                                </span>
                                            </div>
                                            <Slider
                                                value={[safetyTolerance]}
                                                onValueChange={([v]) => onSafetyToleranceChange(v)}
                                                min={safetyToleranceRange[0]}
                                                max={safetyToleranceRange[1]}
                                                step={1}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                    </InfoTooltip>
                                )}

                                {/* Strength (for i2i) */}
                                {supportsStrength && hasAttachments && (
                                    <InfoTooltip content={t.strengthTooltip}>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs text-white/40 font-medium">
                                                    {t.strength}
                                                </label>
                                                <span className="text-xs text-white/30 font-mono tabular-nums">
                                                    {Math.round(strength * 100)}%
                                                </span>
                                            </div>
                                            <Slider
                                                value={[strength]}
                                                onValueChange={([v]) => onStrengthChange(v)}
                                                min={0}
                                                max={1}
                                                step={0.05}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                    </InfoTooltip>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

interface OptionToggleProps {
    icon: React.ReactNode;
    label: string;
    tooltip: string;
    active: boolean;
    onClick: () => void;
}

function OptionToggle({ icon, label, tooltip, active, onClick }: OptionToggleProps) {
    return (
        <InfoTooltip content={tooltip}>
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                    active
                        ? 'bg-[#6F00FF] text-white shadow-[0_0_15px_rgba(111,0,255,0.3)]'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70',
                )}
            >
                {icon}
                <span>{label}</span>
            </button>
        </InfoTooltip>
    );
}

// Sound Toggle component for main options bar
interface SoundToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    supported: boolean;
}

export function SoundToggle({ enabled, onChange, supported }: SoundToggleProps) {
    const { language } = useLanguage();

    if (!supported) return null;

    const tooltip = language === 'ru'
        ? 'Генерировать видео со звуком'
        : 'Generate video with sound';

    return (
        <InfoTooltip content={tooltip}>
            <button
                type="button"
                onClick={() => onChange(!enabled)}
                className={cn(
                    'flex items-center gap-2 h-10 px-4 rounded-2xl text-xs font-medium transition-all',
                    enabled
                        ? 'bg-[#6F00FF] text-white shadow-[0_0_20px_rgba(111,0,255,0.3)]'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white',
                )}
                aria-label={language === 'ru' ? 'Звук' : 'Sound'}
            >
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {enabled ? (
                        <>
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </>
                    ) : (
                        <>
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <line x1="23" y1="9" x2="17" y2="15" />
                            <line x1="17" y1="9" x2="23" y2="15" />
                        </>
                    )}
                </svg>
                <span className="hidden sm:inline">
                    {language === 'ru' ? 'Звук' : 'Sound'}
                </span>
            </button>
        </InfoTooltip>
    );
}
