"use client";

import { AppPage } from "@/components/app-page";
import { User } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function StylistPage() {
  const { language } = useLanguage();
  return (
    <AppPage
      title={language === "ru" ? "Стилист" : "Stylist"}
      description={language === "ru" ? "Примерьте любую одежду" : "Try on any clothes"}
      howItWorks={
        language === "ru"
          ? "Загрузите своё фото и референс одежды. ИИ перенесёт стиль на ваше изображение, сохранив вашу внешность и позу."
          : "Upload your photo and a clothing reference. AI will transfer the style to your image while preserving your appearance and pose."
      }
      icon={<User className="w-5 h-5" />}
      image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop"
      needsPrompt={true}
      promptPlaceholder={language === "ru" ? "Опишите желаемый стиль..." : "Describe the desired style..."}
    />
  );
}
