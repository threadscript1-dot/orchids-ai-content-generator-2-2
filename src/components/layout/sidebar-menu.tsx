'use client';

import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatedLogo } from '@/components/animated-logo';

export interface MenuItem {
    href: string;
    label: string;
    description?: string;
    icon: LucideIcon;
}

interface SidebarMenuProps {
    createItems: MenuItem[];
    editItems: MenuItem[];
    creditBalance: number;
    maxCredits: number;
    onClose: () => void;
    t: (key: string) => string;
}

export function SidebarMenu({
    createItems,
    editItems,
    creditBalance,
    maxCredits,
    onClose,
    t,
}: SidebarMenuProps) {
    const creditPercentage = (creditBalance / maxCredits) * 100;

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-white/10">
                <Link href="/app" onClick={onClose}>
                    <AnimatedLogo />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <MenuSection title={t('nav.create')} items={createItems} onClose={onClose} />
                <MenuSection title={t('nav.edit')} items={editItems} onClose={onClose} />

                <div className="pt-2 border-t border-white/5">
                    <div className="space-y-1">
                        <Link
                            href="/app/library"
                            onClick={onClose}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors">
                                <FolderOpen className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <span className="text-sm font-medium">{t('nav.library')}</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-white/10">
                <div className="bg-white/5 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white">{t('nav.credits')}</span>
                        <span className="text-xs font-bold text-[#FFDC74]">
                            {creditBalance} / {maxCredits}
                        </span>
                    </div>
                    <Progress
                        value={creditPercentage}
                        className="h-1 bg-white/10 [&>div]:bg-[#FFDC74]"
                    />
                    <Link
                        href="/app/profile#plans"
                        onClick={onClose}
                        className="mt-3 w-full flex items-center justify-center px-3 py-2 rounded-lg bg-[#FFDC74] hover:bg-[#FFDC74]/90 transition-colors text-xs font-bold text-black uppercase tracking-wider"
                    >
                        {t('nav.more')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

function MenuSection({
    title,
    items,
    onClose,
}: {
    title: string;
    items: MenuItem[];
    onClose: () => void;
}) {
    return (
        <div>
            <h3 className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                {title}
            </h3>
            <div className="space-y-1">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors">
                            <item.icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
