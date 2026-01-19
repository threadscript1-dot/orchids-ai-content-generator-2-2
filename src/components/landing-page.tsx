'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import {
    Image,
    Video,
    Music,
    ArrowRight,
    Wand2,
    Maximize,
    Eraser,
    Smile,
    Sun,
    Palette,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AnimatedTitle } from '@/components/animated-title';
import { AnimatedLogo } from '@/components/animated-logo';
import {
    SpotlightGrid,
    Marquee,
    ParallaxImageGrid,
    FeaturesTabs,
    ToolsScroll,
    HiggsfieldGrid,
    NavDropdown,
} from '@/components/home';

const CREATE_ITEMS = [
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

const TOOL_ITEMS = [
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

const APP_ITEMS = [
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

const PHRASES_RU = ['смешную картинку', 'видео из фото', 'песню про друзей', 'логотип бренда', '3D персонажа'];
const PHRASES_EN = ['funny image', 'video from photo', 'song about friends', 'brand logo', '3D character'];

function LanguageToggle({ language, onToggle, isLight }: { language: string; onToggle: () => void; isLight: boolean }) {
    return (
        <button
            onClick={onToggle}
            aria-label={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
            className={`px-3 py-1.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md ${
                isLight
                    ? 'border-black/5 bg-black/10 text-black hover:bg-black/15'
                    : 'border-white/5 bg-white/10 text-white hover:bg-white/15'
            }`}
        >
            {language === 'ru' ? (
                <>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="rounded-sm">
                        <rect width="16" height="4" fill="white" />
                        <rect y="4" width="16" height="4" fill="#0039A6" />
                        <rect y="8" width="16" height="4" fill="#D52B1E" />
                    </svg>
                    RU
                </>
            ) : (
                <>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="rounded-sm">
                        <rect width="16" height="12" fill="#012169" />
                        <path d="M0 0L16 12M16 0L0 12" stroke="white" strokeWidth="2" />
                        <path d="M16 0L0 12" stroke="#C8102E" strokeWidth="1" />
                        <path d="M8 0V12M0 6H16" stroke="white" strokeWidth="3" />
                        <path d="M8 0V12M0 6H16" stroke="#C8102E" strokeWidth="2" />
                    </svg>
                    EN
                </>
            )}
        </button>
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

    const phrases = language === 'ru' ? PHRASES_RU : PHRASES_EN;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const anyVisible = entries.some((entry) => entry.isIntersecting);
                setIsHeaderLight(anyVisible);
            },
            { threshold: 0.1, rootMargin: '-80px 0px 0px 0px' },
        );

        if (featuresRef.current) observer.observe(featuresRef.current);
        if (ctaRef.current) observer.observe(ctaRef.current);

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 600) {
                setHeaderVisible(currentScrollY <= lastScrollY);
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

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-[#6F00FF] selection:text-white font-sans">
            <SpotlightGrid />

            {/* Navigation */}
            <motion.nav
                initial={{ y: 0 }}
                animate={{ y: headerVisible ? 0 : -100 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isHeaderLight ? 'border-b border-black/5' : ''}`}
            >
                <div className={`max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between relative z-10 ${isHeaderLight ? 'text-black' : 'text-white'}`}>
                    <div className="flex items-center gap-4">
                        <Link href="/" className={isHeaderLight ? 'invert' : ''}>
                            <AnimatedLogo />
                        </Link>
                        <div className="hidden sm:flex items-center gap-1">
                            <NavDropdown label={language === 'ru' ? 'Сделать' : 'Create'} items={CREATE_ITEMS} language={language} isLight={isHeaderLight} />
                            <NavDropdown label={language === 'ru' ? 'Инструменты' : 'Tools'} items={TOOL_ITEMS} language={language} isLight={isHeaderLight} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <LanguageToggle language={language} onToggle={() => setLanguage(language === 'ru' ? 'en' : 'ru')} isLight={isHeaderLight} />
                        <div className="flex items-center gap-2">
                            <Link
                                href="/app"
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all backdrop-blur-md hover:backdrop-blur-lg ${
                                    isHeaderLight ? 'text-black/60 hover:text-black hover:bg-black/10' : 'text-white/60 hover:text-white hover:bg-white/10'
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
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                            <h1 className="text-4xl sm:text-6xl md:text-[90px] tracking-tighter mb-6 leading-[1.05]">
                                <span className="font-black uppercase tracking-[0.25em] inline-block mb-2">{language === 'ru' ? 'Сделай' : 'Create'}</span>
                                <br />
                                <span className="font-normal text-white/70 tracking-tight">
                                    <AnimatedTitle phrases={phrases} />
                                </span>
                            </h1>
                            <p className="text-xl sm:text-2xl text-white/50 max-w-2xl mx-auto font-normal tracking-tight">{t('landing.heroSub')}</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto mb-20">
                            <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
                                {[
                                    { href: '/app/create/image', ru: 'Изображение', en: 'Image' },
                                    { href: '/app/create/video', ru: 'Видео', en: 'Video' },
                                    { href: '/app/create/audio', ru: 'Аудио', en: 'Audio' },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-xl backdrop-blur-md"
                                    >
                                        {language === 'ru' ? item.ru : item.en}
                                    </Link>
                                ))}
                            </div>
                            <div className="relative group z-10">
                                <div className="absolute -inset-4 bg-[#6F00FF]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="relative rounded-3xl p-2" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>
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
                                            aria-label={language === 'ru' ? 'Описание вашего шедевра' : 'Describe your masterpiece'}
                                            placeholder={language === 'ru' ? 'Опишите ваш шедевр…' : 'Describe your masterpiece…'}
                                            className="w-full bg-transparent border-none focus:ring-0 text-xl font-mono resize-none p-5 placeholder:text-white/35 outline-none focus-visible:ring-0"
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

                {/* Features Section - INVERTED */}
                <section id="features" ref={featuresRef} className="py-32 px-6 relative bg-white text-black">
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
                                {language === 'ru' ? 'ИИ инструменты нового поколения' : 'Next-gen AI Tools'}
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
                                    <span className="font-normal text-black">{language === 'ru' ? 'Начни творить ' : 'Start Creating '}</span>
                                    <span className="font-bold text-black">{language === 'ru' ? 'прямо сейчас' : 'Now'}</span>
                                </h2>
                                <Link
                                    href="/app"
                                    className="px-12 py-6 rounded-2xl bg-[#6F00FF] text-white font-black text-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 relative overflow-hidden group shadow-[0_20px_40px_rgba(111,0,255,0.2)]"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        {t('landing.cta')}
                                        <ArrowRight className="w-6 h-6" aria-hidden="true" />
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
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
                                <h4 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-white/40">{language === 'ru' ? 'Продукт' : 'Product'}</h4>
                                <ul className="flex flex-col gap-6">
                                    <li>
                                        <Link href="/app/create/image" className="text-white hover:text-[#6F00FF] transition-colors text-sm font-bold uppercase tracking-wider">
                                            {language === 'ru' ? 'Сделать' : 'Create'}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/app/tools/enhance" className="text-white hover:text-[#6F00FF] transition-colors text-sm font-bold uppercase tracking-wider">
                                            {language === 'ru' ? 'Инструменты' : 'Tools'}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="lg:flex lg:flex-col lg:items-end">
                            <div className="w-full sm:w-auto text-left">
                                <h4 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-white/40">{language === 'ru' ? 'Ресурсы' : 'Resources'}</h4>
                                <ul className="flex flex-col gap-6">
                                    <li>
                                        <Link href="#" className="text-white hover:text-[#6F00FF] transition-colors text-sm font-bold uppercase tracking-wider">
                                            {language === 'ru' ? 'Блог' : 'Blog'}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-white hover:text-[#6F00FF] transition-colors text-sm font-bold uppercase tracking-wider">
                                            {language === 'ru' ? 'Комьюнити' : 'Community'}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex-col items-center">
                        <div className="mt-12 flex flex-col items-center gap-8">
                            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                                <Link href="#" className="text-white/10 hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em] font-bold">
                                    {language === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
                                </Link>
                                <Link href="#" className="text-white/10 hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em] font-bold">
                                    {language === 'ru' ? 'Условия использования' : 'Terms of Use'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-x { animation: gradient-x 3s ease infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
