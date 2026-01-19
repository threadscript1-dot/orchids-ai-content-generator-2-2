'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, LucideIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
    href: string;
    label: { ru: string; en: string };
    description: { ru: string; en: string };
    icon: LucideIcon;
}

interface NavDropdownProps {
    label: string;
    items: NavItem[];
    language: string;
    isLight?: boolean;
}

export function NavDropdown({ label, items, language, isLight }: NavDropdownProps) {
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
                        aria-hidden="true"
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
                                    <item.icon
                                        className="w-4 h-4 transition-transform group-hover/item:scale-110"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-white">
                                        {language === 'ru' ? item.label.ru : item.label.en}
                                    </span>
                                    <span className="text-[10px] text-white/40 line-clamp-1">
                                        {language === 'ru' ? item.description.ru : item.description.en}
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
