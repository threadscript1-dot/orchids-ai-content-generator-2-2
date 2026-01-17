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
                <Zap className="w-4 h-4 fill-current" />
                {cost}
            </span>
        </div>
    );
}
