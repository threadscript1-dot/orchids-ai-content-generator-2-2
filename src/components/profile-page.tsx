'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Copy,
    Check,
    Zap,
    Sparkles,
    Rocket,
    Building2,
    ChevronDown,
    Globe,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { mockUser, plans, creditPackages } from '@/lib/mock-data';

export function ProfilePage() {
    const { t, language, setLanguage } = useLanguage();
    const [copied, setCopied] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(mockUser.plan);
    const [isAnnual, setIsAnnual] = useState(true);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);

    const copyReferral = async () => {
        const text = `https://sdel.ai/ref/${mockUser.referralCode}`;
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const planConfig: Record<string, { icon: React.ReactNode; gradient: string; accent: string; popular?: boolean; bestValue?: boolean }> = {
        free: { 
            icon: <Sparkles className="w-5 h-5" />, 
            gradient: 'from-zinc-600 to-zinc-800',
            accent: '#a1a1aa'
        },
        starter: { 
            icon: <Zap className="w-5 h-5" />, 
            gradient: 'from-[#FFDC74] to-[#FFC107]',
            accent: '#FFDC74'
        },
        pro: { 
            icon: <Rocket className="w-5 h-5" />, 
            gradient: 'from-[#53FF45] to-[#2db824]',
            accent: '#53FF45',
            popular: true
        },
        enterprise: { 
            icon: <Building2 className="w-5 h-5" />, 
            gradient: 'from-[#BF211E] to-[#ff4444]',
            accent: '#BF211E',
            bestValue: true
        },
    };

    const annualDiscount = 0.4;
    const getPrice = (basePrice: number) => {
        if (basePrice === 0) return 0;
        return isAnnual ? Math.round(basePrice * (1 - annualDiscount)) : basePrice;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-5"
            >
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/10">
                    <img
                        src={mockUser.avatar}
                        alt={mockUser.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h1 className="text-xl font-bold">{mockUser.name}</h1>
                    <p className="text-sm text-white/40">{mockUser.email}</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-white/40">{t('profile.balance')}</span>
                    <div className="flex items-center gap-2 text-[#FFDC74] font-mono text-lg font-bold">
                        <Zap className="w-4 h-4 fill-current" />
                        {mockUser.credits}
                    </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-[#FFDC74] to-[#FFC107]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(mockUser.credits / mockUser.maxCredits) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </div>
                <p className="text-xs text-white/30 mt-2">{mockUser.credits} / {mockUser.maxCredits} {language === 'ru' ? 'кредитов в месяц' : 'credits per month'}</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight">{t('profile.plans')}</h2>
                    <div className="flex items-center gap-3 bg-white/[0.03] rounded-full p-1">
                        <button 
                            onClick={() => setIsAnnual(false)}
                            className={`px-4 py-1.5 rounded-full text-sm transition-all ${!isAnnual ? 'bg-white text-black font-medium' : 'text-white/50 hover:text-white/70'}`}
                        >
                            {language === 'ru' ? 'Месяц' : 'Monthly'}
                        </button>
                        <button 
                            onClick={() => setIsAnnual(true)}
                            className={`px-4 py-1.5 rounded-full text-sm transition-all flex items-center gap-2 ${isAnnual ? 'bg-white text-black font-medium' : 'text-white/50 hover:text-white/70'}`}
                        >
                            {language === 'ru' ? 'Год' : 'Annual'}
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#53FF45] text-black">-40%</span>
                        </button>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan, index) => {
                        const config = planConfig[plan.id];
                        const isCurrentPlan = plan.id === mockUser.plan;
                        const originalPrice = plan.price;
                        const displayPrice = getPrice(plan.price);
                        
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                onClick={() => setSelectedPlan(plan.id as typeof mockUser.plan)}
                                className={`relative p-6 rounded-3xl cursor-pointer transition-all duration-300 overflow-hidden group ${
                                    config.popular 
                                        ? 'bg-gradient-to-b from-[#53FF45]/10 to-[#53FF45]/5 border-[#53FF45]/40 shadow-[0_0_40px_-12px_rgba(83,255,69,0.3)]' 
                                        : config.bestValue 
                                            ? 'bg-gradient-to-b from-[#BF211E]/10 to-[#BF211E]/5 border-[#BF211E]/40 shadow-[0_0_40px_-12px_rgba(191,33,30,0.3)]'
                                            : 'bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-white/[0.08] hover:border-white/20 hover:shadow-[0_0_30px_-12px_rgba(255,255,255,0.15)]'
                                } border`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                                    config.popular 
                                        ? 'from-[#53FF45]/5 to-transparent' 
                                        : config.bestValue 
                                            ? 'from-[#BF211E]/5 to-transparent'
                                            : 'from-white/[0.02] to-transparent'
                                }`} />
                                
                                {config.popular && (
                                    <div className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-b-xl text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#53FF45] to-[#2db824] text-black flex items-center gap-1.5 shadow-lg">
                                        <Sparkles className="w-3 h-3" />
                                        {language === 'ru' ? 'Популярный' : 'Most Popular'}
                                    </div>
                                )}
                                {config.bestValue && (
                                    <div className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-b-xl text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#BF211E] to-[#ff4444] text-white flex items-center gap-1.5 shadow-lg">
                                        <Sparkles className="w-3 h-3" />
                                        {language === 'ru' ? 'Лучшая цена' : 'Best Value'}
                                    </div>
                                )}
                                
                                <div className="relative z-10">
                                    <div className="mb-5 mt-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
                                                {config.icon}
                                            </div>
                                            <span className="font-bold text-lg">
                                                {language === 'ru' ? plan.name : plan.nameEn}
                                            </span>
                                        </div>
                                        {isCurrentPlan && (
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-white/10 text-white/70 backdrop-blur-sm border border-white/10">
                                                {language === 'ru' ? 'Текущий' : 'Current'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-5 flex flex-col">
                                        {isAnnual && originalPrice > 0 && (
                                            <span className="text-white/30 line-through text-sm mb-1">
                                                {originalPrice.toLocaleString()}₽
                                            </span>
                                        )}
                                        <div className="flex items-baseline">
                                            <span className="text-4xl font-bold tracking-tight" style={{ color: plan.price > 0 ? config.accent : '#a1a1aa' }}>
                                                {displayPrice === 0 ? '0' : displayPrice.toLocaleString()}
                                            </span>
                                            <span className="text-white/40 text-sm ml-1.5">
                                                ₽/{language === 'ru' ? 'мес' : 'mo'}
                                            </span>
                                        </div>
                                        {isAnnual && originalPrice > 0 && (
                                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium w-fit" style={{ backgroundColor: `${config.accent}15`, color: config.accent }}>
                                                <Sparkles className="w-3 h-3" />
                                                {language === 'ru' ? 'Экономия' : 'Save'} {Math.round(originalPrice * 12 * annualDiscount).toLocaleString()}₽/{language === 'ru' ? 'год' : 'yr'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-[#FFDC74]/10">
                                                <Zap className="w-4 h-4 text-[#FFDC74] fill-[#FFDC74]" />
                                            </div>
                                            <div>
                                                <span className="text-[#FFDC74] font-bold text-lg">{plan.credits.toLocaleString()}</span>
                                                <span className="text-white/40 text-xs ml-1.5">{language === 'ru' ? 'кредитов/мес' : 'credits/mo'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all mb-5 ${
                                            config.popular 
                                                ? 'bg-gradient-to-r from-[#53FF45] to-[#2db824] text-black hover:shadow-[0_0_20px_-4px_rgba(83,255,69,0.5)] hover:scale-[1.02]'
                                                : config.bestValue
                                                    ? 'bg-gradient-to-r from-[#BF211E] to-[#ff4444] text-white hover:shadow-[0_0_20px_-4px_rgba(191,33,30,0.5)] hover:scale-[1.02]'
                                                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-[1.02]'
                                        }`}
                                    >
                                        {isCurrentPlan 
                                            ? (language === 'ru' ? 'Текущий план' : 'Current Plan')
                                            : (language === 'ru' ? 'Выбрать' : 'Select Plan')
                                        }
                                    </button>

                                    <div className="space-y-2.5">
                                        {(language === 'ru' ? plan.features : plan.featuresEn).slice(0, 4).map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2.5 text-xs text-white/60">
                                                <div className="mt-0.5 p-0.5 rounded-full" style={{ backgroundColor: `${config.accent}20` }}>
                                                    <Check className="w-3 h-3" style={{ color: config.accent }} />
                                                </div>
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-[#FFDC74]/5 to-transparent border border-[#FFDC74]/10"
            >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-[#FFDC74]/10">
                                <Zap className="w-5 h-5 text-[#FFDC74] fill-[#FFDC74]" />
                            </div>
                            <h2 className="text-xl font-bold">{language === 'ru' ? 'Пакеты кредитов' : 'Credit Packages'}</h2>
                        </div>
                        <p className="text-sm text-white/50 max-w-md">
                            {language === 'ru' 
                                ? 'Докупите кредиты отдельно, если не хватает лимита по подписке. Кредиты не сгорают и накапливаются на вашем счёте.'
                                : 'Purchase additional credits if you need more than your subscription limit. Credits never expire and accumulate in your account.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#53FF45]/10 text-[#53FF45] text-xs font-medium">
                        <Check className="w-3.5 h-3.5" />
                        {language === 'ru' ? 'Не сгорают' : 'Never expire'}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {creditPackages.map((pkg, index) => {
                        const pricePerCredit = (pkg.price / pkg.credits).toFixed(1);
                        const isBestDeal = index === creditPackages.length - 1;
                        
                        return (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                                className={`relative p-4 rounded-xl cursor-pointer transition-all group hover:scale-[1.02] ${
                                    isBestDeal 
                                        ? 'bg-[#FFDC74]/10 border-[#FFDC74]/30 hover:border-[#FFDC74]/50' 
                                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'
                                } border`}
                            >
                                {isBestDeal && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#FFDC74] text-black whitespace-nowrap">
                                        {language === 'ru' ? 'Выгодно' : 'Best Deal'}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-1.5 text-[#FFDC74] font-mono text-2xl font-bold mb-1">
                                    <Zap className="w-5 h-5 fill-current" />
                                    {pkg.credits.toLocaleString()}
                                </div>
                                <p className="text-xs text-white/40 mb-3">{t('profile.credits')}</p>
                                
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-lg font-bold group-hover:text-[#FFDC74] transition-colors">
                                        {pkg.price.toLocaleString()} ₽
                                    </span>
                                </div>
                                <div className="text-[10px] text-white/30">
                                    {pricePerCredit} ₽ / {language === 'ru' ? 'кредит' : 'credit'}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40">
                    <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#53FF45]" />
                        {language === 'ru' ? 'Моментальное зачисление' : 'Instant credit'}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#53FF45]" />
                        {language === 'ru' ? 'Работают со всеми функциями' : 'Works with all features'}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#53FF45]" />
                        {language === 'ru' ? 'Безопасная оплата' : 'Secure payment'}
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
                <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">{t('profile.referral')}</h2>
                <p className="text-xs text-white/40 mb-3">
                    {language === 'ru'
                        ? 'Приглашайте друзей и получайте бонусные кредиты'
                        : 'Invite friends and earn bonus credits'}
                </p>
                <div className="flex gap-2">
                    <div className="flex-1 bg-white/[0.03] rounded-lg px-4 py-2.5 text-sm font-mono text-white/60 border border-white/[0.06]">
                        sdel.ai/ref/{mockUser.referralCode}
                    </div>
                    <button
                        onClick={copyReferral}
                        className="px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/[0.06]"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-[#53FF45]" />
                        ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                        )}
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
                <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">{t('profile.settings')}</h2>
                <div className="space-y-0 divide-y divide-white/[0.04]">
                    <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-white/70 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-white/40" />
                            {language === 'ru' ? 'Язык' : 'Language'}
                        </span>
                        <div className="relative">
                            <button
                                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                            >
                                <span className="text-lg">{language === 'ru' ? '🇷🇺' : '🇬🇧'}</span>
                                <span className="text-white/70">{language === 'ru' ? 'Русский' : 'English'}</span>
                                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {langDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setLangDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl overflow-hidden z-50">
                                        <button
                                            onClick={() => { setLanguage('ru'); setLangDropdownOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${language === 'ru' ? 'bg-white/5' : ''}`}
                                        >
                                            <span className="text-lg">🇷🇺</span>
                                            <span>Русский</span>
                                            {language === 'ru' && <Check className="w-4 h-4 ml-auto text-[#53FF45]" />}
                                        </button>
                                        <button
                                            onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${language === 'en' ? 'bg-white/5' : ''}`}
                                        >
                                            <span className="text-lg">🇬🇧</span>
                                            <span>English</span>
                                            {language === 'en' && <Check className="w-4 h-4 ml-auto text-[#53FF45]" />}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
