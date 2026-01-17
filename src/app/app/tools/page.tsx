'use client';

import { motion } from 'framer-motion';
import { Wrench, Sparkles, Wand2, Maximize, Eraser, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';

const TOOLS = [
    {
        id: 'nano',
        title: 'Nano Banana Pro',
        description: 'Лучшая генеративная модель',
        image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/banana-apple-manzano-exoticfruitscouk-905674-1768392693560.jpg?width=8000&height=8000&resize=contain',
        hoverImage: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/banana-apple-manzano-exoticfruitscouk-905674-1768392693560.jpg?width=8000&height=8000&resize=contain',
        href: '/app/create/image?model=nano',
        badge: 'ТОП'
    },
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

function ToolCard({ item }: { item: any }) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <Link 
            href={item.href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group block"
        >
            <div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-[#1A1A1A] border border-white/5 relative">
                {item.badge && (
                    <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {item.badge}
                    </div>
                )}
                <img 
                    src={isHovered ? item.hoverImage : item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />
            </div>
            <div className="px-1">
                <h4 className="font-bold text-lg mb-0.5 group-hover:text-[#6F00FF] transition-colors">{item.title}</h4>
                <p className="text-xs text-white/40 uppercase tracking-wider font-bold">{item.description}</p>
            </div>
        </Link>
    );
}

export default function ToolsPage() {
    const { t } = useLanguage();

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Wrench className="w-8 h-8 text-white" />
                    {t('nav.edit')}
                </h1>
                <p className="text-muted-foreground">
                    Специализированные инструменты для работы с контентом
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {TOOLS.map(item => (
                    <ToolCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}
