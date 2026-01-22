'use client';

import { InfoTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface OptionToggleProps {
    icon: React.ReactNode;
    label: string;
    tooltip: string;
    active: boolean;
    onClick: () => void;
    className?: string;
}

export function OptionToggle({ icon, label, tooltip, active, onClick, className }: OptionToggleProps) {
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
                    className,
                )}
            >
                {icon}
                <span>{label}</span>
            </button>
        </InfoTooltip>
    );
}
