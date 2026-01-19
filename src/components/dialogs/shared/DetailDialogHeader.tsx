'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface DetailDialogHeaderProps {
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
    isFirst: boolean;
    isLast: boolean;
    variant?: 'mobile' | 'desktop';
}

export function DetailDialogHeader({
    onClose,
    onPrevious,
    onNext,
    isFirst,
    isLast,
    variant = 'desktop',
}: DetailDialogHeaderProps) {
    if (variant === 'mobile') {
        return (
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none lg:hidden">
                <button
                    onClick={onClose}
                    className="p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all pointer-events-auto"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="flex gap-2 pointer-events-auto">
                    <button
                        onClick={onPrevious}
                        className="p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                        disabled={isFirst}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onNext}
                        className="p-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                        disabled={isLast}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex gap-2">
                <button
                    onClick={onPrevious}
                    className="p-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                    disabled={isFirst}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={onNext}
                    className="p-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
                    disabled={isLast}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
            <button
                onClick={onClose}
                className="p-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}
