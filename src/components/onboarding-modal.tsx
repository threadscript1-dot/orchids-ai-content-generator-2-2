"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Zap, Sparkles, CreditCard } from "lucide-react";
import Link from "next/link";

interface Step {
  title: string;
  description: string;
  image: string;
  icon: any;
}

const steps: Step[] = [
  {
    title: "Добро пожаловать в SDEL.AI",
    description: "Ваш универсальный инструмент для создания контента с помощью искусственного интеллекта. Генерируйте изображения, видео и музыку в одном месте.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    icon: Sparkles,
  },
  {
    title: "Умные инструменты редактирования",
    description: "Удаляйте фон, улучшайте качество и дорисовывайте детали одним кликом. Мы собрали лучшие модели для ваших творческих задач.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    icon: Zap,
  },
  {
    title: "Ваш стартовый капитал",
    description: "Мы дарим вам 1000 кредитов, чтобы вы могли сразу приступить к творчеству. Этого хватит на десятки генераций!",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80",
    icon: CreditCard,
  },
];

export function OnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-full md:w-1/2 relative overflow-hidden h-48 md:h-auto">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentStep}
                src={steps[currentStep].image}
                alt={steps[currentStep].title}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#6F00FF]/20 flex items-center justify-center mb-6">
                      {(() => {
                        const Icon = steps[currentStep].icon;
                        return <Icon className="w-6 h-6 text-[#6F00FF]" />;
                      })()}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">{steps[currentStep].title}</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {steps[currentStep].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-12 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-4">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep ? "w-8 bg-[#6F00FF]" : "w-1.5 bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white transition-colors text-sm font-medium"
                  >
                    Пропустить
                  </button>

                  <div className="flex items-center gap-3">
                    {currentStep > 0 && (
                      <button
                        onClick={prevStep}
                        className="p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    {isLastStep ? (
                      <Link
                        href="/app/pricing"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl bg-[#6F00FF] hover:bg-[#5D00D6] text-white font-bold transition-all hover:scale-105 active:scale-95"
                      >
                        Перейти в тарифы
                      </Link>
                    ) : (
                      <button
                        onClick={nextStep}
                        className="px-6 py-3 rounded-xl bg-white text-black font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                      >
                        Далее
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
