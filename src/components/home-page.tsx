'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video as VideoIcon, ArrowRight, Zap, Sparkles, Wand2, Maximize, Eraser, Play } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';

import { useLanguage } from '@/lib/language-context';
import { TypewriterTitle, UnifiedGenerationBar } from '@/components/home';

const TEMPLATES = [
    {
        id: 'product',
        title: 'Карточка товара',
        description: 'Профессиональное фото для маркетплейсов',
        image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/market-1768406785100.png?width=8000&height=8000&resize=contain',
        prompt_ru: 'Профессиональная предметная фотосъёмка товара для интернет-магазина. Чистый нейтральный фон, мягкий студийный свет, высокая резкость, точная цветопередача. Товар расположен по центру кадра, без лишних объектов, без шума. Коммерческий стиль, подходящий для карточки товара на маркетплейсе. Фотореализм, высокое качество, ощущение премиального продукта.',
        prompt_en: 'Professional product photography for an online store. Clean neutral background, soft studio light, high sharpness, accurate color reproduction. The product is centered in the frame, no extra objects, no noise. Commercial style suitable for a marketplace product card. Photorealism, high quality, premium product feel.',
        target: '/app/create/image'
    },
    {
        id: 'clothes',
        title: 'ИИ-Стилист',
        description: 'Примерь любой образ за секунды',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
        prompt_ru: 'Модель в роскошном красном шелковом платье, фон улицы Парижа, реалистичное освещение',
        prompt_en: 'Fashion model wearing a luxury red silk dress, Paris street background, realistic lighting',
        target: '/app/apps/stylist'
    },
    {
        id: 'ghibli',
        title: 'Студия Гибли',
        description: 'Атмосфера легендарного аниме',
        image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/19369fcb-cbd4-430f-8b8a-cb81685ddfc2/anime-1768585626687.png?width=8000&height=8000&resize=contain',
        prompt_ru: 'Портрет человека в анимационном стиле, вдохновлённом японской рисованной анимацией конца 90-х, студией Гибли. Мягкие линии, тёплая цветовая палитра, выразительные глаза, спокойное доброжелательное выражение лица. Плоское освещение без резких теней, акварельные текстуры, чистый фон с лёгким намёком на природу. Атмосфера уюта, спокойствия и лёгкой магии. Высокое качество, аккуратный контур, художественный стиль.',
        prompt_en: 'Portrait of a person in animation style inspired by Japanese hand-drawn animation of the late 90s, Studio Ghibli. Soft lines, warm color palette, expressive eyes, calm friendly facial expression. Flat lighting without harsh shadows, watercolor textures, clean background with a light hint of nature. Atmosphere of comfort, peace and light magic. High quality, neat outline, artistic style.',
        target: '/app/create/image'
    },
    {
        id: '3d-model',
        title: '3D-фигурка',
        description: 'Объемные персонажи и объекты',
        image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/3d-1768406830139.png?width=8000&height=8000&resize=contain',
        prompt_ru: 'Создай коммерческую коллекционную фигурку персонажа с приложенного изображения в масштабе 1/7. Реалистичный 3D-стиль, высокая детализация, материалы выглядят физически корректно. Фигурка размещена на компьютерном столе в реальной обстановке. Под фигуркой — круглая прозрачная акриловая подставка. На экране компьютера отображается процесс 3D-моделирования этой фигурки. Рядом с монитором стоит коробка от игрушки, оформленная в стиле премиальных коллекционных фигур. На упаковке напечатаны оригинальные двухмерные иллюстрации этой фигурки. Кинематографичный свет, фотореализм, коммерческий уровень качества.',
        prompt_en: 'Create a commercial collectible figure of the character from the attached image in 1/7 scale. Realistic 3D style, high detail, materials look physically correct. The figure is placed on a computer desk in a real environment. Under the figure is a round transparent acrylic stand. The computer screen displays the process of 3D modeling this figure. Next to the monitor is a toy box designed in the style of premium collectible figures. Original 2D illustrations of this figure are printed on the package. Cinematic light, photorealism, commercial quality level.',
        target: '/app/create/image'
    },
    {
        id: 'face-swap',
        title: 'Заменить лицо',
        description: 'Реалистичная замена лиц на фото',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        prompt_ru: 'Заменить лицо персонажа на лицо с приложенной фотографии, сохранив естественные пропорции, выражение и освещение. Реалистичное совмещение, корректная перспектива, совпадение тона кожи и направления света. Без искажений, без артефактов, без изменения пола и возраста. Результат должен выглядеть как единая фотография.',
        prompt_en: 'Replace the character\'s face with the face from the attached photo, maintaining natural proportions, expression and lighting. Realistic blending, correct perspective, matching skin tone and light direction. No distortions, no artifacts, no change in gender or age. The result should look like a single photograph.',
        target: '/app/create/image'
    }
];

