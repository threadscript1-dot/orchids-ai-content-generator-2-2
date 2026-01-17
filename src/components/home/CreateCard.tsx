'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CreateCardProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    href: string;
    image: string;
}

export function CreateCard({ icon: Icon, title, subtitle, href, image }: CreateCardProps) {
    return (
        <Link href={href}>
            <motion.div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden group cursor-pointer">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 flex flex-col gap-0.5">
                    <div className="w-10 h-10 rounded-xl bg-[#6F00FF] flex items-center justify-center mb-1">
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-semibold">{title}</span>
                    <span className="text-sm text-muted-foreground">{subtitle}</span>
                </div>
            </motion.div>
        </Link>
    );
}
