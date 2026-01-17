"use client";

import { AppPage } from "@/components/app-page";
import { Sun } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function RelightPage() {
  const { language } = useLanguage();
  return (
    <AppPage
      title={language === "ru" ? "Освещение" : "Relight"}
      description={language === "ru" ? "Измените освещение на изображении" : "Change lighting in an image"}
      howItWorks={
        language === "ru"
          ? "Загрузите изображение и опишите желаемое освещение. ИИ изменит источники света, тени и атмосферу сцены."
          : "Upload an image and describe the desired lighting. AI will modify light sources, shadows, and scene atmosphere."
      }
      icon={<Sun className="w-5 h-5" />}
      image="https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&h=400&fit=crop"
      needsPrompt={true}
      promptPlaceholder={language === "ru" ? "Опишите освещение: золотой час, неоновые огни..." : "Describe lighting: golden hour, neon lights..."}
    />
  );
}
