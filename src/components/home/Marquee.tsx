'use client';

const MODELS = [
    'Stable Diffusion 3.5',
    'Midjourney v6.1',
    'DALL-E 3',
    'Luma Dream Machine',
    'Suno v5',
    'Kling AI',
    'Nano Banana Pro',
];

export function Marquee() {
    return (
        <div className="relative py-6 overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-12 items-center px-6">
                        {MODELS.map((model) => (
                            <span
                                key={model}
                                className="text-xs sm:text-sm font-bold text-white/40 uppercase tracking-[0.2em]"
                            >
                                {model}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
