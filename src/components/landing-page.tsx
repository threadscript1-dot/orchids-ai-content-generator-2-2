'use client';

import { motion, useScroll, useTransform, useMotionValue, useInView } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import {
    LucideIcon,
    Sparkles,
    Image,
    Video,
    Music,
    ArrowRight,
    Star,
    Globe,
    Zap,
    Shield,
    Cpu,
    ExternalLink,
    Scissors,
    Wand2,
    Maximize,
    Eraser,
    Smile,
    Sun,
    Palette,
    ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AnimatedTitle } from '@/components/animated-title';
import { AnimatedLogo } from '@/components/animated-logo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function SpotlightGrid() {
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
        <div
            ref={containerRef}
            className="absolute inset-0 z-[1] pointer-events-none"
        >
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

function GridBackground() {
    return (
        <div
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
            style={{
                backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
            }}
        />
    );
}

function Marquee() {
    const models = [
        'Stable Diffusion 3.5',
        'Midjourney v6.1',
        'DALL-E 3',
        'Luma Dream Machine',
        'Suno v5',
        'Kling AI',
        'Nano Banana Pro',
    ];
    return (
        <div className="relative py-6 overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-12 items-center px-6">
                        {models.map((model) => (
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

function ParallaxImageGrid() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    const images = [
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

    const getPositionClasses = (position: string, size: string) => {
        const sizeClasses = {
            small: 'w-[150px] h-[200px] md:w-[180px] md:h-[240px]',
            medium: 'w-[180px] h-[260px] md:w-[240px] md:h-[320px]',
            large: 'w-[240px] h-[320px] md:w-[280px] md:h-[380px]',
            'extra-large': 'w-[300px] h-[400px] md:w-[450px] md:h-[600px] z-20',
        };

        const positionClasses: Record<string, string> = {
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

        return `${sizeClasses[size as keyof typeof sizeClasses]} ${positionClasses[position]}`;
    };

    const getAnimationProps = (position: string, i: number) => {
        const delay = i * 0.1;
        const duration = 1.2;
        const ease = [0.16, 1, 0.3, 1]; // custom cubic-bezier for smooth landing

        const initial: any = { opacity: 0, scale: 0.95 };
        const whileInView: any = { opacity: 1, scale: 1 };

        if (position.includes('left')) initial.x = -150;
        else if (position.includes('right')) initial.x = 150;

        if (position.includes('top')) initial.y = -100;
        else if (position.includes('bottom')) initial.y = 100;

        return {
            initial,
            whileInView,
            transition: { duration, delay, ease: ease as [number, number, number, number] },
        };
    };

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
                        className={`absolute ${getPositionClasses(
                            img.position,
                            img.size
                        )} overflow-hidden group cursor-pointer rounded-2xl md:rounded-3xl shadow-2xl`}
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

function FeaturesTabs() {
    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState('image');

    const tabs = [
        {
            id: 'image',
            icon: Image,
            label: language === 'ru' ? 'Изображение' : 'Image',
            description:
                language === 'ru'
                    ? 'Делайте уникальные изображения любого стиля'
                    : 'Create unique images in any style',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
        },
        {
            id: 'video',
            icon: Video,
            label: language === 'ru' ? 'Видео' : 'Video',
            description:
                language === 'ru'
                    ? 'Превращайте идеи в динамичные видеоролики'
                    : 'Transform ideas into dynamic videos',
            image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&q=80',
        },
        {
            id: 'music',
            icon: Music,
            label: language === 'ru' ? 'Музыка' : 'Music',
            description:
                language === 'ru'
                    ? 'Генерируйте музыку и звуковые эффекты'
                    : 'Generate music and sound effects',
            image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1200&q=80',
        },
    ];

    const activeContent = tabs.find((t) => t.id === activeTab)!;

    return (
        <section className="py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase mb-4 leading-none">
                        {language === 'ru' ? 'Сделай что хочешь' : 'Do whatever you want'}
                    </h2>
                    <p className="text-xl text-white/40 font-medium h-8">
                        {activeContent.description}
                    </p>
                </div>

                <div className="flex justify-center gap-2 sm:gap-4 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 sm:px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'bg-white text-black scale-105'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative max-w-4xl mx-auto aspect-video rounded-[32px] overflow-hidden border border-white/10 bg-white/5 shadow-2xl">
                    <motion.img
                        key={activeTab}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        src={activeContent.image}
                        alt={activeContent.label}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </section>
    );
}

function ToolCard({
    icon: Icon,
    title,
    description,
    image,
    hoverImage,
}: {
    icon: any;
    title: string;
    description: string;
    image: string;
    hoverImage: string;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="flex-shrink-0 w-[300px] group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#6F00FF] transition-all mb-4">
                <Icon className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
            </div>

            <div className="aspect-[4/5] rounded-2xl overflow-hidden relative mb-4 border border-white/10 group-hover:border-white/20 transition-colors">
                <img
                    src={isHovered ? hoverImage : image}
                    alt={title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
            </div>

            <h3 className="text-2xl font-black mb-2 group-hover:text-[#6F00FF] transition-colors uppercase tracking-tight leading-none">
                {title}
            </h3>
            <p className="text-sm text-white/40 leading-relaxed font-medium">{description}</p>
        </div>
    );
}

function ToolsScroll() {
    const { language } = useLanguage();
    const tools =
        language === 'ru'
            ? [
                  {
                      icon: Image,
                      title: 'Магия кисти',
                      description: 'Превращайте слова в визуальные шедевры за секунды',
                      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
                      hoverImage:
                          'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80',
                  },
                  {
                      icon: Video,
                      title: 'Живые кадры',
                      description: 'Вдохните жизнь в статичные изображения одним кликом',
                      image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
                      hoverImage:
                          'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
                  },
                  {
                      icon: Wand2,
                      title: 'Сверхчеткость',
                      description: 'Раскройте каждую деталь в безупречном 4K разрешении',
                      image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80',
                      hoverImage:
                          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
                  },
                  {
                      icon: Eraser,
                      title: 'Чистый холст',
                      description: 'Мгновенная изоляция объектов для ваших лучших идей',
                      image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80',
                      hoverImage:
                          'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
                  },
                  {
                      icon: Maximize,
                      title: 'Без границ',
                      description: 'Достраивайте реальность за пределами кадра силой ИИ',
                      image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80',
                      hoverImage:
                          'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
                  },
              ]
            : [
                  {
                      icon: Image,
                      title: 'Brush Magic',
                      description: 'Transform words into visual masterpieces in seconds',
                      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
                      hoverImage:
                          'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80',
                  },
                  {
                      icon: Video,
                      title: 'Living Frames',
                      description: 'Breathe life into static images with a single click',
                      image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
                      hoverImage:
                          'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
                  },
                  {
                      icon: Wand2,
                      title: 'Ultra Clarity',
                      description: 'Reveal every detail in flawless 4K resolution',
                      image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80',
                      hoverImage:
                          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
                  },
                  {
                      icon: Eraser,
                      title: 'Clean Canvas',
                      description: 'Instant object isolation for your best ideas',
                      image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80',
                      hoverImage:
                          'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
                  },
                  {
                      icon: Maximize,
                      title: 'No Limits',
                      description: 'Extend reality beyond the frame with AI power',
                      image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80',
                      hoverImage:
                          'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
                  },
              ];

    return (
        <div className="py-32 overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 mb-16">
                <h2 className="text-4xl sm:text-7xl tracking-tighter uppercase mb-4 leading-none">
                    <span className="font-medium">{language === 'ru' ? 'Твори ' : 'Create '}</span>
                    <span className="font-bold">
                        {language === 'ru' ? 'без ограничений' : 'without limits'}
                    </span>
                </h2>
                <p className="text-xl text-white/40 max-w-2xl font-medium">
                    {language === 'ru'
                        ? 'Все необходимые инструменты для профессиональной работы с контентом в одном месте'
                        : 'All the tools you need for professional content creation in one place'}
                </p>
            </div>

            <div className="flex gap-10 overflow-x-auto px-6 pb-12 no-scrollbar">
                <div className="flex gap-10 max-w-[1440px] mx-auto">
                    {tools.map((tool, i) => (
                        <ToolCard key={i} {...tool} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    description,
    delay,
}: {
    icon: any;
    title: string;
    description: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-black/5 border border-black/10 hover:border-[#6F00FF]/50 transition-all group"
        >
            <div className="w-12 h-12 rounded-xl bg-[#6F00FF]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-[#6F00FF]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-black">{title}</h3>
            <p className="text-black/60 leading-relaxed font-medium">{description}</p>
        </motion.div>
    );
}

function TypewriterLogo() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const { language } = useLanguage();
    const text = language === 'ru' ? 'СДЕЛAI' : 'SDELAI';
    const [displayText, setDisplayText] = useState('');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isInView) {
            let index = 0;
            const interval = setInterval(() => {
                if (index <= text.length) {
                    setDisplayText(text.slice(0, index));
                    setProgress(index / text.length);
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 150);
            return () => clearInterval(interval);
        }
    }, [isInView, text]);

    return (
        <div ref={ref} className="border-t border-white/5 pt-12 relative">
            <h1 className="text-[25vw] font-black tracking-tighter leading-none text-white pointer-events-none select-none text-center uppercase">
                {displayText}
                <span className="animate-pulse font-thin ml-[-0.05em]">|</span>
            </h1>
            {/* Animated Ellipse synced with typing */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                    opacity: progress * 0.3,
                    scale: 0.5 + progress * 0.5,
                }}
                className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[90vw] h-[300px] bg-[#6F00FF] blur-[140px] rounded-[100%] pointer-events-none -z-10"
            />
        </div>
    );
}

function HiggsfieldGrid() {
    const { language } = useLanguage();
    const [filter, setFilter] = useState('all');

    const categories = [
        { id: 'all', label: language === 'ru' ? 'Все' : 'All' },
        { id: 'cinema', label: language === 'ru' ? 'Кино' : 'Cinema' },
        { id: 'art', label: language === 'ru' ? 'Арт' : 'Art' },
        { id: 'anime', label: language === 'ru' ? 'Аниме' : 'Anime' },
        { id: '3d', label: '3D' },
    ];

    const items = [
        {
            id: 1,
            category: 'cinema',
            size: 'large',
            img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        },
        {
            id: 2,
            category: 'art',
            size: 'medium',
            img: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80',
        },
        {
            id: 3,
            category: 'anime',
            size: 'small',
            img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
        },
        {
            id: 4,
            category: '3d',
            size: 'medium',
            img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
        },
        {
            id: 5,
            category: 'cinema',
            size: 'small',
            img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
        },
        {
            id: 6,
            category: 'art',
            size: 'large',
            img: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80',
        },
        {
            id: 7,
            category: 'anime',
            size: 'medium',
            img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
        },
        {
            id: 8,
            category: '3d',
            size: 'small',
            img: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80',
        },
    ];

    const filteredItems = filter === 'all' ? items : items.filter((i) => i.category === filter);

    return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2 mb-12">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                            filter === cat.id
                                ? 'bg-black text-white'
                                : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                {filteredItems.map((item) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={item.id}
                        className="relative rounded-2xl overflow-hidden group border border-black/5"
                    >
                        <img
                            src={item.img}
                            alt=""
                            className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <ExternalLink className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function NavDropdown({
    label,
    items,
    language,
    isLight,
}: {
    label: string;
    items: any[];
    language: string;
    isLight?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 100);
    };

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger
                    className={`px-4 py-2 text-sm rounded-xl transition-all flex items-center gap-1.5 outline-none font-medium backdrop-blur-md ${
                        isLight
                            ? 'bg-black/10 text-black/60 hover:text-black hover:bg-black/15'
                            : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/15'
                    }`}
                    onClick={(e) => e.preventDefault()}
                >
                    {label}
                    <ChevronDown
                        className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${
                            open ? 'rotate-180' : ''
                        }`}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    align="start"
                    className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl min-w-[240px] p-2 mt-2"
                >
                    {items.map((item) => (
                        <DropdownMenuItem
                            key={item.href}
                            asChild
                            className="rounded-lg focus:bg-white/10 focus:text-white cursor-pointer p-0"
                        >
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-3 w-full pl-3 pr-8 py-3 group/item"
                                >
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-white/10 group-hover/item:text-white transition-colors">
                                    <item.icon className="w-4 h-4 transition-transform group-hover/item:scale-110" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-white">
                                        {language === 'ru' ? item.label.ru : item.label.en}
                                    </span>
                                    <span className="text-[10px] text-white/40 line-clamp-1">
                                        {language === 'ru'
                                            ? item.description.ru
                                            : item.description.en}
                                    </span>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function LandingPage() {
    const { language, setLanguage, t } = useLanguage();
    const [prompt, setPrompt] = useState('');
    const [headerVisible, setHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isHeaderLight, setIsHeaderLight] = useState(false);
    const featuresRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const anyVisible = entries.some((entry) => entry.isIntersecting);
                setIsHeaderLight(anyVisible);
            },
            { threshold: 0.1, rootMargin: '-80px 0px 0px 0px' }
        );

        if (featuresRef.current) observer.observe(featuresRef.current);
        if (ctaRef.current) observer.observe(ctaRef.current);

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 600) {
                if (currentScrollY > lastScrollY) {
                    setHeaderVisible(false);
                } else {
                    setHeaderVisible(true);
                }
            } else {
                setHeaderVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, [lastScrollY]);

    const phrases =
        language === 'ru'
            ? [
                  'смешную картинку',
                  'видео из фото',
                  'песню про друзей',
                  'логотип бренда',
                  '3D персонажа',
              ]
            : [
                  'funny image',
                  'video from photo',
                  'song about friends',
                  'brand logo',
                  '3D character',
              ];

    const createItems = [
        {
            href: '/app/create/image',
            label: { ru: 'Изображение', en: 'Image' },
            description: { ru: 'Генерация картинок', en: 'Generate images' },
            icon: Image,
        },
        {
            href: '/app/create/video',
            label: { ru: 'Видео', en: 'Video' },
            description: { ru: 'Создание анимаций', en: 'Create animations' },
            icon: Video,
        },
        {
            href: '/app/create/audio',
            label: { ru: 'Аудио', en: 'Audio' },
            description: { ru: 'Музыка и речь', en: 'Music and speech' },
            icon: Music,
        },
    ];

    const toolItems = [
        {
            href: '/app/tools/enhance',
            label: { ru: 'Улучшить', en: 'Enhance' },
            description: { ru: 'HD качество', en: 'HD quality' },
            icon: Wand2,
        },
        {
            href: '/app/tools/expand',
            label: { ru: 'Расширить', en: 'Expand' },
            description: { ru: 'Достроить края', en: 'Outpaint edges' },
            icon: Maximize,
        },
        {
            href: '/app/tools/remove-bg',
            label: { ru: 'Удалить фон', en: 'Remove BG' },
            description: { ru: 'Прозрачный фон', en: 'Transparent BG' },
            icon: Eraser,
        },
    ];

    const appItems = [
        {
            href: '/app/apps/face-swap',
            label: { ru: 'Лица', en: 'Face Swap' },
            description: { ru: 'Замена лиц', en: 'Swap faces' },
            icon: Smile,
        },
        {
            href: '/app/apps/relight',
            label: { ru: 'Свет', en: 'Relight' },
            description: { ru: 'Изменить освещение', en: 'Change lighting' },
            icon: Sun,
        },
        {
            href: '/app/apps/stylist',
            label: { ru: 'Стилист', en: 'Stylist' },
            description: { ru: 'Перенос стиля', en: 'Style transfer' },
            icon: Palette,
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-[#6F00FF] selection:text-white font-sans">
            <SpotlightGrid />

            <motion.nav
                initial={{ y: 0 }}
                animate={{ y: headerVisible ? 0 : -100 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
                    isHeaderLight ? 'border-b border-black/5' : ''
                }`}
            >
                <div
                    className={`max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between relative z-10 ${
                        isHeaderLight ? 'text-black' : 'text-white'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <Link href="/" className={isHeaderLight ? 'invert' : ''}>
                            <AnimatedLogo />
                        </Link>
                        <div className="hidden sm:flex items-center gap-1">
                            <NavDropdown
                                label={language === 'ru' ? 'Сделать' : 'Create'}
                                items={createItems}
                                language={language}
                                isLight={isHeaderLight}
                            />
                            <NavDropdown
                                label={language === 'ru' ? 'Инструменты' : 'Tools'}
                                items={toolItems}
                                language={language}
                                isLight={isHeaderLight}
                            />
                            {/* <div className={`w-px h-4 mx-2 ${isHeaderLight ? "bg-black/10" : "bg-white/10"}`} />
  
                      <Link href="/school" className={`px-4 py-2 rounded-xl text-sm transition-all font-medium backdrop-blur-md ${
                        isHeaderLight 
                          ? "bg-black/10 text-black/60 hover:text-black hover:bg-black/15" 
                          : "bg-white/10 text-white/60 hover:text-white hover:bg-white/15"
                      }`}>{language === "ru" ? "Школа" : "School"}</Link> */}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <button
                            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                            className={`px-3 py-1.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md ${
                                isHeaderLight
                                    ? 'border-black/5 bg-black/10 text-black hover:bg-black/15'
                                    : 'border-white/5 bg-white/10 text-white hover:bg-white/15'
                            }`}
                        >
                            {language === 'ru' ? (
                                <>
                                    <svg
                                        width="16"
                                        height="12"
                                        viewBox="0 0 16 12"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="rounded-sm"
                                    >
                                        <rect width="16" height="4" fill="white" />
                                        <rect y="4" width="16" height="4" fill="#0039A6" />
                                        <rect y="8" width="16" height="4" fill="#D52B1E" />
                                    </svg>
                                    RU
                                </>
                            ) : (
                                <>
                                    <svg
                                        width="16"
                                        height="12"
                                        viewBox="0 0 16 12"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="rounded-sm"
                                    >
                                        <rect width="16" height="12" fill="#012169" />
                                        <path
                                            d="M0 0L16 12M16 0L0 12"
                                            stroke="white"
                                            strokeWidth="2"
                                        />
                                        <path d="M16 0L0 12" stroke="#C8102E" strokeWidth="1" />
                                        <path d="M8 0V12M0 6H16" stroke="white" strokeWidth="3" />
                                        <path d="M8 0V12M0 6H16" stroke="#C8102E" strokeWidth="2" />
                                    </svg>
                                    EN
                                </>
                            )}
                        </button>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/app"
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all backdrop-blur-md hover:backdrop-blur-lg ${
                                    isHeaderLight
                                        ? 'text-black/60 hover:text-black hover:bg-black/10'
                                        : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {language === 'ru' ? 'Войти' : 'Login'}
                            </Link>

                            <Link
                                href="/app"
                                prefetch={true}
                                className="px-5 py-2 rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all relative overflow-hidden group whitespace-nowrap backdrop-blur-md"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#6F00FF] via-[#a855f7] to-[#6F00FF] bg-[length:200%_100%] animate-gradient-x opacity-90" />
                                <span className="relative z-10 text-white">{t('landing.cta')}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <main className="relative">
                {/* Hero Section */}
                <section className="pt-32 pb-12 px-6 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <h1 className="text-4xl sm:text-6xl md:text-[90px] tracking-tighter mb-6 leading-[1.05]">
                                <span className="font-black uppercase tracking-[0.25em] inline-block mb-2">
                                    {language === 'ru' ? 'Сделай' : 'Create'}
                                </span>{' '}
                                <br />
                                <span className="font-normal text-white/70 tracking-tight">
                                    <AnimatedTitle phrases={phrases} />
                                </span>
                            </h1>
                            <p className="text-xl sm:text-2xl text-white/50 max-w-2xl mx-auto font-normal tracking-tight">
                                {t('landing.heroSub')}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-3xl mx-auto mb-20"
                        >
                            <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
                                <Link 
                                    href="/app/create/image" 
                                    className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-xl backdrop-blur-md"
                                >
                                    {language === 'ru' ? 'Изображение' : 'Image'}
                                </Link>
                                <Link 
                                    href="/app/create/video" 
                                    className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-xl backdrop-blur-md"
                                >
                                    {language === 'ru' ? 'Видео' : 'Video'}
                                </Link>
                                <Link 
                                    href="/app/create/audio" 
                                    className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-xl backdrop-blur-md"
                                >
                                    {language === 'ru' ? 'Аудио' : 'Audio'}
                                </Link>
                            </div>
                            <div className="relative group z-10">
                                <div className="absolute -inset-4 bg-[#6F00FF]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div 
                                    className="relative rounded-3xl p-2"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        backdropFilter: 'blur(12px)',
                                    }}
                                >
                                    <div 
                                        className="absolute inset-0 rounded-3xl pointer-events-none"
                                        style={{
                                            padding: '1px',
                                            background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 100%)',
                                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                            WebkitMaskComposite: 'xor',
                                            maskComposite: 'exclude',
                                        }}
                                    />
                                    <div className="flex flex-col min-h-[160px]">
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder={
                                                language === 'ru'
                                                    ? 'Опишите ваш шедевр...'
                                                    : 'Describe your masterpiece...'
                                            }
                                            className="w-full bg-transparent border-none focus:ring-0 text-xl font-mono resize-none p-5 placeholder:text-white/35 outline-none"
                                        />

                                        <div className="flex justify-end p-3">
                                            <Link
                                                href="/app"
                                                className="px-6 py-3 rounded-xl bg-[#6F00FF] text-white font-bold text-base hover:bg-[#5D00D6] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(111,0,255,0.3)]"
                                            >
                                                {language === 'ru' ? 'Сделать' : 'Create'}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <ParallaxImageGrid />
                </section>

                <section id="models" className="py-16">
                    <Marquee />
                </section>

                <FeaturesTabs />
                <ToolsScroll />

                {/* Features Section - INVERTED (Higgsfield Style) */}
                <section
                    id="features"
                    ref={featuresRef}
                    className="py-32 px-6 relative bg-white text-black"
                >
                    <div className="absolute inset-0 z-0">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                                backgroundSize: '60px 60px',
                                maskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 50%)',
                                WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 50%)',
                                opacity: 0.06,
                            }}
                        />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="mb-24">
                            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-8 leading-none uppercase max-w-3xl">
                                {language === 'ru'
                                    ? 'ИИ инструменты нового поколения'
                                    : 'Next-gen AI Tools'}
                            </h2>
                            <HiggsfieldGrid />
                        </div>
                    </div>
                </section>

                {/* CTA Section - INVERTED */}
                <section ref={ctaRef} className="py-32 px-6 bg-white border-t border-black/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="relative p-12 sm:p-24 overflow-hidden text-center">
                            <div className="relative z-10">
                                <h2 className="text-4xl sm:text-7xl tracking-tighter mb-12 leading-none uppercase">
                                    <span className="font-normal text-black">
                                        {language === 'ru' ? 'Начни творить ' : 'Start Creating '}
                                    </span>
                                    <span className="font-bold text-black">
                                        {language === 'ru' ? 'прямо сейчас' : 'Now'}
                                    </span>
                                </h2>
                                <Link
                                    href="/app"
                                    className="px-12 py-6 rounded-2xl bg-[#6F00FF] text-white font-black text-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 relative overflow-hidden group shadow-[0_20px_40px_rgba(111,0,255,0.2)]"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        {t('landing.cta')}
                                        <ArrowRight className="w-6 h-6" />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer id="resources" className="pt-32 pb-20 px-6 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-32 text-left items-start">
                        <div className="lg:col-span-2">
                            <p className="text-2xl sm:text-3xl font-black text-white uppercase leading-[1.1]">
                                {language === 'ru' ? (
                                    <>
                                        СДЕЛАЙ <br /> ЧТО УГОДНО В ИИ — ПРОСТО
                                    </>
                                ) : (
                                    <>
                                        MAKE <br /> ANYTHING IN AI — SIMPLE
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="lg:flex lg:flex-col lg:items-end">
                            <div className="w-full sm:w-auto text-left">
                                <h4 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-white/40">
                                    {language === 'ru' ? 'Продукт' : 'Product'}
                                </h4>
                                <ul className="flex flex-col gap-6">
                                    <li>
                                        <Link
                                            href="/app/create/image"
                                            className="text-white hover:text-[#6F00FF] transition-colors text-sm font-bold uppercase tracking-wider"
                                        >
                                            {language === 'ru' ? 'Сделать' : 'Create'}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/app/tools/enhance"
                                            className="text-white hover:text-[#6F00FF] transition-colors text-sm font-bold uppercase tracking-wider"
                                        >
                                            {language === 'ru' ? 'Инструменты' : 'Tools'}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="lg:flex lg:flex-col lg:items-end">
                            <div className="w-full sm:w-auto text-left">
                                <h4 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-white/40">
                                    {language === 'ru' ? 'Ресурсы' : 'Resources'}
                                </h4>
                                <ul className="flex flex-col gap-6">
                                    {/* <li><Link href="/school" className="text-white hover:text-[#6F00FF] transition-colors text-sm font-bold uppercase tracking-wider">{language === "ru" ? "Школа" : "School"}</Link></li> */}
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-white hover:text-[#6F00FF] transition-colors text-sm font-bold uppercase tracking-wider"
                                        >
                                            {language === 'ru' ? 'Блог' : 'Blog'}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-white hover:text-[#6F00FF] transition-colors text-sm font-bold uppercase tracking-wider"
                                        >
                                            {language === 'ru' ? 'Комьюнити' : 'Community'}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex-col items-center">
                        <div className="w-full relative">
                            <TypewriterLogo />
                        </div>
                        <div className="mt-12 flex flex-col items-center gap-8">
                            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                                <Link
                                    href="#"
                                    className="text-white/10 hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em] font-bold"
                                >
                                    {language === 'ru'
                                        ? 'Политика конфиденциальности'
                                        : 'Privacy Policy'}
                                </Link>
                                <Link
                                    href="#"
                                    className="text-white/10 hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em] font-bold"
                                >
                                    {language === 'ru' ? 'Условия использования' : 'Terms of Use'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes gradient-x {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
                .animate-gradient-x {
                    animation: gradient-x 3s ease infinite;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
