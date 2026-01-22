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
import { OptionToggle } from './OptionToggle';

// Re-export for convenience
export { SoundToggle } from './SoundToggle';

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

    // Constraint flags
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

// Translations helper
function useTranslations() {
    const { language } = useLanguage();
    const isRu = language === 'ru';

    return {
        settings: isRu ? 'Настройки' : 'Settings',
        settingsTooltip: isRu ? 'Дополнительные настройки генерации' : 'Additional generation settings',
        negativePrompt: isRu ? 'Негативный промпт' : 'Negative prompt',
        negativePromptPlaceholder: isRu ? 'Что исключить из результата...' : 'What to exclude from result...',
        negativePromptTooltip: isRu ? 'Опишите что НЕ должно быть в результате' : 'Describe what should NOT appear in the result',
        promptEnhancement: isRu ? 'Улучшить' : 'Enhance',
        promptEnhancementTooltip: isRu ? 'AI улучшит и дополнит ваш промпт' : 'AI will improve and expand your prompt',
        translation: isRu ? 'Перевод' : 'Translate',
        translationTooltip: isRu ? 'Автоматически перевести промпт на английский' : 'Automatically translate prompt to English',
        removeWatermark: isRu ? 'Без знака' : 'No mark',
        removeWatermarkTooltip: isRu ? 'Убрать водяной знак с результата' : 'Remove watermark from result',
        upscale: isRu ? 'HD' : 'HD',
        upscaleTooltip: isRu ? 'Увеличить разрешение результата' : 'Increase result resolution',
        safetyTolerance: isRu ? 'Безопасность' : 'Safety',
        safetyToleranceTooltip: isRu ? 'Уровень фильтрации контента (0 = строго, 6 = свободно)' : 'Content filtering level (0 = strict, 6 = permissive)',
        strength: isRu ? 'Сила изменений' : 'Change strength',
        strengthTooltip: isRu ? 'Насколько сильно изменить исходное изображение' : 'How much to transform the source image',
        variants: isRu ? 'Варианты' : 'Variants',
        variantsTooltip: isRu ? 'Количество вариантов для генерации' : 'Number of variations to generate',
    };
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
    const t = useTranslations();
    const [isOpen, setIsOpen] = useState(false);

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

    const activeCount = [
        negativePrompt.trim().length > 0,
        promptEnhancement,
        translation,
        removeWatermark,
        upscale,
    ].filter(Boolean).length;

    const showSliders = safetyToleranceRange || (supportsStrength && hasAttachments);

    return (
        <div className="flex flex-col">
            <SettingsButton
                isOpen={isOpen}
                activeCount={activeCount}
                tooltip={t.settingsTooltip}
                label={t.settings}
                onClick={() => setIsOpen(!isOpen)}
            />

            {isOpen && (
                <div className="absolute left-0 right-0 bottom-full mb-3 mx-4">
                    <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-4 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
                        {/* Toggle Buttons */}
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
                                <VariantsSelector
                                    value={variants}
                                    maxVariants={maxVariants}
                                    tooltip={t.variantsTooltip}
                                    onChange={onVariantsChange}
                                />
                            )}
                        </div>

                        {/* Negative Prompt */}
                        {supportsNegativePrompt && (
                            <NegativePromptInput
                                value={negativePrompt}
                                onChange={onNegativePromptChange}
                                label={t.negativePrompt}
                                placeholder={t.negativePromptPlaceholder}
                                tooltip={t.negativePromptTooltip}
                            />
                        )}

                        {/* Sliders */}
                        {showSliders && (
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                {safetyToleranceRange && (
                                    <SafetySlider
                                        value={safetyTolerance}
                                        range={safetyToleranceRange}
                                        label={t.safetyTolerance}
                                        tooltip={t.safetyToleranceTooltip}
                                        onChange={onSafetyToleranceChange}
                                    />
                                )}
                                {supportsStrength && hasAttachments && (
                                    <StrengthSlider
                                        value={strength}
                                        label={t.strength}
                                        tooltip={t.strengthTooltip}
                                        onChange={onStrengthChange}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components

function SettingsButton({
    isOpen,
    activeCount,
    tooltip,
    label,
    onClick,
}: {
    isOpen: boolean;
    activeCount: number;
    tooltip: string;
    label: string;
    onClick: () => void;
}) {
    return (
        <InfoTooltip content={tooltip}>
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    'relative flex items-center justify-center h-10 w-10 rounded-2xl transition-all',
                    'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white',
                    isOpen && 'bg-[#6F00FF]/20 text-[#6F00FF] border border-[#6F00FF]/30',
                )}
                aria-label={label}
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
    );
}

function VariantsSelector({
    value,
    maxVariants,
    tooltip,
    onChange,
}: {
    value: number;
    maxVariants: number;
    tooltip: string;
    onChange: (value: number) => void;
}) {
    return (
        <InfoTooltip content={tooltip}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-white/60">
                <Copy className="w-3.5 h-3.5" />
                <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
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
    );
}

function NegativePromptInput({
    value,
    onChange,
    label,
    placeholder,
    tooltip,
}: {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder: string;
    tooltip: string;
}) {
    return (
        <InfoTooltip content={tooltip}>
            <div className="space-y-2">
                <label className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                    <MinusCircle className="w-3 h-3" />
                    {label}
                </label>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 resize-none min-h-[50px] focus:outline-none focus:ring-1 focus:ring-[#6F00FF]/50 border border-white/5 transition-all"
                    rows={2}
                />
            </div>
        </InfoTooltip>
    );
}

function SafetySlider({
    value,
    range,
    label,
    tooltip,
    onChange,
}: {
    value: number;
    range: [number, number];
    label: string;
    tooltip: string;
    onChange: (value: number) => void;
}) {
    return (
        <InfoTooltip content={tooltip}>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                        <Shield className="w-3 h-3" />
                        {label}
                    </label>
                    <span className="text-xs text-white/30 font-mono tabular-nums">{value}</span>
                </div>
                <Slider
                    value={[value]}
                    onValueChange={([v]) => onChange(v)}
                    min={range[0]}
                    max={range[1]}
                    step={1}
                    className="cursor-pointer"
                />
            </div>
        </InfoTooltip>
    );
}

function StrengthSlider({
    value,
    label,
    tooltip,
    onChange,
}: {
    value: number;
    label: string;
    tooltip: string;
    onChange: (value: number) => void;
}) {
    return (
        <InfoTooltip content={tooltip}>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs text-white/40 font-medium">{label}</label>
                    <span className="text-xs text-white/30 font-mono tabular-nums">
                        {Math.round(value * 100)}%
                    </span>
                </div>
                <Slider
                    value={[value]}
                    onValueChange={([v]) => onChange(v)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="cursor-pointer"
                />
            </div>
        </InfoTooltip>
    );
}
