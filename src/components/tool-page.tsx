"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, X, Sparkles, Loader2, Download, Zap } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { downloadFile } from "@/lib/utils";

interface ToolPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

export function ToolPage({ title, description, icon, gradient }: ToolPageProps) {
  const { t, language } = useLanguage();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]?.type.startsWith("image/")) {
      setUploadedImage(URL.createObjectURL(files[0]));
      setResult(null);
    }
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]?.type.startsWith("image/")) {
      setUploadedImage(URL.createObjectURL(files[0]));
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setResult(uploadedImage);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-12">
        <div className="flex items-center gap-4 mb-12">
<Link href="/app" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{title}</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">{description}</p>
          </div>
        </div>

        {!uploadedImage ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-[3/4] sm:aspect-square md:aspect-[4/3] rounded-[40px] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden ${
              isDragging 
                ? "border-[#6F00FF] bg-[#6F00FF]/5 shadow-[0_0_50px_rgba(111,0,255,0.1)]" 
                : "border-white/10 hover:border-white/20 bg-white/5"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#6F00FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex flex-col items-center text-center px-6">
              <div className={`w-32 h-32 rounded-3xl ${gradient} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-white/10 shadow-2xl`}>
                {icon}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                {language === "ru" ? "Выберите изображение" : "Select an image"}
              </h3>
              <p className="text-sm text-white/40 font-medium">
                <span className="md:hidden">{language === "ru" ? "Выбрать из галереи" : "Choose from gallery"}</span>
                <span className="hidden md:inline">{language === "ru" ? "Перетащите файл сюда или нажмите для загрузки" : "Drag and drop your file here or click to upload"}</span>
              </p>
            </div>
          </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div
            className={`rounded-3xl bg-white/5 border border-white/10 p-6 transition-all ${isDragging ? "border-[#6F00FF] border-2 border-dashed" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <h3 className="font-bold text-xs uppercase tracking-widest text-white/30 mb-6">{language === "ru" ? "Исходное изображение" : "Source Image"}</h3>
            
            <div className="relative">
              <img src={uploadedImage} alt="Uploaded" className="w-full rounded-2xl border border-white/5" />
              <button
                onClick={() => { setUploadedImage(null); setResult(null); }}
                className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 transition-colors backdrop-blur-md border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full mt-8 py-5 rounded-xl bg-[#6F00FF] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(111,0,255,0.3)] disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {language === "ru" ? "Обработать" : "Process"}
              <div className="ml-2 flex items-center gap-1.5 text-[#FFD700] font-mono">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span className="text-xs font-bold">10</span>
              </div>
            </button>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-bold text-xs uppercase tracking-widest text-white/30 mb-6">{language === "ru" ? "Результат" : "Result"}</h3>
            
            {isProcessing ? (
              <div className="aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-[#6F00FF] mx-auto mb-4" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6F00FF] animate-pulse">
                    {language === "ru" ? "Обработка..." : "Processing..."}
                  </p>
                </div>
              </div>
            ) : result ? (
                <div className="relative">
                  <img src={result} alt="Result" className="w-full rounded-2xl border border-white/5" />
                  <button 
                    onClick={() => {
                      downloadFile(result, 'result.png');
                    }}
                    className="absolute bottom-4 right-4 p-3 rounded-xl bg-[#6F00FF] text-white hover:scale-110 active:scale-95 transition-all shadow-2xl"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
            ) : (
              <div className="aspect-square border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                  {language === "ru" ? "Результат появится здесь" : "Result will appear here"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
