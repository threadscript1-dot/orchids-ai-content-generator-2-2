'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GridSizeSlider } from './GridSizeSlider';

interface GenerationPageHeaderProps {
    title: string;
    gridSize: number[];
    onGridSizeChange: (value: number[]) => void;
    viewMode: 'grid' | 'feed';
    onViewModeChange: (mode: 'grid' | 'feed') => void;
    isHidden?: boolean;
}

export function GenerationPageHeader({
    title,
    gridSize,
    onGridSizeChange,
    viewMode,
    onViewModeChange,
    isHidden = false,
}: GenerationPageHeaderProps) {
    return (
        <div
            className={`sticky top-0 z-10 w-full px-2 sm:px-6 py-4 flex items-center justify-between gap-4 transition-all duration-300 ${
                isHidden
                    ? 'opacity-0 pointer-events-none -translate-y-4'
                    : 'opacity-100 pointer-events-auto translate-y-0'
            }`}
        >
            <div className="flex items-center gap-2 sm:gap-6">
                <Link
                    href="/app"
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors bg-white/5 border border-white/10"
                >
                    <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                </Link>
                <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight">{title}</h1>
            </div>

            <div className="flex items-center gap-6">
                <GridSizeSlider
                    value={gridSize}
                    onChange={onGridSizeChange}
                    min={200}
                    max={800}
                    viewMode={viewMode}
                    onViewModeChange={onViewModeChange}
                />
            </div>
        </div>
    );
}
