'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface ParallaxImage {
    src: string;
    y: MotionValue<number>;
    size: string;
    position: string;
}

const SIZE_CLASSES: Record<string, string> = {
    small: 'w-[150px] h-[200px] md:w-[180px] md:h-[240px]',
    medium: 'w-[180px] h-[260px] md:w-[240px] md:h-[320px]',
    large: 'w-[240px] h-[320px] md:w-[280px] md:h-[380px]',
    'extra-large': 'w-[300px] h-[400px] md:w-[450px] md:h-[600px] z-20',
};

const POSITION_CLASSES: Record<string, string> = {
    left: 'left-[0%] top-[5%]',
    'center-top': 'left-[30%] top-[-5%]',
    center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    right: 'right-[2%] top-[10%]',
    'bottom-left': 'left-[10%] bottom-[10%]',
    'bottom-right': 'right-[5%] bottom-[5%]',
    'left-center': 'left-[15%] top-[35%]',
    'right-center': 'right-[15%] top-[40%]',
    'bottom-center': 'left-[45%] bottom-[15%]',
};

function getPositionClasses(position: string, size: string) {
    return `${SIZE_CLASSES[size] || ''} ${POSITION_CLASSES[position] || ''}`;
}

function getAnimationProps(position: string, i: number) {
    const delay = i * 0.1;
    const duration = 1.2;
    const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

    const initial: { opacity: number; scale: number; x?: number; y?: number } = {
        opacity: 0,
        scale: 0.95,
    };

    if (position.includes('left')) initial.x = -150;
    else if (position.includes('right')) initial.x = 150;

    if (position.includes('top')) initial.y = -100;
    else if (position.includes('bottom')) initial.y = 100;

    return {
        initial,
        whileInView: { opacity: 1, scale: 1, x: 0, y: 0 },
        transition: { duration, delay, ease },
    };
}

export function ParallaxImageGrid() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    const images: ParallaxImage[] = [
        {
            src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
            y: useTransform(scrollYProgress, [0, 1], [0, -150]),
            size: 'large',
            position: 'left',
        },
        {
            src: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80',
            y: useTransform(scrollYProgress, [0, 1], [0, 100]),
            size: 'medium',
            position: 'center-top',
        },
        {
            src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
            y: useTransform(scrollYProgress, [0, 1], [0, -50]),
            size: 'extra-large',
            position: 'center',
        },
        {
            src: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
            y: useTransform(scrollYProgress, [0, 1], [0, -200]),
            size: 'small',
            position: 'right',
        },
        {
            src: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
            y: useTransform(scrollYProgress, [0, 1], [0, 150]),
            size: 'medium',
            position: 'bottom-left',
        },
        {
            src: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
            y: useTransform(scrollYProgress, [0, 1], [0, -120]),
            size: 'large',
            position: 'bottom-right',
        },
        {
            src: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80',
            y: useTransform(scrollYProgress, [0, 1], [0, 80]),
            size: 'small',
            position: 'left-center',
        },
        {
            src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
            y: useTransform(scrollYProgress, [0, 1], [0, -180]),
            size: 'medium',
            position: 'right-center',
        },
        {
            src: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80',
            y: useTransform(scrollYProgress, [0, 1], [0, 120]),
            size: 'small',
            position: 'bottom-center',
        },
    ];

    return (
        <div ref={containerRef} className="relative h-[800px] md:h-[1000px] px-4 md:px-8 !w-full">
            {images.map((img, i) => {
                const animation = getAnimationProps(img.position, i);
                return (
                    <motion.div
                        key={i}
                        style={{ y: img.y }}
                        initial={animation.initial}
                        whileInView={animation.whileInView}
                        transition={animation.transition}
                        viewport={{ once: true, margin: '100px' }}
                        className={`absolute ${getPositionClasses(img.position, img.size)} overflow-hidden group cursor-pointer rounded-2xl md:rounded-3xl shadow-2xl`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img
                            src={img.src}
                            alt=""
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 border border-white/10 group-hover:border-white/30 transition-colors" />
                    </motion.div>
                );
            })}
        </div>
    );
}
