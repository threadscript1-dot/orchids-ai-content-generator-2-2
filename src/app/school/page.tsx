"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { AnimatedLogo } from "@/components/animated-logo";
import { ArrowLeft, BookOpen, GraduationCap, Play, Clock, Star, ChevronRight } from "lucide-react";
import { useState } from "react";

const articles = [
  {
    id: 1,
    title: { ru: "Как создавать гиперреалистичные портреты", en: "How to Create Hyper-Realistic Portraits" },
    category: { ru: "Генерация изображений", en: "Image Generation" },
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    slug: "hyper-realistic-portraits"
  },
  {
    id: 2,
    title: { ru: "Секреты идеального промпта для видео", en: "Secrets of the Perfect Video Prompt" },
    category: { ru: "Видео-продакшн", en: "Video Production" },
    readTime: "12 min",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
    slug: "perfect-video-prompt"
  },
  {
    id: 3,
    title: { ru: "ИИ в маркетинге: кейсы 2024 года", en: "AI in Marketing: 2024 Use Cases" },
    category: { ru: "Бизнес", en: "Business" },
    readTime: "15 min",
    image: "https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&q=80",
    slug: "ai-marketing-2024"
  }
];

const courses = [
  {
    id: 1,
    title: { ru: "Мастер нейросетей: Полный курс", en: "Neural Network Master: Full Course" },
    lessons: 24,
    duration: "12h",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80"
  },
  {
    id: 2,
    title: { ru: "Профессиональный видео-арт с ИИ", en: "Professional AI Video Art" },
    lessons: 18,
    duration: "8h",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80"
  }
];

export default function SchoolPage() {
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<"articles" | "courses">("articles");

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#6F00FF]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <AnimatedLogo />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
                {language === "ru" ? "Главная" : "Home"}
              </Link>
              <Link href="/app" className="text-sm text-white/40 hover:text-white transition-colors">
                {language === "ru" ? "Приложение" : "App"}
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === "ru" ? "en" : "ru")}
              className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
            >
              {language === "ru" ? (
                <>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm">
                    <rect width="16" height="4" fill="white"/>
                    <rect y="4" width="16" height="4" fill="#0039A6"/>
                    <rect y="8" width="16" height="4" fill="#D52B1E"/>
                  </svg>
                  RU
                </>
              ) : (
                <>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm">
                    <rect width="16" height="12" fill="#012169"/>
                    <path d="M0 0L16 12M16 0L0 12" stroke="white" strokeWidth="2"/>
                    <path d="M0 0L16 12M16 0L0 12" stroke="#C8102E" strokeWidth="1"/>
                    <path d="M8 0V12M0 6H16" stroke="white" strokeWidth="3"/>
                    <path d="M8 0V12M0 6H16" stroke="#C8102E" strokeWidth="2"/>
                  </svg>
                  EN
                </>
              )}
            </button>
            <Link
              href="/app"
              className="px-5 py-2 rounded-xl bg-[#6F00FF] text-sm font-bold text-white hover:bg-[#5D00D6] transition-colors"
            >
              {language === "ru" ? "Войти" : "Login"}
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6"
          >
            {language === "ru" ? "Школа СДЕЛAI" : "SDELAI School"}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/40 max-w-2xl mx-auto"
          >
            {language === "ru" 
              ? "Освойте искусство работы с искусственным интеллектом от основ до профессионального уровня"
              : "Master the art of working with AI from basics to professional level"}
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("articles")}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === "articles" 
                ? "bg-white text-black" 
                : "bg-white/5 text-white/40 hover:text-white"
            }`}
          >
            {language === "ru" ? "Статьи" : "Articles"}
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === "courses" 
                ? "bg-white text-black" 
                : "bg-white/5 text-white/40 hover:text-white"
            }`}
          >
            {language === "ru" ? "Курсы" : "Courses"}
          </button>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === "articles" ? (
            articles.map((article, i) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-white/10">
                  <img 
                    src={article.image} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#6F00FF]/20 text-[#6F00FF] rounded-md">
                    {language === "ru" ? article.category.ru : article.category.en}
                  </span>
                  <div className="flex items-center gap-1 text-white/20 text-xs">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#6F00FF] transition-colors leading-tight">
                  {language === "ru" ? article.title.ru : article.title.en}
                </h3>
              </motion.article>
            ))
          ) : (
            courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 border border-white/10 relative">
                  <img 
                    src={course.image} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <Play className="w-6 h-6 text-black fill-black ml-1" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <BookOpen className="w-4 h-4" />
                    {course.lessons} {language === "ru" ? "уроков" : "lessons"}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#FFDC74]">
                    <Star className="w-3 h-3 fill-[#FFDC74]" />
                    {course.rating}
                  </div>
                </div>
                <h3 className="text-xl font-bold group-hover:text-[#6F00FF] transition-colors mb-4">
                  {language === "ru" ? course.title.ru : course.title.en}
                </h3>
                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                  {language === "ru" ? "Начать обучение" : "Start Learning"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
