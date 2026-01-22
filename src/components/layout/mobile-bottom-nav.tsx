'use client';

import type { LucideIcon } from 'lucide-react';
import { NavItem } from './nav-item';

interface NavItemData {
    href: string;
    icon: LucideIcon;
    label: string;
}

interface MobileBottomNavProps {
    items: NavItemData[];
    pathname: string;
    highlightHref?: string;
}

export function MobileBottomNav({ items, pathname, highlightHref = '/app' }: MobileBottomNavProps) {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass">
            <div className="flex items-center justify-around h-16 px-2">
                {items.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        active={pathname === item.href}
                        highlight={item.href === highlightHref}
                    />
                ))}
            </div>
        </nav>
    );
}
