'use client';

import { useState } from 'react';
import { Image, Video, Wand2, Eraser, Maximize, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface ToolCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    image: string;
    hoverImage: string;
}

function ToolCard({ icon: Icon, title, description, image, hoverImage }: ToolCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="flex-shrink-0 w-[300px] group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#6F00FF] transition-all mb-4">
                <Icon
                    className="w-6 h-6 text-white/40 group-hover:text-white transition-colors"
                    aria-hidden="true"
                />
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

const TOOLS_RU = [
    {
        icon: Image,
        title: 'Магия кисти',
        description: 'Превращайте слова в визуальные шедевры за секунды',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        hoverImage: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80',
    },
    {
        icon: Video,
        title: 'Живые кадры',
        description: 'Вдохните жизнь в статичные изображения одним кликом',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
        hoverImage: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
    },
    {
        icon: Wand2,
        title: 'Сверхчеткость',
        description: 'Раскройте каждую деталь в безупречном 4K разрешении',
        image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80',
        hoverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
    },
    {
        icon: Eraser,
        title: 'Чистый холст',
        description: 'Мгновенная изоляция объектов для ваших лучших идей',
        image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80',
        hoverImage: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
    },
    {
        icon: Maximize,
        title: 'Без границ',
        description: 'Достраивайте реальность за пределами кадра силой ИИ',
        image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80',
        hoverImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
    },
];

const TOOLS_EN = [
    {
        icon: Image,
        title: 'Brush Magic',
        description: 'Transform words into visual masterpieces in seconds',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        hoverImage: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80',
    },
    {
        icon: Video,
        title: 'Living Frames',
        description: 'Breathe life into static images with a single click',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
        hoverImage: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
    },
    {
        icon: Wand2,
        title: 'Ultra Clarity',
        description: 'Reveal every detail in flawless 4K resolution',
        image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80',
        hoverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
    },
    {
        icon: Eraser,
        title: 'Clean Canvas',
        description: 'Instant object isolation for your best ideas',
        image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80',
        hoverImage: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
    },
    {
        icon: Maximize,
        title: 'No Limits',
        description: 'Extend reality beyond the frame with AI power',
        image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80',
        hoverImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
    },
];

export function ToolsScroll() {
    const { language } = useLanguage();
    const tools = language === 'ru' ? TOOLS_RU : TOOLS_EN;

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
                        ? 'Генерируй изображения, видео и музыку с помощью нейросетей — быстро, качественно и без технических навыков'
                        : 'Generate images, videos and music with AI — fast, high-quality, no technical skills required'}
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
