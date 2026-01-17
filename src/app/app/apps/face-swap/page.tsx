"use client";

import { AppPage } from "@/components/app-page";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function FaceSwapPage() {
  const { language } = useLanguage();
  return (
    <AppPage
      title={language === "ru" ? "Замена лица" : "Face Swap"}
      description={language === "ru" ? "Замените лицо на изображении" : "Replace face in an image"}
      howItWorks={
        language === "ru"
          ? "Загрузите целевое изображение и фото с лицом-донором. ИИ заменит лицо, сохраняя естественное освещение и выражение."
          : "Upload a target image and a donor face photo. AI will replace the face while maintaining natural lighting and expression."
      }
      icon={<RefreshCw className="w-5 h-5" />}
      image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop"
    />
  );
}