const TOOLS = [
    {
        id: 'remove-bg',
        title: 'Удалить фон',
        description: 'Идеально чисто',
        image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/removebg-1768346852348.png?width=8000&height=8000&resize=contain',
        hoverImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/removebg_hover-1768346852348.png?width=8000&height=8000&resize=contain',
        href: '/app/tools/remove-bg'
    },
    {
        id: 'enhance',
        title: 'Улучшить',
        description: 'Детализация и четкость',
        image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/upscale-1768346852348.png?width=8000&height=8000&resize=contain',
        hoverImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/upscale_hover-1768346852404.png?width=8000&height=8000&resize=contain',
        href: '/app/tools/enhance'
    },
    {
        id: 'expand',
        title: 'Дорисовать',
        description: 'Расширение границ',
        image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/expand-1768346852352.png?width=8000&height=8000&resize=contain',
        hoverImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/expand_hover-1768346852354.png?width=8000&height=8000&resize=contain',
        href: '/app/tools/expand'
    }
];

function HorizontalScroll({ children }: { children: React.ReactNode }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative group">
            <div 
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
                {children}
            </div>
        </div>
    );
}

function TemplateCard({ item }: { item: typeof TEMPLATES[0] }) {
    const { language } = useLanguage();
    const prompt = language === 'ru' ? item.prompt_ru : item.prompt_en;
    
    return (
        <Link 
            href={`${item.target}?prompt=${encodeURIComponent(prompt)}`}
            className="flex-shrink-0 w-[280px] snap-start group"
        >
            <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-white/5 border border-white/5">
                <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-all duration-500"
                />
            </div>
            <h4 className="font-bold text-base mb-1">{item.title}</h4>
            <p className="text-xs text-white/40 line-clamp-2">{item.description}</p>
        </Link>
    );
}

function GalleryCard({ item }: { item: typeof GALLERY_ITEMS[0] }) {
    const aspectClass = item.aspectRatio === 'vertical' 
        ? 'row-span-2' 
        : item.aspectRatio === 'horizontal' 
            ? 'col-span-2' 
            : '';
    
    return (
        <div className={`${aspectClass} group cursor-pointer`}>
            <div className="w-full h-full rounded-2xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <img 
                    src={item.image} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
        </div>
    );
}

function ToolCardSquare({ item }: { item: any }) {
    const [isHovered, setIsHovered] = useState(false);
    const { t } = useLanguage();

    return (
        <Link 
            href={item.href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex-shrink-0 w-[216px] snap-start group"
        >
            <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-[#1A1A1A] border border-white/5 relative">
                {item.badge && (
                    <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[8px] font-black uppercase tracking-widest shadow-lg">
                        {item.badge}
                    </div>
                )}
                <img 
                    src={isHovered ? item.hoverImage : item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-all duration-500"
                />
            </div>
            <div className="px-1">
                <h4 className="font-bold text-base mb-0.5">{item.title}</h4>
                <p className="text-xs text-white/40">{item.description}</p>
            </div>
        </Link>
    );
}

export function HomePage() {
    const { t, language } = useLanguage();
    const phrases = ['смешную картинку', 'видео из фото', 'песню про друзей'];

    const TOOLS_WITH_NANO = [
        {
            id: 'nano',
            title: 'Nano Banana Pro',
            description: 'Лучшая генеративная модель',
            image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/banana-apple-manzano-exoticfruitscouk-905674-1768392693560.jpg?width=8000&height=8000&resize=contain',
            hoverImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/banana-apple-manzano-exoticfruitscouk-905674-1768392693560.jpg?width=8000&height=8000&resize=contain',
            href: '/app/create/image?model=nano',
            badge: 'ТОП'
        },
        ...TOOLS
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-24 pb-32 relative">
            {/* Grid background */}
            <div
                className="absolute left-1/2 -translate-x-1/2 w-screen -top-24 h-[800px] pointer-events-none z-0"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                    maskImage: 'radial-gradient(circle at 50% 0%, black 10%, transparent 75%)',
                    WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 10%, transparent 75%)',
                }}
            />
            
            {/* Hero Section */}
            <section className="pt-12 text-center space-y-12 relative z-10">
                <div className="space-y-4">
                    <TypewriterTitle phrases={phrases} prefix="Сделай" />
                </div>

                <UnifiedGenerationBar />
            </section>

            {/* Инструменты */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Инструменты</h2>
                </div>
                <HorizontalScroll>
                    {TOOLS_WITH_NANO.map(item => (
                        <ToolCardSquare key={item.id} item={item} />
                    ))}
                </HorizontalScroll>
            </section>

            {/* Чертежи */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Чертежи</h2>
                </div>
                <HorizontalScroll>
                    {TEMPLATES.map(item => (
                        <TemplateCard key={item.id} item={item} />
                    ))}
                </HorizontalScroll>
            </section>


        </div>
    );
}
