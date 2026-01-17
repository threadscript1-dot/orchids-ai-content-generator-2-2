'use client';

import { Minimize2, Maximize2, LayoutGrid, List } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface GridSizeSliderProps {
    value: number[];
    onChange: (value: number[]) => void;
    min?: number;
    max?: number;
    viewMode?: 'grid' | 'feed';
    onViewModeChange?: (mode: 'grid' | 'feed') => void;
}

export function GridSizeSlider({
    value,
    onChange,
    min = 150,
    max = 800,
    viewMode = 'grid',
    onViewModeChange,
}: GridSizeSliderProps) {
    return (
        <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 w-32 sm:w-48">
                <Minimize2 className="w-3.5 h-3.5 text-white/20" />
                <Slider
                    value={value}
                    onValueChange={onChange}
                    max={max}
                    min={min}
                    step={0.1}
                    className="flex-1 cursor-pointer"
                />
                <Maximize2 className="w-3.5 h-3.5 text-white/20" />
            </div>

            <div className="flex sm:hidden items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                <button
                    onClick={() => onViewModeChange?.('grid')}
                    className={`p-2 rounded-lg transition-all ${
                        viewMode === 'grid' 
                            ? 'bg-[#6F00FF] text-white shadow-[0_0_15px_rgba(111,0,255,0.4)]' 
                            : 'text-white/40 hover:text-white'
                    }`}
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onViewModeChange?.('feed')}
                    className={`p-2 rounded-lg transition-all ${
                        viewMode === 'feed' 
                            ? 'bg-[#6F00FF] text-white shadow-[0_0_15px_rgba(111,0,255,0.4)]' 
                            : 'text-white/40 hover:text-white'
                    }`}
                >
                    <List className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
