'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    href: string;
}

export function ToolCard({ icon: Icon, title, subtitle, href }: ToolCardProps) {
    return (
        <Link href={href}>
            <motion.div className="relative h-32 sm:h-44 rounded-2xl overflow-hidden cursor-pointer border border-purple-500/20 hover:border-purple-500/60 transition-all duration-300 bg-white/5">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="font-medium text-center text-sm sm:text-base">
                            {title}
                        </span>
                        <span className="text-[10px] sm:text-xs text-center opacity-70 line-clamp-1">
                            {subtitle}
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
