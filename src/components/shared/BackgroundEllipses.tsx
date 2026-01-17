'use client';

export function BackgroundEllipses() {
    return (
        <>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6F00FF]/20 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#a855f7]/20 blur-[120px] rounded-full -z-10" />
        </>
    );
}
