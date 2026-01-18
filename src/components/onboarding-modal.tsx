"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface Step {
  title: string;
  description: string;
  image: string;
  highlight?: string;
}

const steps: Step[] = [
  {
    title: "Добро пожаловать в SDEL.AI",
    description: "Ваш универсальный инструмент для создания контента с помощью искусственного интеллекта. Генерируйте изображения, видео и музыку в одном месте.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
  {
    title: "Умные инструменты редактирования",
    description: "Удаляйте фон, улучшайте качество и дорисовывайте детали одним кликом. Мы собрали лучшие модели для ваших творческих задач.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  },
  {
    title: "Ваш стартовый капитал",
    description: "Мы дарим вам кредиты, чтобы вы могли сразу приступить к творчеству.",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80",
    highlight: "50",
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
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-lg bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl"
          style={{
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.8)"
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="relative h-48 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <img
                  src={steps[currentStep].image}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-8 pb-8 pt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="min-h-[140px]"
              >
                <h2 className="text-2xl font-bold mb-3 tracking-tight">{steps[currentStep].title}</h2>
                
                {steps[currentStep].highlight ? (
                  <div className="mb-4">
                    <div className="inline-flex items-baseline gap-1.5 mb-2">
                      <span className="text-5xl font-black text-[#FFDC74]">{steps[currentStep].highlight}</span>
                      <span className="text-lg text-white/60 font-medium">кредитов</span>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {steps[currentStep].description}
                    </p>
                  </div>
                ) : (
                  <p className="text-white/50 text-sm leading-relaxed">
                    {steps[currentStep].description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-1.5 mb-6">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full bg-white/10 overflow-hidden"
                  style={{ width: i === currentStep ? 24 : 8 }}
                  animate={{ width: i === currentStep ? 24 : 8 }}
                  transition={{ duration: 0.3 }}
                >
                  {i === currentStep && (
                    <motion.div
                      className="h-full bg-[#6F00FF]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/60 transition-colors text-sm"
              >
                Пропустить
              </button>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white/60" aria-hidden="true" />
                  </button>
                )}
                
                <button
                  onClick={nextStep}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    isLastStep
                      ? "bg-[#FFDC74] text-black hover:bg-[#FFDC74]/90"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  {isLastStep ? (
                    "Прекрасно"
                  ) : (
                    <>
                      Далее
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
