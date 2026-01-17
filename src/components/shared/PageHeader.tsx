'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    backHref?: string;
    rightContent?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backHref = '/app', rightContent }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
                <Link
                    href={backHref}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {rightContent && <div>{rightContent}</div>}
        </div>
    );
}
