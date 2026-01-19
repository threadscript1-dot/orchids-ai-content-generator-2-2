'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

const CATEGORIES_RU = [
    { id: 'all', label: 'Все' },
    { id: 'cinema', label: 'Кино' },
    { id: 'art', label: 'Арт' },
    { id: 'anime', label: 'Аниме' },
    { id: '3d', label: '3D' },
];

const CATEGORIES_EN = [
    { id: 'all', label: 'All' },
    { id: 'cinema', label: 'Cinema' },
    { id: 'art', label: 'Art' },
    { id: 'anime', label: 'Anime' },
    { id: '3d', label: '3D' },
];

const ITEMS = [
    {
        id: 1,
        category: 'cinema',
        img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    },
    {
        id: 2,
        category: 'art',
        img: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80',
    },
    {
        id: 3,
        category: 'anime',
        img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
    },
    {
        id: 4,
        category: '3d',
        img: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
    },
    {
        id: 5,
        category: 'cinema',
        img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
    },
    {
        id: 6,
        category: 'art',
        img: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80',
    },
    {
        id: 7,
        category: 'anime',
        img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
    },
    {
        id: 8,
        category: '3d',
        img: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80',
    },
];

export function HiggsfieldGrid() {
    const { language } = useLanguage();
    const [filter, setFilter] = useState('all');

    const categories = language === 'ru' ? CATEGORIES_RU : CATEGORIES_EN;
    const filteredItems = filter === 'all' ? ITEMS : ITEMS.filter((i) => i.category === filter);

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
                            className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <ExternalLink className="w-5 h-5 text-white" aria-hidden="true" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
