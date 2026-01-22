'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface DropdownItem {
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
}

interface HeaderDropdownProps {
    label: string;
    items: DropdownItem[];
    pathname: string;
    href?: string;
}

export function HeaderDropdown({ label, items, pathname, href }: HeaderDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 100);
    };

    const isActive = href
        ? pathname === href || pathname.startsWith(href + '/')
        : pathname.startsWith(items[0].href.split('/').slice(0, 3).join('/'));

    const triggerContent = (
        <span
            className={`px-4 py-2 rounded-xl transition-colors border-none outline-none text-sm font-medium cursor-pointer ${
                isActive
                    ? 'bg-white/10 text-white'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
        >
            {label}
        </span>
    );

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative py-2">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                    {href ? <Link href={href}>{triggerContent}</Link> : triggerContent}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    sideOffset={8}
                    className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 rounded-2xl min-w-[280px] p-2"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {items.map((item) => (
                        <DropdownMenuItem
                            key={item.href}
                            asChild
                            className="rounded-xl focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white cursor-pointer p-0"
                        >
                            <Link
                                href={item.href}
                                className="flex items-start gap-3 w-full pl-3 pr-8 py-3 group/item"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-white/10 transition-colors shrink-0">
                                    <item.icon
                                        className="w-5 h-5 text-white/40 group-hover/item:text-white transition-transform group-hover/item:scale-110"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium text-sm text-white transition-colors">
                                        {item.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground leading-tight">
                                        {item.description}
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
