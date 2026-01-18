'use client';

import { Zap } from 'lucide-react';

interface CreditsCostDisplayProps {
    cost: number;
    className?: string;
}

export function CreditsCostDisplay({ cost, className = '' }: CreditsCostDisplayProps) {
    return (
        <div className={`text-sm text-muted-foreground ${className}`}>
            <span className="text-[#FFDC74] font-mono flex items-center gap-2 font-black">
                <Zap className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                {cost}
            </span>
        </div>
    );
}
