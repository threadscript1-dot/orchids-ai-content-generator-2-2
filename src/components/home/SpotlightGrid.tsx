'use client';

import { useState, useRef, useEffect } from 'react';

export function SpotlightGrid() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 z-[1] pointer-events-none">
            <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                    maskImage: 'radial-gradient(circle at 50% 30%, black 0%, transparent 50%)',
                    WebkitMaskImage: 'radial-gradient(circle at 50% 30%, black 0%, transparent 50%)',
                }}
            />

            <div
                className="absolute inset-0 pointer-events-none opacity-80 transition-opacity"
                style={{
                    background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 50%)`,
                }}
            />
        </div>
    );
}
