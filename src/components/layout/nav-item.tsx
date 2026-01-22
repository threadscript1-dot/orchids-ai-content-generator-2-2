'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface NavItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    active: boolean;
    highlight?: boolean;
}

export function NavItem({ href, icon: Icon, label, active, highlight }: NavItemProps) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                highlight
                    ? 'bg-[#7C3AED] text-white px-6 py-2 rounded-2xl'
                    : active
                      ? 'text-white p-2'
                      : 'text-muted-foreground hover:text-white p-2'
            }`}
        >
            <Icon
                className={`w-5 h-5 ${active || highlight ? 'text-white' : ''}`}
                aria-hidden="true"
            />
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
}
