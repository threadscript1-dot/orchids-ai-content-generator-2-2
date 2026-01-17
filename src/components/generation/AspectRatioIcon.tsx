'use client';

interface AspectRatioIconProps {
    ratio: string;
    className?: string;
}

export function AspectRatioIcon({ ratio, className = '' }: AspectRatioIconProps) {
    const baseClasses = `border-2 border-current rounded-none ${className}`;

    switch (ratio) {
        case '1:1':
            return <div className={`w-3.5 h-3.5 ${baseClasses}`} />;
        case '16:9':
            return <div className={`w-5 h-3 ${baseClasses}`} />;
        case '9:16':
            return <div className={`w-3 h-5 ${baseClasses}`} />;
        case '4:3':
            return <div className={`w-4 h-3 ${baseClasses}`} />;
        case '3:4':
            return <div className={`w-3 h-4 ${baseClasses}`} />;
        case '3:2':
            return <div className={`w-4.5 h-3 ${baseClasses}`} />;
        case '2:3':
            return <div className={`w-3 h-4.5 ${baseClasses}`} />;
        case '21:9':
            return <div className={`w-6 h-2.5 ${baseClasses}`} />;
        default:
            return <div className={`w-3.5 h-3.5 ${baseClasses}`} />;
    }
}
