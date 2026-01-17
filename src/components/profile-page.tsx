'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Settings,
    Link as LinkIcon,
    Copy,
    Check,
    CreditCard,
    Crown,
    Zap,
    Building,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { mockUser, plans, creditPackages } from '@/lib/mock-data';
import { Progress } from '@/components/ui/progress';

export function ProfilePage() {
    const { t, language } = useLanguage();
    const [copied, setCopied] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(mockUser.plan);

    const copyReferral = () => {
        navigator.clipboard.writeText(`https://sdel.ai/ref/${mockUser.referralCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const creditPercentage = (mockUser.credits / mockUser.maxCredits) * 100;

    const planIcons: Record<string, React.ReactNode> = {
        free: <User className="w-5 h-5" />,
        starter: <Zap className="w-5 h-5" />,
        pro: <Crown className="w-5 h-5" />,
        enterprise: <Building className="w-5 h-5" />,
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6">{t('profile.title')}</h1>

            <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl glass p-6"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#6F00FF]">
                            <img
                                src={mockUser.avatar}
                                alt={mockUser.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">{mockUser.name}</h2>
                            <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">
                                    {t('profile.balance')}
                                </span>
                                <span className="text-credits font-mono text-lg flex items-center gap-1">
                                    <Zap className="w-4 h-4 fill-current" />
                                    {mockUser.credits} / {mockUser.maxCredits}
                                </span>
                            </div>
                            <Progress value={creditPercentage} className="h-2 bg-white/10" />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                            <div className="flex items-center gap-3">
                                {planIcons[mockUser.plan]}
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('profile.plan')}
                                    </p>
                                    <p className="font-medium">
                                        {
                                            plans.find((p) => p.id === mockUser.plan)?.[
                                                language === 'ru' ? 'name' : 'nameEn'
                                            ]
                                        }
                                    </p>
                                </div>
                            </div>
                            <button className="px-4 py-2 rounded-full bg-[#6F00FF] hover:bg-[#6F00FF]/80 transition-colors text-sm border-none">
                                {language === 'ru' ? 'Улучшить' : 'Upgrade'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl glass p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <LinkIcon className="w-5 h-5 text-[#6F00FF]" />
                        <h3 className="font-semibold">{t('profile.referral')}</h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                        {language === 'ru'
                            ? 'Приглашайте друзей и получайте бонусные кредиты'
                            : 'Invite friends and earn bonus credits'}
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={`sdel.ai/ref/${mockUser.referralCode}`}
                            readOnly
                            className="flex-1 bg-white/5 border-none rounded-full px-4 py-2 text-sm font-mono outline-none"
                        />
                        <button
                            onClick={copyReferral}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border-none"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-green-400" />
                            ) : (
                                <Copy className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>

            <motion.div
                id="plans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
            >
                <h3 className="font-semibold mb-4">{t('profile.plans')}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`rounded-2xl glass p-5 cursor-pointer transition-all ${
                                selectedPlan === plan.id
                                    ? 'ring-2 ring-[#6F00FF]'
                                    : 'hover:bg-white/5'
                            }`}
                            onClick={() =>
                                setSelectedPlan(
                                    plan.id as 'free' | 'starter' | 'pro' | 'enterprise'
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-3">
                                {planIcons[plan.id]}
                                <h4 className="font-medium">
                                    {language === 'ru' ? plan.name : plan.nameEn}
                                </h4>
                            </div>

                            <div className="mb-4">
                                <span className="text-2xl font-bold">
                                    {plan.price === 0
                                        ? language === 'ru'
                                            ? 'Бесплатно'
                                            : 'Free'
                                        : `₽${plan.price}`}
                                </span>
                                {plan.price > 0 && (
                                    <span className="text-sm text-muted-foreground">
                                        /{language === 'ru' ? 'мес' : 'mo'}
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-2 text-sm">
                                {(language === 'ru' ? plan.features : plan.featuresEn).map(
                                    (feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-[#6F00FF] flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    )
                                )}
                            </ul>

                            {plan.id !== mockUser.plan && plan.price > 0 && (
                                <button className="w-full mt-4 py-2 rounded-full bg-[#6F00FF] hover:bg-[#6F00FF]/80 transition-colors text-sm font-medium border-none">
                                    {language === 'ru' ? 'Выбрать' : 'Select'}
                                </button>
                            )}

                            {plan.id === mockUser.plan && (
                                <div className="w-full mt-4 py-2 text-center text-sm text-muted-foreground">
                                    {language === 'ru' ? 'Текущий план' : 'Current Plan'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
            >
                <h3 className="font-semibold mb-4">{t('profile.buyCredits')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {creditPackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="rounded-2xl glass p-4 text-center hover:bg-white/5 cursor-pointer transition-all border-none"
                        >
                            <div className="text-credits font-mono text-2xl font-bold mb-1 flex items-center justify-center gap-1">
                                <Zap className="w-5 h-5 fill-current" />
                                {pkg.credits}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                {t('profile.credits')}
                            </p>
                            <button className="w-full py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm border-none">
                                ₽{pkg.price}
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
            >
                <div className="rounded-2xl glass p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-semibold">{t('profile.settings')}</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-white/10">
                            <span>{language === 'ru' ? 'Язык' : 'Language'}</span>
                            <span className="text-muted-foreground font-mono">
                                {language === 'ru' ? 'Русский' : 'English'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-white/10">
                            <span>
                                {language === 'ru' ? 'Email уведомления' : 'Email Notifications'}
                            </span>
                            <span className="text-muted-foreground">
                                {language === 'ru' ? 'Включены' : 'Enabled'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span>
                                {language === 'ru' ? 'Качество по умолчанию' : 'Default Quality'}
                            </span>
                            <span className="text-muted-foreground">HD</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
