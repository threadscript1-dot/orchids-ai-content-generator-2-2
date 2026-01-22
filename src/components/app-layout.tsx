'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FolderOpen,
    User,
    Menu,
    Zap,
    Image,
    Video,
    Music,
    Sparkles,
    Wrench,
    Wand2,
    Maximize,
    Eraser,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/user-store';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { OnboardingModal } from '@/components/onboarding-modal';
import { AnimatedLogo } from '@/components/animated-logo';
import { HeaderDropdown, SidebarMenu, MobileBottomNav, type DropdownItem } from '@/components/layout';

const MAX_CREDITS = 1000;

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { language, t } = useLanguage();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const { user } = useAuthStore();
    const { creditBalance, fetchBalance } = useUserStore();

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    const handleCloseOnboarding = () => {
        setShowOnboarding(false);
        localStorage.setItem('hasSeenOnboarding', 'true');
    };

    const navItems = [
        { href: '/app/library', icon: FolderOpen, label: t('nav.library') },
        { href: '/app', icon: Sparkles, label: language === 'ru' ? 'Сделать' : 'Create' },
        { href: '/app/tools', icon: Wrench, label: t('nav.edit') },
    ];

    const createItems: DropdownItem[] = [
        {
            href: '/app/create/image',
            label: t('type.image'),
            description: t('type.image.sub'),
            icon: Image,
        },
        {
            href: '/app/create/video',
            label: t('type.video'),
            description: t('type.video.sub'),
            icon: Video,
        },
        {
            href: '/app/create/audio',
            label: t('type.audio'),
            description: t('type.audio.sub'),
            icon: Music,
        },
    ];

    const editItems: DropdownItem[] = [
        {
            href: '/app/tools/enhance',
            label: t('edit.enhance'),
            description: t('edit.enhance.sub'),
            icon: Wand2,
        },
        {
            href: '/app/tools/expand',
            label: t('edit.expand'),
            description: t('edit.expand.sub'),
            icon: Maximize,
        },
        {
            href: '/app/tools/remove-bg',
            label: t('edit.removeBg'),
            description: t('edit.removeBg.sub'),
            icon: Eraser,
        },
    ];

    return (
        <div className="min-h-[100dvh] bg-black text-white overflow-x-hidden">
            <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />
            <div className="gradient-bg" />

            <header className="fixed top-0 left-0 right-0 z-50 h-20 border-none">
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none" />
                <div className="h-full px-[14px] sm:px-6 flex items-center justify-between max-w-[1440px] mx-auto relative z-10">
                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="flex items-center gap-2">
                            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                                <SheetTrigger asChild>
                                    <button
                                        aria-label={
                                            language === 'ru' ? 'Открыть меню' : 'Open menu'
                                        }
                                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <Menu className="w-5 h-5" aria-hidden="true" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 p-0 w-[280px]"
                                >
                                    <SidebarMenu
                                        createItems={createItems}
                                        editItems={editItems}
                                        creditBalance={creditBalance}
                                        maxCredits={MAX_CREDITS}
                                        onClose={() => setMenuOpen(false)}
                                        t={t}
                                    />
                                </SheetContent>
                            </Sheet>

                            <Link href="/app" className="flex items-center gap-2">
                                <AnimatedLogo />
                            </Link>
                        </div>

                        <nav className="hidden md:flex items-center gap-1">
                            <HeaderDropdown
                                label={t('nav.create')}
                                items={createItems}
                                pathname={pathname}
                            />
                            <HeaderDropdown
                                label={t('nav.edit')}
                                items={editItems}
                                pathname={pathname}
                                href="/app/tools"
                            />
                            <Link
                                href="/app/library"
                                className={`px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
                                    pathname === '/app/library'
                                        ? 'bg-white/10 text-white'
                                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {t('nav.library')}
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-1.5 px-1">
                                <Zap
                                    className="w-4 h-4 text-[#FFDC74] fill-[#FFDC74]"
                                    aria-hidden="true"
                                />
                                <span className="text-sm font-bold text-[#FFDC74] font-mono">
                                    {creditBalance}
                                </span>
                            </div>

                            <Link
                                href="/app/profile#plans"
                                className="hidden sm:flex px-3 py-1.5 rounded-lg bg-[#FFDC74] text-[11px] font-bold text-black uppercase tracking-wider relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,220,116,0.4)]"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                                <span className="relative z-10">{t('nav.more')}</span>
                            </Link>

                            <Link href="/app/profile">
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors overflow-hidden">
                                    {user?.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.display_name || 'User'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User
                                            className="w-5 h-5 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-16 pb-20 md:pb-8 min-h-[100dvh]">
                <div className="px-[14px] sm:px-6 py-6">{children}</div>
            </main>

            <MobileBottomNav items={navItems} pathname={pathname} />
        </div>
    );
}
