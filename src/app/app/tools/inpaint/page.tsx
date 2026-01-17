"use client";

import { ToolPage } from "@/components/tool-page";
import { Paintbrush } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function InpaintPage() {
  const { language } = useLanguage();
  return (
    <ToolPage
      title={language === "ru" ? "Инпейнт" : "Inpaint"}
      description={language === "ru" ? "Редактирование и замена частей изображения" : "Edit and replace parts of images"}
      icon={<Paintbrush className="w-5 h-5" />}
      gradient="bg-gradient-to-br from-emerald-500/50 to-green-500/50"
    />
  );
}
