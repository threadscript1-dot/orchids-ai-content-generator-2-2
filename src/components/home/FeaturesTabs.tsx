'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, Music } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

const TABS_RU = [
    {
        id: 'image',
        icon: Image,
        label: 'Изображение',
        description: 'Делайте уникальные изображения любого стиля',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    },
    {
        id: 'video',
        icon: Video,
        label: 'Видео',
        description: 'Превращайте идеи в динамичные видеоролики',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&q=80',
    },
    {
        id: 'music',
        icon: Music,
        label: 'Музыка',
        description: 'Генерируйте музыку и звуковые эффекты',
        image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1200&q=80',
    },
];

const TABS_EN = [
    {
        id: 'image',
        icon: Image,
        label: 'Image',
        description: 'Create unique images in any style',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    },
    {
        id: 'video',
        icon: Video,
        label: 'Video',
        description: 'Transform ideas into dynamic videos',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&q=80',
    },
    {
        id: 'music',
        icon: Music,
        label: 'Music',
        description: 'Generate music and sound effects',
        image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1200&q=80',
    },
];

export function FeaturesTabs() {
    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState('image');

    const tabs = language === 'ru' ? TABS_RU : TABS_EN;
    const activeContent = tabs.find((t) => t.id === activeTab)!;

    return (
        <section className="py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase mb-4 leading-none">
                        {language === 'ru' ? 'Сделай что хочешь' : 'Do whatever you want'}
                    </h2>
                    <p className="text-xl text-white/40 font-medium h-8">{activeContent.description}</p>
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
                            <tab.icon className="w-4 h-4" aria-hidden="true" />
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
